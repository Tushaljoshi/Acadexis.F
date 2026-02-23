import { useEffect, useState } from 'react';
import { Users, GraduationCap, DollarSign, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import { dashboardService } from '../../services/dashboardService';
import { formatCurrency } from '../../utils/helpers';
import Loading from '../../components/ui/Loading';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardService.getAdminDashboard();
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

  const stats = [
    {
      title: 'Total Students',
      value: data?.totalStudents || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Total Teachers',
      value: data?.totalTeachers || 0,
      icon: GraduationCap,
      color: 'bg-green-500',
      change: '+5%',
    },
    {
      title: 'Fee Collected',
      value: formatCurrency(data?.feeCollected || 0),
      icon: DollarSign,
      color: 'bg-yellow-500',
      change: '+8%',
    },
    {
      title: 'Pending Fees',
      value: formatCurrency(data?.pendingFees || 0),
      icon: AlertCircle,
      color: 'bg-red-500',
      change: '-3%',
    },
  ];

  const attendanceData = data?.attendanceOverview || [
    { name: 'Mon', present: 95, absent: 5 },
    { name: 'Tue', present: 92, absent: 8 },
    { name: 'Wed', present: 98, absent: 2 },
    { name: 'Thu', present: 94, absent: 6 },
    { name: 'Fri', present: 96, absent: 4 },
  ];

  const feeData = data?.feeCollection || [
    { month: 'Jan', collected: 450000, pending: 50000 },
    { month: 'Feb', collected: 520000, pending: 30000 },
    { month: 'Mar', collected: 480000, pending: 40000 },
    { month: 'Apr', collected: 550000, pending: 25000 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-green-600 mt-1">{stat.change} from last month</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <Card.Title>Attendance Overview</Card.Title>
          </Card.Header>
          <Card.Content>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="#235347" />
                <Bar dataKey="absent" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Fee Collection</Card.Title>
          </Card.Header>
          <Card.Content>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={feeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="collected" stroke="#235347" strokeWidth={2} />
                <Line type="monotone" dataKey="pending" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card.Content>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <Card.Title>Recent Activities</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                  <div className="w-2 h-2 bg-brand-600 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">New student admission</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Upcoming Events</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                  <Calendar size={20} className="text-brand-600" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Annual Day Celebration</p>
                    <p className="text-xs text-gray-500">March 15, 2024</p>
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

export default AdminDashboard;
