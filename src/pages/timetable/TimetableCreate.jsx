import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import {
  timetableStore,
  DAYS,
  TIME_SLOTS,
} from '../../store/timetableStore';
import { ROUTES } from '../../config/constants';
import toast from 'react-hot-toast';

const TimetableCreate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedClass, setSelectedClass] = useState(location.state?.classId || '');
  const [selectedSection, setSelectedSection] = useState(location.state?.sectionId || '');
  const [timetable, setTimetable] = useState({});
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [slotForm, setSlotForm] = useState({ subjectId: '', teacherId: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setClasses(timetableStore.getClasses());
    setSubjects(timetableStore.getSubjects());
    setTeachers(timetableStore.getTeachers());
  }, []);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      const entries = timetableStore.getTimetableByClass(selectedClass, selectedSection);
      const map = {};
      entries.forEach((e) => {
        map[`${e.day}_${e.time}`] = e;
      });
      setTimetable(map);
    } else {
      setTimetable({});
    }
  }, [selectedClass, selectedSection]);

  const selectedClassObj = classes.find((c) => c._id === selectedClass);
  const sections = selectedClassObj?.sections || [];

  const getSlotEntry = (day, time) => {
    return timetable[`${day}_${time}`] || null;
  };

  const handleCellClick = (day, time) => {
    const entry = getSlotEntry(day, time);
    setEditingSlot({ day, time });
    setSlotForm({
      subjectId: entry?.subjectId || '',
      teacherId: entry?.teacherId || '',
    });
    setShowSlotModal(true);
  };

  const handleSaveSlot = () => {
    if (!slotForm.subjectId || !slotForm.teacherId) {
      toast.error('Please select both subject and teacher');
      return;
    }

    const subject = subjects.find((s) => s._id === slotForm.subjectId);
    const teacher = teachers.find((t) => t._id === slotForm.teacherId);
    const classObj = classes.find((c) => c._id === selectedClass);
    const section = sections.find((s) => s._id === selectedSection);

    if (!subject || !teacher || !classObj || !section) {
      toast.error('Invalid selection');
      return;
    }

    const entry = {
      classId: selectedClass,
      sectionId: selectedSection,
      day: editingSlot.day,
      time: editingSlot.time,
      subjectId: subject._id,
      teacherId: teacher._id,
      subject: { _id: subject._id, name: subject.name },
      teacher: { _id: teacher._id, name: teacher.name },
      class: { _id: classObj._id, name: classObj.name },
      section: { _id: section._id, name: section.name },
    };

    timetableStore.saveEntry(entry);
    setTimetable((prev) => ({
      ...prev,
      [`${editingSlot.day}_${editingSlot.time}`]: entry,
    }));

    toast.success('Slot added successfully');
    setShowSlotModal(false);
    setEditingSlot(null);
  };

  const handleClearSlot = () => {
    if (!editingSlot) return;

    timetableStore.deleteEntry(selectedClass, selectedSection, editingSlot.day, editingSlot.time);
    setTimetable((prev) => {
      const next = { ...prev };
      delete next[`${editingSlot.day}_${editingSlot.time}`];
      return next;
    });

    toast.success('Slot cleared');
    setShowSlotModal(false);
    setEditingSlot(null);
  };

  const handleSaveAll = () => {
    setSaving(true);
    const entries = Object.values(timetable);
    if (entries.length === 0) {
      toast.error('No timetable entries to save');
      setSaving(false);
      return;
    }

    // Already saved via saveEntry
    toast.success('Timetable saved successfully');
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Timetable</h1>
          <p className="text-gray-600">
            Assign subjects and teachers to each time slot
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.TIMETABLE)}
            leftIcon={<ArrowLeft size={18} />}
          >
            Back
          </Button>
          <Button
            onClick={handleSaveAll}
            loading={saving}
            leftIcon={<Save size={18} />}
          >
            Save Timetable
          </Button>
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Select
            label="Class"
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedSection('');
            }}
            options={classes.map((c) => ({ value: c._id, label: c.name }))}
            placeholder="Select class"
          />
          <Select
            label="Section"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            options={sections.map((s) => ({ value: s._id, label: s.name }))}
            placeholder="Select section"
            disabled={!selectedClass}
          />
        </div>

        {selectedClass && selectedSection && (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Click on any cell to assign subject and teacher
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-300 p-3 bg-gray-50 font-semibold min-w-[80px]">
                      Time
                    </th>
                    {DAYS.map((day) => (
                      <th
                        key={day}
                        className="border border-gray-300 p-3 bg-gray-50 font-semibold min-w-[140px]"
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map((time) => (
                    <tr key={time}>
                      <td className="border border-gray-300 p-3 font-medium bg-gray-50">
                        {time}
                      </td>
                      {DAYS.map((day) => {
                        const entry = getSlotEntry(day, time);
                        return (
                          <td
                            key={day}
                            onClick={() => handleCellClick(day, time)}
                            className="border border-gray-300 p-2 min-h-[80px] cursor-pointer hover:bg-brand-50 transition-colors"
                          >
                            {entry ? (
                              <div className="text-center p-2 bg-brand-50 rounded border border-brand-200">
                                <p className="font-medium text-gray-900 text-sm">
                                  {entry.subject?.name}
                                </p>
                                <p className="text-xs text-gray-600 mt-0.5">
                                  {entry.teacher?.name}
                                </p>
                                <p className="text-[10px] text-brand-600 mt-1">
                                  Click to edit
                                </p>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center h-16 text-gray-400 hover:text-brand-600">
                                <Plus size={20} />
                                <span className="text-xs mt-1">Add</span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      <Modal
        isOpen={showSlotModal}
        onClose={() => {
          setShowSlotModal(false);
          setEditingSlot(null);
        }}
        title={
          editingSlot
            ? `Assign Slot - ${editingSlot.day} ${editingSlot.time}`
            : 'Assign Slot'
        }
      >
        <div className="space-y-4">
          <Select
            label="Subject"
            value={slotForm.subjectId}
            onChange={(e) =>
              setSlotForm({ ...slotForm, subjectId: e.target.value })
            }
            options={subjects.map((s) => ({
              value: s._id,
              label: s.name,
            }))}
            placeholder="Select subject"
          />
          <Select
            label="Teacher"
            value={slotForm.teacherId}
            onChange={(e) =>
              setSlotForm({ ...slotForm, teacherId: e.target.value })
            }
            options={teachers.map((t) => ({
              value: t._id,
              label: t.name,
            }))}
            placeholder="Select teacher"
          />
          <div className="flex gap-2 justify-between pt-2">
            <Button
              variant="danger"
              onClick={handleClearSlot}
              leftIcon={<Trash2 size={16} />}
            >
              Clear Slot
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSlotModal(false);
                  setEditingSlot(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveSlot}>Save</Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TimetableCreate;
