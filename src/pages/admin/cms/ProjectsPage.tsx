import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FolderOpen, Plus, Edit2, Trash2, X } from 'lucide-react';
import { projectsApi, Project, CreateProjectDto } from '../../../api/events-projects';
import { uploadsApi } from '../../../api/uploads';
import toast from 'react-hot-toast';

export const ProjectsPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<CreateProjectDto>({
    title: '',
    slug: '',
    short_description: '',
    full_description: '',
    image_url: '',
    category: '',
    status: 'ongoing',
    start_date: '',
    end_date: '',
    location: '',
    budget: undefined,
    beneficiaries: undefined,
    is_featured: false,
    is_active: true,
    display_order: 0,
  });

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['cms-projects'],
    queryFn: projectsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateProjectDto) => projectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-projects'] });
      toast.success('Project created successfully');
      closeModal();
    },
    onError: () => toast.error('Failed to create project'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => projectsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-projects'] });
      toast.success('Project updated successfully');
      closeModal();
    },
    onError: () => toast.error('Failed to update project'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => projectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-projects'] });
      toast.success('Project deleted successfully');
    },
    onError: () => toast.error('Failed to delete project'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...formData, image_url: imageUrl };
    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({ ...project });
    setImageUrl(project.image_url || '');
    setIsModalOpen(true);
  };

  const handleDelete = (project: Project) => {
    if (window.confirm(`Delete "${project.title}"?`)) {
      deleteMutation.mutate(project.id);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    setFormData({
      title: '',
      slug: '',
      short_description: '',
      full_description: '',
      image_url: '',
      category: '',
      status: 'ongoing',
      start_date: '',
      end_date: '',
      location: '',
      budget: undefined,
      beneficiaries: undefined,
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

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Projects Management</h1>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary flex items-center gap-2">
          <Plus size={20} /> Add Project
        </button>
      </div>

      <div className="grid gap-4">
        {projects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition">
            <div className="flex gap-6">
              {project.image_url && (
                <img src={project.image_url.startsWith('http') ? project.image_url : `http://localhost:3000${project.image_url}`} alt={project.title} className="w-32 h-32 object-cover rounded-lg" />
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{project.title}</h3>
                      {project.is_featured && <span className="px-2 py-1 bg-accent-100 text-accent-700 rounded text-xs font-semibold">Featured</span>}
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${project.status === 'completed' ? 'bg-green-100 text-green-700' : project.status === 'ongoing' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                        {project.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{project.short_description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      {project.category && <span>Category: {project.category}</span>}
                      {project.beneficiaries && <span>Beneficiaries: {project.beneficiaries}</span>}
                      {project.location && <span>Location: {project.location}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(project)} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"><Edit2 size={20} /></button>
                    <button onClick={() => handleDelete(project)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={20} /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full my-8">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">{editingProject ? 'Edit Project' : 'Add Project'}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="block text-sm font-medium mb-2">Title *</label><input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value, slug: formData.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })} className="input w-full" /></div>
                <div className="col-span-2"><label className="block text-sm font-medium mb-2">Slug *</label><input type="text" required value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="input w-full" /></div>
                <div className="col-span-2"><label className="block text-sm font-medium mb-2">Short Description</label><textarea value={formData.short_description} onChange={(e) => setFormData({ ...formData, short_description: e.target.value })} rows={2} className="input w-full" /></div>
                <div className="col-span-2"><label className="block text-sm font-medium mb-2">Full Description</label><textarea value={formData.full_description} onChange={(e) => setFormData({ ...formData, full_description: e.target.value })} rows={4} className="input w-full" /></div>
                <div className="col-span-2"><label className="block text-sm font-medium mb-2">Image</label><input type="file" accept="image/*" onChange={handleFileUpload} disabled={isUploading} className="w-full" />{imageUrl && <div className="mt-2 relative w-32 h-32"><img src={imageUrl.startsWith('http') ? imageUrl : `http://localhost:3000${imageUrl}`} alt="Preview" className="w-full h-full object-cover rounded" /><button type="button" onClick={() => setImageUrl('')} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded"><X size={16} /></button></div>}</div>
                <div><label className="block text-sm font-medium mb-2">Category</label><input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="input w-full" /></div>
                <div><label className="block text-sm font-medium mb-2">Status</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="input w-full"><option value="planning">Planning</option><option value="ongoing">Ongoing</option><option value="completed">Completed</option></select></div>
                <div><label className="block text-sm font-medium mb-2">Start Date</label><input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="input w-full" /></div>
                <div><label className="block text-sm font-medium mb-2">End Date</label><input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className="input w-full" /></div>
                <div><label className="block text-sm font-medium mb-2">Location</label><input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="input w-full" /></div>
                <div><label className="block text-sm font-medium mb-2">Budget (BDT)</label><input type="number" value={formData.budget || ''} onChange={(e) => setFormData({ ...formData, budget: e.target.value ? parseFloat(e.target.value) : undefined })} className="input w-full" /></div>
                <div><label className="block text-sm font-medium mb-2">Beneficiaries</label><input type="number" value={formData.beneficiaries || ''} onChange={(e) => setFormData({ ...formData, beneficiaries: e.target.value ? parseInt(e.target.value) : undefined })} className="input w-full" /></div>
                <div><label className="block text-sm font-medium mb-2">Display Order</label><input type="number" value={formData.display_order} onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })} className="input w-full" /></div>
                <div className="col-span-2 flex items-center gap-6"><label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} className="rounded" /><span className="text-sm font-medium">Featured</span></label><label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="rounded" /><span className="text-sm font-medium">Active</span></label></div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="btn btn-primary flex-1">{editingProject ? 'Update' : 'Create'} Project</button>
                <button type="button" onClick={closeModal} className="btn btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
