import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Eye, EyeOff, Target, Upload } from 'lucide-react';
import { focusAreaApi, FocusArea, CreateFocusAreaDto, UpdateFocusAreaDto } from '../../../api/cms';
import { uploadsApi } from '../../../api/uploads';
import { toast } from 'react-hot-toast';

export const FocusAreasPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<FocusArea | null>(null);
  const [imageUrl, setImageUrl] = useState('');

  const { data: focusAreas, isLoading } = useQuery({
    queryKey: ['focus-areas'],
    queryFn: focusAreaApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: focusAreaApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focus-areas'] });
      toast.success('Focus area created successfully');
      setIsModalOpen(false);
      setImageUrl('');
    },
    onError: (error: any) => {
      console.error('Create error:', error);
      toast.error(error?.response?.data?.message || 'Failed to create focus area');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateFocusAreaDto }) =>
      focusAreaApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focus-areas'] });
      toast.success('Focus area updated successfully');
      setIsModalOpen(false);
      setEditingArea(null);
      setImageUrl('');
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      toast.error(error?.response?.data?.message || 'Failed to update focus area');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: focusAreaApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focus-areas'] });
      toast.success('Focus area deleted successfully');
    },
    onError: () => toast.error('Failed to delete focus area'),
  });

  const toggleActive = (area: FocusArea) => {
    updateMutation.mutate({
      id: area.id,
      data: { is_active: !area.is_active },
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadsApi.uploadFile(file);
      setImageUrl(url);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const description = formData.get('description') as string;
    const data: any = {
      title: formData.get('title') as string,
      slug: formData.get('slug') as string,
      short_description: description,
      full_description: description,
      icon: formData.get('icon') as string || undefined,
      image_url: imageUrl || (formData.get('image_url') as string) || undefined,
      display_order: parseInt(formData.get('display_order') as string) || undefined,
      is_active: formData.get('is_active') === 'on',
    };

    if (editingArea) {
      updateMutation.mutate({ id: editingArea.id, data });
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
          <h1 className="text-3xl font-bold text-gray-900">Focus Areas</h1>
          <p className="text-gray-600 mt-1">Manage organization focus areas and services</p>
        </div>
        <button
          onClick={() => {
            setEditingArea(null);
            setImageUrl('');
            setIsModalOpen(true);
          }}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Focus Area</span>
        </button>
      </div>

      {/* Focus Areas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!focusAreas || focusAreas.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-md p-12 text-center text-gray-500">
            No focus areas yet. Create your first one!
          </div>
        ) : (
          focusAreas.map((area) => (
            <div
              key={area.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {area.image_url && (
                <img
                  src={area.image_url.startsWith('http') ? area.image_url : `http://localhost:3000${area.image_url}`}
                  alt={area.title}
                  className="w-full h-48 object-cover"
                />
              )}
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {area.icon && (
                      <span className="text-3xl">{area.icon}</span>
                    )}
                    <h3 className="text-xl font-semibold text-gray-900">{area.title}</h3>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      area.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {area.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{area.short_description || area.full_description}</p>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>Order: {area.display_order}</span>
                  <span>/{area.slug}</span>
                </div>

                <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => toggleActive(area)}
                    className="flex-1 btn btn-sm btn-secondary flex items-center justify-center space-x-1"
                  >
                    {area.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                    <span>{area.is_active ? 'Deactivate' : 'Activate'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingArea(area);
                      setImageUrl(area.image_url || '');
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this focus area?')) {
                        deleteMutation.mutate(area.id);
                      }
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingArea ? 'Edit Focus Area' : 'Create Focus Area'}
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
                    defaultValue={editingArea?.title}
                    required
                    className="input w-full"
                    placeholder="Education"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug *
                  </label>
                  <input
                    type="text"
                    name="slug"
                    defaultValue={editingArea?.slug}
                    required
                    className="input w-full"
                    placeholder="education"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  defaultValue={editingArea?.short_description || editingArea?.full_description}
                  required
                  rows={4}
                  className="input w-full"
                  placeholder="Describe this focus area..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon (Emoji)
                  </label>
                  <input
                    type="text"
                    name="icon"
                    defaultValue={editingArea?.icon}
                    className="input w-full"
                    placeholder="📚"
                    maxLength={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="display_order"
                    defaultValue={editingArea?.display_order || 1}
                    min={1}
                    className="input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image
                </label>
                <div className="space-y-3">
                  {imageUrl && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
                      <img 
                        src={imageUrl.startsWith('http') ? imageUrl : `http://localhost:3000${imageUrl}`}
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <label className="btn btn-secondary cursor-pointer inline-flex items-center gap-2">
                    <Upload size={16} />
                    {imageUrl ? 'Change Image' : 'Upload Image'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove Image
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  id="is_active"
                  defaultChecked={editingArea?.is_active ?? true}
                  className="mr-2"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingArea(null);
                    setImageUrl('');
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
                  {editingArea ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
