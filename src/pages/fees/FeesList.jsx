import { useState, useEffect } from 'react';
import { DollarSign, Plus, Eye, Search, Calendar, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import { feeService } from '../../services/feeService';
import { studentService } from '../../services/studentService';
import { feeStore } from '../../store/feeStore';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { FEE_STATUS } from '../../config/constants';
import toast from 'react-hot-toast';
import Loading from '../../components/ui/Loading';

const FeesList = () => {
  const navigate = useNavigate();
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    totalAmount: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: 'cash',
    remarks: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch fees
      try {
        const response = await feeService.getDueFees();
        setFees(response.data || []);
      } catch {
        setFees(feeStore.getAll());
      }

      // Fetch students
      try {
        const response = await studentService.getAll();
        setStudents(response.data || []);
      } catch {
        setStudents([]);
      }
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudentFees = (student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const handleAddPayment = (fee) => {
    setSelectedStudent({ fee });
    setPaymentData({
      amount: fee.dueAmount || fee.totalAmount || '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMode: 'cash',
      remarks: '',
    });
    setShowPaymentModal(true);
  };

  const handleSubmitPayment = async () => {
    if (!selectedStudent?.fee || !paymentData.amount) {
      toast.error('Please enter payment amount');
      return;
    }

    try {
      const installment = {
        amount: Number(paymentData.amount),
        paymentDate: paymentData.paymentDate,
        paymentMode: paymentData.paymentMode,
        remarks: paymentData.remarks,
      };

      feeStore.addInstallment(selectedStudent.fee._id, installment);
      toast.success('Payment recorded successfully');
      setShowPaymentModal(false);
      setSelectedStudent(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to record payment');
    }
  };

  const getStudentFees = (studentId) => {
    return feeStore.getByStudent(studentId);
  };

  const calculateTotals = () => {
    const allFees = feeStore.getAll();
    const totalCollected = allFees.reduce((sum, f) => sum + (f.paidAmount || 0), 0);
    const totalPending = allFees.reduce((sum, f) => sum + (f.dueAmount || 0), 0);
    const totalOverdue = allFees
      .filter((f) => {
        if (f.dueDate) {
          const dueDate = new Date(f.dueDate);
          const today = new Date();
          return dueDate < today && f.status !== 'paid';
        }
        return false;
      })
      .reduce((sum, f) => sum + (f.dueAmount || 0), 0);

    return { totalCollected, totalPending, totalOverdue };
  };

  const filteredFees = fees.filter((fee) => {
    const term = searchTerm.toLowerCase();
    return (
      fee.student?.name?.toLowerCase().includes(term) ||
      fee.student?.admissionNumber?.toLowerCase().includes(term)
    );
  });

  const totals = calculateTotals();
  const statusColors = {
    [FEE_STATUS.PAID]: 'success',
    [FEE_STATUS.PENDING]: 'warning',
    [FEE_STATUS.OVERDUE]: 'danger',
    [FEE_STATUS.PARTIAL]: 'info',
  };

  if (loading) {
    return <Loading size="lg" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fees Management</h1>
          <p className="text-gray-600">Manage fee collection and payments</p>
        </div>
        <Button
          onClick={() => {
            // Create fee for student
            setShowPaymentModal(true);
            setSelectedStudent(null);
            setPaymentData({
              totalAmount: '',
              amount: '',
              paymentDate: new Date().toISOString().split('T')[0],
              paymentMode: 'cash',
              remarks: '',
            });
          }}
          leftIcon={<Plus size={18} />}
        >
          Add Fee Record
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Collected</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.totalCollected)}</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <DollarSign className="text-white" size={24} />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Fees</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.totalPending)}</p>
            </div>
            <div className="bg-yellow-500 p-3 rounded-lg">
              <DollarSign className="text-white" size={24} />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.totalOverdue)}</p>
            </div>
            <div className="bg-red-500 p-3 rounded-lg">
              <DollarSign className="text-white" size={24} />
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-4">
          <Input
            placeholder="Search by student name or admission number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={18} />}
          />
        </div>

        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Student</Table.Head>
              <Table.Head>Class</Table.Head>
              <Table.Head>Total Amount</Table.Head>
              <Table.Head>Paid</Table.Head>
              <Table.Head>Due</Table.Head>
              <Table.Head>Status</Table.Head>
              <Table.Head>Actions</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredFees.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={7} className="text-center py-8 text-gray-500">
                  No fees records found
                </Table.Cell>
              </Table.Row>
            ) : (
              filteredFees.map((fee) => (
                <Table.Row key={fee._id}>
                  <Table.Cell className="font-medium">
                    {fee.student?.name || fee.studentName || '-'}
                  </Table.Cell>
                  <Table.Cell>{fee.student?.class?.name || fee.className || '-'}</Table.Cell>
                  <Table.Cell className="font-medium">
                    {formatCurrency(fee.totalAmount || fee.amount || 0)}
                  </Table.Cell>
                  <Table.Cell className="text-green-600 font-medium">
                    {formatCurrency(fee.paidAmount || 0)}
                  </Table.Cell>
                  <Table.Cell className="text-red-600 font-medium">
                    {formatCurrency(fee.dueAmount || fee.totalAmount || 0)}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge variant={statusColors[fee.status] || 'default'}>
                      {fee.status || 'pending'}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewStudentFees(fee.student || { _id: fee.studentId, name: fee.studentName })}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      {fee.dueAmount > 0 && (
                        <button
                          onClick={() => handleAddPayment(fee)}
                          className="text-green-600 hover:text-green-800"
                          title="Add Payment"
                        >
                          <Plus size={18} />
                        </button>
                      )}
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </Card>

      {/* Student Fee Details Modal */}
      <Modal
        isOpen={showStudentModal}
        onClose={() => {
          setShowStudentModal(false);
          setSelectedStudent(null);
        }}
        title={`Fee Details - ${selectedStudent?.name || ''}`}
        size="xl"
      >
        {selectedStudent && (
          <div className="space-y-6">
            {(() => {
              const studentFees = getStudentFees(selectedStudent._id);
              if (studentFees.length === 0) {
                return (
                  <div className="text-center py-8 text-gray-500">
                    <p>No fee records found for this student</p>
                    <Button
                      className="mt-4"
                      onClick={() => {
                        setShowStudentModal(false);
                        // Create new fee
                        const newFee = feeStore.create({
                          studentId: selectedStudent._id,
                          studentName: selectedStudent.name,
                          totalAmount: 0,
                        });
                        handleAddPayment(newFee);
                      }}
                    >
                      Create Fee Record
                    </Button>
                  </div>
                );
              }

              return studentFees.map((fee) => (
                <div key={fee._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">Fee Record</h3>
                      <p className="text-sm text-gray-600">
                        Created: {formatDate(fee.createdAt)}
                      </p>
                    </div>
                    <Badge variant={statusColors[fee.status] || 'default'}>
                      {fee.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="font-bold text-lg">{formatCurrency(fee.totalAmount || 0)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Paid Amount</p>
                      <p className="font-bold text-lg text-green-600">
                        {formatCurrency(fee.paidAmount || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Due Amount</p>
                      <p className="font-bold text-lg text-red-600">
                        {formatCurrency(fee.dueAmount || 0)}
                      </p>
                    </div>
                  </div>

                  {fee.installments && fee.installments.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Installments</h4>
                      <Table>
                        <Table.Header>
                          <Table.Row>
                            <Table.Head>Date</Table.Head>
                            <Table.Head>Amount</Table.Head>
                            <Table.Head>Mode</Table.Head>
                            <Table.Head>Remarks</Table.Head>
                          </Table.Row>
                        </Table.Header>
                        <Table.Body>
                          {fee.installments.map((inst, idx) => (
                            <Table.Row key={inst.id || idx}>
                              <Table.Cell>{formatDate(inst.paymentDate)}</Table.Cell>
                              <Table.Cell className="font-medium text-green-600">
                                {formatCurrency(inst.amount)}
                              </Table.Cell>
                              <Table.Cell>{inst.paymentMode || 'cash'}</Table.Cell>
                              <Table.Cell>{inst.remarks || '-'}</Table.Cell>
                            </Table.Row>
                          ))}
                        </Table.Body>
                      </Table>
                    </div>
                  )}

                  {fee.dueAmount > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <Button
                        onClick={() => {
                          setShowStudentModal(false);
                          handleAddPayment(fee);
                        }}
                        leftIcon={<Plus size={18} />}
                      >
                        Add Payment
                      </Button>
                    </div>
                  )}
                </div>
              ));
            })()}
          </div>
        )}
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedStudent(null);
        }}
        title={selectedStudent?.fee ? 'Record Payment' : 'Create Fee Record'}
        size="md"
      >
        <div className="space-y-4">
          {!selectedStudent?.fee && (
            <Select
              label="Select Student"
              value={selectedStudent?._id || ''}
              onChange={(e) => {
                const student = students.find((s) => s._id === e.target.value);
                setSelectedStudent(student);
              }}
              options={students.map((s) => ({
                value: s._id,
                label: `${s.name} (${s.admissionNumber})`,
              }))}
              required
            />
          )}

          <Input
            label="Total Fee Amount"
            type="number"
            value={selectedStudent?.fee ? selectedStudent.fee.totalAmount : paymentData.totalAmount || ''}
            onChange={(e) => {
              if (!selectedStudent?.fee) {
                setPaymentData({ ...paymentData, totalAmount: e.target.value });
              }
            }}
            disabled={!!selectedStudent?.fee}
            required={!selectedStudent?.fee}
          />

          <Input
            label="Payment Amount"
            type="number"
            value={paymentData.amount}
            onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
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
              { value: 'cash', label: 'Cash' },
              { value: 'cheque', label: 'Cheque' },
              { value: 'online', label: 'Online' },
              { value: 'card', label: 'Card' },
            ]}
            required
          />

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
                setSelectedStudent(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedStudent?.fee) {
                  handleSubmitPayment();
                } else {
                  // Create new fee and add payment
                  if (!selectedStudent?._id || !paymentData.totalAmount) {
                    toast.error('Please select student and enter total amount');
                    return;
                  }
                  const newFee = feeStore.create({
                    studentId: selectedStudent._id,
                    studentName: selectedStudent.name,
                    totalAmount: Number(paymentData.totalAmount),
                  });
                  feeStore.addInstallment(newFee._id, {
                    amount: Number(paymentData.amount),
                    paymentDate: paymentData.paymentDate,
                    paymentMode: paymentData.paymentMode,
                    remarks: paymentData.remarks,
                  });
                  toast.success('Fee record created and payment recorded');
                  setShowPaymentModal(false);
                  setSelectedStudent(null);
                  fetchData();
                }
              }}
            >
              {selectedStudent?.fee ? 'Record Payment' : 'Create & Record Payment'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FeesList;
