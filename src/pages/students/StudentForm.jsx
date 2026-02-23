import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, X, FileImage } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { studentService } from '../../services/studentService';
import { classService } from '../../services/classService';
import { ROUTES } from '../../config/constants';
import toast from 'react-hot-toast';
import Loading from '../../components/ui/Loading';

const StudentForm = () => {
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
    dateOfBirth: '',
    address: '',
    classId: '',
    sectionId: '',
    admissionNumber: '',
    bloodGroup: '',
    height: '',
    weight: '',
    // Parents Information
    fatherName: '',
    fatherPhone: '',
    motherName: '',
    motherPhone: '',
    // Guardian Information
    guardianName: '',
    guardianPhone: '',
    guardianRelation: '',
    // Previous School Information
    previousSchoolName: '',
    previousSchoolPercentage: '',
    // Sports Information
    sports: '',
    // Medical Details
    medicalConditions: '',
    allergies: '',
    medications: '',
    emergencyContact: '',
    emergencyContactPhone: '',
  });

  useEffect(() => {
    fetchClasses();
    if (isEdit) {
      fetchStudent();
    }
  }, [id]);

  const fetchClasses = async () => {
    try {
      const response = await classService.getAll();
      setClasses(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch classes');
    }
  };

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const response = await studentService.getById(id);
      const studentData = response.data || {};
      setFormData(studentData);
      setDocuments(studentData.documents || []);
    } catch (error) {
      toast.error('Failed to fetch student');
      navigate(ROUTES.STUDENTS);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    try {
      setLoading(true);
      const payload = {
        ...formData,
        documents: documents.map((doc) => ({
          name: doc.name,
          url: doc.url,
        })),
      };
      
      if (isEdit) {
        await studentService.update(id, payload);
        toast.success('Student updated successfully');
      } else {
        await studentService.create(payload);
        toast.success('Student created successfully');
      }
      navigate(ROUTES.STUDENTS);
    } catch (error) {
      toast.error(isEdit ? 'Failed to update student' : 'Failed to create student');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return <Loading size="lg" />;
  }

  const selectedClass = classes.find((c) => c._id === formData.classId);
  const sections = selectedClass?.sections || [];

  return (
    <div className="max-w-8xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Student' : 'Add New Student'}
        </h1>
        <p className="text-gray-600">
          {isEdit ? 'Update student information' : 'Fill in the student details'}
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <Input
              label="Admission Number"
              name="admissionNumber"
              value={formData.admissionNumber}
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
            <Input
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
            />
            <Select
              label="Blood Group"
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              options={[
                { value: '', label: 'Select Blood Group' },
                { value: 'A+', label: 'A+' },
                { value: 'A-', label: 'A-' },
                { value: 'B+', label: 'B+' },
                { value: 'B-', label: 'B-' },
                { value: 'AB+', label: 'AB+' },
                { value: 'AB-', label: 'AB-' },
                { value: 'O+', label: 'O+' },
                { value: 'O-', label: 'O-' },
              ]}
            />
            <Input
              label="Height (cm)"
              name="height"
              type="number"
              value={formData.height}
              onChange={handleChange}
              placeholder="e.g., 165"
            />
            <Input
              label="Weight (kg)"
              name="weight"
              type="number"
              value={formData.weight}
              onChange={handleChange}
              placeholder="e.g., 55"
            />
            <Select
              label="Class"
              name="classId"
              value={formData.classId}
              onChange={handleChange}
              options={classes.map((c) => ({ value: c._id, label: c.name }))}
              required
            />
            <Select
              label="Section"
              name="sectionId"
              value={formData.sectionId}
              onChange={handleChange}
              options={sections.map((s) => ({ value: s._id, label: s.name }))}
              required
              disabled={!formData.classId}
            />
            <Input
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          {/* Parents Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Parents Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Father Details</h4>
                <div className="space-y-4">
                  <Input
                    label="Father Name"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                  />
                  <Input
                    label="Father Phone"
                    name="fatherPhone"
                    value={formData.fatherPhone}
                    onChange={handleChange}
                    placeholder="e.g., 9876543210"
                  />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Mother Details</h4>
                <div className="space-y-4">
                  <Input
                    label="Mother Name"
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleChange}
                  />
                  <Input
                    label="Mother Phone"
                    name="motherPhone"
                    value={formData.motherPhone}
                    onChange={handleChange}
                    placeholder="e.g., 9876543210"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Guardian Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Guardian Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Guardian Name"
                name="guardianName"
                value={formData.guardianName}
                onChange={handleChange}
                required
              />
              <Input
                label="Guardian Phone"
                name="guardianPhone"
                value={formData.guardianPhone}
                onChange={handleChange}
                required
              />
              <Input
                label="Relation"
                name="guardianRelation"
                value={formData.guardianRelation}
                onChange={handleChange}
                placeholder="e.g., Father, Mother, Guardian"
                required
              />
            </div>
          </div>

          {/* Previous School Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Previous School Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Previous School Name"
                name="previousSchoolName"
                value={formData.previousSchoolName}
                onChange={handleChange}
                placeholder="e.g., ABC School"
              />
              <Input
                label="Previous School Percentage"
                name="previousSchoolPercentage"
                type="number"
                min="0"
                max="100"
                value={formData.previousSchoolPercentage}
                onChange={handleChange}
                placeholder="e.g., 85.5"
              />
            </div>
          </div>

          {/* Sports Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sports Information</h3>
            <div className="grid grid-cols-1 gap-6">
              <Input
                label="Sports / Games"
                name="sports"
                value={formData.sports}
                onChange={handleChange}
                placeholder="e.g., Cricket, Football, Basketball, Swimming"
              />
            </div>
          </div>

          {/* Medical Details */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical Conditions
                </label>
                <textarea
                  name="medicalConditions"
                  value={formData.medicalConditions}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="e.g., Asthma, Diabetes, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allergies
                </label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="e.g., Peanuts, Dust, Pollen, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Medications
                </label>
                <textarea
                  name="medications"
                  value={formData.medications}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="e.g., Inhaler, Insulin, etc."
                />
              </div>
              <div className="space-y-4">
                <Input
                  label="Emergency Contact Name"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  placeholder="Emergency contact person"
                />
                <Input
                  label="Emergency Contact Phone"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  placeholder="e.g., 9876543210"
                />
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
                  placeholder="e.g., Birth Certificate, ID Card"
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

          <div className="flex gap-4 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(ROUTES.STUDENTS)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {isEdit ? 'Update' : 'Create'} Student
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default StudentForm;
