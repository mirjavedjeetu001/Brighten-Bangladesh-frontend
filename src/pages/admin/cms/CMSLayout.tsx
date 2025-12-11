import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Image,
  FileText,
  Target,
  BarChart3,
  MessageSquare,
  Users,
  Calendar,
  FolderOpen,
  Settings,
  Mail,
  LogOut,
  Home,
  User,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';

export const CMSLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin/cms', icon: LayoutDashboard, end: true },
    { name: 'User Approvals', href: '/admin/cms/users', icon: Users },
    { name: 'Approved Members', href: '/admin/cms/approved-users', icon: Users },
    { name: 'Access Management', href: '/admin/cms/access-management', icon: Shield },
    { name: 'Blogs', href: '/admin/cms/blogs', icon: FileText },
    { name: 'Blog Comments', href: '/admin/cms/comments', icon: MessageSquare },
    { name: 'Hero Sliders', href: '/admin/cms/hero-sliders', icon: Image },
    { name: 'About Page', href: '/admin/cms/about', icon: FileText },
    { name: 'Focus Areas', href: '/admin/cms/focus-areas', icon: Target },
    { name: 'Events', href: '/admin/cms/events', icon: Calendar },
    { name: 'Event Registrations', href: '/admin/cms/event-registrations', icon: Users },
    { name: 'Projects', href: '/admin/cms/projects', icon: FolderOpen },
    { name: 'Statistics', href: '/admin/cms/statistics', icon: BarChart3 },
    { name: 'Contact Submissions', href: '/admin/cms/contact', icon: Mail },
    { name: 'Settings', href: '/admin/cms/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg min-h-screen sticky top-0">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-primary-600">CMS Panel</h2>
            <p className="text-sm text-gray-500 mt-1">Content Management</p>
          </div>

          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = item.end 
                ? location.pathname === item.href
                : location.pathname.startsWith(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-medium border-l-4 border-primary-600'
                      : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
            <div className="px-8 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  to="/"
                  className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition"
                >
                  <Home size={20} />
                  <span className="font-medium">Back to Website</span>
                </Link>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg">
                  <User size={18} className="text-gray-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition font-medium"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 p-8 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
