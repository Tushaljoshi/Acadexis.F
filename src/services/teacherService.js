import api from '../config/api';

export const teacherService = {
  // Get all teachers
  getAll: async (params = {}) => {
    const response = await api.get('/teachers', { params });
    return response.data;
  },

  // Get teacher by ID
  getById: async (id) => {
    const response = await api.get(`/teachers/${id}`);
    return response.data;
  },

  // Create teacher
  create: async (data) => {
    const response = await api.post('/teachers', data);
    return response.data;
  },

  // Update teacher
  update: async (id, data) => {
    const response = await api.put(`/teachers/${id}`, data);
    return response.data;
  },

  // Delete teacher
  delete: async (id) => {
    const response = await api.delete(`/teachers/${id}`);
    return response.data;
  },

  // Assign subjects
  assignSubjects: async (id, subjectIds) => {
    const response = await api.post(`/teachers/${id}/subjects`, { subjectIds });
    return response.data;
  },

  // Assign class teacher
  assignClassTeacher: async (id, classId, sectionId) => {
    const response = await api.post(`/teachers/${id}/assign-class`, {
      classId,
      sectionId,
    });
    return response.data;
  },
};
