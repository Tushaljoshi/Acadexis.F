import api from '../config/api';

export const classService = {
  // Get all classes
  getAll: async () => {
    const response = await api.get('/classes');
    return response.data;
  },

  // Create class
  create: async (data) => {
    const response = await api.post('/classes', data);
    return response.data;
  },

  // Update class
  update: async (id, data) => {
    const response = await api.put(`/classes/${id}`, data);
    return response.data;
  },

  // Delete class
  delete: async (id) => {
    const response = await api.delete(`/classes/${id}`);
    return response.data;
  },

  // Add section
  addSection: async (classId, sectionName) => {
    const response = await api.post(`/classes/${classId}/sections`, { name: sectionName });
    return response.data;
  },

  // Assign subjects to class
  assignSubjects: async (classId, subjectIds) => {
    const response = await api.post(`/classes/${classId}/subjects`, { subjectIds });
    return response.data;
  },
};
