import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { projectsApi, Project } from '../../api/events-projects';
import { Calendar, MapPin, Users, FolderOpen, ArrowRight } from 'lucide-react';

const ProjectsListPage = () => {
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects', 'active'],
    queryFn: projectsApi.getAllActive,
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
          <p className="mt-4 text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading projects</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Projects</h1>
            <p className="text-xl text-teal-100">
              Discover the initiatives we're working on to make a positive impact in our communities
            </p>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="container mx-auto px-4 py-12">
        {projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project: Project) => (
              <Link
                key={project.id}
                to={`/projects/${project.slug}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
              >
                {/* Project Image */}
                {project.image_url ? (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={project.image_url}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {project.is_featured && (
                      <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Featured
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                    <FolderOpen className="w-16 h-16 text-white opacity-50" />
                  </div>
                )}

                <div className="p-6">
                  {/* Status Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(project.status)}`}>
                      {getStatusIcon(project.status)} {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </span>
                    {project.category && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                        {project.category}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
                    {project.title}
                  </h3>

                  {/* Short Description */}
                  {project.short_description && (
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {project.short_description}
                    </p>
                  )}

                  {/* Project Details */}
                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    {project.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-teal-600" />
                        <span>{project.location}</span>
                      </div>
                    )}
                    {project.beneficiaries && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-teal-600" />
                        <span>{project.beneficiaries.toLocaleString()} beneficiaries</span>
                      </div>
                    )}
                    {project.start_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-teal-600" />
                        <span>Started {new Date(project.start_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Read More Link */}
                  <div className="flex items-center text-teal-600 font-semibold group-hover:gap-2 transition-all">
                    <span>Learn More</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Projects Yet</h3>
            <p className="text-gray-600">Check back soon for our upcoming projects!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsListPage;
