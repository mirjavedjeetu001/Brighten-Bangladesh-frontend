import { useQuery } from '@tanstack/react-query';
import { 
  Image, 
  FileText, 
  Target, 
  BarChart3, 
  MessageSquare, 
  Users, 
  Calendar, 
  FolderOpen,
  Mail,
  TrendingUp,
  Activity
} from 'lucide-react';
import { heroSliderApi, pageApi, focusAreaApi, statisticApi, contactApi } from '../../../api/cms';
import { Link } from 'react-router-dom';

export const CMSDashboard = () => {
  const { data: heroSliders } = useQuery({
    queryKey: ['hero-sliders'],
    queryFn: heroSliderApi.getAll,
  });

  const { data: pages } = useQuery({
    queryKey: ['pages'],
    queryFn: pageApi.getAll,
  });

  const { data: focusAreas } = useQuery({
    queryKey: ['focus-areas'],
    queryFn: focusAreaApi.getAll,
  });

  const { data: statistics } = useQuery({
    queryKey: ['statistics'],
    queryFn: statisticApi.getAll,
  });

  const { data: unreadContact } = useQuery({
    queryKey: ['contact-unread'],
    queryFn: contactApi.getUnreadCount,
  });

  const stats = [
    {
      name: 'Hero Sliders',
      value: heroSliders?.length || 0,
      active: heroSliders?.filter(s => s.is_active).length || 0,
      icon: Image,
      color: 'bg-blue-500',
      link: '/admin/cms/hero-sliders',
    },
    {
      name: 'Pages',
      value: pages?.length || 0,
      active: pages?.filter(p => p.is_published).length || 0,
      icon: FileText,
      color: 'bg-purple-500',
      link: '/admin/cms/pages',
    },
    {
      name: 'Focus Areas',
      value: focusAreas?.length || 0,
      active: focusAreas?.filter(f => f.is_active).length || 0,
      icon: Target,
      color: 'bg-green-500',
      link: '/admin/cms/focus-areas',
    },
    {
      name: 'Statistics',
      value: statistics?.length || 0,
      active: statistics?.filter(s => s.is_active).length || 0,
      icon: BarChart3,
      color: 'bg-yellow-500',
      link: '/admin/cms/statistics',
    },
    {
      name: 'Unread Messages',
      value: unreadContact?.count || 0,
      active: unreadContact?.count || 0,
      icon: Mail,
      color: 'bg-red-500',
      link: '/admin/cms/contact',
    },
  ];

  const quickActions = [
    { name: 'Add Hero Slider', icon: Image, link: '/admin/cms/hero-sliders', color: 'bg-blue-500' },
    { name: 'Create Page', icon: FileText, link: '/admin/cms/pages', color: 'bg-purple-500' },
    { name: 'Add Focus Area', icon: Target, link: '/admin/cms/focus-areas', color: 'bg-green-500' },
    { name: 'Manage Settings', icon: Activity, link: '/admin/cms/settings', color: 'bg-gray-500' },
  ];

  const contentModules = [
    { name: 'Testimonials', icon: MessageSquare, link: '/admin/cms/testimonials', count: 0 },
    { name: 'Team Members', icon: Users, link: '/admin/cms/team', count: 0 },
    { name: 'Events', icon: Calendar, link: '/admin/cms/events', count: 0 },
    { name: 'Projects', icon: FolderOpen, link: '/admin/cms/projects', count: 0 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">CMS Dashboard</h1>
        <p className="text-gray-600">Manage all your website content from one place</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              to={stat.link}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
                <TrendingUp className="text-green-500" size={20} />
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.name}</h3>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">
                {stat.active} active
              </p>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.name}
                to={action.link}
                className="flex items-center space-x-4 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
              >
                <div className={`${action.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={20} />
                </div>
                <span className="font-medium text-gray-700">{action.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Content Modules */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Content Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {contentModules.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.name}
                to={module.link}
                className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
              >
                <Icon className="text-primary-600 mb-3" size={32} />
                <span className="font-medium text-gray-700 text-center">{module.name}</span>
                <span className="text-sm text-gray-500 mt-1">{module.count} items</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Updates</h2>
        <div className="space-y-4">
          {pages?.slice(0, 5).map((page) => (
            <div key={page.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <FileText className="text-primary-600" size={20} />
                <div>
                  <p className="font-medium text-gray-900">{page.title}</p>
                  <p className="text-sm text-gray-500">
                    Updated {new Date(page.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  page.is_published
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {page.is_published ? 'Published' : 'Draft'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
