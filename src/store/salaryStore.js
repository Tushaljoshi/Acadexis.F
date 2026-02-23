const STORAGE_KEY = 'acadexis_salaries';

const getStoredSalaries = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const setStoredSalaries = (salaries) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(salaries));
};

export const salaryStore = {
  getAll: () => {
    return getStoredSalaries();
  },

  getByTeacher: (teacherId) => {
    const salaries = getStoredSalaries();
    return salaries.filter((s) => s.teacherId === teacherId);
  },

  recordPayment: (data) => {
    const salaries = getStoredSalaries();
    const payment = {
      id: `sal_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      ...data,
      paymentDate: data.paymentDate || new Date().toISOString().split('T')[0],
    };
    salaries.push(payment);
    setStoredSalaries(salaries);
    return payment;
  },

  getTeacherSummary: (teacherId, monthlySalary) => {
    const payments = getStoredSalaries().filter((s) => s.teacherId === teacherId);
    const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const monthsPaid = payments.length;
    const totalDue = (monthlySalary || 0) * monthsPaid;
    const extraPaid = totalPaid > totalDue ? totalPaid - totalDue : 0;
    const pending = totalDue - totalPaid;

    return {
      monthlySalary,
      totalPaid,
      monthsPaid,
      totalDue,
      extraPaid,
      pending,
      payments,
    };
  },

  delete: (id) => {
    const salaries = getStoredSalaries().filter((s) => s.id !== id);
    setStoredSalaries(salaries);
    return true;
  },
};
