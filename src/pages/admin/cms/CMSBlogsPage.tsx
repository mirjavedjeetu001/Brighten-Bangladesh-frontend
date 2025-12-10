import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { blogsApi } from '../../../api/blogs';
import { toast } from 'react-hot-toast';

export const CMSBlogsPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any>(null);

  const { data: blogs, isLoading } = useQuery({
    queryKey: ['blogs-cms'],
    queryFn: () => blogsApi.getAll({}),
  });

  const createMutation = useMutation({
    mutationFn: blogsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs-cms'] });
      toast.success('Blog created successfully');
      setIsModalOpen(false);
    },
    onError: () => toast.error('Failed to create blog'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      blogsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs-cms'] });
      toast.success('Blog updated successfully');
      setIsModalOpen(false);
      setEditingBlog(null);
    },
    onError: () => toast.error('Failed to update blog'),
  });

  const deleteMutation = useMutation({
    mutationFn: blogsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs-cms'] });
      toast.success('Blog deleted successfully');
    },
    onError: () => toast.error('Failed to delete blog'),
  });

  const approveMutation = useMutation({
    mutationFn: blogsApi.approve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs-cms'] });
      toast.success('Blog approved successfully');
    },
    onError: () => toast.error('Failed to approve blog'),
  });

  const publishMutation = useMutation({
    mutationFn: blogsApi.publish,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs-cms'] });
      toast.success('Blog published successfully');
    },
    onError: () => toast.error('Failed to publish blog'),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      summary: formData.get('summary') as string || undefined,
      coverImage: formData.get('coverImage') as string || undefined,
      status: formData.get('status') as string || undefined,
    };

    if (editingBlog) {
      updateMutation.mutate({ id: editingBlog.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-blue-100 text-blue-700',
      published: 'bg-green-100 text-green-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const approveBlog = (id: number) => {
    if (confirm('Approve this blog? It will be ready to publish.')) {
      approveMutation.mutate(id);
    }
  };

  const publishBlog = (id: number) => {
    if (confirm('Publish this blog? It will be visible on the website.')) {
      publishMutation.mutate(id);
    }
  };

  const rejectBlog = (id: number) => {
    if (confirm('Reject and delete this blog?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-12">Loading...</div>;
  }

  const blogData = blogs?.data || [];
  const pendingCount = blogData.filter((b: any) => b.status === 'pending').length;
  const approvedCount = blogData.filter((b: any) => b.status === 'approved').length;
  const publishedCount = blogData.filter((b: any) => b.status === 'published').length;
  const draftCount = blogData.filter((b: any) => b.status === 'draft').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blogs Management</h1>
          <p className="text-gray-600 mt-1">Approve and manage all blog posts</p>
        </div>
        <button
          onClick={() => {
            setEditingBlog(null);
            setIsModalOpen(true);
          }}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Create Blog</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending Review</p>
              <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
            <Clock className="text-yellow-600" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Approved</p>
              <p className="text-3xl font-bold text-blue-600">{approvedCount}</p>
            </div>
            <CheckCircle className="text-blue-600" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Published</p>
              <p className="text-3xl font-bold text-green-600">{publishedCount}</p>
            </div>
            <CheckCircle className="text-green-600" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Drafts</p>
              <p className="text-3xl font-bold text-gray-600">{draftCount}</p>
            </div>
            <Edit className="text-gray-600" size={32} />
          </div>
        </div>
      </div>

      {/* Blogs List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            All Blogs ({blogData?.length || 0})
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {!blogData || blogData.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No blogs yet. Create your first blog!
            </div>
          ) : (
            blogData.map((blog: any) => (
              <div key={blog.id} className="flex items-center p-6 hover:bg-gray-50 transition-colors">
                {/* Image */}
                {blog.featured_image && (
                  <img
                    src={blog.featured_image}
                    alt={blog.title}
                    className="w-24 h-24 object-cover rounded-lg mr-6"
                  />
                )}

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{blog.title}</h3>
                  {blog.excerpt && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{blog.excerpt}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>By {blog.author?.name || 'Unknown'}</span>
                    <span>•</span>
                    <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                    {blog.category && (
                      <>
                        <span>•</span>
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {blog.category}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="mr-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(blog.status)}`}>
                    {blog.status}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  {blog.status === 'pending' && (
                    <>
                      <button
                        onClick={() => approveBlog(blog.id)}
                        className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-md transition text-sm"
                        title="Approve Blog"
                      >
                        <CheckCircle size={16} className="mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => rejectBlog(blog.id)}
                        className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition text-sm"
                        title="Reject Blog"
                      >
                        <XCircle size={16} className="mr-1" />
                        Reject
                      </button>
                    </>
                  )}
                  {blog.status === 'approved' && (
                    <button
                      onClick={() => publishBlog(blog.id)}
                      className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition text-sm"
                      title="Publish Blog"
                    >
                      <CheckCircle size={16} className="mr-1" />
                      Publish
                    </button>
                  )}
                  {(blog.status === 'draft' || blog.status === 'approved') && (
                    <button
                      onClick={() => {
                        setEditingBlog(blog);
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit Blog"
                    >
                      <Edit size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this blog?')) {
                        deleteMutation.mutate(blog.id);
                      }
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete Blog"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingBlog ? 'Edit Blog' : 'Create Blog'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={editingBlog?.title}
                    required
                    className="input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Summary
                </label>
                <textarea
                  name="summary"
                  defaultValue={editingBlog?.summary}
                  rows={2}
                  className="input w-full"
                  placeholder="Brief description of the blog post..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  name="content"
                  defaultValue={editingBlog?.content}
                  required
                  rows={10}
                  className="input w-full font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    name="coverImage"
                    defaultValue={editingBlog?.coverImage}
                    className="input w-full"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={editingBlog?.status || 'draft'}
                    className="input w-full"
                  >
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingBlog(null);
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
                  {editingBlog ? 'Update Blog' : 'Create Blog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
