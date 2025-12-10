import { Link, Outlet, useLocation } from 'react-router-dom';
import { Users, BookOpen, FileText, Award, LayoutDashboard } from 'lucide-react';

export const AdminLayout = () => {
  const location = useLocation();

  const navigation = [
    { name: 'CMS Panel', href: '/admin/cms', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Blogs', href: '/admin/blogs', icon: BookOpen },
    { name: 'Magazines', href: '/admin/magazines', icon: FileText },
    { name: 'Memberships', href: '/admin/memberships', icon: Award },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Admin Panel</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
