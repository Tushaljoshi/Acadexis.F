import { useState, useEffect } from 'react';
import { Plus, MessageSquare, AlertCircle, CheckCircle, Clock, X, Send, HelpCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import { supportService } from '../../services/supportService';
import { supportStore } from '../../store/supportStore';
import { useAuthStore } from '../../store/authStore';
import { formatDate } from '../../utils/helpers';
import { ROLES } from '../../config/constants';
import toast from 'react-hot-toast';
import Loading from '../../components/ui/Loading';

const SupportPage = () => {
  const { user, hasRole } = useAuthStore();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [formData, setFormData] = useState({
    issueType: 'technical',
    subject: '',
    description: '',
  });
  const [responseText, setResponseText] = useState('');

  const isAdmin = hasRole(ROLES.ADMIN);

  useEffect(() => {
    fetchQueries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      let data = [];

      try {
        const response = await supportService.getAll();
        data = response.data || [];
      } catch {
        const allQueries = supportStore.getAll();
        data = isAdmin ? allQueries : supportStore.getByUser(user?._id);
      }

      setQueries(data);
    } catch (error) {
      toast.error('Failed to fetch queries');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuery = async () => {
    if (!formData.subject || !formData.description) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const payload = {
        issueType: formData.issueType,
        subject: formData.subject,
        description: formData.description,
      };

      try {
        await supportService.create(payload);
      } catch {
        // Fallback to local storage
        supportStore.create({
          ...payload,
          userId: user._id,
          userName: user.name,
          userEmail: user.email,
          userRole: user.role,
        });
      }
      toast.success('Query submitted successfully');
      setShowCreateModal(false);
      setFormData({
        issueType: 'technical',
        subject: '',
        description: '',
      });
      fetchQueries();
    } catch (error) {
      toast.error('Failed to submit query');
    }
  };

  const handleViewQuery = (query) => {
    setSelectedQuery(query);
    setShowViewModal(true);
  };

  const handleRespond = (query) => {
    setSelectedQuery(query);
    setResponseText('');
    setShowResponseModal(true);
  };

  const handleSubmitResponse = async () => {
    if (!responseText.trim()) {
      toast.error('Please enter a response');
      return;
    }

    try {
      try {
        await supportService.addResponse(selectedQuery._id, {
          message: responseText,
        });
      } catch {
        supportStore.addResponse(selectedQuery._id, {
          userId: user._id,
          userName: user.name,
          userRole: user.role,
          message: responseText,
        });
      }
      toast.success('Response sent successfully');
      setShowResponseModal(false);
      setSelectedQuery(null);
      setResponseText('');
      fetchQueries();
    } catch (error) {
      toast.error('Failed to send response');
    }
  };

  const handleStatusChange = async (queryId, status) => {
    try {
      try {
        await supportService.updateStatus(queryId, status);
      } catch {
        supportStore.updateStatus(queryId, status);
      }
      toast.success('Status updated successfully');
      fetchQueries();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: { variant: 'warning', icon: Clock, label: 'Pending' },
      responded: { variant: 'info', icon: MessageSquare, label: 'Responded' },
      resolved: { variant: 'success', icon: CheckCircle, label: 'Resolved' },
      closed: { variant: 'default', icon: X, label: 'Closed' },
    };
    return variants[status] || variants.pending;
  };

  const getIssueTypeBadge = (type) => {
    const types = {
      technical: { label: 'Technical', color: 'bg-red-100 text-red-700' },
      logic: { label: 'Logic', color: 'bg-blue-100 text-blue-700' },
      data_missing: { label: 'Data Missing', color: 'bg-yellow-100 text-yellow-700' },
      other: { label: 'Other', color: 'bg-gray-100 text-gray-700' },
    };
    return types[type] || types.other;
  };

  const filteredQueries = queries.sort((a, b) => {
    const dateA = new Date(a.createdAt || 0);
    const dateB = new Date(b.createdAt || 0);
    return dateB - dateA;
  });

  if (loading) {
    return <Loading size="lg" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
          <p className="text-gray-600">
            {isAdmin
              ? 'Manage and respond to user queries'
              : 'Submit queries and get help from admin'}
          </p>
        </div>
        {!isAdmin && (
          <Button
            onClick={() => setShowCreateModal(true)}
            leftIcon={<Plus size={18} />}
          >
            Create Query
          </Button>
        )}
      </div>

      {/* Statistics Cards - Admin Only */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Queries</p>
                <p className="text-2xl font-bold text-gray-900">{queries.length}</p>
              </div>
              <div className="bg-blue-500 p-3 rounded-lg">
                <HelpCircle className="text-white" size={24} />
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {queries.filter((q) => q.status === 'pending').length}
                </p>
              </div>
              <div className="bg-yellow-500 p-3 rounded-lg">
                <Clock className="text-white" size={24} />
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Responded</p>
                <p className="text-2xl font-bold text-blue-600">
                  {queries.filter((q) => q.status === 'responded').length}
                </p>
              </div>
              <div className="bg-blue-500 p-3 rounded-lg">
                <MessageSquare className="text-white" size={24} />
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Resolved</p>
                <p className="text-2xl font-bold text-green-600">
                  {queries.filter((q) => q.status === 'resolved').length}
                </p>
              </div>
              <div className="bg-green-500 p-3 rounded-lg">
                <CheckCircle className="text-white" size={24} />
              </div>
            </div>
          </Card>
        </div>
      )}

      <Card>
        {isAdmin ? (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>User</Table.Head>
                <Table.Head>Issue Type</Table.Head>
                <Table.Head>Subject</Table.Head>
                <Table.Head>Date</Table.Head>
                <Table.Head>Status</Table.Head>
                <Table.Head>Actions</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredQueries.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={6} className="text-center py-8 text-gray-500">
                    No queries found
                  </Table.Cell>
                </Table.Row>
              ) : (
                filteredQueries.map((query) => {
                  const statusBadge = getStatusBadge(query.status);
                  const issueBadge = getIssueTypeBadge(query.issueType);
                  return (
                    <Table.Row key={query._id}>
                      <Table.Cell>
                        <div>
                          <p className="font-medium">{query.userName}</p>
                          <p className="text-xs text-gray-500 capitalize">{query.userRole}</p>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${issueBadge.color}`}>
                          {issueBadge.label}
                        </span>
                      </Table.Cell>
                      <Table.Cell className="max-w-xs">
                        <p className="truncate">{query.subject}</p>
                      </Table.Cell>
                      <Table.Cell>{formatDate(query.createdAt)}</Table.Cell>
                      <Table.Cell>
                        <Badge variant={statusBadge.variant}>
                          {statusBadge.label}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewQuery(query)}
                            className="text-blue-600 hover:text-blue-800"
                            title="View"
                          >
                            <MessageSquare size={18} />
                          </button>
                          {query.status !== 'resolved' && query.status !== 'closed' && (
                            <button
                              onClick={() => handleRespond(query)}
                              className="text-green-600 hover:text-green-800"
                              title="Respond"
                            >
                              <Send size={18} />
                            </button>
                          )}
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  );
                })
              )}
            </Table.Body>
          </Table>
        ) : (
          <div className="space-y-4">
            {filteredQueries.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <HelpCircle size={48} className="mx-auto mb-4 text-gray-400" />
                <p>No queries submitted yet</p>
                <Button
                  className="mt-4"
                  onClick={() => setShowCreateModal(true)}
                  leftIcon={<Plus size={18} />}
                >
                  Create Your First Query
                </Button>
              </div>
            ) : (
              filteredQueries.map((query) => {
                const statusBadge = getStatusBadge(query.status);
                const issueBadge = getIssueTypeBadge(query.issueType);
                return (
                  <div
                    key={query._id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${issueBadge.color}`}>
                            {issueBadge.label}
                          </span>
                          <Badge variant={statusBadge.variant}>
                            {statusBadge.label}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{query.subject}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{query.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
                      <span>{formatDate(query.createdAt)}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewQuery(query)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </Card>

      {/* Create Query Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setFormData({
            issueType: 'technical',
            subject: '',
            description: '',
          });
        }}
        title="Create Support Query"
        size="md"
      >
        <div className="space-y-4">
          <Select
            label="Issue Type"
            value={formData.issueType}
            onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
            options={[
              { value: 'technical', label: 'Technical Issue' },
              { value: 'logic', label: 'Logic Issue' },
              { value: 'data_missing', label: 'Data Missing' },
              { value: 'other', label: 'Other Issue' },
            ]}
            required
          />

          <Input
            label="Subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="Brief description of your issue"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="Describe your issue in detail..."
              required
            />
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setFormData({
                  issueType: 'technical',
                  subject: '',
                  description: '',
                });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateQuery}>
              Submit Query
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Query Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedQuery(null);
        }}
        title={selectedQuery?.subject || 'Query Details'}
        size="lg"
      >
        {selectedQuery && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Submitted By</p>
                <p className="font-medium">{selectedQuery.userName}</p>
                <p className="text-xs text-gray-500 capitalize">{selectedQuery.userRole}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Issue Type</p>
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getIssueTypeBadge(selectedQuery.issueType).color}`}>
                  {getIssueTypeBadge(selectedQuery.issueType).label}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge variant={getStatusBadge(selectedQuery.status).variant}>
                  {getStatusBadge(selectedQuery.status).label}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium">{formatDate(selectedQuery.createdAt)}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Description</p>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedQuery.description}</p>
              </div>
            </div>

            {selectedQuery.responses && selectedQuery.responses.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Responses</p>
                <div className="space-y-3">
                  {selectedQuery.responses.map((response) => (
                    <div
                      key={response.id || response._id}
                      className="border-l-4 border-brand-500 pl-4 py-2"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-900">{response.userName}</p>
                        <span className="text-xs text-gray-500">{formatDate(response.createdAt)}</span>
                      </div>
                      <p className="text-gray-700">{response.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isAdmin && (
              <div className="flex gap-2 pt-4 border-t">
                {selectedQuery.status !== 'resolved' && selectedQuery.status !== 'closed' && (
                  <Button
                    onClick={() => {
                      setShowViewModal(false);
                      handleRespond(selectedQuery);
                    }}
                    leftIcon={<Send size={18} />}
                  >
                    Respond
                  </Button>
                )}
                <Select
                  value={selectedQuery.status}
                  onChange={(e) => {
                    handleStatusChange(selectedQuery._id, e.target.value);
                    setSelectedQuery({ ...selectedQuery, status: e.target.value });
                  }}
                  options={[
                    { value: 'pending', label: 'Pending' },
                    { value: 'responded', label: 'Responded' },
                    { value: 'resolved', label: 'Resolved' },
                    { value: 'closed', label: 'Closed' },
                  ]}
                  className="flex-1"
                />
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Response Modal */}
      <Modal
        isOpen={showResponseModal}
        onClose={() => {
          setShowResponseModal(false);
          setSelectedQuery(null);
          setResponseText('');
        }}
        title="Respond to Query"
        size="md"
      >
        {selectedQuery && (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900 mb-1">{selectedQuery.subject}</p>
              <p className="text-xs text-gray-600 line-clamp-2">{selectedQuery.description}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Response <span className="text-red-500">*</span>
              </label>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                placeholder="Enter your response..."
                required
              />
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowResponseModal(false);
                  setSelectedQuery(null);
                  setResponseText('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmitResponse} leftIcon={<Send size={18} />}>
                Send Response
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SupportPage;
