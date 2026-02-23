import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { noticeService } from '../../services/noticeService';
import { noticeStore } from '../../store/noticeStore';
import toast from 'react-hot-toast';
import Loading from '../../components/ui/Loading';

const NoticeForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'student', // 'student' or 'teacher'
    file: null,
    fileName: '',
    fileUrl: '',
  });

  useEffect(() => {
    if (isEdit) {
      fetchNotice();
    }
  }, [id]);

  const fetchNotice = async () => {
    try {
      setLoading(true);
      let notice = null;
      try {
        const response = await noticeService.getById(id);
        notice = response.data;
      } catch {
        notice = noticeStore.getById(id);
      }

      if (notice) {
        setFormData({
          title: notice.title || '',
          content: notice.content || '',
          type: notice.type || 'student',
          file: null,
          fileName: notice.fileName || '',
          fileUrl: notice.fileUrl || '',
        });
      } else {
        toast.error('Notice not found');
        navigate('/notices');
      }
    } catch (error) {
      toast.error('Failed to fetch notice');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Convert to base64 for localStorage
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          file: file,
          fileName: file.name,
          fileUrl: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    setFormData({
      ...formData,
      file: null,
      fileName: '',
      fileUrl: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const noticeData = {
        title: formData.title,
        content: formData.content,
        type: formData.type,
        fileName: formData.fileName,
        fileUrl: formData.fileUrl,
      };

      if (isEdit) {
        try {
          await noticeService.update(id, noticeData);
        } catch {
          noticeStore.update(id, noticeData);
        }
        toast.success('Notice updated successfully');
      } else {
        try {
          await noticeService.create(noticeData);
        } catch {
          noticeStore.create(noticeData);
        }
        toast.success('Notice created successfully');
      }
      navigate('/notices');
    } catch (error) {
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} notice`);
    }
  };

  if (loading) {
    return <Loading size="lg" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate('/notices')}
          leftIcon={<ArrowLeft size={18} />}
        >
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Notice' : 'Create Notice'}
          </h1>
          <p className="text-gray-600">
            {isEdit ? 'Update notice details' : 'Add a new notice or announcement'}
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Select
            label="Notice Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            options={[
              { value: 'student', label: 'Student Notice' },
              { value: 'teacher', label: 'Teacher Notice' },
            ]}
            required
            helpText="Select who should see this notice"
          />

          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter notice title"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="Enter notice content..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachment (Optional)
            </label>
            {formData.fileUrl ? (
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Upload size={18} className="text-gray-600" />
                    <span className="text-sm text-gray-700">{formData.fileName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X size={18} />
                  </button>
                </div>
                {formData.fileUrl.startsWith('data:image') && (
                  <img
                    src={formData.fileUrl}
                    alt="Preview"
                    className="mt-2 max-w-xs rounded-lg"
                  />
                )}
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                <label className="cursor-pointer">
                  <span className="text-sm text-brand-600 hover:text-brand-700">
                    Click to upload file
                  </span>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  PDF, DOC, DOCX, or Images (Max 5MB)
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/notices')}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEdit ? 'Update Notice' : 'Create Notice'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default NoticeForm;
