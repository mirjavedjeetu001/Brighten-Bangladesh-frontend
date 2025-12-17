import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { FileText, Download, Users, Eye, UserCheck } from 'lucide-react';
import { formatDate } from '../utils/helpers';

interface Analytics {
  totalCvs: number;
  totalDownloads: number;
  cvsByUser: Array<{ userId: number; userName: string; cvCount: number; totalDownloads: number }>;
  recentCvs: Array<{ id: number; title: string; userName: string; downloads: number; createdAt: string }>;
}

interface WebsiteStats {
  totalPageViews: number;
  totalUniqueVisitors: number;
  todayPageViews: number;
  todayUniqueVisitors: number;
  last30Days: Array<{ date: string; pageViews: number; uniqueVisitors: number }>;
}

const cmsAnalyticsApi = {
  getAnalytics: () => apiClient.get<Analytics>('/cms/user-cvs/analytics'),
  getWebsiteStats: () => apiClient.get<WebsiteStats>('/cms/website-analytics/stats'),
};

export const DashboardPage = () => {
  const { data: analyticsData, isLoading: loadingAnalytics } = useQuery({
    queryKey: ['cv-analytics'],
    queryFn: cmsAnalyticsApi.getAnalytics,
  });

  const { data: websiteStatsData, isLoading: loadingWebsiteStats } = useQuery({
    queryKey: ['website-stats'],
    queryFn: cmsAnalyticsApi.getWebsiteStats,
  });

  const analytics = analyticsData?.data;
  const websiteStats = websiteStatsData?.data;
  const isLoading = loadingAnalytics || loadingWebsiteStats;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total CVs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analytics?.totalCvs || 0}</p>
              </div>
              <div className="bg-teal-100 p-3 rounded-full">
                <FileText className="w-8 h-8 text-teal-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Downloads</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analytics?.totalDownloads || 0}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Download className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analytics?.cvsByUser?.length || 0}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{websiteStats?.totalPageViews || 0}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Eye className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Visitors</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{websiteStats?.totalUniqueVisitors || 0}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <UserCheck className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CVs by User */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">CVs by User</h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {analytics?.cvsByUser?.map((user) => (
                <div key={user.userId} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{user.userName}</p>
                    <p className="text-sm text-gray-500">{user.cvCount} CVs created</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user.totalDownloads} downloads</p>
                  </div>
                </div>
              ))}
              {(!analytics?.cvsByUser || analytics.cvsByUser.length === 0) && (
                <div className="px-6 py-8 text-center text-gray-500">No data available</div>
              )}
            </div>
          </div>

          {/* Recent CVs */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent CVs</h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {analytics?.recentCvs?.map((cv) => (
                <div key={cv.id} className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{cv.title}</p>
                      <p className="text-sm text-gray-500">{cv.userName}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(cv.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Download size={14} />
                      <span>{cv.downloads}</span>
                    </div>
                  </div>
                </div>
              ))}
              {(!analytics?.recentCvs || analytics.recentCvs.length === 0) && (
                <div className="px-6 py-8 text-center text-gray-500">No recent CVs</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
