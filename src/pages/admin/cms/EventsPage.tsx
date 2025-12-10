import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Plus, Edit2, Trash2, X, Upload, MapPin, Users, ExternalLink } from 'lucide-react';
import { eventsApi, Event, CreateEventDto, UpdateEventDto } from '../../../api/events-projects';
import { uploadsApi } from '../../../api/uploads';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export const EventsPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<CreateEventDto>({
    title: '',
    slug: '',
    short_description: '',
    full_description: '',
    image_url: '',
    event_date: '',
    location: '',
    organizer: '',
    max_participants: undefined,
    registration_link: '',
    is_featured: false,
    is_active: true,
    display_order: 0,
  });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['cms-events'],
    queryFn: eventsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateEventDto) => eventsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-events'] });
      toast.success('Event created successfully');
      closeModal();
    },
    onError: () => toast.error('Failed to create event'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEventDto }) => eventsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-events'] });
      toast.success('Event updated successfully');
      closeModal();
    },
    onError: () => toast.error('Failed to update event'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => eventsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-events'] });
      toast.success('Event deleted successfully');
    },
    onError: () => toast.error('Failed to delete event'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...formData, image_url: imageUrl };

    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      slug: event.slug,
      short_description: event.short_description || '',
      full_description: event.full_description || '',
      image_url: event.image_url || '',
      event_date: event.event_date.split('T')[0] + 'T' + event.event_date.split('T')[1].substring(0, 5),
      location: event.location || '',
      organizer: event.organizer || '',
      max_participants: event.max_participants,
      registration_link: event.registration_link || '',
      is_featured: event.is_featured,
      is_active: event.is_active,
      display_order: event.display_order,
    });
    setImageUrl(event.image_url || '');
    setIsModalOpen(true);
  };

  const handleDelete = (event: Event) => {
    if (window.confirm(`Delete "${event.title}"?`)) {
      deleteMutation.mutate(event.id);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
    setFormData({
      title: '',
      slug: '',
      short_description: '',
      full_description: '',
      image_url: '',
      event_date: '',
      location: '',
      organizer: '',
      max_participants: undefined,
      registration_link: '',
      is_featured: false,
      is_active: true,
      display_order: 0,
    });
    setImageUrl('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadsApi.uploadFile(file);
      setImageUrl(url);
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const generateSlug = (title: string) => {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setFormData({ ...formData, slug });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary flex items-center gap-2">
          <Plus size={20} /> Add Event
        </button>
      </div>

      <div className="grid gap-4">
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition">
            <div className="flex gap-6">
              {event.image_url && (
                <img src={event.image_url.startsWith('http') ? event.image_url : `http://localhost:3000${event.image_url}`} alt={event.title} className="w-32 h-32 object-cover rounded-lg" />
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                      {event.is_featured && <span className="px-2 py-1 bg-accent-100 text-accent-700 rounded text-xs font-semibold">Featured</span>}
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${event.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {event.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{event.short_description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1"><Calendar size={16} /> {format(new Date(event.event_date), 'MMM dd, yyyy hh:mm a')}</div>
                      {event.location && <div className="flex items-center gap-1"><MapPin size={16} /> {event.location}</div>}
                      {event.max_participants && <div className="flex items-center gap-1"><Users size={16} /> Max: {event.max_participants}</div>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(event)} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"><Edit2 size={20} /></button>
                    <button onClick={() => handleDelete(event)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={20} /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full my-8">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">{editingEvent ? 'Edit Event' : 'Add Event'}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} onBlur={(e) => !formData.slug && generateSlug(e.target.value)} className="input w-full" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Slug *</label>
                  <input type="text" required value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="input w-full" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Short Description</label>
                  <textarea value={formData.short_description} onChange={(e) => setFormData({ ...formData, short_description: e.target.value })} rows={2} className="input w-full" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Full Description</label>
                  <textarea value={formData.full_description} onChange={(e) => setFormData({ ...formData, full_description: e.target.value })} rows={4} className="input w-full" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Image</label>
                  <div className="space-y-2">
                    <input type="file" accept="image/*" onChange={handleFileUpload} disabled={isUploading} className="w-full" />
                    {imageUrl && (
                      <div className="relative w-32 h-32">
                        <img src={imageUrl.startsWith('http') ? imageUrl : `http://localhost:3000${imageUrl}`} alt="Preview" className="w-full h-full object-cover rounded" />
                        <button type="button" onClick={() => setImageUrl('')} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded"><X size={16} /></button>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Event Date & Time *</label>
                  <input type="datetime-local" required value={formData.event_date} onChange={(e) => setFormData({ ...formData, event_date: e.target.value })} className="input w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="input w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Organizer</label>
                  <input type="text" value={formData.organizer} onChange={(e) => setFormData({ ...formData, organizer: e.target.value })} className="input w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Max Participants</label>
                  <input type="number" value={formData.max_participants || ''} onChange={(e) => setFormData({ ...formData, max_participants: e.target.value ? parseInt(e.target.value) : undefined })} className="input w-full" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Registration Link</label>
                  <input type="url" value={formData.registration_link} onChange={(e) => setFormData({ ...formData, registration_link: e.target.value })} className="input w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Display Order</label>
                  <input type="number" value={formData.display_order} onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })} className="input w-full" />
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} className="rounded" />
                    <span className="text-sm font-medium">Featured</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="rounded" />
                    <span className="text-sm font-medium">Active</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="btn btn-primary flex-1">
                  {editingEvent ? 'Update' : 'Create'} Event
                </button>
                <button type="button" onClick={closeModal} className="btn btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
