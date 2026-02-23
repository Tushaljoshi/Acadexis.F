import { useEffect, useState } from 'react';
import { Users, Calendar, FileText, DollarSign } from 'lucide-react';
import Card from '../../components/ui/Card';
import { dashboardService } from '../../services/dashboardService';
import Loading from '../../components/ui/Loading';
import Badge from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/helpers';

const ParentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardService.getParentDashboard();
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

  const children = data?.children || [
    { name: 'John Doe', class: '10-A', attendance: 92, feeDue: 5000 },
    { name: 'Jane Doe', class: '8-B', attendance: 88, feeDue: 3000 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Children</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {children.map((child, index) => (
            <Card key={index}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{child.name}</h3>
                  <p className="text-sm text-gray-600">{child.class}</p>
                </div>
                <div className="bg-brand-100 p-3 rounded-lg">
                  <Users className="text-brand-700" size={24} />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Attendance</span>
                  <span className="font-semibold text-gray-900">{child.attendance}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Fee Due</span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(child.feeDue)}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <Card.Title>Upcoming Examinations</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">Mathematics Unit Test</p>
                    <p className="text-sm text-gray-600">John Doe - 10-A</p>
                  </div>
                  <Badge variant="primary">March 20</Badge>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Fee Status</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              {children.map((child, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{child.name}</p>
                    <p className="text-sm text-gray-600">{child.class}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">
                      {formatCurrency(child.feeDue)}
                    </p>
                    <Badge variant="danger">Due</Badge>
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

export default ParentDashboard;
