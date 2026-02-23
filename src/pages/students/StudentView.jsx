import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, FileText, ArrowLeft, TrendingUp, FileImage, User, Heart, Activity, GraduationCap, Stethoscope } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import { studentService } from '../../services/studentService';
import { attendanceService } from '../../services/attendanceService';
import { timetableService } from '../../services/timetableService';
import { examService } from '../../services/examService';
import { timetableStore } from '../../store/timetableStore';
import { attendanceStore } from '../../store/attendanceStore';
import { ATTENDANCE_STATUS } from '../../config/constants';
import { useAuthStore } from '../../store/authStore';
import { ROLES, ROUTES } from '../../config/constants';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Loading from '../../components/ui/Loading';

const StudentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isStudent = user?.role === ROLES.STUDENT;
  const studentId = isStudent ? user._id : id;

  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [attendancePercentage, setAttendancePercentage] = useState(0);
  const [timetable, setTimetable] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId || (isStudent && user?._id)) {
      fetchStudentData();
    }
  }, [studentId, isStudent, user?._id]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      
      // Fetch student info
      if (isStudent) {
        // For student role, use their own data
        setStudent({
          _id: user._id,
          name: user.name,
          email: user.email,
          class: user.class || { _id: 'cls_10', name: '10th' },
          section: user.section || { _id: 'sec_10a', name: 'A' },
          admissionNumber: user.admissionNo || 'ADM2024001',
        });
      } else {
        // For admin, fetch from API
        try {
          const response = await studentService.getById(studentId);
          setStudent(response.data || {});
        } catch {
          // Use dummy data if API fails
          setStudent({
            _id: studentId,
            name: 'Student Name',
            class: { _id: 'cls_10', name: '10th' },
            section: { _id: 'sec_10a', name: 'A' },
            admissionNumber: 'ADM2024001',
            documents: [],
          });
        }
      }

    } catch (error) {
      toast.error('Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (student?.class?._id && student?.section?._id) {
      loadAttendance();
      loadTimetable();
      loadExams();
    }
  }, [student]);

  const loadAttendance = () => {
    if (!student?.class?._id || !student?.section?._id) return;

    try {
      // Get last 30 days attendance
      const today = new Date();
      const attendanceRecords = [];
      let presentCount = 0;
      let totalCount = 0;

      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const stored = attendanceStore.getStudentAttendance(
          student.class._id,
          student.section._id,
          dateStr
        );
        
        const record = stored.find((r) => r.studentId === (studentId || student?._id));
        if (record) {
          attendanceRecords.push({
            date: dateStr,
            status: record.status,
          });
          totalCount++;
          if (record.status === ATTENDANCE_STATUS.PRESENT || record.status === ATTENDANCE_STATUS.LATE) {
            presentCount++;
          }
        }
      }

      setAttendance(attendanceRecords.reverse());
      setAttendancePercentage(totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : 0);
    } catch (error) {
      console.error('Error loading attendance:', error);
    }
  };

  const loadTimetable = () => {
    if (!student?.class?._id || !student?.section?._id) return;

    try {
      const stored = timetableStore.getTimetableByClass(
        student.class._id,
        student.section._id
      );
      setTimetable(stored);
    } catch (error) {
      console.error('Error loading timetable:', error);
    }
  };

  const loadExams = async () => {
    if (!student?.class?._id) return;

    try {
      const response = await examService.getAll({ classId: student.class._id });
      const data = response.data || [];
      
      // Filter upcoming exams
      const today = new Date().toISOString().split('T')[0];
      const upcoming = data.filter((exam) => {
        if (exam.schedules && exam.schedules.length > 0) {
          return exam.schedules.some((s) => s.date >= today);
        }
        return exam.endDate >= today;
      });
      
      setExams(upcoming);
    } catch (error) {
      console.error('Error loading exams:', error);
      // Use dummy exams
      setExams([
        {
          _id: 'exam1',
          name: 'Mid Term Examination',
          type: 'Mid-term',
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          schedules: [
            { subject: { name: 'Mathematics' }, date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
            { subject: { name: 'Science' }, date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
          ],
        },
      ]);
    }
  };

  const getTimetableEntry = (day, time) => {
    return timetable.find((e) => e.day === day && e.time === time);
  };

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '01:00', '02:00', '03:00'];

  const statusColors = {
    [ATTENDANCE_STATUS.PRESENT]: 'success',
    [ATTENDANCE_STATUS.ABSENT]: 'danger',
    [ATTENDANCE_STATUS.LATE]: 'warning',
    [ATTENDANCE_STATUS.EXCUSED]: 'info',
  };

  if (loading) {
    return <Loading size="lg" />;
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Student not found</p>
        <Button variant="outline" onClick={() => navigate(ROUTES.STUDENTS)} className="mt-4">
          Back to Students
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isStudent ? 'My Profile' : student.name}
          </h1>
          <p className="text-gray-600">
            {student.admissionNumber} • {student.class?.name} - {student.section?.name}
          </p>
        </div>
        {!isStudent && (
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.STUDENTS)}
            leftIcon={<ArrowLeft size={18} />}
          >
            Back
          </Button>
        )}
      </div>

      {/* Attendance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Attendance</p>
              <p className="text-3xl font-bold text-gray-900">{attendancePercentage}%</p>
              <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <TrendingUp className="text-white" size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Present Days</p>
              <p className="text-3xl font-bold text-green-600">
                {attendance.filter((a) => a.status === ATTENDANCE_STATUS.PRESENT || a.status === ATTENDANCE_STATUS.LATE).length}
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <Calendar className="text-white" size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Absent Days</p>
              <p className="text-3xl font-bold text-red-600">
                {attendance.filter((a) => a.status === ATTENDANCE_STATUS.ABSENT).length}
              </p>
            </div>
            <div className="bg-red-500 p-3 rounded-lg">
              <Calendar className="text-white" size={24} />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Records */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Attendance</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {attendance.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No attendance records found</p>
              ) : (
                attendance.slice(-10).reverse().map((record, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-900">{formatDate(record.date)}</span>
                    </div>
                    <Badge variant={statusColors[record.status] || 'default'}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>

        {/* Class Timetable */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Timetable</h3>
            {timetable.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No timetable available</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 p-2 bg-gray-50 font-semibold">Time</th>
                      {DAYS.map((day) => (
                        <th key={day} className="border border-gray-300 p-2 bg-gray-50 font-semibold">
                          {day.slice(0, 3)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TIME_SLOTS.map((time) => (
                      <tr key={time}>
                        <td className="border border-gray-300 p-2 font-medium">{time}</td>
                        {DAYS.map((day) => {
                          const entry = getTimetableEntry(day, time);
                          return (
                            <td key={day} className="border border-gray-300 p-2 text-center">
                              {entry ? (
                                <div>
                                  <p className="font-medium text-gray-900">{entry.subject?.name}</p>
                                  <p className="text-gray-600 text-[10px]">{entry.teacher?.name}</p>
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Exam Timetable */}
      <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Examinations</h3>
            {exams.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No upcoming exams</p>
          ) : (
            <div className="space-y-4">
              {exams.map((exam) => (
                <div key={exam._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{exam.name}</h3>
                      <p className="text-sm text-gray-600">{exam.type}</p>
                    </div>
                    <Badge variant="primary">{exam.type}</Badge>
                  </div>
                  
                  {exam.schedules && exam.schedules.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700 mb-2">Exam Schedule:</p>
                      <Table>
                        <Table.Header>
                          <Table.Row>
                            <Table.Head>Subject</Table.Head>
                            <Table.Head>Date</Table.Head>
                            <Table.Head>Time</Table.Head>
                          </Table.Row>
                        </Table.Header>
                        <Table.Body>
                          {exam.schedules.map((schedule, idx) => (
                            <Table.Row key={idx}>
                              <Table.Cell className="font-medium">
                                {schedule.subject?.name || 'Subject'}
                              </Table.Cell>
                              <Table.Cell>{formatDate(schedule.date)}</Table.Cell>
                              <Table.Cell>{schedule.time || '09:00 AM'}</Table.Cell>
                            </Table.Row>
                          ))}
                        </Table.Body>
                      </Table>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        <span>Start: {formatDate(exam.startDate)}</span>
                      </div>
                      {exam.endDate && (
                        <div className="flex items-center gap-1">
                          <Calendar size={16} />
                          <span>End: {formatDate(exam.endDate)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            )}
          </div>
      </Card>

      {/* Personal Information */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User size={20} />
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Blood Group</p>
              <p className="font-medium">{student.bloodGroup || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Height</p>
              <p className="font-medium">{student.height ? `${student.height} cm` : '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Weight</p>
              <p className="font-medium">{student.weight ? `${student.weight} kg` : '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date of Birth</p>
              <p className="font-medium">
                {student.dateOfBirth ? formatDate(student.dateOfBirth) : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{student.email || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium">{student.phone || '-'}</p>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <p className="text-sm text-gray-600">Address</p>
              <p className="font-medium">{student.address || '-'}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Parents Information */}
      {(student.fatherName || student.motherName) && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Heart size={20} />
              Parents Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Father</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{student.fatherName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{student.fatherPhone || '-'}</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Mother</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{student.motherName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{student.motherPhone || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
            {student.guardianName && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Guardian</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{student.guardianName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{student.guardianPhone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Relation</p>
                    <p className="font-medium">{student.guardianRelation || '-'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Previous School Information */}
      {student.previousSchoolName && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <GraduationCap size={20} />
              Previous School Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">School Name</p>
                <p className="font-medium">{student.previousSchoolName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Percentage</p>
                <p className="font-medium">
                  {student.previousSchoolPercentage ? `${student.previousSchoolPercentage}%` : '-'}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Sports Information */}
      {student.sports && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity size={20} />
              Sports Information
            </h3>
            <div>
              <p className="text-sm text-gray-600 mb-2">Sports / Games</p>
              <p className="font-medium">{student.sports}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Medical Details */}
      {(student.medicalConditions || student.allergies || student.medications || student.emergencyContact) && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Stethoscope size={20} />
              Medical Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {student.medicalConditions && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Medical Conditions</p>
                  <p className="font-medium whitespace-pre-line">{student.medicalConditions}</p>
                </div>
              )}
              {student.allergies && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Allergies</p>
                  <p className="font-medium whitespace-pre-line">{student.allergies}</p>
                </div>
              )}
              {student.medications && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Current Medications</p>
                  <p className="font-medium whitespace-pre-line">{student.medications}</p>
                </div>
              )}
              {student.emergencyContact && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Emergency Contact</p>
                  <p className="font-medium">{student.emergencyContact}</p>
                  {student.emergencyContactPhone && (
                    <p className="text-sm text-gray-600 mt-1">Phone: {student.emergencyContactPhone}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Documents Section */}
      {student.documents && student.documents.length > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileImage size={20} />
              Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {student.documents.map((doc, idx) => (
                <div key={doc.id || idx} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <p className="font-medium text-sm mb-3 text-gray-900">{doc.name}</p>
                  {doc.url && (
                    <div className="relative">
                      <img
                        src={doc.url}
                        alt={doc.name}
                        className="w-full h-48 object-cover rounded cursor-pointer"
                        onClick={() => window.open(doc.url, '_blank')}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity rounded flex items-center justify-center">
                        <FileText className="text-white opacity-0 hover:opacity-100" size={24} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default StudentView;
