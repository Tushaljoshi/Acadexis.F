import { useState, useEffect } from 'react';
import { Plus, Search, Download, Upload, Edit, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { studentService } from '../../services/studentService';
import { ROUTES } from '../../config/constants';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Loading from '../../components/ui/Loading';
import Papa from 'papaparse';

const StudentsList = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await studentService.getAll({ search: searchTerm });
      setStudents(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    // Debounce search
    setTimeout(() => {
      fetchStudents();
    }, 500);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await studentService.delete(id);
      toast.success('Student deleted successfully');
      fetchStudents();
    } catch (error) {
      toast.error('Failed to delete student');
    }
  };

  const handleBulkUpload = async () => {
    if (!uploadFile) {
      toast.error('Please select a CSV file');
      return;
    }

    try {
      await studentService.bulkUpload(uploadFile);
      toast.success('Students uploaded successfully');
      setShowBulkUpload(false);
      setUploadFile(null);
      fetchStudents();
    } catch (error) {
      toast.error('Failed to upload students');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await studentService.exportToExcel({ search: searchTerm });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `students_${new Date().getTime()}.xlsx`;
      link.click();
      toast.success('Export successful');
    } catch (error) {
      toast.error('Failed to export students');
    }
  };

  const filteredStudents = students.filter((student) =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Loading size="lg" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600">Manage student records and information</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setShowBulkUpload(true)}
            leftIcon={<Upload size={18} />}
          >
            Bulk Upload
          </Button>
          <Button
            variant="secondary"
            onClick={handleExport}
            leftIcon={<Download size={18} />}
          >
            Export
          </Button>
          <Button
            onClick={() => navigate(ROUTES.STUDENT_ADD)}
            leftIcon={<Plus size={18} />}
          >
            Add Student
          </Button>
        </div>
      </div>

      <Card>
        <div className="mb-4">
          <Input
            placeholder="Search by name, admission number, or email..."
            value={searchTerm}
            onChange={handleSearch}
            leftIcon={<Search size={18} />}
          />
        </div>

        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Admission No.</Table.Head>
              <Table.Head>Name</Table.Head>
              <Table.Head>Class</Table.Head>
              <Table.Head>Section</Table.Head>
              <Table.Head>Email</Table.Head>
              <Table.Head>Phone</Table.Head>
              <Table.Head>Status</Table.Head>
              <Table.Head>Actions</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredStudents.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={8} className="text-center py-8 text-gray-500">
                  No students found
                </Table.Cell>
              </Table.Row>
            ) : (
              filteredStudents.map((student) => (
                <Table.Row key={student._id}>
                  <Table.Cell className="font-medium">{student.admissionNumber}</Table.Cell>
                  <Table.Cell>{student.name}</Table.Cell>
                  <Table.Cell>{student.class?.name || '-'}</Table.Cell>
                  <Table.Cell>{student.section?.name || '-'}</Table.Cell>
                  <Table.Cell>{student.email}</Table.Cell>
                  <Table.Cell>{student.phone}</Table.Cell>
                  <Table.Cell>
                    <Badge variant={student.status === 'active' ? 'success' : 'default'}>
                      {student.status || 'active'}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(ROUTES.STUDENT_VIEW.replace(':id', student._id))}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => navigate(ROUTES.STUDENT_EDIT.replace(':id', student._id))}
                        className="text-brand-600 hover:text-brand-800"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(student._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </Card>

      <Modal
        isOpen={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        title="Bulk Upload Students"
        size="md"
      >
        <div className="space-y-4">
          <Input
            type="file"
            accept=".csv"
            onChange={(e) => setUploadFile(e.target.files[0])}
            label="Select CSV File"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowBulkUpload(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkUpload}>Upload</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentsList;
