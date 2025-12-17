import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmsCvTemplatesApi, CvTemplate } from '../../api/cvs';
import { Eye, EyeOff, Edit, Trash2, Plus, X } from 'lucide-react';

export const CMSCvTemplatesPage = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CvTemplate | null>(null);
  const [form, setForm] = useState<Partial<CvTemplate>>({
    name: '',
    description: '',
    thumbnailUrl: '',
    htmlContent: '',
    cssContent: '',
    displayOrder: 0,
    isActive: true,
  });

  const { data: templatesResponse, isLoading } = useQuery({
    queryKey: ['cms-cv-templates'],
    queryFn: cmsCvTemplatesApi.getAll,
  });

  const templates: CvTemplate[] = templatesResponse?.data || [];

  const toggleActiveMutation = useMutation({
    mutationFn: cmsCvTemplatesApi.toggleActive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-cv-templates'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: cmsCvTemplatesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-cv-templates'] });
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: Partial<CvTemplate>) => cmsCvTemplatesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-cv-templates'] });
      setShowForm(false);
      setEditing(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<CvTemplate> }) => cmsCvTemplatesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-cv-templates'] });
      setShowForm(false);
      setEditing(null);
    },
  });

  const openForm = (template?: CvTemplate) => {
    if (template) {
      setEditing(template);
      setForm({ ...template });
    } else {
      setEditing(null);
      setForm({ name: '', description: '', thumbnailUrl: '', htmlContent: '', cssContent: '', displayOrder: templates.length, isActive: true });
    }
    setShowForm(true);
  };

  const handleSubmit = () => {
    const payload = { ...form };
    if (editing) {
      updateMutation.mutate({ id: editing.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CV Templates</h1>
          <p className="text-gray-600 mt-1">Manage CV templates for users</p>
        </div>
        <button
          onClick={() => openForm()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium transition-colors"
        >
          <Plus size={20} />
          Add Template
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Template
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {templates.map((template: CvTemplate) => (
              <tr key={template.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{template.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600 max-w-md truncate">
                    {template.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">{template.displayOrder}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {template.isActive ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      <Eye size={12} />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                      <EyeOff size={12} />
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => toggleActiveMutation.mutate(template.id)}
                      className={`p-2 rounded ${
                        template.isActive
                          ? 'text-gray-600 hover:bg-gray-100'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={template.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {template.isActive ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <button
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit"
                      onClick={() => openForm(template)}
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this template?')) {
                          deleteMutation.mutate(template.id);
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow mt-6">
          <p className="text-gray-500">No CV templates found</p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{editing ? 'Edit Template' : 'Add Template'}</h2>
                <p className="text-sm text-gray-600">Only one template should remain active for users.</p>
              </div>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    value={form.name || ''}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    className="w-full border rounded px-3 py-2"
                    value={form.displayOrder ?? 0}
                    onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full border rounded px-3 py-2 h-20"
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={form.thumbnailUrl || ''}
                  onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">HTML Content</label>
                <textarea
                  className="w-full border rounded px-3 py-2 font-mono text-xs h-56"
                  value={form.htmlContent || ''}
                  onChange={(e) => setForm({ ...form, htmlContent: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CSS Content</label>
                <textarea
                  className="w-full border rounded px-3 py-2 font-mono text-xs h-56"
                  value={form.cssContent || ''}
                  onChange={(e) => setForm({ ...form, cssContent: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-700">Active</label>
                <input
                  type="checkbox"
                  checked={form.isActive ?? false}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                <span className="text-xs text-gray-500">Only one active template will be shown to users.</span>
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded border text-gray-700">Cancel</button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editing ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
