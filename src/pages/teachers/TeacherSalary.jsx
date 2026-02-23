import { useState, useEffect } from 'react';
import { DollarSign, Plus, Calendar, TrendingUp, Search } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import { teacherService } from '../../services/teacherService';
import { salaryStore } from '../../store/salaryStore';
import { teacherStore } from '../../store/teacherStore';
import { formatCurrency, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Loading from '../../components/ui/Loading';

const TeacherSalary = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    month: new Date().toISOString().slice(0, 7), // YYYY-MM format
    paymentMode: 'bank',
    remarks: '',
    isExtra: false,
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await teacherService.getAll();
      const data = response.data || [];
      setTeachers(data.length > 0 ? data : teacherStore.getAll());
    } catch (error) {
      setTeachers(teacherStore.getAll());
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (teacher) => {
    setSelectedTeacher(teacher);
    setShowDetailsModal(true);
  };

  const handleAddPayment = (teacher) => {
    setSelectedTeacher(teacher);
    const basic = teacher.salaryBasic ?? teacher.salary ?? 0;
    const allowance = teacher.salaryAllowance ?? 0;
    const totalSalary = Number(basic) + Number(allowance);
    
    setPaymentData({
      amount: totalSalary.toString(),
      paymentDate: new Date().toISOString().split('T')[0],
      month: new Date().toISOString().slice(0, 7),
      paymentMode: 'bank',
      remarks: '',
      isExtra: false,
    });
    setShowPaymentModal(true);
  };

  const handleSubmitPayment = async () => {
    if (!selectedTeacher || !paymentData.amount) {
      toast.error('Please enter payment amount');
      return;
    }

    try {
      salaryStore.recordPayment({
        teacherId: selectedTeacher._id,
        teacherName: selectedTeacher.name,
        amount: Number(paymentData.amount),
        month: paymentData.month,
        paymentDate: paymentData.paymentDate,
        paymentMode: paymentData.paymentMode,
        remarks: paymentData.remarks,
        isExtra: paymentData.isExtra,
      });
      toast.success('Salary payment recorded successfully');
      setShowPaymentModal(false);
      setSelectedTeacher(null);
      fetchTeachers();
    } catch (error) {
      toast.error('Failed to record payment');
    }
  };

  const getTeacherSummary = (teacher) => {
    const basic = teacher.salaryBasic ?? teacher.salary ?? 0;
    const allowance = teacher.salaryAllowance ?? 0;
    const monthlySalary = Number(basic) + Number(allowance);
    return salaryStore.getTeacherSummary(teacher._id, monthlySalary);
  };

  const calculateTotals = () => {
    const allSalaries = salaryStore.getAll();
    const totalPaid = allSalaries.reduce((sum, s) => sum + (s.amount || 0), 0);
    const totalTeachers = teachers.length;
    const totalMonths = allSalaries.length;

    return { totalPaid, totalTeachers, totalMonths };
  };

  const filteredTeachers = teachers.filter((teacher) => {
    const term = searchTerm.toLowerCase();
    return (
      teacher.name?.toLowerCase().includes(term) ||
      teacher.email?.toLowerCase().includes(term)
    );
  });

  const totals = calculateTotals();

  if (loading) {
    return <Loading size="lg" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teacher Salary Management</h1>
          <p className="text-gray-600">Manage teacher salary payments and records</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Paid</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.totalPaid)}</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <DollarSign className="text-white" size={24} />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Teachers</p>
              <p className="text-2xl font-bold text-gray-900">{totals.totalTeachers}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <TrendingUp className="text-white" size={24} />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Payments</p>
              <p className="text-2xl font-bold text-gray-900">{totals.totalMonths}</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <Calendar className="text-white" size={24} />
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-4">
          <Input
            placeholder="Search by teacher name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={18} />}
          />
        </div>

        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Teacher</Table.Head>
              <Table.Head>Monthly Salary</Table.Head>
              <Table.Head>Months Paid</Table.Head>
              <Table.Head>Total Paid</Table.Head>
              <Table.Head>Extra Paid</Table.Head>
              <Table.Head>Pending</Table.Head>
              <Table.Head>Actions</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredTeachers.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={7} className="text-center py-8 text-gray-500">
                  No teachers found
                </Table.Cell>
              </Table.Row>
            ) : (
              filteredTeachers.map((teacher) => {
                const summary = getTeacherSummary(teacher);
                return (
                  <Table.Row key={teacher._id}>
                    <Table.Cell className="font-medium">{teacher.name}</Table.Cell>
                    <Table.Cell className="font-medium">
                      {formatCurrency(summary.monthlySalary || 0)}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge variant="info">{summary.monthsPaid}</Badge>
                    </Table.Cell>
                    <Table.Cell className="text-green-600 font-medium">
                      {formatCurrency(summary.totalPaid)}
                    </Table.Cell>
                    <Table.Cell className="text-blue-600 font-medium">
                      {formatCurrency(summary.extraPaid)}
                    </Table.Cell>
                    <Table.Cell className="text-red-600 font-medium">
                      {formatCurrency(summary.pending)}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(teacher)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Calendar size={18} />
                        </button>
                        <button
                          onClick={() => handleAddPayment(teacher)}
                          className="text-green-600 hover:text-green-800"
                          title="Record Payment"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                );
              })
            )}
          </Table.Body>
        </Table>
      </Card>

      {/* Teacher Salary Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedTeacher(null);
        }}
        title={`Salary Details - ${selectedTeacher?.name || ''}`}
        size="xl"
      >
        {selectedTeacher && (() => {
          const summary = getTeacherSummary(selectedTeacher);
          return (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Monthly Salary</p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(summary.monthlySalary)}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Paid</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(summary.totalPaid)}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Months Paid</p>
                  <p className="text-xl font-bold text-purple-600">{summary.monthsPaid}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(summary.pending)}
                  </p>
                </div>
              </div>

              {summary.extraPaid > 0 && (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-gray-600">Extra Payment</p>
                  <p className="text-xl font-bold text-yellow-600">
                    {formatCurrency(summary.extraPaid)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Amount paid over the expected salary
                  </p>
                </div>
              )}

              {summary.payments && summary.payments.length > 0 ? (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Payment History</h3>
                  <Table>
                    <Table.Header>
                      <Table.Row>
                        <Table.Head>Month</Table.Head>
                        <Table.Head>Date</Table.Head>
                        <Table.Head>Amount</Table.Head>
                        <Table.Head>Mode</Table.Head>
                        <Table.Head>Type</Table.Head>
                        <Table.Head>Remarks</Table.Head>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {summary.payments.map((payment, idx) => (
                        <Table.Row key={payment.id || idx}>
                          <Table.Cell className="font-medium">
                            {payment.month || formatDate(payment.paymentDate, 'MM/YYYY')}
                          </Table.Cell>
                          <Table.Cell>{formatDate(payment.paymentDate)}</Table.Cell>
                          <Table.Cell className="font-medium text-green-600">
                            {formatCurrency(payment.amount)}
                          </Table.Cell>
                          <Table.Cell>{payment.paymentMode || 'bank'}</Table.Cell>
                          <Table.Cell>
                            <Badge variant={payment.isExtra ? 'warning' : 'success'}>
                              {payment.isExtra ? 'Extra' : 'Regular'}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>{payment.remarks || '-'}</Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No payment records found</p>
                </div>
              )}
            </div>
          );
        })()}
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedTeacher(null);
        }}
        title={`Record Salary Payment - ${selectedTeacher?.name || ''}`}
        size="md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Monthly Salary</p>
            <p className="font-bold text-lg">
              {selectedTeacher
                ? formatCurrency(
                    (selectedTeacher.salaryBasic ?? selectedTeacher.salary ?? 0) +
                      (selectedTeacher.salaryAllowance ?? 0)
                  )
                : '-'}
            </p>
          </div>

          <Input
            label="Payment Amount"
            type="number"
            value={paymentData.amount}
            onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
            required
          />

          <Input
            label="Month (YYYY-MM)"
            type="month"
            value={paymentData.month}
            onChange={(e) => setPaymentData({ ...paymentData, month: e.target.value })}
            required
          />

          <Input
            label="Payment Date"
            type="date"
            value={paymentData.paymentDate}
            onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
            required
          />

          <Select
            label="Payment Mode"
            value={paymentData.paymentMode}
            onChange={(e) => setPaymentData({ ...paymentData, paymentMode: e.target.value })}
            options={[
              { value: 'bank', label: 'Bank Transfer' },
              { value: 'cheque', label: 'Cheque' },
              { value: 'cash', label: 'Cash' },
              { value: 'online', label: 'Online' },
            ]}
            required
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isExtra"
              checked={paymentData.isExtra}
              onChange={(e) => setPaymentData({ ...paymentData, isExtra: e.target.checked })}
              className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
            />
            <label htmlFor="isExtra" className="text-sm text-gray-700">
              This is an extra payment (bonus, advance, etc.)
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks
            </label>
            <textarea
              value={paymentData.remarks}
              onChange={(e) => setPaymentData({ ...paymentData, remarks: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="Payment remarks (optional)"
            />
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowPaymentModal(false);
                setSelectedTeacher(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitPayment}>
              Record Payment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TeacherSalary;
