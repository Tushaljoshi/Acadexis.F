import { useState, useEffect } from 'react';
import { Menu, Bell, ChevronDown, User, LogOut, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ROUTES } from '../config/constants';
import { getInitials } from '../utils/helpers';

const TopBar = ({ toggleSidebar }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const pageInfo = {
    [ROUTES.DASHBOARD]: {
      title: 'Dashboard',
      subtitle: 'Overview of your school management system',
    },
    [ROUTES.STUDENTS]: {
      title: 'Students',
      subtitle: 'Manage student records and information',
    },
    [ROUTES.TEACHERS]: {
      title: 'Teachers',
      subtitle: 'Manage teacher records and assignments',
    },
    [ROUTES.CLASSES]: {
      title: 'Classes',
      subtitle: 'Manage classes and sections',
    },
    [ROUTES.ATTENDANCE]: {
      title: 'Attendance',
      subtitle: 'Track and manage student attendance',
    },
    [ROUTES.EXAMS]: {
      title: 'Examinations',
      subtitle: 'Manage exams and results',
    },
    [ROUTES.FEES]: {
      title: 'Fees',
      subtitle: 'Manage fee collection and payments',
    },
    [ROUTES.NOTICES]: {
      title: 'Notices',
      subtitle: 'View and manage announcements',
    },
    [ROUTES.TIMETABLE]: {
      title: 'Timetable',
      subtitle: 'Manage class and teacher schedules',
    },
    [ROUTES.PROFILE]: {
      title: 'Profile',
      subtitle: 'Manage your profile settings',
    },
  };

  const currentPage = pageInfo[location.pathname] || {
    title: 'Acadexis',
    subtitle: 'School Management System',
  };

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
    setShowDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.dropdown-container')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors lg:hidden"
          >
            <Menu size={22} className="text-gray-700" />
          </button>

          <div className="flex flex-col">
            <h1 className="text-lg lg:text-xl font-semibold text-brand-900 leading-tight">
              {currentPage.title}
            </h1>
            <p className="hidden sm:block text-gray-500 text-xs lg:text-sm leading-tight">
              {currentPage.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 border border-gray-200 rounded-full hover:bg-gray-50 relative">
            <Bell size={18} className="text-gray-700" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
              3
            </span>
          </button>
    
          <div className="relative dropdown-container">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 border border-gray-200 rounded-full px-2 pr-3 py-1 hover:bg-gray-50 transition"
            >
              <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-semibold text-sm">
                {user ? getInitials(user.name || user.email) : 'U'}
              </div>
              <div className="flex flex-col text-left hidden sm:block">
                <p className="text-sm font-medium text-gray-900 leading-tight">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 leading-tight capitalize">
                  {user?.role || 'Role'}
                </p>
              </div>
              <ChevronDown size={16} className="text-gray-500" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-lg py-2 z-50">
                <button
                  onClick={() => {
                    navigate(ROUTES.PROFILE);
                    setShowDropdown(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <User size={16} />
                  Profile
                </button>
                <button
                  onClick={() => {
                    navigate('/settings');
                    setShowDropdown(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Settings size={16} />
                  Settings
                </button>
                <div className="border-t my-1" />
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
