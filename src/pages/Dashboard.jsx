import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { dashboardService } from '../services/dashboardService';
import { ROLES } from '../config/constants';
import AdminDashboard from './dashboards/AdminDashboard';
import TeacherDashboard from './dashboards/TeacherDashboard';
import StudentDashboard from './dashboards/StudentDashboard';
import ParentDashboard from './dashboards/ParentDashboard';
import Loading from '../components/ui/Loading';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  const renderDashboard = () => {
    switch (user?.role) {
      case ROLES.ADMIN:
        return <AdminDashboard />;
      case ROLES.TEACHER:
        return <TeacherDashboard />;
      case ROLES.STUDENT:
        return <StudentDashboard />;
      case ROLES.PARENT:
        return <ParentDashboard />;
      default:
        return <AdminDashboard />;
    }
  };

  return renderDashboard();
};

export default Dashboard;
