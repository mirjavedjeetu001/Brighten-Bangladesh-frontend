import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical, Save } from 'lucide-react';
import { heroSliderApi, HeroSlider, CreateHeroSliderDto, UpdateHeroSliderDto } from '../../../api/cms';
import { toast } from 'react-hot-toast';

export const HeroSlidersPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlider, setEditingSlider] = useState<HeroSlider | null>(null);
  const [sliders, setSliders] = useState<HeroSlider[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['hero-sliders'],
    queryFn: heroSliderApi.getAll,
  });

  // Update local state when data changes
  React.useEffect(() => {
    if (data) {
      setSliders(data);
    }
  }, [data]);

  const createMutation = useMutation({
    mutationFn: heroSliderApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-sliders'] });
      toast.success('Hero slider created successfully');
      setIsModalOpen(false);
    },
    onError: () => toast.error('Failed to create hero slider'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateHeroSliderDto }) =>
      heroSliderApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-sliders'] });
      toast.success('Hero slider updated successfully');
      setIsModalOpen(false);
      setEditingSlider(null);
    },
    onError: () => toast.error('Failed to update hero slider'),
  });

  const deleteMutation = useMutation({
    mutationFn: heroSliderApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-sliders'] });
      toast.success('Hero slider deleted successfully');
    },
    onError: () => toast.error('Failed to delete hero slider'),
  });

  const reorderMutation = useMutation({
    mutationFn: heroSliderApi.reorder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-sliders'] });
      toast.success('Order saved successfully');
    },
    onError: () => toast.error('Failed to save order'),
  });

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/html'));
    const newSliders = [...sliders];
    const [removed] = newSliders.splice(dragIndex, 1);
    newSliders.splice(dropIndex, 0, removed);
    
    // Update display_order for all items
    const reorderedSliders = newSliders.map((slider, index) => ({
      ...slider,
      display_order: index + 1,
    }));
    
    setSliders(reorderedSliders);
  };

  const handleSaveOrder = () => {
    const orders = sliders.map((slider, index) => ({
      id: slider.id,
      display_order: index + 1,
    }));
    reorderMutation.mutate({ orders });
  };

  const toggleActive = (slider: HeroSlider) => {
    updateMutation.mutate({
      id: slider.id,
      data: { is_active: !slider.is_active },
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data: CreateHeroSliderDto = {
      title: formData.get('title') as string,
      subtitle: formData.get('subtitle') as string || undefined,
      image_url: formData.get('image_url') as string,
      button_text: formData.get('button_text') as string || undefined,
      button_url: formData.get('button_url') as string || undefined,
      is_active: formData.get('is_active') === 'on',
    };

    if (editingSlider) {
      updateMutation.mutate({ id: editingSlider.id, data });
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
          <h1 className="text-3xl font-bold text-gray-900">Hero Sliders</h1>
          <p className="text-gray-600 mt-1">Manage homepage carousel sliders</p>
        </div>
        <button
          onClick={() => {
            setEditingSlider(null);
            setIsModalOpen(true);
          }}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Slider</span>
        </button>
      </div>

      {/* Sliders List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            All Sliders ({sliders.length})
          </h2>
          {sliders.length > 0 && (
            <button
              onClick={handleSaveOrder}
              className="btn btn-sm btn-primary flex items-center space-x-2"
              disabled={reorderMutation.isPending}
            >
              <Save size={16} />
              <span>Save Order</span>
            </button>
          )}
        </div>

        <div className="divide-y divide-gray-200">
          {sliders.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No hero sliders yet. Create your first one!
            </div>
          ) : (
            sliders.map((slider, index) => (
              <div
                key={slider.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className="flex items-center p-6 hover:bg-gray-50 cursor-move transition-colors"
              >
                {/* Drag Handle */}
                <GripVertical className="text-gray-400 mr-4" size={20} />

                {/* Image Preview */}
                <img
                  src={slider.image_url}
                  alt={slider.title}
                  className="w-32 h-20 object-cover rounded-lg mr-6"
                />

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{slider.title}</h3>
                  {slider.subtitle && (
                    <p className="text-sm text-gray-600 mt-1">{slider.subtitle}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-xs text-gray-500">Order: {slider.display_order}</span>
                    {slider.button_text && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        CTA: {slider.button_text}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="mr-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      slider.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {slider.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleActive(slider)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    title={slider.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {slider.is_active ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <button
                    onClick={() => {
                      setEditingSlider(slider);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this slider?')) {
                        deleteMutation.mutate(slider.id);
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
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingSlider ? 'Edit Hero Slider' : 'Create Hero Slider'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingSlider?.title}
                  required
                  className="input w-full"
                  placeholder="Enter slider title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  name="subtitle"
                  defaultValue={editingSlider?.subtitle}
                  className="input w-full"
                  placeholder="Enter subtitle (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL *
                </label>
                <input
                  type="url"
                  name="image_url"
                  defaultValue={editingSlider?.image_url}
                  required
                  className="input w-full"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Button Text
                  </label>
                  <input
                    type="text"
                    name="button_text"
                    defaultValue={editingSlider?.button_text}
                    className="input w-full"
                    placeholder="Get Started"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Button URL
                  </label>
                  <input
                    type="text"
                    name="button_url"
                    defaultValue={editingSlider?.button_url}
                    className="input w-full"
                    placeholder="/about"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  id="is_active"
                  defaultChecked={editingSlider?.is_active ?? true}
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
                    setEditingSlider(null);
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
                  {editingSlider ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
