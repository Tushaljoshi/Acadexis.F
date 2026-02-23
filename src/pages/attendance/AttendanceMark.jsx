import { useState, useEffect } from 'react';
import { Save, Users, GraduationCap } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import { attendanceService } from '../../services/attendanceService';
import { classService } from '../../services/classService';
import { studentService } from '../../services/studentService';
import { teacherService } from '../../services/teacherService';
import { timetableStore } from '../../store/timetableStore';
import { attendanceStore, TEACHER_STATUS } from '../../store/attendanceStore';
import { ATTENDANCE_STATUS } from '../../config/constants';
import { useAuthStore } from '../../store/authStore';
import { ROLES } from '../../config/constants';
import toast from 'react-hot-toast';
import Loading from '../../components/ui/Loading';

const AttendanceMark = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === ROLES.ADMIN;

  const [mode, setMode] = useState('student'); // 'teacher' | 'student'

  // Teacher Attendance
  const [teachers, setTeachers] = useState([]);
  const [teacherDate, setTeacherDate] = useState(new Date().toISOString().split('T')[0]);
  const [teacherAttendance, setTeacherAttendance] = useState({});
  const [teacherLoading, setTeacherLoading] = useState(false);

  // Student Attendance
  const [classes, setClasses] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]); // Filtered classes for teacher
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [studentDate, setStudentDate] = useState(new Date().toISOString().split('T')[0]);
  const [studentAttendance, setStudentAttendance] = useState({});
  const [studentLoading, setStudentLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchTeachers();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin && user?._id) {
      // For teachers: Get their assigned classes and substitute classes
      getTeacherClasses();
    } else {
      setAvailableClasses(classes);
    }
  }, [isAdmin, user?._id, classes, studentDate]);

  useEffect(() => {
    if (isAdmin && mode === 'teacher') {
      loadTeacherAttendance();
    }
  }, [isAdmin, mode, teacherDate]);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      fetchStudents();
    }
  }, [selectedClass, selectedSection]);

  useEffect(() => {
    if (selectedClass && selectedSection && studentDate && students.length > 0) {
      const stored = attendanceStore.getStudentAttendance(selectedClass, selectedSection, studentDate);
      if (stored.length > 0) {
        const map = {};
        students.forEach((s) => {
          const rec = stored.find((r) => r.studentId === s._id);
          map[s._id] = rec ? rec.status : ATTENDANCE_STATUS.PRESENT;
        });
        setStudentAttendance(map);
      }
    }
  }, [selectedClass, selectedSection, studentDate, students]);

  const fetchClasses = async () => {
    try {
      const response = await classService.getAll();
      const data = response.data || [];
      setClasses(data.length > 0 ? data : timetableStore.getClasses());
    } catch {
      setClasses(timetableStore.getClasses());
    }
  };

  const getTeacherClasses = () => {
    if (!user?._id) {
      setAvailableClasses(classes);
      return;
    }

    const allClasses = classes.length > 0 ? classes : timetableStore.getClasses();
    
    // Get classes where teacher is assigned (from timetable)
    const teacherTimetable = timetableStore.getTimetableByTeacher(user._id);
    const assignedClassSections = new Set();
    teacherTimetable.forEach((entry) => {
      if (entry.classId && entry.sectionId) {
        assignedClassSections.add(`${entry.classId}_${entry.sectionId}`);
      }
    });

    // Get classes where teacher is substitute (from teacher attendance for selected date)
    const teacherAttendanceRecords = attendanceStore.getTeacherAttendance(studentDate);
    const substituteClassSections = new Set();
    const substituteInfo = {}; // Store which teacher they're substituting for
    
    teacherAttendanceRecords.forEach((record) => {
      // If this teacher is assigned as substitute for another teacher
      if (record.substituteId === user._id && (record.status === TEACHER_STATUS.ABSENT || record.status === TEACHER_STATUS.LEAVE)) {
        // Find which classes the absent teacher was teaching
        const absentTeacherTimetable = timetableStore.getTimetableByTeacher(record.teacherId);
        absentTeacherTimetable.forEach((entry) => {
          if (entry.classId && entry.sectionId) {
            const key = `${entry.classId}_${entry.sectionId}`;
            substituteClassSections.add(key);
            substituteInfo[key] = record.teacherName || 'Teacher';
          }
        });
      }
    });

    // Combine assigned and substitute classes
    const allTeacherClassSections = new Set([...assignedClassSections, ...substituteClassSections]);

    // If teacher has no classes, show empty
    if (allTeacherClassSections.size === 0) {
      setAvailableClasses([]);
      return;
    }

    // Filter classes to show only teacher's classes, mark which are substitute
    const filtered = allClasses.map((cls) => {
      const sections = cls.sections?.map((sec) => {
        const key = `${cls._id}_${sec._id}`;
        const isSubstitute = substituteClassSections.has(key);
        return {
          ...sec,
          isSubstitute,
          substituteFor: isSubstitute ? substituteInfo[key] : null,
        };
      }).filter((sec) => allTeacherClassSections.has(`${cls._id}_${sec._id}`)) || [];
      return { ...cls, sections };
    }).filter((cls) => cls.sections.length > 0);

    setAvailableClasses(filtered);
  };

  const fetchTeachers = async () => {
    try {
      const response = await teacherService.getAll();
      const data = response?.data || [];
      setTeachers(data.length > 0 ? data : timetableStore.getTeachers());
    } catch {
      setTeachers(timetableStore.getTeachers());
    }
  };

  const fetchStudents = async () => {
    try {
      setStudentLoading(true);
      const response = await studentService.getAll({
        classId: selectedClass,
        sectionId: selectedSection,
      });
      const data = response.data || [];
      if (data.length === 0) {
        const dummyStudents = generateDummyStudents(selectedClass, selectedSection);
        setStudents(dummyStudents);
        const initial = {};
        dummyStudents.forEach((s) => { initial[s._id] = ATTENDANCE_STATUS.PRESENT; });
        setStudentAttendance(initial);
      } else {
        setStudents(data);
        const initial = {};
        data.forEach((s) => { initial[s._id] = ATTENDANCE_STATUS.PRESENT; });
        setStudentAttendance(initial);
      }
    } catch {
      const dummyStudents = generateDummyStudents(selectedClass, selectedSection);
      setStudents(dummyStudents);
      const initial = {};
      dummyStudents.forEach((s) => { initial[s._id] = ATTENDANCE_STATUS.PRESENT; });
      setStudentAttendance(initial);
    } finally {
      setStudentLoading(false);
    }
  };

  const generateDummyStudents = (classId, sectionId) => {
    const classObj = (classes.length > 0 ? classes : timetableStore.getClasses()).find((c) => c._id === classId);
    const section = classObj?.sections?.find((s) => s._id === sectionId);
    const count = 5;
    const names = ['Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha Singh', 'Vikram Mehta'];
    return Array.from({ length: count }, (_, i) => ({
      _id: `stu_${classId}_${sectionId}_${i}`,
      name: names[i] || `Student ${i + 1}`,
      admissionNumber: `ADM${2024}${String(i + 1).padStart(4, '0')}`,
    }));
  };

  const loadTeacherAttendance = () => {
    const stored = attendanceStore.getTeacherAttendance(teacherDate);
    const map = {};
    teachers.forEach((t) => {
      const rec = stored.find((r) => r.teacherId === t._id);
      map[t._id] = rec
        ? { status: rec.status, substituteId: rec.substituteId || '' }
        : { status: TEACHER_STATUS.PRESENT, substituteId: '' };
    });
    setTeacherAttendance(map);
  };


  const handleTeacherStatusChange = (teacherId, status) => {
    setTeacherAttendance((prev) => ({
      ...prev,
      [teacherId]: {
        ...prev[teacherId],
        status,
        substituteId: status === TEACHER_STATUS.PRESENT ? '' : prev[teacherId]?.substituteId || '',
      },
    }));
  };

  const handleTeacherSubstituteChange = (teacherId, substituteId) => {
    setTeacherAttendance((prev) => ({
      ...prev,
      [teacherId]: { ...prev[teacherId], substituteId },
    }));
  };

  const handleSaveTeacherAttendance = () => {
    const records = Object.entries(teacherAttendance).map(([teacherId, data]) => {
      const teacher = teachers.find((t) => t._id === teacherId);
      const substitute = data.substituteId ? teachers.find((t) => t._id === data.substituteId) : null;
      return {
        teacherId,
        teacherName: teacher?.name,
        status: data.status,
        substituteId: data.substituteId || null,
        substituteName: substitute?.name || null,
      };
    });
    attendanceStore.saveTeacherAttendance(teacherDate, records);
    toast.success('Teacher attendance saved');
  };

  const handleStudentStatusChange = (studentId, status) => {
    setStudentAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSaveStudentAttendance = async (e) => {
    e.preventDefault();
    if (!selectedClass || !selectedSection || !studentDate) {
      toast.error('Please select class, section, and date');
      return;
    }

    const records = Object.entries(studentAttendance).map(([studentId, status]) => ({
      studentId,
      status,
    }));

    try {
      attendanceStore.saveStudentAttendance(selectedClass, selectedSection, studentDate, records);
      toast.success('Student attendance saved');
    } catch (error) {
      toast.error('Failed to save attendance');
    }
  };

  const selectedClassObj = availableClasses.find((c) => c._id === selectedClass) || classes.find((c) => c._id === selectedClass);
  const sections = selectedClassObj?.sections || [];

  const presentCount = Object.values(studentAttendance).filter((s) => s === ATTENDANCE_STATUS.PRESENT || s === ATTENDANCE_STATUS.LATE).length;
  const absentCount = Object.values(studentAttendance).filter((s) => s === ATTENDANCE_STATUS.ABSENT).length;
  const totalCount = students.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-600">
          {isAdmin ? 'Manage teacher and student attendance' : 'Mark student attendance'}
        </p>
      </div>

      {isAdmin && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode('teacher')}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
              mode === 'teacher'
                ? 'bg-brand-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <GraduationCap size={18} />
            Teacher Attendance
          </button>
          <button
            type="button"
            onClick={() => setMode('student')}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
              mode === 'student'
                ? 'bg-brand-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Users size={18} />
            Student Attendance
          </button>
        </div>
      )}

      {mode === 'teacher' && isAdmin && (
        <Card>
          <div className="mb-6">
            <Input
              label="Date"
              type="date"
              value={teacherDate}
              onChange={(e) => setTeacherDate(e.target.value)}
            />
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Teacher Status & Substitute
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Mark Present/Absent/Leave. For Absent or Leave, assign a substitute teacher.
          </p>

          <div className="overflow-x-auto">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Teacher</Table.Head>
                  <Table.Head>Status</Table.Head>
                  <Table.Head>Substitute Teacher</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {teachers.map((teacher) => {
                  const data = teacherAttendance[teacher._id] || {
                    status: TEACHER_STATUS.PRESENT,
                    substituteId: '',
                  };
                  const needsSubstitute = data.status === TEACHER_STATUS.ABSENT || data.status === TEACHER_STATUS.LEAVE;
                  return (
                    <Table.Row key={teacher._id}>
                      <Table.Cell className="font-medium">{teacher.name}</Table.Cell>
                      <Table.Cell>
                        <div className="flex gap-2 flex-wrap">
                          {Object.values(TEACHER_STATUS).map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => handleTeacherStatusChange(teacher._id, status)}
                              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                data.status === status
                                  ? 'bg-brand-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                          ))}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        {needsSubstitute ? (
                          <Select
                            value={data.substituteId}
                            onChange={(e) =>
                              handleTeacherSubstituteChange(teacher._id, e.target.value)
                            }
                            options={teachers
                              .filter((t) => t._id !== teacher._id)
                              .map((t) => ({ value: t._id, label: t.name }))}
                            placeholder="Select substitute"
                            className="min-w-[180px]"
                          />
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          </div>

          <div className="flex justify-end mt-6 pt-4 border-t">
            <Button
              onClick={handleSaveTeacherAttendance}
              leftIcon={<Save size={18} />}
            >
              Save Teacher Attendance
            </Button>
          </div>
        </Card>
      )}

      {mode === 'student' && (
        <Card>
          {!isAdmin && availableClasses.length === 0 && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                No classes assigned. Please contact admin to assign classes or check if you are assigned as substitute for today.
              </p>
            </div>
          )}
          <form onSubmit={handleSaveStudentAttendance} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label={isAdmin ? "Class" : "Your Assigned Classes"}
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedSection('');
                  setStudents([]);
                }}
                options={availableClasses.map((c) => ({ value: c._id, label: c.name }))}
                required
                placeholder={isAdmin ? "Select class" : "Select your class"}
                disabled={!isAdmin && availableClasses.length === 0}
              />
              <Select
                label="Section"
                value={selectedSection}
                onChange={(e) => {
                  setSelectedSection(e.target.value);
                  setStudents([]);
                }}
                options={sections.map((s) => ({
                  value: s._id,
                  label: s.isSubstitute
                    ? `${s.name} (Substitute for ${s.substituteFor})`
                    : s.name,
                }))}
                required
                disabled={!selectedClass}
              />
              <Input
                label="Date"
                type="date"
                value={studentDate}
                onChange={(e) => setStudentDate(e.target.value)}
                required
              />
            </div>

            {selectedClass && selectedSection && (
              <>
                {(() => {
                  const selectedSectionObj = sections.find((s) => s._id === selectedSection);
                  if (selectedSectionObj?.isSubstitute) {
                    return (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Substitute Class:</strong> You are marking attendance as substitute for{' '}
                          <strong>{selectedSectionObj.substituteFor}</strong>
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}
              </>
            )}

            {students.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <p className="text-sm text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700">Present</p>
                    <p className="text-2xl font-bold text-green-800">{presentCount}</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-700">Absent</p>
                    <p className="text-2xl font-bold text-red-800">{absentCount}</p>
                  </div>
                  <div className="p-4 bg-brand-50 rounded-lg border border-brand-200">
                    <p className="text-sm text-brand-700">Attendance %</p>
                    <p className="text-2xl font-bold text-brand-800">
                      {totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Student List</h3>
                  <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                    <Table>
                      <Table.Header>
                        <Table.Row>
                          <Table.Head>#</Table.Head>
                          <Table.Head>Admission No.</Table.Head>
                          <Table.Head>Name</Table.Head>
                          <Table.Head>Status</Table.Head>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {students.map((student, idx) => (
                          <Table.Row key={student._id}>
                            <Table.Cell>{idx + 1}</Table.Cell>
                            <Table.Cell>{student.admissionNumber}</Table.Cell>
                            <Table.Cell className="font-medium">{student.name}</Table.Cell>
                            <Table.Cell>
                              <div className="flex gap-2 flex-wrap">
                                {Object.values(ATTENDANCE_STATUS).map((status) => (
                                  <button
                                    key={status}
                                    type="button"
                                    onClick={() =>
                                      handleStudentStatusChange(student._id, status)
                                    }
                                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                      studentAttendance[student._id] === status
                                        ? 'bg-brand-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                  >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                  </button>
                                ))}
                              </div>
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button type="submit" loading={studentLoading} leftIcon={<Save size={18} />}>
                Save Student Attendance
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default AttendanceMark;
