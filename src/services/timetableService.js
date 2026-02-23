import api from '../config/api';

export const timetableService = {
  // Get timetable by class
  getByClass: async (classId, sectionId) => {
    const response = await api.get('/timetable/class', {
      params: { classId, sectionId },
    });
    return response.data;
  },

  // Get timetable by teacher
  getByTeacher: async (teacherId) => {
    const response = await api.get('/timetable/teacher', {
      params: { teacherId },
    });
    return response.data;
  },

  // Create/Update timetable
  update: async (data) => {
    const response = await api.post('/timetable', data);
    return response.data;
  },

  // Delete timetable entry
  delete: async (id) => {
    const response = await api.delete(`/timetable/${id}`);
    return response.data;
  },
};
