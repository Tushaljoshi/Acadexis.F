import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  FileText,
  DollarSign,
  Megaphone,
  Clock,
  User,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { ROUTES, ROLES } from '../config/constants';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, hasRole } = useAuthStore();

  const menuItems = [
    {
      section: 'Main Menu',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: ROUTES.DASHBOARD },
      ],
    },
  ];

  if (hasRole(ROLES.ADMIN) || hasRole(ROLES.TEACHER)) {
    menuItems.push({
      section: 'Management',
      items: [
        { label: 'Students', icon: Users, path: ROUTES.STUDENTS, roles: [ROLES.ADMIN] },
        { label: 'Teachers', icon: GraduationCap, path: ROUTES.TEACHERS, roles: [ROLES.ADMIN] },
        { label: 'Teacher Salary', icon: DollarSign, path: ROUTES.TEACHER_SALARY, roles: [ROLES.ADMIN] },
        { label: 'Classes', icon: BookOpen, path: ROUTES.CLASSES, roles: [ROLES.ADMIN] },
        { label: 'Subjects', icon: BookOpen, path: ROUTES.SUBJECTS, roles: [ROLES.ADMIN] },
      ],
    });

    menuItems.push({
      section: 'Academic',
      items: [
        { label: 'Attendance', icon: Calendar, path: ROUTES.ATTENDANCE },
        { label: 'Examinations', icon: FileText, path: ROUTES.EXAMS },
        { label: 'Timetable', icon: Clock, path: ROUTES.TIMETABLE },
      ],
    });
  }

  if (hasRole(ROLES.STUDENT)) {
    menuItems.push({
      section: 'My Information',
      items: [
        { label: 'My Profile', icon: User, path: user?._id ? `/students/${user._id}` : ROUTES.PROFILE },
      ],
    });
  }

  if (hasRole(ROLES.ADMIN)) {
    menuItems.push({
      section: 'Finance',
      items: [
        { label: 'Fees Management', icon: DollarSign, path: ROUTES.FEES },
      ],
    });
  }
  
  menuItems.push({
    section: 'Communication',
    items: [
      { label: 'Notices', icon: Megaphone, path: ROUTES.NOTICES },
    ],
  });

  menuItems.push({
    section: 'Account',
    items: [
      { label: 'Profile', icon: User, path: ROUTES.PROFILE },
      { label: 'Help & Support', icon: HelpCircle, path: ROUTES.SUPPORT },
    ],
  });

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  const filteredMenuItems = menuItems.map((section) => ({
    ...section,
    items: section.items.filter((item) => {
      if (!item.roles) return true;
      return item.roles.some((role) => hasRole(role));
    }),
  }));

  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl border-r border-gray-200 transform transition-all duration-300 z-50
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg font-bold text-brand-900">Acadexis</h1>
            <p className="text-xs text-gray-500">School Management</p>
          </div>
        </div>
        <button
          className="text-gray-600 text-lg hover:text-gray-900 hover:bg-gray-100 p-1 rounded transition-colors lg:hidden"
          onClick={toggleSidebar}
        >
          ✕
        </button>
      </div>

      <div className="px-4 py-4 overflow-y-auto h-[calc(100%-80px)]">
        {filteredMenuItems.map((section, index) => (
          <div key={index} className="mb-6">
            {section.items.length > 0 && (
              <>
                <p className="uppercase text-xs text-gray-400 font-semibold mb-2 px-2">
                  {section.section}
                </p>
                <div className="space-y-1">
                  {section.items.map((item, i) => {
                    const active = location.pathname === item.path || 
                                  location.pathname.startsWith(item.path + '/');
                    const Icon = item.icon;
                    return (
                      <button
                        key={i}
                        onClick={() => handleNavigation(item.path)}
                        className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all 
                          ${
                            active
                              ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white font-medium shadow-sm'
                              : 'text-gray-700 hover:bg-brand-50 hover:text-brand-700'
                          }
                        `}
                      >
                        <Icon size={18} />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
