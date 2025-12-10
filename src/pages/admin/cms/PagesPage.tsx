import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Eye, EyeOff, FileText } from 'lucide-react';
import { pageApi, Page, CreatePageDto, UpdatePageDto } from '../../../api/cms';
import { toast } from 'react-hot-toast';

export const PagesPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);

  const { data: pages, isLoading } = useQuery({
    queryKey: ['pages'],
    queryFn: pageApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: pageApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      toast.success('Page created successfully');
      setIsModalOpen(false);
    },
    onError: () => toast.error('Failed to create page'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePageDto }) =>
      pageApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      toast.success('Page updated successfully');
      setIsModalOpen(false);
      setEditingPage(null);
    },
    onError: () => toast.error('Failed to update page'),
  });

  const deleteMutation = useMutation({
    mutationFn: pageApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      toast.success('Page deleted successfully');
    },
    onError: () => toast.error('Failed to delete page'),
  });

  const publishMutation = useMutation({
    mutationFn: pageApi.publish,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      toast.success('Page published successfully');
    },
    onError: () => toast.error('Failed to publish page'),
  });

  const unpublishMutation = useMutation({
    mutationFn: pageApi.unpublish,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      toast.success('Page unpublished successfully');
    },
    onError: () => toast.error('Failed to unpublish page'),
  });

  const togglePublish = (page: Page) => {
    if (page.is_published) {
      unpublishMutation.mutate(page.id);
    } else {
      publishMutation.mutate(page.id);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data: CreatePageDto = {
      title: formData.get('title') as string,
      slug: formData.get('slug') as string,
      content: formData.get('content') as string,
      excerpt: formData.get('excerpt') as string || undefined,
      featured_image: formData.get('featured_image') as string || undefined,
      meta_title: formData.get('meta_title') as string || undefined,
      meta_description: formData.get('meta_description') as string || undefined,
      meta_keywords: formData.get('meta_keywords') as string || undefined,
      is_published: formData.get('is_published') === 'on',
    };

    if (editingPage) {
      updateMutation.mutate({ id: editingPage.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pages</h1>
          <p className="text-gray-600 mt-1">Manage website pages and content</p>
        </div>
        <button
          onClick={() => {
            setEditingPage(null);
            setIsModalOpen(true);
          }}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Create Page</span>
        </button>
      </div>

      {/* Pages List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            All Pages ({pages?.length || 0})
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {!pages || pages.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No pages yet. Create your first page!
            </div>
          ) : (
            pages.map((page) => (
              <div key={page.id} className="flex items-center p-6 hover:bg-gray-50 transition-colors">
                {/* Icon */}
                <FileText className="text-primary-600 mr-4" size={24} />

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{page.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">/{page.slug}</p>
                  {page.excerpt && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{page.excerpt}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-xs text-gray-500">
                      Updated {new Date(page.updated_at).toLocaleDateString()}
                    </span>
                    {page.creator && (
                      <span className="text-xs text-gray-500">by {page.creator.name}</span>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="mr-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      page.is_published
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {page.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => togglePublish(page)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    title={page.is_published ? 'Unpublish' : 'Publish'}
                  >
                    {page.is_published ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <button
                    onClick={() => {
                      setEditingPage(page);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this page?')) {
                        deleteMutation.mutate(page.id);
                      }
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
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
                {editingPage ? 'Edit Page' : 'Create Page'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      defaultValue={editingPage?.title}
                      required
                      className="input w-full"
                      placeholder="Page title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slug *
                    </label>
                    <input
                      type="text"
                      name="slug"
                      defaultValue={editingPage?.slug}
                      required
                      className="input w-full"
                      placeholder="page-slug"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Excerpt
                  </label>
                  <textarea
                    name="excerpt"
                    defaultValue={editingPage?.excerpt}
                    rows={2}
                    className="input w-full"
                    placeholder="Short description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content *
                  </label>
                  <textarea
                    name="content"
                    defaultValue={editingPage?.content}
                    required
                    rows={8}
                    className="input w-full font-mono text-sm"
                    placeholder="Page content (HTML supported)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Image URL
                  </label>
                  <input
                    type="url"
                    name="featured_image"
                    defaultValue={editingPage?.featured_image}
                    className="input w-full"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              {/* SEO */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900">SEO Settings</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    name="meta_title"
                    defaultValue={editingPage?.meta_title}
                    className="input w-full"
                    placeholder="SEO title (defaults to page title)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    name="meta_description"
                    defaultValue={editingPage?.meta_description}
                    rows={2}
                    className="input w-full"
                    placeholder="SEO description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    name="meta_keywords"
                    defaultValue={editingPage?.meta_keywords}
                    className="input w-full"
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
              </div>

              {/* Publishing */}
              <div className="flex items-center border-t pt-6">
                <input
                  type="checkbox"
                  name="is_published"
                  id="is_published"
                  defaultChecked={editingPage?.is_published ?? false}
                  className="mr-2"
                />
                <label htmlFor="is_published" className="text-sm font-medium text-gray-700">
                  Publish immediately
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingPage(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isLoading || updateMutation.isLoading}
                  className="btn btn-primary"
                >
                  {editingPage ? 'Update Page' : 'Create Page'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
