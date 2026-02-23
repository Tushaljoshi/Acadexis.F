import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, X, FileImage } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { teacherService } from '../../services/teacherService';
import { classService } from '../../services/classService';
import { classStore } from '../../store/classStore';
import { teacherStore } from '../../store/teacherStore';
import { ROUTES } from '../../config/constants';
import toast from 'react-hot-toast';
import Loading from '../../components/ui/Loading';

const TeacherForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [newDocument, setNewDocument] = useState({ name: '', file: null, preview: null });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    qualification: '',
    experienceYears: '',
    mainSubject: '',
    subjects: '',
    status: 'active',
    joinDate: '',
    salaryBasic: '',
    salaryAllowance: '',
    classId: '',
    sectionId: '',
  });

  useEffect(() => {
    fetchClasses();
    if (isEdit) {
      fetchTeacher();
    }
  }, [id]);

  const fetchClasses = async () => {
    try {
      const response = await classService.getAll();
      const data = response.data || [];
      setClasses(data.length > 0 ? data : classStore.getAll());
    } catch (error) {
      setClasses(classStore.getAll());
    }
  };

  const fetchTeacher = async () => {
    try {
      setLoading(true);
      let teacher = null;
      try {
        const response = await teacherService.getById(id);
        teacher = response.data;
      } catch (error) {
        teacher = teacherStore.getById(id);
      }

      if (!teacher) {
        toast.error('Teacher not found');
        navigate(ROUTES.TEACHERS);
        return;
      }

      setFormData((prev) => ({
        ...prev,
        ...teacher,
        salaryBasic: teacher.salaryBasic ?? teacher.salary ?? '',
        salaryAllowance: teacher.salaryAllowance ?? '',
        classId: teacher.class?._id || teacher.classId || '',
        sectionId: teacher.section?._id || teacher.sectionId || '',
        subjects: Array.isArray(teacher.subjects)
          ? teacher.subjects.map((s) => s.name || s).join(', ')
          : teacher.subjects || '',
      }));
      setDocuments(teacher.documents || []);
    } catch (error) {
      toast.error('Failed to fetch teacher');
      navigate(ROUTES.TEACHERS);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewDocument((prev) => ({
            ...prev,
            file,
            preview: reader.result,
          }));
        };
        reader.readAsDataURL(file);
      } else {
        toast.error('Please select an image file');
      }
    }
  };

  const handleAddDocument = () => {
    if (!newDocument.name.trim()) {
      toast.error('Please enter document name');
      return;
    }
    if (!newDocument.file) {
      toast.error('Please select an image file');
      return;
    }

    const newDoc = {
      id: `doc_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      name: newDocument.name,
      url: newDocument.preview,
      file: newDocument.file,
    };

    setDocuments((prev) => [...prev, newDoc]);
    setNewDocument({ name: '', file: null, preview: null });
    toast.success('Document added');
  };

  const handleRemoveDocument = (docId) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
    toast.success('Document removed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      salaryBasic: formData.salaryBasic ? Number(formData.salaryBasic) : 0,
      salaryAllowance: formData.salaryAllowance ? Number(formData.salaryAllowance) : 0,
      documents: documents.map((doc) => ({
        name: doc.name,
        url: doc.url,
      })),
    };

    try {
      setLoading(true);
      if (isEdit) {
        try {
          await teacherService.update(id, payload);
          toast.success('Teacher updated successfully');
        } catch {
          teacherStore.update(id, payload);
          toast.success('Teacher updated locally');
        }
      } else {
        try {
          await teacherService.create(payload);
          toast.success('Teacher created successfully');
        } catch {
          teacherStore.create(payload);
          toast.success('Teacher created locally');
        }
      }
      navigate(ROUTES.TEACHERS);
    } catch (error) {
      toast.error(isEdit ? 'Failed to update teacher' : 'Failed to create teacher');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return <Loading size="lg" />;
  }

  const selectedClass = classes.find((c) => c._id === formData.classId);
  const sections = selectedClass?.sections || [];

  const totalSalary =
    (formData.salaryBasic ? Number(formData.salaryBasic) : 0) +
    (formData.salaryAllowance ? Number(formData.salaryAllowance) : 0);

  return (
    <div className="max-w-8xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Teacher' : 'Add New Teacher'}
        </h1>
        <p className="text-gray-600">
          {isEdit ? 'Update teacher information and salary details' : 'Fill in the teacher details'}
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <Input
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              <Select
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                ]}
              />
              <Input
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
              <Input
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Professional Details */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Qualification"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                placeholder="e.g., B.Ed, M.Sc"
              />
              <Input
                label="Experience (Years)"
                name="experienceYears"
                value={formData.experienceYears}
                onChange={handleChange}
                type="number"
                min="0"
              />
              <Input
                label="Main Subject"
                name="mainSubject"
                value={formData.mainSubject}
                onChange={handleChange}
                placeholder="e.g., Mathematics"
              />
              <Input
                label="Subjects (comma separated)"
                name="subjects"
                value={formData.subjects}
                onChange={handleChange}
                placeholder="e.g., Maths, Physics, Chemistry"
              />
              <Select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                  { value: 'on_leave', label: 'On Leave' },
                ]}
              />
              <Input
                label="Joining Date"
                name="joinDate"
                type="date"
                value={formData.joinDate}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Class Teacher Assignment */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Teacher Assignment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Class"
                name="classId"
                value={formData.classId}
                onChange={handleChange}
                options={classes.map((c) => ({ value: c._id, label: c.name }))}
              />
              <Select
                label="Section"
                name="sectionId"
                value={formData.sectionId}
                onChange={handleChange}
                options={sections.map((s) => ({ value: s._id, label: s.name }))}
                disabled={!formData.classId}
              />
            </div>
          </div>

          {/* Salary Details */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Salary Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Basic Salary (Monthly)"
                name="salaryBasic"
                type="number"
                min="0"
                value={formData.salaryBasic}
                onChange={handleChange}
                placeholder="e.g., 30000"
              />
              <Input
                label="Allowances"
                name="salaryAllowance"
                type="number"
                min="0"
                value={formData.salaryAllowance}
                onChange={handleChange}
                placeholder="e.g., 5000"
              />
              <div className="flex flex-col justify-end">
                <p className="text-sm text-gray-600 mb-1">Total Monthly Salary</p>
                <p className="text-2xl font-bold text-brand-700">
                  ₹{Number.isNaN(totalSalary) ? 0 : totalSalary.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>

          {/* Documents Upload */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
            
            {/* Add New Document */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Input
                  label="Document Name"
                  value={newDocument.name}
                  onChange={(e) => setNewDocument((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., ID Card, Certificate"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Image
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <Upload size={18} />
                      <span className="text-sm">Choose File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    {newDocument.preview && (
                      <span className="text-sm text-green-600">✓ Selected</span>
                    )}
                  </div>
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={handleAddDocument}
                    disabled={!newDocument.name || !newDocument.file}
                    leftIcon={<FileImage size={18} />}
                  >
                    Add Document
                  </Button>
                </div>
              </div>
              {newDocument.preview && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <img
                    src={newDocument.preview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded border"
                  />
                </div>
              )}
            </div>

            {/* Existing Documents */}
            {documents.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-3">Uploaded Documents:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="border rounded-lg p-3 relative">
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument(doc.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        title="Remove"
                      >
                        <X size={16} />
                      </button>
                      <p className="font-medium text-sm mb-2 pr-6">{doc.name}</p>
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
          </div>

          <div className="flex gap-4 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(ROUTES.TEACHERS)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {isEdit ? 'Update' : 'Create'} Teacher
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default TeacherForm;

