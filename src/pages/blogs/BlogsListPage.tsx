import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { blogsApi } from '@/api/blogs';
import { Loader } from '@/components/Loader';
import { Badge } from '@/components/Badge';
import { formatDate, truncateText } from '@/utils/helpers';
import { Search } from 'lucide-react';

export const BlogsListPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data: blogsResponse, isLoading, error } = useQuery({
    queryKey: ['blogs', page, search],
    queryFn: () => blogsApi.getAll({ page, limit: 9, search, status: 'published' }),
  });

  const blogs = blogsResponse?.data || [];
  const totalPages = blogsResponse?.totalPages || 1;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  if (isLoading) return <Loader />;
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error loading blogs</h2>
          <p className="text-red-600">{(error as any)?.message || 'Failed to load blogs'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Header Section with Premium Spacing */}
      <div className="bg-gradient-to-br from-primary-50 via-white to-accent-50 pt-20 pb-16">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 max-w-7xl">
          <div className="text-center">
            <div className="inline-block px-8 py-3 bg-gradient-to-r from-primary-100 to-accent-100 rounded-full mb-8 shadow-sm">
              <span className="text-primary-700 font-bold text-sm uppercase tracking-widest">Featured Content</span>
            </div>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold mb-8 bg-gradient-to-r from-primary-600 via-accent-600 to-primary-800 bg-clip-text text-transparent leading-tight">
              Blogs & Articles
            </h1>
            <p className="text-gray-600 text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed">
              Discover inspiring stories, powerful insights, and transformative experiences from our community
            </p>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 max-w-3xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
                <input
                  type="text"
                  placeholder="Search articles..."
                  className="w-full pl-14 pr-6 py-5 rounded-2xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-300 text-lg shadow-sm hover:shadow-md"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary px-10 py-5 text-lg font-bold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                Search
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Articles Grid Section with Premium Spacing */}
      <div className="container mx-auto px-6 md:px-12 lg:px-16 max-w-7xl py-20">
        {blogs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
              {blogs.map((blog) => (
                <Link 
                  key={blog.id} 
                  to={`/blogs/${blog.slug}`} 
                  className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  {blog.coverImage && (
                    <div className="relative overflow-hidden h-56">
                      <img
                        src={blog.coverImage}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge status={blog.status}>{blog.status}</Badge>
                      <span className="text-sm text-gray-500 font-medium">{formatDate(blog.createdAt)}</span>
                    </div>
                    <h2 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-primary-600 transition-colors duration-300 line-clamp-2">
                      {blog.title}
                    </h2>
                    {blog.summary && (
                      <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">{truncateText(blog.summary, 150)}</p>
                    )}
                    {blog.author && (
                      <p className="text-sm text-gray-500 font-medium flex items-center">
                        <img
                          src={
                            blog.author.profilePhoto
                              ? (blog.author.profilePhoto.startsWith('data:image') || blog.author.profilePhoto.startsWith('http') 
                                ? blog.author.profilePhoto 
                                : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://brightenbangladesh.com'}${blog.author.profilePhoto}`)
                              : `https://ui-avatars.com/api/?name=${encodeURIComponent(blog.author.name)}&background=166534&color=fff&size=100`
                          }
                          alt={blog.author.name}
                          className="w-8 h-8 rounded-full object-cover mr-2 border border-gray-200"
                        />
                        By {blog.author.name}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-16 flex justify-center items-center gap-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-8 py-4 rounded-xl border-2 border-gray-200 hover:border-primary-500 hover:bg-primary-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-gray-700 hover:text-primary-600 transition-all duration-300"
                >
                  Previous
                </button>
                <span className="flex items-center px-6 py-3 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl font-bold text-gray-700 text-lg">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-8 py-4 rounded-xl border-2 border-gray-200 hover:border-primary-500 hover:bg-primary-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-gray-700 hover:text-primary-600 transition-all duration-300"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="inline-block p-8 bg-gray-100 rounded-2xl">
              <p className="text-xl text-gray-600 font-medium">No articles found</p>
              <p className="text-sm text-gray-500 mt-2">Try adjusting your search criteria</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
