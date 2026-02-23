import api from '../config/api';

export const dashboardService = {
  // Get admin dashboard data
  getAdminDashboard: async () => {
    const response = await api.get('/dashboard/admin');
    return response.data;
  },

  // Get teacher dashboard data
  getTeacherDashboard: async () => {
    const response = await api.get('/dashboard/teacher');
    return response.data;
  },

  // Get student dashboard data
  getStudentDashboard: async () => {
    const response = await api.get('/dashboard/student');
    return response.data;
  },

  // Get parent dashboard data
  getParentDashboard: async () => {
    const response = await api.get('/dashboard/parent');
    return response.data;
  },
};
