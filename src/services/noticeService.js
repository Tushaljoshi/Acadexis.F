import api from '../config/api';

export const noticeService = {
  // Get all notices
  getAll: async (params = {}) => {
    const response = await api.get('/notices', { params });
    return response.data;
  },

  // Get notice by ID
  getById: async (id) => {
    const response = await api.get(`/notices/${id}`);
    return response.data;
  },

  // Create notice
  create: async (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === 'file' && data[key]) {
        formData.append('file', data[key]);
      } else {
        formData.append(key, data[key]);
      }
    });
    const response = await api.post('/notices', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Update notice
  update: async (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === 'file' && data[key]) {
        formData.append('file', data[key]);
      } else {
        formData.append(key, data[key]);
      }
    });
    const response = await api.put(`/notices/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Delete notice
  delete: async (id) => {
    const response = await api.delete(`/notices/${id}`);
    return response.data;
  },
};
