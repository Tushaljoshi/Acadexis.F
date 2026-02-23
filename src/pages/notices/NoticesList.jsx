import { useState, useEffect } from 'react';
import { Plus, Bell, FileText, Calendar, Edit, Trash2, Users, GraduationCap, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { noticeService } from '../../services/noticeService';
import { noticeStore } from '../../store/noticeStore';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Loading from '../../components/ui/Loading';
import { useAuthStore } from '../../store/authStore';
import { ROLES } from '../../config/constants';

const NoticesList = () => {
  const navigate = useNavigate();
  const { hasRole, user } = useAuthStore();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('student'); // 'student' or 'teacher'
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, []);

  useEffect(() => {
    // Auto-set tab based on user role
    if (user?.role === ROLES.TEACHER) {
      setActiveTab('teacher');
    } else if (user?.role === ROLES.STUDENT) {
      setActiveTab('student');
    }
  }, [user]);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      let data = [];
      try {
        const response = await noticeService.getAll();
        data = response.data || [];
      } catch {
        data = noticeStore.getAll();
      }
      setNotices(data);
    } catch (error) {
      toast.error('Failed to fetch notices');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedNotice) return;

    try {
      try {
        await noticeService.delete(selectedNotice._id);
      } catch {
        noticeStore.delete(selectedNotice._id);
      }
      toast.success('Notice deleted successfully');
      setShowDeleteModal(false);
      setSelectedNotice(null);
      fetchNotices();
    } catch (error) {
      toast.error('Failed to delete notice');
    }
  };

  const handleViewNotice = (notice) => {
    setSelectedNotice(notice);
    setShowViewModal(true);
  };

  // Filter notices based on active tab and user role
  const getFilteredNotices = () => {
    let filtered = notices;

    // If user is admin, show all notices of selected type
    if (hasRole(ROLES.ADMIN)) {
      filtered = notices.filter((n) => n.type === activeTab);
    } else if (user?.role === ROLES.TEACHER) {
      // Teachers only see teacher notices
      filtered = notices.filter((n) => n.type === 'teacher');
    } else if (user?.role === ROLES.STUDENT) {
      // Students only see student notices
      filtered = notices.filter((n) => n.type === 'student');
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });
  };

  const filteredNotices = getFilteredNotices();

  if (loading) {
    return <Loading size="lg" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notices & Announcements</h1>
          <p className="text-gray-600">View and manage school notices</p>
        </div>
        {hasRole(ROLES.ADMIN) && (
          <Button
            onClick={() => navigate('/notices/add')}
            leftIcon={<Plus size={18} />}
          >
            Add Notice
          </Button>
        )}
      </div>

      {/* Tabs - Only show for Admin */}
      {hasRole(ROLES.ADMIN) && (
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab('student')}
            className={`px-6 py-3 font-medium flex items-center gap-2 transition-colors border-b-2 ${
              activeTab === 'student'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users size={18} />
            Student Notices ({notices.filter((n) => n.type === 'student').length})
          </button>
          <button
            onClick={() => setActiveTab('teacher')}
            className={`px-6 py-3 font-medium flex items-center gap-2 transition-colors border-b-2 ${
              activeTab === 'teacher'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <GraduationCap size={18} />
            Teacher Notices ({notices.filter((n) => n.type === 'teacher').length})
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotices.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <Bell size={48} className="mx-auto mb-4 text-gray-400" />
            <p>No {activeTab} notices available</p>
          </div>
        ) : (
          filteredNotices.map((notice) => (
            <Card key={notice._id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${
                  notice.type === 'student' ? 'bg-blue-100' : 'bg-purple-100'
                }`}>
                  <Bell className={notice.type === 'student' ? 'text-blue-700' : 'text-purple-700'} size={20} />
                </div>
                <div className="flex gap-2">
                  <Badge variant={notice.type === 'student' ? 'info' : 'primary'}>
                    {notice.type === 'student' ? 'Student' : 'Teacher'}
                  </Badge>
                  {hasRole(ROLES.ADMIN) && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => navigate(`/notices/edit/${notice._id}`)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedNotice(notice);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <h3 
                className="text-lg font-semibold text-gray-900 mb-2 cursor-pointer hover:text-brand-600"
                onClick={() => handleViewNotice(notice)}
              >
                {notice.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">{notice.content}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  {formatDate(notice.createdAt)}
                </div>
                {notice.fileName && (
                  <div className="flex items-center gap-1 text-brand-600">
                    <FileText size={14} />
                    Attachment
                  </div>
                )}
              </div>
              <div className="mt-3 pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewNotice(notice)}
                  className="w-full"
                >
                  <Eye size={14} className="mr-2" />
                  View Details
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* View Notice Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedNotice(null);
        }}
        title={selectedNotice?.title || ''}
        size="lg"
      >
        {selectedNotice && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={selectedNotice.type === 'student' ? 'info' : 'primary'}>
                {selectedNotice.type === 'student' ? 'Student Notice' : 'Teacher Notice'}
              </Badge>
              <span className="text-sm text-gray-500">
                {formatDate(selectedNotice.createdAt)}
              </span>
            </div>

            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{selectedNotice.content}</p>
            </div>

            {selectedNotice.fileUrl && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={18} className="text-gray-600" />
                  <span className="font-medium text-gray-900">{selectedNotice.fileName}</span>
                </div>
                {selectedNotice.fileUrl.startsWith('data:image') && (
                  <img
                    src={selectedNotice.fileUrl}
                    alt={selectedNotice.fileName}
                    className="max-w-full rounded-lg"
                  />
                )}
                {selectedNotice.fileUrl.startsWith('data:application/pdf') && (
                  <div className="text-center py-4">
                    <FileText size={48} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">PDF Document</p>
                    <a
                      href={selectedNotice.fileUrl}
                      download={selectedNotice.fileName}
                      className="text-brand-600 hover:text-brand-700 text-sm mt-2 inline-block"
                    >
                      Download PDF
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedNotice(null);
        }}
        title="Delete Notice"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete this notice? This action cannot be undone.
          </p>
          {selectedNotice && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900">{selectedNotice.title}</p>
            </div>
          )}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedNotice(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NoticesList;
