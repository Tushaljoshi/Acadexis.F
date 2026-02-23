const STORAGE_KEY = 'acadexis_fees';

const getStoredFees = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const setStoredFees = (fees) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fees));
};

export const feeStore = {
  getAll: () => {
    return getStoredFees();
  },

  getByStudent: (studentId) => {
    const fees = getStoredFees();
    return fees.filter((f) => f.studentId === studentId);
  },

  create: (data) => {
    const fees = getStoredFees();
    const newFee = {
      _id: `fee_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      ...data,
      installments: data.installments || [],
      totalAmount: data.totalAmount || 0,
      paidAmount: 0,
      dueAmount: data.totalAmount || 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    fees.push(newFee);
    setStoredFees(fees);
    return newFee;
  },

  addInstallment: (feeId, installmentData) => {
    const fees = getStoredFees();
    const feeIndex = fees.findIndex((f) => f._id === feeId);
    if (feeIndex >= 0) {
      const installment = {
        id: `inst_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        ...installmentData,
        paymentDate: installmentData.paymentDate || new Date().toISOString().split('T')[0],
      };
      if (!fees[feeIndex].installments) {
        fees[feeIndex].installments = [];
      }
      fees[feeIndex].installments.push(installment);
      
      // Update paid and due amounts
      fees[feeIndex].paidAmount = (fees[feeIndex].paidAmount || 0) + (installmentData.amount || 0);
      fees[feeIndex].dueAmount = (fees[feeIndex].totalAmount || 0) - fees[feeIndex].paidAmount;
      
      // Update status
      if (fees[feeIndex].dueAmount <= 0) {
        fees[feeIndex].status = 'paid';
      } else if (fees[feeIndex].paidAmount > 0) {
        fees[feeIndex].status = 'partial';
      }
      
      setStoredFees(fees);
      return installment;
    }
    return null;
  },

  update: (id, data) => {
    const fees = getStoredFees();
    const index = fees.findIndex((f) => f._id === id);
    if (index >= 0) {
      fees[index] = {
        ...fees[index],
        ...data,
      };
      setStoredFees(fees);
      return fees[index];
    }
    return null;
  },

  delete: (id) => {
    const fees = getStoredFees().filter((f) => f._id !== id);
    setStoredFees(fees);
    return true;
  },
};
