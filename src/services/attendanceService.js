import api from '../config/api';

export const attendanceService = {
  // Mark attendance
  markAttendance: async (data) => {
    const response = await api.post('/attendance/mark', data);
    return response.data;
  },

  // Get attendance by date
  getByDate: async (classId, sectionId, date) => {
    const response = await api.get('/attendance', {
      params: { classId, sectionId, date },
    });
    return response.data;
  },

  // Get student attendance
  getStudentAttendance: async (studentId, params = {}) => {
    const response = await api.get(`/attendance/student/${studentId}`, { params });
    return response.data;
  },

  // Get attendance report
  getReport: async (params) => {
    const response = await api.get('/attendance/report', { params });
    return response.data;
  },

  // Export attendance
  exportReport: async (params) => {
    const response = await api.get('/attendance/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};
