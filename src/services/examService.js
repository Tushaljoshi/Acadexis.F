import api from '../config/api';

export const examService = {
  // Get all exams
  getAll: async (params = {}) => {
    const response = await api.get('/exams', { params });
    return response.data;
  },

  // Get exam by ID
  getById: async (id) => {
    const response = await api.get(`/exams/${id}`);
    return response.data;
  },

  // Create exam
  create: async (data) => {
    const response = await api.post('/exams', data);
    return response.data;
  },

  // Update exam
  update: async (id, data) => {
    const response = await api.put(`/exams/${id}`, data);
    return response.data;
  },

  // Delete exam
  delete: async (id) => {
    const response = await api.delete(`/exams/${id}`);
    return response.data;
  },

  // Add marks
  addMarks: async (examId, data) => {
    const response = await api.post(`/exams/${examId}/marks`, data);
    return response.data;
  },

  // Get results
  getResults: async (params = {}) => {
    const response = await api.get('/results', { params });
    return response.data;
  },

  // Get report card
  getReportCard: async (studentId, examId) => {
    const response = await api.get(`/results/report-card/${studentId}`, {
      params: { examId },
    });
    return response.data;
  },

  // Generate PDF report card
  generatePDF: async (studentId, examId) => {
    const response = await api.get(`/results/report-card/${studentId}/pdf`, {
      params: { examId },
      responseType: 'blob',
    });
    return response.data;
  },
};
