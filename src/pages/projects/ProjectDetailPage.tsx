import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { projectsApi } from '../../api/events-projects';
import { Calendar, MapPin, Users, DollarSign, ArrowLeft, FolderOpen } from 'lucide-react';

const ProjectDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', slug],
    queryFn: () => projectsApi.getBySlug(slug!),
    enabled: !!slug,
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      planning: 'bg-blue-100 text-blue-800',
      ongoing: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning':
        return '📋';
      case 'ongoing':
        return '🚀';
      case 'completed':
        return '✅';
      default:
        return '📁';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Project not found</p>
          <Link to="/projects" className="text-teal-600 hover:text-teal-700">
            ← Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Status and Category */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadge(project.status)}`}>
                {getStatusIcon(project.status)} {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </span>
              {project.category && (
                <span className="px-4 py-2 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">
                  {project.category}
                </span>
              )}
              {project.is_featured && (
                <span className="px-4 py-2 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
                  ⭐ Featured Project
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {project.title}
            </h1>

            {/* Short Description */}
            {project.short_description && (
              <p className="text-xl text-gray-600 mb-8">
                {project.short_description}
              </p>
            )}

            {/* Project Image */}
            {project.image_url ? (
              <img
                src={project.image_url}
                alt={project.title}
                className="w-full h-96 object-cover rounded-lg shadow-lg mb-8"
              />
            ) : (
              <div className="w-full h-96 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg shadow-lg mb-8 flex items-center justify-center">
                <FolderOpen className="w-24 h-24 text-white opacity-50" />
              </div>
            )}

            {/* Project Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {project.location && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-teal-600 mb-2">
                    <MapPin className="w-5 h-5" />
                    <span className="font-semibold">Location</span>
                  </div>
                  <p className="text-gray-900">{project.location}</p>
                </div>
              )}

              {project.beneficiaries && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-teal-600 mb-2">
                    <Users className="w-5 h-5" />
                    <span className="font-semibold">Beneficiaries</span>
                  </div>
                  <p className="text-gray-900">{project.beneficiaries.toLocaleString()}</p>
                </div>
              )}

              {project.budget && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-teal-600 mb-2">
                    <DollarSign className="w-5 h-5" />
                    <span className="font-semibold">Budget</span>
                  </div>
                  <p className="text-gray-900">${project.budget.toLocaleString()}</p>
                </div>
              )}

              {project.start_date && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-teal-600 mb-2">
                    <Calendar className="w-5 h-5" />
                    <span className="font-semibold">Started</span>
                  </div>
                  <p className="text-gray-900">
                    {new Date(project.start_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}

              {project.end_date && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-teal-600 mb-2">
                    <Calendar className="w-5 h-5" />
                    <span className="font-semibold">{project.status === 'completed' ? 'Completed' : 'Expected End'}</span>
                  </div>
                  <p className="text-gray-900">
                    {new Date(project.end_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Full Description */}
            {project.full_description && (
              <div className="prose prose-lg max-w-none">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Project</h2>
                <div
                  className="text-gray-700 whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: project.full_description }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
