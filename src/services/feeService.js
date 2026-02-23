import api from '../config/api';

export const feeService = {
  // Get fee structure
  getStructure: async (classId) => {
    const response = await api.get('/fees/structure', { params: { classId } });
    return response.data;
  },

  // Create/Update fee structure
  updateStructure: async (data) => {
    const response = await api.post('/fees/structure', data);
    return response.data;
  },

  // Get student fees
  getStudentFees: async (studentId, params = {}) => {
    const response = await api.get(`/fees/student/${studentId}`, { params });
    return response.data;
  },

  // Record payment
  recordPayment: async (data) => {
    const response = await api.post('/fees/payment', data);
    return response.data;
  },

  // Generate receipt
  generateReceipt: async (paymentId) => {
    const response = await api.get(`/fees/receipt/${paymentId}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Get due fees
  getDueFees: async (params = {}) => {
    const response = await api.get('/fees/due', { params });
    return response.data;
  },

  // Razorpay payment
  createRazorpayOrder: async (data) => {
    const response = await api.post('/fees/razorpay/create-order', data);
    return response.data;
  },

  // Verify payment
  verifyPayment: async (data) => {
    const response = await api.post('/fees/razorpay/verify', data);
    return response.data;
  },
};
