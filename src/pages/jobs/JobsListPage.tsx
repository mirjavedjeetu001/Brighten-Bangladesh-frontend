import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { jobsApi, jobCategoriesApi } from '../../api/jobs';
import { Briefcase, MapPin, Calendar, ExternalLink, Filter, Tag } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

export const JobsListPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // Fetch active jobs
  const { data: jobsResponse, isLoading: jobsLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobsApi.getAll({}),
  });

  const jobs = jobsResponse?.data || [];

  // Fetch active categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['job-categories'],
    queryFn: jobCategoriesApi.getAll,
  });

  const isJobExpired = (job: any) => {
    if (!job.deadline) return false;
    return new Date(job.deadline) < new Date();
  };

  // Filter jobs that are active and not expired
  const activeJobs = jobs.filter((job: any) => 
    job.isActive && !isJobExpired(job)
  );

  // Apply category filter
  const filteredJobs = selectedCategory
    ? activeJobs.filter((job: any) => job.categoryId === selectedCategory)
    : activeJobs;

  if (jobsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading jobs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Job Portal</h1>
          <p className="text-xl text-teal-100 max-w-2xl">
            Discover career opportunities and find your next role
          </p>
        </div>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-2 mb-3">
              <Filter size={20} className="text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Filter by Category</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${
                  selectedCategory === null
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Tag size={16} />
                All Categories ({activeJobs.length})
              </button>
              {categories.map((category: any) => {
                const count = activeJobs.filter((j: any) => j.categoryId === category.id).length;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Tag size={16} />
                    {category.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className="container mx-auto px-4 py-12">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No jobs available</h3>
            <p className="text-gray-500">
              {selectedCategory
                ? 'No jobs found in this category. Try selecting a different category.'
                : 'Check back later for new opportunities.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job: any) => (
              <div key={job.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                <div className="p-6">
                  {/* Category Badge */}
                  {job.category && (
                    <div className="mb-3">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-800">
                        <Tag size={12} />
                        {job.category.name}
                      </span>
                    </div>
                  )}

                  {/* Job Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {job.title}
                  </h3>

                  {/* Company & Location */}
                  <div className="space-y-2 mb-4">
                    {job.company && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Briefcase size={16} />
                        <span className="text-sm">{job.company}</span>
                      </div>
                    )}
                    {job.location && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin size={16} />
                        <span className="text-sm">{job.location}</span>
                      </div>
                    )}
                    {job.deadline && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={16} />
                        <span className="text-sm">Deadline: {formatDate(job.deadline)}</span>
                      </div>
                    )}
                  </div>

                  {/* Job Type */}
                  {job.jobType && (
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 rounded text-xs font-medium bg-teal-100 text-teal-800">
                        {job.jobType}
                      </span>
                    </div>
                  )}

                  {/* Description Preview */}
                  {job.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {job.description}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link
                      to={`/jobs/${job.slug}`}
                      className="flex-1 text-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                    >
                      View Details
                    </Link>
                    <a
                      href={job.applyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium transition-colors"
                    >
                      Apply
                      <ExternalLink size={16} />
                    </a>
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
