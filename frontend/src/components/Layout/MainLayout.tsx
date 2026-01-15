import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTour } from '@/context/TourContext';
import {
  Home,
  Package,
  Calendar,
  Users,
  ClipboardCheck,
  FileText,
  CheckSquare,
  Wrench,
  Shield,
  BarChart3,
  AlertTriangle,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Bell,
  HelpCircle,
} from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
}

interface NavItem {
  name: string;
  path: string;
  icon: any;
  roles?: string[];
  tourId: string;
}

const navigationItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: Home, tourId: 'nav-dashboard' },
  { name: 'Assets', path: '/assets', icon: Package, tourId: 'nav-assets' },
  { name: 'Planning', path: '/plans/annual', icon: Calendar, roles: ['team_leader', 'admin'], tourId: 'nav-planning' },
  { name: 'Teams', path: '/teams', icon: Users, roles: ['team_leader', 'admin'], tourId: 'nav-teams' },
  { name: 'Inspections', path: '/inspections', icon: ClipboardCheck, tourId: 'nav-inspections' },
  { name: 'Reports', path: '/reports', icon: FileText, tourId: 'nav-reports' },
  { name: 'Approvals', path: '/approvals', icon: CheckSquare, tourId: 'nav-approvals' },
  { name: 'Work Requests', path: '/work-requests', icon: Wrench, roles: ['engineer', 'team_leader', 'admin'], tourId: 'nav-work-requests' },
  { name: 'RBI', path: '/rbi', icon: Shield, roles: ['rbi_auditor', 'admin'], tourId: 'nav-rbi' },
  { name: 'Analytics', path: '/analytics', icon: BarChart3, roles: ['team_leader', 'admin'], tourId: 'nav-analytics' },
  { name: 'Escalations', path: '/escalations', icon: AlertTriangle, roles: ['team_leader', 'admin'], tourId: 'nav-escalations' },
];

export function MainLayout({ children }: MainLayoutProps) {
  const { user, logout } = useAuth();
  const { startTour } = useTour();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNavItems = navigationItems.filter(item => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  });

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Menu button + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-100 lg:hidden"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                IA
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                InspectionAgent
              </span>
            </Link>
          </div>

          {/* Right: Help + Notifications + Profile */}
          <div className="flex items-center gap-2">
            {/* Help/Tour Button */}
            <button
              onClick={startTour}
              className="p-2 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900"
              title="Start guided tour"
            >
              <HelpCircle size={20} />
            </button>

            {/* Notifications */}
            <button
              data-tour="notifications"
              className="relative p-2 rounded-md hover:bg-gray-100"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative" data-tour="profile-menu">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <User size={16} />
                    Profile Settings
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      data-tour="nav-admin"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Settings size={16} />
                      Admin Panel
                    </Link>
                  )}
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        data-tour="sidebar"
        className={`
          fixed top-16 left-0 bottom-0 z-30 w-64 bg-white border-r border-gray-200
          transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <nav className="h-full overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    data-tour={item.tourId}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium
                      transition-colors duration-150
                      ${
                        active
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon size={20} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className={`
          pt-16 transition-all duration-300
          ${isSidebarOpen ? 'lg:pl-64' : 'lg:pl-64'}
        `}
      >
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
