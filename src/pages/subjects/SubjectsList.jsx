import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, BookOpen } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { subjectService } from '../../services/subjectService';
import { subjectStore } from '../../store/subjectStore';
import toast from 'react-hot-toast';
import Loading from '../../components/ui/Loading';

const SubjectsList = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await subjectService.getAll();
      const data = response.data || [];
      setSubjects(data.length > 0 ? data : subjectStore.getAll());
    } catch (error) {
      setSubjects(subjectStore.getAll());
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (subject = null) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({
        name: subject.name || '',
        code: subject.code || '',
        description: subject.description || '',
      });
    } else {
      setEditingSubject(null);
      setFormData({
        name: '',
        code: '',
        description: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSubject(null);
    setFormData({
      name: '',
      code: '',
      description: '',
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter subject name');
      return;
    }

    try {
      if (editingSubject) {
        // Update
        try {
          await subjectService.update(editingSubject._id, formData);
          toast.success('Subject updated successfully');
        } catch (error) {
          subjectStore.update(editingSubject._id, formData);
          toast.success('Subject updated locally');
        }
      } else {
        // Create
        try {
          await subjectService.create(formData);
          toast.success('Subject created successfully');
        } catch (error) {
          subjectStore.create(formData);
          toast.success('Subject created locally');
        }
      }
      handleCloseModal();
      fetchSubjects();
    } catch (error) {
      toast.error(editingSubject ? 'Failed to update subject' : 'Failed to create subject');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    
    try {
      await subjectService.delete(id);
      toast.success('Subject deleted successfully');
      fetchSubjects();
    } catch (error) {
      subjectStore.delete(id);
      toast.success('Subject deleted locally');
      fetchSubjects();
    }
  };

  const filteredSubjects = subjects.filter((subject) => {
    const term = searchTerm.toLowerCase();
    return (
      subject.name?.toLowerCase().includes(term) ||
      subject.code?.toLowerCase().includes(term) ||
      subject.description?.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return <Loading size="lg" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
          <p className="text-gray-600">Manage subjects and curriculum</p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          leftIcon={<Plus size={18} />}
        >
          Add Subject
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <Input
            placeholder="Search by name, code, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={18} />}
          />
        </div>

        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Subject Code</Table.Head>
              <Table.Head>Subject Name</Table.Head>
              <Table.Head>Description</Table.Head>
              <Table.Head>Actions</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredSubjects.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={4} className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No subjects found matching your search' : 'No subjects found'}
                </Table.Cell>
              </Table.Row>
            ) : (
              filteredSubjects.map((subject) => (
                <Table.Row key={subject._id}>
                  <Table.Cell>
                    <Badge variant="primary">{subject.code || '-'}</Badge>
                  </Table.Cell>
                  <Table.Cell className="font-medium">{subject.name}</Table.Cell>
                  <Table.Cell className="text-gray-600">
                    {subject.description || '-'}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal(subject)}
                        className="text-brand-600 hover:text-brand-800"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(subject._id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingSubject ? 'Edit Subject' : 'Add New Subject'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Subject Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Mathematics, Science"
            required
          />
          <Input
            label="Subject Code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="e.g., MATH, SCI"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="Subject description (optional)"
            />
          </div>
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingSubject ? 'Update' : 'Create'} Subject
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SubjectsList;
