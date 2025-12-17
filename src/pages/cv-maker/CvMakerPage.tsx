import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userCvsApi, UserCv } from '../../api/cvs';
import { Link } from 'react-router-dom';
import { FileText, Plus, Trash2, Edit, Eye, Download } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

export const CvMakerPage = () => {
  const queryClient = useQueryClient();

  const { data: cvsResponse, isLoading: cvsLoading } = useQuery({
    queryKey: ['user-cvs'],
    queryFn: userCvsApi.getAll,
  });

  const cvs: UserCv[] = cvsResponse?.data || [];

  const deleteMutation = useMutation({
    mutationFn: userCvsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-cvs'] });
    },
  });

  const handleDownloadHtml = async (id: number, title: string) => {
    const blob = await userCvsApi.downloadHtml(id);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '-')}.html`;
    a.click();
  };



  if (cvsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">CV Maker</h1>
            <p className="text-gray-600 mt-2">Create and manage your professional CVs</p>
          </div>
          <Link
            to="/cv-maker/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium transition-colors"
          >
            <Plus size={20} />
            Create New CV
          </Link>
        </div>

        {/* My CVs List */}
        {cvs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No CVs yet</h3>
            <p className="text-gray-500 mb-6">Create your first professional CV using our templates</p>
            <Link
              to="/cv-maker/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium transition-colors"
            >
              <Plus size={20} />
              Create Your First CV
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cvs.map((cv: UserCv) => (
              <div key={cv.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{cv.title}</h3>
                      <p className="text-sm text-gray-500">
                        {cv.template?.name || 'Unknown Template'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Updated {formatDate(cv.updatedAt)}
                      </p>
                    </div>
                  </div>

                  {/* Personal Info Preview */}
                  {cv.personalInfo?.name && (
                    <div className="mb-4 p-3 bg-gray-50 rounded">
                      <p className="font-medium text-gray-900">{cv.personalInfo.name}</p>
                      {cv.personalInfo.title && (
                        <p className="text-sm text-gray-600">{cv.personalInfo.title}</p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <div>
                      <button
                        onClick={() => handleDownloadHtml(cv.id, cv.title)}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 text-sm font-medium transition-colors"
                      >
                        <Download size={16} />
                        HTML
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Link
                        to={`/cv-maker/${cv.id}/preview`}
                        className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium transition-colors"
                      >
                        <Eye size={16} />
                        Preview
                      </Link>
                      <Link
                        to={`/cv-maker/${cv.id}/edit`}
                        className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium transition-colors"
                      >
                        <Edit size={16} />
                        Open
                      </Link>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this CV?')) {
                            deleteMutation.mutate(cv.id);
                          }
                        }}
                        className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium transition-colors"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
