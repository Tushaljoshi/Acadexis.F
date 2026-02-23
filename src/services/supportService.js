import api from '../config/api';

export const supportService = {
  // Get all/current user's support queries
  getAll: async () => {
    const response = await api.get('/support');
    return response.data;
  },

  // Get single query
  getById: async (id) => {
    const response = await api.get(`/support/${id}`);
    return response.data;
  },

  // Create new query
  create: async (data) => {
    const response = await api.post('/support', data);
    return response.data;
  },

  // Add response to query
  addResponse: async (id, data) => {
    const response = await api.post(`/support/${id}/responses`, data);
    return response.data;
  },

  // Update status
  updateStatus: async (id, status) => {
    const response = await api.patch(`/support/${id}/status`, { status });
    return response.data;
  },
};

