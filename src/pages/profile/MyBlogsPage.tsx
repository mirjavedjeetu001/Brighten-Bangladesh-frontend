import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Send, FileText, Clock, CheckCircle } from 'lucide-react';
import { blogsApi } from '../../api/blogs';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const MyBlogsPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedBlog, setSelectedBlog] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    coverImage: '',
  });

  const { data: blogsResponse, isLoading } = useQuery({
    queryKey: ['my-blogs'],
    queryFn: () => blogsApi.getAll({ page: 1, limit: 100, authorId: user?.id.toString() }),
  });

  const blogs = blogsResponse?.data || [];

  const createMutation = useMutation({
    mutationFn: blogsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-blogs'] });
      toast.success('Blog created successfully');
      setShowCreateModal(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create blog');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => blogsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-blogs'] });
      toast.success('Blog updated successfully');
      setSelectedBlog(null);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update blog');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: blogsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-blogs'] });
      toast.success('Blog deleted successfully');
    },
    onError: () => toast.error('Failed to delete blog'),
  });

  const submitMutation = useMutation({
    mutationFn: blogsApi.submit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-blogs'] });
      toast.success('Blog submitted for review');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit blog');
    },
  });

  const resetForm = () => {
    setFormData({ title: '', summary: '', content: '', coverImage: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBlog) {
      updateMutation.mutate({ id: selectedBlog.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const editBlog = (blog: any) => {
    setSelectedBlog(blog);
    setFormData({
      title: blog.title,
      summary: blog.summary || '',
      content: blog.content || '',
      coverImage: blog.coverImage || '',
    });
    setShowCreateModal(true);
  };

  const deleteBlog = (id: number) => {
    if (confirm('Are you sure you want to delete this blog?')) {
      deleteMutation.mutate(id);
    }
  };

  const submitForReview = (id: number) => {
    if (confirm('Submit this blog for review? You won\'t be able to edit it until it\'s reviewed.')) {
      submitMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: any; text: string }> = {
      draft: { color: 'bg-gray-100 text-gray-700', icon: FileText, text: 'Draft' },
      pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, text: 'Pending Review' },
      approved: { color: 'bg-green-100 text-green-700', icon: CheckCircle, text: 'Approved' },
      published: { color: 'bg-blue-100 text-blue-700', icon: CheckCircle, text: 'Published' },
    };
    const badge = badges[status] || badges.draft;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        <Icon size={14} className="mr-1" />
        {badge.text}
      </span>
    );
  };

  const canCreateNewBlog = () => {
    // Check if member has created a blog in the last 7 days
    if (user?.role === 'member') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const recentBlogs = blogs.filter((blog: any) => 
        new Date(blog.createdAt) > oneWeekAgo
      );
      
      return recentBlogs.length === 0;
    }
    return true;
  };

  const getNextBlogDate = () => {
    if (user?.role !== 'member') return null;
    
    const sortedBlogs = [...blogs].sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    if (sortedBlogs.length === 0) return null;
    
    const lastBlogDate = new Date(sortedBlogs[0].createdAt);
    const nextAllowedDate = new Date(lastBlogDate);
    nextAllowedDate.setDate(nextAllowedDate.getDate() + 7);
    
    if (nextAllowedDate > new Date()) {
      return nextAllowedDate;
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const canCreate = canCreateNewBlog();
  const nextDate = getNextBlogDate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Blogs</h1>
          <p className="text-gray-600 mt-1">Create and manage your blog posts</p>
          {user?.role === 'member' && (
            <p className="text-sm text-gray-500 mt-2">
              📝 Members can create 1 blog per week
            </p>
          )}
        </div>
        <button
          onClick={() => {
            if (canCreate) {
              setSelectedBlog(null);
              resetForm();
              setShowCreateModal(true);
            }
          }}
          disabled={!canCreate}
          className={`btn ${canCreate ? 'btn-primary' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
        >
          <Plus size={20} className="mr-2" />
          Create New Blog
        </button>
      </div>

      {!canCreate && nextDate && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            ⏰ You can create your next blog on <strong>{nextDate.toLocaleDateString()}</strong>
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Total Blogs</p>
          <p className="text-3xl font-bold text-gray-900">{blogs.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Drafts</p>
          <p className="text-3xl font-bold text-gray-500">
            {blogs.filter((b: any) => b.status === 'draft').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Pending Review</p>
          <p className="text-3xl font-bold text-yellow-600">
            {blogs.filter((b: any) => b.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Published</p>
          <p className="text-3xl font-bold text-green-600">
            {blogs.filter((b: any) => b.status === 'published').length}
          </p>
        </div>
      </div>

      {/* Blogs List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {blogs.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No blogs yet</h3>
            <p className="text-gray-500 mb-4">Start creating your first blog post</p>
            {canCreate && (
              <button
                onClick={() => {
                  resetForm();
                  setShowCreateModal(true);
                }}
                className="btn btn-primary"
              >
                <Plus size={20} className="mr-2" />
                Create Your First Blog
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Likes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {blogs.map((blog: any) => (
                  <tr key={blog.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{blog.title}</p>
                        {blog.summary && (
                          <p className="text-sm text-gray-500 truncate max-w-md">{blog.summary}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(blog.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{blog.viewCount ?? 0}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{blog.likesCount ?? 0}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {blog.status === 'draft' && (
                        <>
                          <button
                            onClick={() => editBlog(blog)}
                            className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md"
                          >
                            <Edit size={16} className="mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => submitForReview(blog.id)}
                            className="inline-flex items-center px-3 py-1 bg-green-50 text-green-600 hover:bg-green-100 rounded-md"
                          >
                            <Send size={16} className="mr-1" />
                            Submit
                          </button>
                        </>
                      )}
                      {blog.status === 'draft' && (
                        <button
                          onClick={() => deleteBlog(blog.id)}
                          className="inline-flex items-center px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-md"
                        >
                          <Trash2 size={16} className="mr-1" />
                          Delete
                        </button>
                      )}
                      {(blog.status === 'published' || blog.status === 'approved') && (
                        <button
                          onClick={() => navigate(`/blogs/${blog.slug}`)}
                          className="inline-flex items-center px-3 py-1 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-md"
                        >
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-2xl font-bold text-gray-900">
                {selectedBlog ? 'Edit Blog' : 'Create New Blog'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image URL</label>
                <input
                  type="url"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  className="input"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Summary</label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="input"
                  rows={3}
                  placeholder="Brief summary of your blog..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="input"
                  rows={12}
                  required
                  placeholder="Write your blog content here..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedBlog(null);
                    resetForm();
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="btn btn-primary"
                >
                  {selectedBlog ? 'Update' : 'Create'} Blog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
