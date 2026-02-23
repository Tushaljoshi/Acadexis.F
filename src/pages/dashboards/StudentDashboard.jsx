import { useEffect, useState } from 'react';
import { Calendar, FileText, DollarSign, Bell, TrendingUp } from 'lucide-react';
import Card from '../../components/ui/Card';
import { dashboardService } from '../../services/dashboardService';
import Loading from '../../components/ui/Loading';
import Badge from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/helpers';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardService.getStudentDashboard();
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

  const attendancePercentage = data?.attendancePercentage || 85;
  const upcomingExams = data?.upcomingExams || [
    { name: 'Mathematics Unit Test', date: '2024-03-20', type: 'Unit Test' },
    { name: 'Science Mid-term', date: '2024-03-25', type: 'Mid-term' },
  ];
  const feeDue = data?.feeDue || 5000;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Attendance</p>
              <p className="text-2xl font-bold text-gray-900">{attendancePercentage}%</p>
              <p className="text-xs text-green-600 mt-1">Good attendance</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <Calendar className="text-white" size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Fee Due</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(feeDue)}</p>
              <p className="text-xs text-red-600 mt-1">Payment pending</p>
            </div>
            <div className="bg-yellow-500 p-3 rounded-lg">
              <DollarSign className="text-white" size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Upcoming Exams</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingExams.length}</p>
              <p className="text-xs text-blue-600 mt-1">Prepare well</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <FileText className="text-white" size={24} />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <Card.Title>Upcoming Examinations</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              {upcomingExams.map((exam, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{exam.name}</p>
                    <p className="text-sm text-gray-600">{exam.date}</p>
                  </div>
                  <Badge variant="primary">{exam.type}</Badge>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Latest Notices</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded">
                  <Bell size={18} className="text-brand-600 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Important notice from school</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      </div>

      <Card>
        <Card.Header>
          <Card.Title>Recent Results</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">Mathematics Unit Test</p>
                  <p className="text-sm text-gray-600">Marks: 85/100</p>
                </div>
                <Badge variant="success">Grade A</Badge>
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default StudentDashboard;
