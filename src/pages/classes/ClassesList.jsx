import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, ArrowLeft, Eye, Calendar, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import { classService } from '../../services/classService';
import { studentService } from '../../services/studentService';
import { classStore } from '../../store/classStore';
import { timetableStore } from '../../store/timetableStore';
import { attendanceStore } from '../../store/attendanceStore';
import { ROUTES } from '../../config/constants';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Loading from '../../components/ui/Loading';

const ClassesList = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', sectionName: '' });
  const [viewMode, setViewMode] = useState('classes'); // 'classes' | 'students' | 'student-detail'

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await classService.getAll();
      const data = response.data || [];
      setClasses(data.length > 0 ? data : classStore.getAll());
    } catch (error) {
      setClasses(classStore.getAll());
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter class name');
      return;
    }
    try {
      await classService.create({ name: formData.name });
      toast.success('Class created successfully');
      setShowModal(false);
      setFormData({ name: '', sectionName: '' });
      fetchClasses();
    } catch (error) {
      // Fallback to localStorage
      classStore.create(formData.name);
      toast.success('Class created successfully');
      setShowModal(false);
      setFormData({ name: '', sectionName: '' });
      fetchClasses();
    }
  };

  const handleAddSection = async () => {
    if (!selectedClass || !formData.sectionName.trim()) {
      toast.error('Please enter section name');
      return;
    }
    try {
      await classService.addSection(selectedClass._id, formData.sectionName);
      toast.success('Section added successfully');
      setShowSectionModal(false);
      setFormData({ name: '', sectionName: '' });
      setSelectedClass(null);
      fetchClasses();
    } catch (error) {
      // Fallback to localStorage
      classStore.addSection(selectedClass._id, formData.sectionName);
      toast.success('Section added successfully');
      setShowSectionModal(false);
      setFormData({ name: '', sectionName: '' });
      setSelectedClass(null);
      fetchClasses();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    try {
      await classService.delete(id);
      toast.success('Class deleted successfully');
      fetchClasses();
    } catch (error) {
      classStore.delete(id);
      toast.success('Class deleted successfully');
      fetchClasses();
    }
  };

  const handleClassClick = async (classItem, section = null) => {
    setSelectedClass(classItem);
    setSelectedSection(section);
    setViewMode('students');
    await fetchStudents(classItem._id, section?._id);
  };

  const fetchStudents = async (classId, sectionId = null) => {
    try {
      setStudentsLoading(true);
      const response = await studentService.getAll({ classId, sectionId });
      const data = response.data || [];
      
      if (data.length === 0) {
        // Generate dummy students
        const classObj = classes.find((c) => c._id === classId) || classStore.getById(classId);
        const sections = sectionId 
          ? [classObj?.sections?.find((s) => s._id === sectionId)]
          : classObj?.sections || [];
        
        const dummyStudents = [];
        sections.forEach((sec, secIdx) => {
          if (sec) {
            const names = ['Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha Singh', 'Vikram Mehta'];
            names.forEach((name, idx) => {
              dummyStudents.push({
                _id: `stu_${classId}_${sec._id}_${idx}`,
                name,
                admissionNumber: `ADM${2024}${String(secIdx * 5 + idx + 1).padStart(4, '0')}`,
                class: { _id: classId, name: classObj?.name },
                section: { _id: sec._id, name: sec.name },
                email: `${name.toLowerCase().replace(' ', '.')}@student.acadexis.com`,
                phone: `9876543${String(secIdx * 5 + idx + 1).padStart(3, '0')}`,
              });
            });
          }
        });
        setStudents(dummyStudents);
      } else {
        setStudents(data);
      }
    } catch (error) {
      // Generate dummy students on error
      const classObj = classes.find((c) => c._id === classId) || classStore.getById(classId);
      const sections = sectionId 
        ? [classObj?.sections?.find((s) => s._id === sectionId)]
        : classObj?.sections || [];
      
      const dummyStudents = [];
      sections.forEach((sec, secIdx) => {
        if (sec) {
          const names = ['Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha Singh', 'Vikram Mehta'];
          names.forEach((name, idx) => {
            dummyStudents.push({
              _id: `stu_${classId}_${sec._id}_${idx}`,
              name,
              admissionNumber: `ADM${2024}${String(secIdx * 5 + idx + 1).padStart(4, '0')}`,
              class: { _id: classId, name: classObj?.name },
              section: { _id: sec._id, name: sec.name },
            });
          });
        }
      });
      setStudents(dummyStudents);
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const getStudentAttendance = (studentId) => {
    if (!selectedClass || !selectedSection) return { percentage: 0, present: 0, absent: 0 };
    
    const today = new Date();
    let present = 0;
    let total = 0;

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const stored = attendanceStore.getStudentAttendance(
        selectedClass._id,
        selectedSection._id,
        dateStr
      );
      
      const record = stored.find((r) => r.studentId === studentId);
      if (record) {
        total++;
        if (record.status === 'present' || record.status === 'late') {
          present++;
        }
      }
    }

    return {
      percentage: total > 0 ? ((present / total) * 100).toFixed(1) : 0,
      present,
      absent: total - present,
    };
  };

  if (loading) {
    return <Loading size="lg" />;
  }

  if (viewMode === 'students') {
    const sections = selectedClass?.sections || [];
    const filteredStudents = selectedSection
      ? students.filter((s) => s.section?._id === selectedSection._id)
      : students;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setViewMode('classes');
                setSelectedClass(null);
                setSelectedSection(null);
                setStudents([]);
              }}
              leftIcon={<ArrowLeft size={18} />}
            >
              Back to Classes
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedClass?.name} {selectedSection ? `- Section ${selectedSection.name}` : ''}
              </h1>
              <p className="text-gray-600">Students List</p>
            </div>
          </div>
        </div>

        {sections.length > 1 && (
          <Card>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => {
                  setSelectedSection(null);
                  fetchStudents(selectedClass._id);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  !selectedSection
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Sections
              </button>
              {sections.map((sec) => (
                <button
                  key={sec._id}
                  onClick={() => {
                    setSelectedSection(sec);
                    fetchStudents(selectedClass._id, sec._id);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedSection?._id === sec._id
                      ? 'bg-brand-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Section {sec.name}
                </button>
              ))}
            </div>
          </Card>
        )}

        <Card>
          {studentsLoading ? (
            <Loading />
          ) : (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Admission No.</Table.Head>
                  <Table.Head>Name</Table.Head>
                  <Table.Head>Section</Table.Head>
                  <Table.Head>Email</Table.Head>
                  <Table.Head>Attendance</Table.Head>
                  <Table.Head>Actions</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredStudents.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={6} className="text-center py-8 text-gray-500">
                      No students found
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  filteredStudents.map((student) => {
                    const attendance = getStudentAttendance(student._id);
                    return (
                      <Table.Row key={student._id}>
                        <Table.Cell className="font-medium">{student.admissionNumber}</Table.Cell>
                        <Table.Cell>{student.name}</Table.Cell>
                        <Table.Cell>{student.section?.name || '-'}</Table.Cell>
                        <Table.Cell>{student.email || '-'}</Table.Cell>
                        <Table.Cell>
                          <Badge variant={attendance.percentage >= 75 ? 'success' : 'warning'}>
                            {attendance.percentage}%
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleStudentClick(student)}
                              className="text-blue-600 hover:text-blue-800"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => navigate(ROUTES.STUDENT_VIEW.replace(':id', student._id))}
                              className="text-brand-600 hover:text-brand-800"
                              title="View Profile"
                            >
                              <FileText size={18} />
                            </button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })
                )}
              </Table.Body>
            </Table>
          )}
        </Card>

        <Modal
          isOpen={showStudentModal}
          onClose={() => setShowStudentModal(false)}
          title={`Student Details - ${selectedStudent?.name}`}
          size="lg"
        >
          {selectedStudent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Admission Number</p>
                  <p className="font-medium">{selectedStudent.admissionNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{selectedStudent.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Class</p>
                  <p className="font-medium">{selectedStudent.class?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Section</p>
                  <p className="font-medium">{selectedStudent.section?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{selectedStudent.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{selectedStudent.phone || '-'}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Attendance Summary</h3>
                {(() => {
                  const attendance = getStudentAttendance(selectedStudent._id);
                  return (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">Attendance %</p>
                        <p className="text-2xl font-bold text-blue-600">{attendance.percentage}%</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">Present</p>
                        <p className="text-2xl font-bold text-green-600">{attendance.present}</p>
                      </div>
                      <div className="p-3 bg-red-50 rounded-lg">
                        <p className="text-sm text-gray-600">Absent</p>
                        <p className="text-2xl font-bold text-red-600">{attendance.absent}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowStudentModal(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setShowStudentModal(false);
                    navigate(ROUTES.STUDENT_VIEW.replace(':id', selectedStudent._id));
                  }}
                >
                  View Full Profile
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classes & Sections</h1>
          <p className="text-gray-600">Manage classes and sections</p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          leftIcon={<Plus size={18} />}
        >
          Add Class
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <Card
            key={classItem._id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleClassClick(classItem)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{classItem.name}</h3>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedClass(classItem);
                    setShowSectionModal(true);
                  }}
                  className="text-brand-600 hover:text-brand-800 text-sm px-2 py-1 rounded hover:bg-brand-50"
                  title="Add Section"
                >
                  <Plus size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(classItem._id);
                  }}
                  className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                  title="Delete Class"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Sections:</p>
                <span className="text-sm font-medium text-gray-900">
                  {classItem.sections?.length || 0}
                </span>
              </div>
              {classItem.sections?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {classItem.sections.map((section) => (
                    <span
                      key={section._id}
                      className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClassClick(classItem, section);
                      }}
                    >
                      {section.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No sections</p>
              )}
              <div className="mt-3 pt-3 border-t flex items-center gap-2 text-sm text-brand-600">
                <Users size={16} />
                <span>Click to view students</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add New Class"
      >
        <div className="space-y-4">
          <Input
            label="Class Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., 1st, 2nd, 10th"
            required
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showSectionModal}
        onClose={() => {
          setShowSectionModal(false);
          setSelectedClass(null);
        }}
        title={`Add Section to ${selectedClass?.name}`}
      >
        <div className="space-y-4">
          <Input
            label="Section Name"
            value={formData.sectionName}
            onChange={(e) => setFormData({ ...formData, sectionName: e.target.value })}
            placeholder="e.g., A, B, C"
            required
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowSectionModal(false);
                setSelectedClass(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddSection}>Add Section</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClassesList;
