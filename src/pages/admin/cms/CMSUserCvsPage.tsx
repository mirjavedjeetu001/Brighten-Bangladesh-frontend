import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../api/client';
import { Download, Eye, User } from 'lucide-react';
import { formatDate } from '../../../utils/helpers';

interface UserCv {
  id: number;
  title: string;
  userId: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  template: {
    id: number;
    name: string;
  };
}

const cmsUserCvsApi = {
  getAll: () => apiClient.get<UserCv[]>('/cms/user-cvs'),
  downloadHtml: (id: number) => {
    return fetch(`${import.meta.env.VITE_API_URL}/cms/user-cvs/${id}/download/html`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    }).then(res => res.blob());
  },
};

export const CMSUserCvsPage = () => {
  const { data: cvsData, isLoading } = useQuery({
    queryKey: ['cms-user-cvs'],
    queryFn: cmsUserCvsApi.getAll,
  });

  const cvs = cvsData?.data || [];

  const handleDownload = async (cv: UserCv) => {
    try {
      const blob = await cmsUserCvsApi.downloadHtml(cv.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cv.title.replace(/\s+/g, '-')}-${cv.user.name.replace(/\s+/g, '-')}.html`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download CV');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading CVs...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">All User CVs</h1>
        <p className="text-gray-600 mt-2">Manage and download all CVs created by users</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total CVs</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{cvs.length}</p>
            </div>
            <div className="bg-teal-100 p-3 rounded-full">
              <Eye className="w-8 h-8 text-teal-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Downloads</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {cvs.reduce((sum, cv) => sum + cv.downloadCount, 0)}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Download className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unique Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {new Set(cvs.map(cv => cv.userId)).size}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <User className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* CVs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CV Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Template
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Downloads
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cvs.map((cv) => (
                <tr key={cv.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{cv.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{cv.user.name}</div>
                    <div className="text-xs text-gray-500">{cv.user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{cv.template.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Download size={12} />
                      {cv.downloadCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(cv.createdAt)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDownload(cv)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
                    >
                      <Download size={14} />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {cvs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No CVs found
          </div>
        )}
      </div>
    </div>
  );
};
