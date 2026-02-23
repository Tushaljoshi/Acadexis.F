import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, DollarSign, Calendar, GraduationCap, BookOpen, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { teacherService } from '../../services/teacherService';
import { teacherStore } from '../../store/teacherStore';
import { ROUTES } from '../../config/constants';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Loading from '../../components/ui/Loading';

const TeachersList = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await teacherService.getAll();
      const data = response.data || [];
      setTeachers(data.length > 0 ? data : teacherStore.getAll());
    } catch (error) {
      setTeachers(teacherStore.getAll());
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;
    try {
      await teacherService.delete(id);
      toast.success('Teacher deleted successfully');
      fetchTeachers();
    } catch (error) {
      teacherStore.delete(id);
      toast.success('Teacher deleted locally');
      fetchTeachers();
    }
  };

  const handleViewDetails = async (teacherId) => {
    try {
      const response = await teacherService.getById(teacherId);
      const teacher = response.data || teacherStore.getById(teacherId);
      if (teacher) {
        setSelectedTeacher(teacher);
        setShowViewModal(true);
      } else {
        toast.error('Teacher not found');
      }
    } catch (error) {
      const teacher = teacherStore.getById(teacherId);
      if (teacher) {
        setSelectedTeacher(teacher);
        setShowViewModal(true);
      } else {
        toast.error('Teacher not found');
      }
    }
  };

  const filteredTeachers = teachers.filter((teacher) => {
    const term = searchTerm.toLowerCase();
    return (
      teacher.name?.toLowerCase().includes(term) ||
      teacher.email?.toLowerCase().includes(term) ||
      teacher.phone?.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return <Loading size="lg" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
          <p className="text-gray-600">Manage teacher records, salary, and assignments</p>
        </div>
        <Button
          onClick={() => navigate(ROUTES.TEACHER_ADD)}
          leftIcon={<Plus size={18} />}
        >
          Add Teacher
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Name</Table.Head>
              <Table.Head>Email</Table.Head>
              <Table.Head>Phone</Table.Head>
              <Table.Head>Subjects</Table.Head>
              <Table.Head>Class Teacher</Table.Head>
              <Table.Head>Salary</Table.Head>
              <Table.Head>Status</Table.Head>
              <Table.Head>Actions</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredTeachers.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={8} className="text-center py-8 text-gray-500">
                  No teachers found
                </Table.Cell>
              </Table.Row>
            ) : (
              filteredTeachers.map((teacher) => {
                const basic = teacher.salaryBasic ?? teacher.salary ?? 0;
                const allowance = teacher.salaryAllowance ?? 0;
                const total = Number(basic) + Number(allowance);

                return (
                  <Table.Row key={teacher._id}>
                    <Table.Cell className="font-medium">{teacher.name}</Table.Cell>
                    <Table.Cell>{teacher.email}</Table.Cell>
                    <Table.Cell>{teacher.phone}</Table.Cell>
                    <Table.Cell>
                      {Array.isArray(teacher.subjects)
                        ? teacher.subjects.slice(0, 2).map((s) => s.name || s).join(', ')
                        : teacher.subjects || '-'}
                    </Table.Cell>
                    <Table.Cell>{teacher.classTeacher || '-'}</Table.Cell>
                    <Table.Cell>
                      {total > 0 ? `₹${total.toLocaleString('en-IN')}` : '-'}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge variant={teacher.status === 'active' ? 'success' : 'default'}>
                        {teacher.status || 'active'}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(teacher._id)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() =>
                            navigate(ROUTES.TEACHER_EDIT.replace(':id', teacher._id))
                          }
                          className="text-brand-600 hover:text-brand-800"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(teacher._id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                );
              })
            )}
          </Table.Body>
        </Table>
      </Card>

      {/* View Details Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedTeacher(null);
        }}
        title={`Teacher Details - ${selectedTeacher?.name || ''}`}
        size="xl"
      >
        {selectedTeacher && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User size={20} />
                Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{selectedTeacher.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{selectedTeacher.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{selectedTeacher.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="font-medium">{selectedTeacher.gender || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date of Birth</p>
                  <p className="font-medium">
                    {selectedTeacher.dateOfBirth ? formatDate(selectedTeacher.dateOfBirth) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium">{selectedTeacher.address || '-'}</p>
                </div>
              </div>
            </div>

            {/* Professional Details */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <GraduationCap size={20} />
                Professional Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Qualification</p>
                  <p className="font-medium">{selectedTeacher.qualification || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Experience</p>
                  <p className="font-medium">
                    {selectedTeacher.experienceYears ? `${selectedTeacher.experienceYears} years` : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Main Subject</p>
                  <p className="font-medium">{selectedTeacher.mainSubject || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Subjects</p>
                  <p className="font-medium">
                    {Array.isArray(selectedTeacher.subjects)
                      ? selectedTeacher.subjects.map((s) => s.name || s).join(', ')
                      : selectedTeacher.subjects || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge variant={selectedTeacher.status === 'active' ? 'success' : 'default'}>
                    {selectedTeacher.status || 'active'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Joining Date</p>
                  <p className="font-medium">
                    {selectedTeacher.joinDate ? formatDate(selectedTeacher.joinDate) : '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Class Teacher Assignment */}
            {selectedTeacher.classId && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen size={20} />
                  Class Teacher Assignment
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Class</p>
                    <p className="font-medium">
                      {selectedTeacher.class?.name || selectedTeacher.classTeacher || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Section</p>
                    <p className="font-medium">{selectedTeacher.section?.name || '-'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Salary Details */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign size={20} />
                Salary Details
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Basic Salary</p>
                  <p className="font-medium text-lg">
                    {selectedTeacher.salaryBasic
                      ? `₹${Number(selectedTeacher.salaryBasic).toLocaleString('en-IN')}`
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Allowances</p>
                  <p className="font-medium text-lg">
                    {selectedTeacher.salaryAllowance
                      ? `₹${Number(selectedTeacher.salaryAllowance).toLocaleString('en-IN')}`
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Monthly Salary</p>
                  <p className="font-bold text-xl text-brand-700">
                    {(() => {
                      const basic = selectedTeacher.salaryBasic ?? selectedTeacher.salary ?? 0;
                      const allowance = selectedTeacher.salaryAllowance ?? 0;
                      const total = Number(basic) + Number(allowance);
                      return total > 0 ? `₹${total.toLocaleString('en-IN')}` : '-';
                    })()}
                  </p>
                </div>
              </div>
            </div>

            {/* Documents */}
            {selectedTeacher.documents && selectedTeacher.documents.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedTeacher.documents.map((doc, idx) => (
                    <div key={idx} className="border rounded-lg p-3">
                      <p className="font-medium text-sm mb-2">{doc.name}</p>
                      {doc.url && (
                        <img
                          src={doc.url}
                          alt={doc.name}
                          className="w-full h-32 object-cover rounded"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedTeacher(null);
                }}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setShowViewModal(false);
                  navigate(ROUTES.TEACHER_EDIT.replace(':id', selectedTeacher._id));
                }}
              >
                Edit Teacher
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TeachersList;
