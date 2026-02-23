import { useState, useEffect } from 'react';
import { Clock, Calendar, User, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import { timetableService } from '../../services/timetableService';
import { classService } from '../../services/classService';
import { teacherService } from '../../services/teacherService';
import { timetableStore } from '../../store/timetableStore';
import { useAuthStore } from '../../store/authStore';
import { ROUTES, ROLES } from '../../config/constants';
import toast from 'react-hot-toast';
import Loading from '../../components/ui/Loading';

const TimetableList = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [teacherTimetable, setTeacherTimetable] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('class');

  const { user } = useAuthStore();
  const isAdmin = user?.role === ROLES.ADMIN;
  const isTeacher = user?.role === ROLES.TEACHER;

  useEffect(() => {
    fetchClasses();
    if (isAdmin || isTeacher) {
      fetchTeachers();
    }
    if (isTeacher && user?._id) {
      setViewMode('teacher');
      setSelectedTeacher(user._id);
      loadTeacherTimetable(user._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      loadTimetable();
    }
  }, [selectedClass, selectedSection]);

  useEffect(() => {
    if (viewMode === 'teacher' && (selectedTeacher || (isTeacher && user?._id))) {
      loadTeacherTimetable(selectedTeacher || user._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, selectedTeacher]);

  const fetchClasses = async () => {
    try {
      const response = await classService.getAll();
      const data = response.data || [];
      setClasses(data.length > 0 ? data : timetableStore.getClasses());
    } catch {
      setClasses(timetableStore.getClasses());
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await teacherService.getAll();
      const data = response.data || [];
      if (data.length > 0) {
        setTeachers(data);
      } else {
        setTeachers(timetableStore.getTeachers());
      }
    } catch {
      setTeachers(timetableStore.getTeachers());
    } finally {
      setLoading(false);
    }
  };

  const loadTimetable = () => {
    setLoading(true);
    const stored = timetableStore.getTimetableByClass(selectedClass, selectedSection);
    if (stored.length > 0) {
      setTimetable(stored);
      setLoading(false);
    } else {
      timetableService.getByClass(selectedClass, selectedSection)
        .then(res => setTimetable(res.data || []))
        .catch(() => setTimetable([]))
        .finally(() => setLoading(false));
    }
  };

  const loadTeacherTimetable = (teacherId) => {
    if (!teacherId) return;
    setLoading(true);
    const stored = timetableStore.getTimetableByTeacher(teacherId);
    if (stored.length > 0) {
      setTeacherTimetable(stored);
      setLoading(false);
    } else {
      timetableService.getByTeacher(teacherId)
        .then(res => setTeacherTimetable(res.data || []))
        .catch(() => setTeacherTimetable([]))
        .finally(() => setLoading(false));
    }
  };

  const selectedClassObj = classes.find((c) => c._id === selectedClass);
  const sections = selectedClassObj?.sections || [];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '01:00', '02:00', '03:00'];

  const getTimetableEntry = (day, time) => {
    return timetable.find(
      (entry) => entry.day === day && entry.time === time
    );
  };

  const getTeacherTimetableEntry = (day, time) => {
    return teacherTimetable.find(
      (entry) => entry.day === day && entry.time === time
    );
  };

  if (loading) {
    return <Loading size="lg" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timetable</h1>
          <p className="text-gray-600">
            View {isAdmin ? 'and manage ' : ''}class and teacher schedules
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => navigate(ROUTES.TIMETABLE_CREATE, {
              state: selectedClass && selectedSection
                ? { classId: selectedClass, sectionId: selectedSection }
                : undefined,
            })}
            leftIcon={<Plus size={18} />}
          >
            {selectedClass && selectedSection ? 'Edit Timetable' : 'Create Timetable'}
          </Button>
        )}
      </div>

      <Card>
        {(isAdmin || isTeacher) && (
          <div className="flex items-center gap-3 mb-4">
            <button
              type="button"
              onClick={() => setViewMode('class')}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                viewMode === 'class'
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Class Timetable
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('teacher');
                if ((isAdmin && selectedTeacher) || isTeacher) {
                  loadTeacherTimetable(isTeacher ? user?._id : selectedTeacher);
                }
              }}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors flex items-center gap-1.5 ${
                viewMode === 'teacher'
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <User size={14} />
              Teacher Timetable
            </button>
          </div>
        )}

        {/* Class-wise timetable */}
        {(viewMode === 'class' || (!isAdmin && !isTeacher)) && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Select
                label="Class"
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedSection('');
                }}
                options={classes.map((c) => ({ value: c._id, label: c.name }))}
              />
              <Select
                label="Section"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                options={sections.map((s) => ({ value: s._id, label: s.name }))}
                disabled={!selectedClass}
              />
            </div>

            {selectedClass && selectedSection && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 p-3 bg-gray-50 font-semibold">Time</th>
                      {days.map((day) => (
                        <th key={day} className="border border-gray-300 p-3 bg-gray-50 font-semibold">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((time) => (
                      <tr key={time}>
                        <td className="border border-gray-300 p-3 font-medium">{time}</td>
                        {days.map((day) => {
                          const entry = getTimetableEntry(day, time);
                          return (
                            <td key={day} className="border border-gray-300 p-3">
                              {entry ? (
                                <div className="text-center">
                                  <p className="font-medium text-gray-900">{entry.subject?.name}</p>
                                  <p className="text-sm text-gray-600">{entry.teacher?.name}</p>
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
          </>
        )}

        {/* Teacher-wise timetable for admin & teachers */}
        {(isAdmin || isTeacher) && viewMode === 'teacher' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {isAdmin && (
                <Select
                  label="Teacher"
                  value={selectedTeacher}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedTeacher(value);
                    if (value) {
                      loadTeacherTimetable(value);
                    }
                  }}
                  options={teachers.map((t) => ({
                    value: t._id,
                    label: t.name,
                  }))}
                />
              )}
              {isTeacher && (
                <div className="flex flex-col justify-end">
                  <p className="text-xs text-gray-500">
                    Viewing timetable for:&nbsp;
                    <span className="font-medium text-gray-800">{user?.name}</span>
                  </p>
                </div>
              )}
            </div>

            {(isTeacher || selectedTeacher) && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 p-3 bg-gray-50 font-semibold">Time</th>
                      {days.map((day) => (
                        <th key={day} className="border border-gray-300 p-3 bg-gray-50 font-semibold">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((time) => (
                      <tr key={time}>
                        <td className="border border-gray-300 p-3 font-medium">{time}</td>
                        {days.map((day) => {
                          const entry = getTeacherTimetableEntry(day, time);
                          return (
                            <td key={day} className="border border-gray-300 p-3">
                              {entry ? (
                                <div className="text-center">
                                  <p className="font-medium text-gray-900">
                                    {entry.subject?.name}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {entry.class?.name}
                                    {entry.section?.name ? ` - ${entry.section.name}` : ''}
                                  </p>
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
          </>
        )}
      </Card>
    </div>
  );
};

export default TimetableList;
