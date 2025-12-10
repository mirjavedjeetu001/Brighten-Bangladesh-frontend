import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Home as HomeIcon } from 'lucide-react';
import { focusAreaApi } from '../../api/cms';
import {
  Users,
  UserCheck,
  MapPin,
  Award,
  Briefcase,
  BookOpen,
  GraduationCap,
  Leaf,
  Home,
  Heart,
  Target,
  Zap,
  TrendingUp,
  Globe,
  Shield,
  Star
} from 'lucide-react';

// Icon mapping function
const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, any> = {
    'users': Users,
    'user-check': UserCheck,
    'map-pin': MapPin,
    'award': Award,
    'briefcase': Briefcase,
    'book-open': BookOpen,
    'graduation-cap': GraduationCap,
    'leaf': Leaf,
    'home': Home,
    'heart': Heart,
    'target': Target,
    'zap': Zap,
    'trending-up': TrendingUp,
    'globe': Globe,
    'shield': Shield,
    'star': Star,
    'female': Users,
  };
  
  return iconMap[iconName.toLowerCase()] || null;
};

export const FocusAreaDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: focusArea, isLoading, error } = useQuery({
    queryKey: ['focus-area', slug],
    queryFn: () => focusAreaApi.getBySlug(slug!),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-accent-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !focusArea) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-accent-50/30 flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-6">
          <div className="text-6xl mb-6">😕</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Focus Area Not Found</h1>
          <p className="text-xl text-gray-600 mb-8">
            The focus area you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-accent-600 hover:to-accent-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <ArrowLeft className="mr-2" size={20} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const IconComponent = focusArea.icon ? getIconComponent(focusArea.icon) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-accent-50/30">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-500 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 md:px-12 max-w-5xl relative z-10">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center text-white/80 hover:text-white transition-colors duration-300 text-sm font-medium"
            >
              <HomeIcon className="mr-2" size={16} />
              Home
              <span className="mx-3">/</span>
              <span>Focus Areas</span>
              <span className="mx-3">/</span>
              <span className="text-white">{focusArea.title}</span>
            </Link>
          </div>

          {/* Title and Icon */}
          <div className="flex items-start gap-6">
            {IconComponent && (
              <div className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 bg-white/95 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl">
                <IconComponent className="w-10 h-10 md:w-12 md:h-12 text-primary-600" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                {focusArea.title}
              </h1>
              {focusArea.short_description && (
                <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
                  {focusArea.short_description}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {focusArea.image_url && (
        <section className="container mx-auto px-6 md:px-12 max-w-5xl -mt-12 mb-16 relative z-20">
          <div className="rounded-3xl overflow-hidden shadow-2xl">
            <img
              src={focusArea.image_url.startsWith('http') ? focusArea.image_url : `http://localhost:3000${focusArea.image_url}`}
              alt={focusArea.title}
              className="w-full h-[400px] md:h-[500px] object-cover"
            />
          </div>
        </section>
      )}

      {/* Content Section */}
      <section className="container mx-auto px-6 md:px-12 max-w-5xl pb-24">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
          {focusArea.full_description && (
            <div className="prose prose-lg max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                {focusArea.full_description}
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-12 pt-12 border-t border-gray-200">
            <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl p-8 md:p-10 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Want to Get Involved?
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Join us in making a difference in this focus area. Your contribution can create lasting impact.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-accent-600 hover:to-accent-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Join Our Community
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl border-2 border-primary-600 hover:bg-primary-50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <ArrowLeft className="mr-2" size={20} />
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
