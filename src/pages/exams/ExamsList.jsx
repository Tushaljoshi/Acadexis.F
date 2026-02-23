import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { examService } from '../../services/examService';
import { ROUTES, EXAM_TYPES } from '../../config/constants';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Loading from '../../components/ui/Loading';

const ExamsList = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await examService.getAll();
      setExams(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch exams');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) return;
    try {
      await examService.delete(id);
      toast.success('Exam deleted successfully');
      fetchExams();
    } catch (error) {
      toast.error('Failed to delete exam');
    }
  };

  if (loading) {
    return <Loading size="lg" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Examinations</h1>
          <p className="text-gray-600">Manage exams and results</p>
        </div>
        <Button
          onClick={() => navigate(ROUTES.EXAM_ADD)}
          leftIcon={<Plus size={18} />}
        >
          Create Exam
        </Button>
      </div>

      <Card>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Exam Name</Table.Head>
              <Table.Head>Type</Table.Head>
              <Table.Head>Class</Table.Head>
              <Table.Head>Start Date</Table.Head>
              <Table.Head>End Date</Table.Head>
              <Table.Head>Status</Table.Head>
              <Table.Head>Actions</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {exams.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={7} className="text-center py-8 text-gray-500">
                  No exams found
                </Table.Cell>
              </Table.Row>
            ) : (
              exams.map((exam) => (
                <Table.Row key={exam._id}>
                  <Table.Cell className="font-medium">{exam.name}</Table.Cell>
                  <Table.Cell>
                    <Badge variant="primary">{exam.type}</Badge>
                  </Table.Cell>
                  <Table.Cell>{exam.class?.name || '-'}</Table.Cell>
                  <Table.Cell>{formatDate(exam.startDate)}</Table.Cell>
                  <Table.Cell>{formatDate(exam.endDate)}</Table.Cell>
                  <Table.Cell>
                    <Badge
                      variant={
                        exam.status === 'completed' ? 'success' : exam.status === 'ongoing' ? 'warning' : 'default'
                      }
                    >
                      {exam.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/exams/${exam._id}/marks`)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Add Marks"
                      >
                        <FileText size={18} />
                      </button>
                      <button
                        onClick={() => navigate(`/exams/edit/${exam._id}`)}
                        className="text-brand-600 hover:text-brand-800"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(exam._id)}
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
    </div>
  );
};

export default ExamsList;
