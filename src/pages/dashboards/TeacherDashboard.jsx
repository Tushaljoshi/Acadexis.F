import { useEffect, useState } from 'react';
import { Clock, Users, BookOpen, Bell } from 'lucide-react';
import Card from '../../components/ui/Card';
import { dashboardService } from '../../services/dashboardService';
import Loading from '../../components/ui/Loading';
import Button from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../config/constants';

const TeacherDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardService.getTeacherDashboard();
      setData(response);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading size="lg" />;
  }

  const todayTimetable = data?.todayTimetable || [
    { time: '09:00 AM', subject: 'Mathematics', class: '10-A' },
    { time: '10:30 AM', subject: 'Physics', class: '10-B' },
    { time: '02:00 PM', subject: 'Mathematics', class: '9-A' },
  ];

  const assignedClasses = data?.assignedClasses || [
    { class: '10-A', subject: 'Mathematics', students: 35 },
    { class: '10-B', subject: 'Physics', students: 32 },
    { class: '9-A', subject: 'Mathematics', students: 38 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Assigned Classes</p>
              <p className="text-2xl font-bold text-gray-900">{assignedClasses.length}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <BookOpen className="text-white" size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {assignedClasses.reduce((sum, c) => sum + c.students, 0)}
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <Users className="text-white" size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Today's Classes</p>
              <p className="text-2xl font-bold text-gray-900">{todayTimetable.length}</p>
            </div>
            <div className="bg-yellow-500 p-3 rounded-lg">
              <Clock className="text-white" size={24} />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <Card.Title>Today's Timetable</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              {todayTimetable.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{item.subject}</p>
                    <p className="text-sm text-gray-600">{item.class}</p>
                  </div>
                  <p className="text-sm font-medium text-brand-600">{item.time}</p>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Assigned Classes</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              {assignedClasses.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{item.class}</p>
                    <p className="text-sm text-gray-600">{item.subject}</p>
                  </div>
                  <p className="text-sm text-gray-600">{item.students} students</p>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <Card.Title>Quick Actions</Card.Title>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="space-y-2">
              <Button
                className="w-full"
                onClick={() => navigate(ROUTES.ATTENDANCE_MARK)}
              >
                Mark Attendance
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => navigate(ROUTES.EXAMS)}
              >
                Add Exam Marks
              </Button>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Recent Notices</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded">
                  <Bell size={18} className="text-brand-600 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">New notice from admin</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;
