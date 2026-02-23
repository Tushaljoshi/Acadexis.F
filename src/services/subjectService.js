import api from '../config/api';

export const subjectService = {
  // Get all subjects
  getAll: async () => {
    const response = await api.get('/subjects');
    return response.data;
  },

  // Create subject
  create: async (data) => {
    const response = await api.post('/subjects', data);
    return response.data;
  },

  // Update subject
  update: async (id, data) => {
    const response = await api.put(`/subjects/${id}`, data);
    return response.data;
  },

  // Delete subject
  delete: async (id) => {
    const response = await api.delete(`/subjects/${id}`);
    return response.data;
  },
};
