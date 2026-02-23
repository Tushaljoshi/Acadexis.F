import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Loading from '../../components/ui/Loading';
import { classService } from '../../services/classService';
import { subjectService } from '../../services/subjectService';
import { examService } from '../../services/examService';
import { EXAM_TYPES, ROUTES } from '../../config/constants';
import toast from 'react-hot-toast';

const ExamCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [form, setForm] = useState({
    name: '',
    type: EXAM_TYPES[0] || '',
    startDate: '',
    endDate: '',
    description: '',
  });

  const [scheduleRows, setScheduleRows] = useState([
    { classId: '', subjectId: '', date: '', maxMarks: 100 },
  ]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [classRes, subjectRes] = await Promise.all([
          classService.getAll().catch(() => ({ data: [] })),
          subjectService.getAll().catch(() => ({ data: [] })),
        ]);

        setClasses(classRes.data || []);
        setSubjects(subjectRes.data || []);
      } catch (error) {
        toast.error('Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRowChange = (index, field, value) => {
    setScheduleRows((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      )
    );
  };

  const handleAddRow = () => {
    setScheduleRows((prev) => [
      ...prev,
      { classId: '', subjectId: '', date: '', maxMarks: 100 },
    ]);
  };

  const handleRemoveRow = (index) => {
    setScheduleRows((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    if (!form.name.trim()) {
      toast.error('Exam name is required');
      return false;
    }
    if (!form.type) {
      toast.error('Exam type is required');
      return false;
    }
    if (!form.startDate || !form.endDate) {
      toast.error('Start and end date are required');
      return false;
    }
    if (new Date(form.startDate) > new Date(form.endDate)) {
      toast.error('Start date cannot be after end date');
      return false;
    }

    const validRows = scheduleRows.filter(
      (row) => row.classId && row.subjectId && row.date
    );
    if (validRows.length === 0) {
      toast.error('Please add at least one exam schedule row');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        type: form.type,
        description: form.description?.trim() || undefined,
        startDate: form.startDate,
        endDate: form.endDate,
        schedules: scheduleRows
          .filter((row) => row.classId && row.subjectId && row.date)
          .map((row) => ({
            classId: row.classId,
            subjectId: row.subjectId,
            date: row.date,
            maxMarks: Number(row.maxMarks) || 100,
          })),
      };

      await examService.create(payload);
      toast.success('Exam created successfully');
      navigate(ROUTES.EXAMS);
    } catch (error) {
      toast.error('Failed to create exam');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading size="lg" className="mt-10" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Exam</h1>
          <p className="text-gray-600">
            Configure exam details and schedule per class & subject
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.EXAMS)}
            leftIcon={<ArrowLeft size={18} />}
          >
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            loading={saving}
            leftIcon={<Save size={18} />}
          >
            Save Exam
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <Card.Header>
            <Card.Title>Exam Information</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Exam Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g., Mid Term Examination"
                required
              />
              <Select
                label="Exam Type"
                value={form.type}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, type: e.target.value }))
                }
                options={EXAM_TYPES.map((t) => ({ value: t, label: t }))}
                placeholder="Select exam type"
                required
              />
              <Input
                label="Start Date"
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleChange}
                required
              />
              <Input
                label="End Date"
                name="endDate"
                type="date"
                value={form.endDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-600 text-sm"
                placeholder="Short description about this exam..."
              />
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <Card.Title>Exam Schedule</Card.Title>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddRow}
                leftIcon={<Plus size={16} />}
              >
                Add Row
              </Button>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border border-gray-200 px-3 py-2 text-left bg-gray-50">
                      Class
                    </th>
                    <th className="border border-gray-200 px-3 py-2 text-left bg-gray-50">
                      Subject
                    </th>
                    <th className="border border-gray-200 px-3 py-2 text-left bg-gray-50">
                      Exam Date
                    </th>
                    <th className="border border-gray-200 px-3 py-2 text-left bg-gray-50">
                      Max Marks
                    </th>
                    <th className="border border-gray-200 px-3 py-2 text-center bg-gray-50 w-16">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {scheduleRows.map((row, idx) => (
                    <tr key={idx}>
                      <td className="border border-gray-200 px-3 py-2 min-w-[160px]">
                        <select
                          className="w-full px-2 py-1.5 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-600"
                          value={row.classId}
                          onChange={(e) =>
                            handleRowChange(idx, 'classId', e.target.value)
                          }
                        >
                          <option value="">Select class</option>
                          {classes.map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="border border-gray-200 px-3 py-2 min-w-[180px]">
                        <select
                          className="w-full px-2 py-1.5 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-600"
                          value={row.subjectId}
                          onChange={(e) =>
                            handleRowChange(idx, 'subjectId', e.target.value)
                          }
                        >
                          <option value="">Select subject</option>
                          {subjects.map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="border border-gray-200 px-3 py-2 min-w-[140px]">
                        <input
                          type="date"
                          className="w-full px-2 py-1.5 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-600"
                          value={row.date}
                          onChange={(e) =>
                            handleRowChange(idx, 'date', e.target.value)
                          }
                        />
                      </td>
                      <td className="border border-gray-200 px-3 py-2 min-w-[100px]">
                        <input
                          type="number"
                          min="1"
                          max="1000"
                          className="w-full px-2 py-1.5 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-600"
                          value={row.maxMarks}
                          onChange={(e) =>
                            handleRowChange(
                              idx,
                              'maxMarks',
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td className="border border-gray-200 px-3 py-2 text-center">
                        {scheduleRows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(idx)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-gray-500 mt-3">
              Tip: Add multiple rows for different subjects, classes and dates within this exam window.
            </p>
          </Card.Content>
        </Card>
      </form>
    </div>
  );
};

export default ExamCreate;

