import api from '../config/api';

export const studentService = {
  // Get all students
  getAll: async (params = {}) => {
    const response = await api.get('/students', { params });
    return response.data;
  },

  // Get student by ID
  getById: async (id) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  // Create student
  create: async (data) => {
    const response = await api.post('/students', data);
    return response.data;
  },

  // Update student
  update: async (id, data) => {
    const response = await api.put(`/students/${id}`, data);
    return response.data;
  },

  // Delete student
  delete: async (id) => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },

  // Bulk upload
  bulkUpload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/students/bulk-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Export to Excel
  exportToExcel: async (params = {}) => {
    const response = await api.get('/students/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // Promote students
  promote: async (data) => {
    const response = await api.post('/students/promote', data);
    return response.data;
  },

  // Upload document
  uploadDocument: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/students/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
