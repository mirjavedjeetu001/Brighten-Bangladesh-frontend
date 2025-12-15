import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { jobsApi } from '@/api/jobs';
import { Loader } from '@/components/Loader';
import { SEO } from '@/components/SEO';
import { Briefcase, MapPin, ExternalLink, Clock, ArrowLeft } from 'lucide-react';
import { formatDate } from '@/utils/helpers';

export const JobDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', slug],
    queryFn: () => jobsApi.getBySlug(slug!),
    enabled: !!slug,
  });

  if (isLoading) return <Loader />;
  
  if (error || !job) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">Job not found</h2>
          <p className="text-red-600 mb-4">The job you're looking for doesn't exist or has been removed.</p>
          <Link to="/jobs" className="btn btn-primary">
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  const isExpiringSoon = job.deadline && 
    new Date(job.deadline).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000;

  return (
    <>
      <SEO
        title={`${job.title} - Job Portal`}
        description={`${job.company ? `${job.company} - ` : ''}${job.location || 'Remote'} - ${job.jobType || 'Full-time'}`}
      />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
        {/* Back Button */}
        <div className="bg-white border-b border-gray-100">
          <div className="container mx-auto px-6 md:px-12 lg:px-16 max-w-5xl py-6">
            <Link 
              to="/jobs" 
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to All Jobs
            </Link>
          </div>
        </div>

        {/* Job Header */}
        <div className="bg-gradient-to-br from-primary-50 via-white to-accent-50 py-12">
          <div className="container mx-auto px-6 md:px-12 lg:px-16 max-w-5xl">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-gray-900 leading-tight">
                {job.title}
              </h1>
              
              {job.company && (
                <div className="flex items-center text-gray-700 mb-6">
                  <Briefcase size={24} className="mr-3 text-primary-500" />
                  <span className="font-bold text-2xl">{job.company}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-6 mb-8">
                {job.location && (
                  <div className="flex items-center text-gray-600">
                    <MapPin size={20} className="mr-2 text-gray-400" />
                    <span className="text-lg">{job.location}</span>
                  </div>
                )}
                {job.jobType && (
                  <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-semibold">
                    {job.jobType}
                  </span>
                )}
                {job.deadline && (
                  <div className={`flex items-center ${isExpiringSoon ? 'text-orange-600 font-bold' : 'text-gray-600'}`}>
                    <Clock size={20} className="mr-2" />
                    <span className="text-lg">
                      Deadline: {formatDate(job.deadline)}
                    </span>
                  </div>
                )}
              </div>

              {isExpiringSoon && (
                <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-orange-700 font-semibold">
                    ⚠️ Application deadline approaching! Apply soon.
                  </p>
                </div>
              )}

              <a
                href={job.applyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary inline-flex items-center gap-3 text-lg px-8 py-4"
              >
                Apply Now
                <ExternalLink size={22} />
              </a>

              <div className="mt-6 text-sm text-gray-400">
                Posted on {formatDate(job.createdAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Job Description */}
        {job.description && (
          <div className="container mx-auto px-6 md:px-12 lg:px-16 max-w-5xl py-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Job Description</h2>
              <div
                className="text-gray-700 leading-relaxed prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
            </div>
          </div>
        )}

        {/* Apply Section */}
        <div className="container mx-auto px-6 md:px-12 lg:px-16 max-w-5xl pb-16">
          <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Apply?
            </h2>
            <p className="text-gray-600 text-lg mb-6 max-w-2xl mx-auto">
              Take the next step in your career journey. Click the button below to submit your application.
            </p>
            <a
              href={job.applyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary inline-flex items-center gap-3 text-lg px-8 py-4"
            >
              Apply for this Position
              <ExternalLink size={22} />
            </a>
          </div>
        </div>
      </div>
    </>
  );
};
