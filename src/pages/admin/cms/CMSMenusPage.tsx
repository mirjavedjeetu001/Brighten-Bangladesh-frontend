import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { navigationMenusApi } from '../../../api/menus';
import { NavigationMenu } from '../../../api/types';
import { Plus, GripVertical, Edit, Trash2, Eye, EyeOff, Save, X } from 'lucide-react';

interface MenuFormData {
  name: string;
  label: string;
  path: string;
  isActive: boolean;
  displayOrder: number;
  icon?: string;
}

export default function CMSMenusPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<NavigationMenu | null>(null);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [formData, setFormData] = useState<MenuFormData>({
    name: '',
    label: '',
    path: '',
    isActive: true,
    displayOrder: 0,
    icon: '',
  });

  // Fetch all menus (admin)
  const { data: menus = [], isLoading } = useQuery({
    queryKey: ['navigation-menus-admin'],
    queryFn: navigationMenusApi.getAllAdmin,
  });

  // Sort menus by displayOrder
  const sortedMenus = [...menus].sort((a, b) => a.displayOrder - b.displayOrder);

  // Create menu mutation
  const createMenuMutation = useMutation({
    mutationFn: navigationMenusApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navigation-menus-admin'] });
      queryClient.invalidateQueries({ queryKey: ['navigation-menus'] });
      closeModal();
    },
  });

  // Update menu mutation
  const updateMenuMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<MenuFormData> }) =>
      navigationMenusApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navigation-menus-admin'] });
      queryClient.invalidateQueries({ queryKey: ['navigation-menus'] });
      closeModal();
    },
  });

  // Delete menu mutation
  const deleteMenuMutation = useMutation({
    mutationFn: navigationMenusApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navigation-menus-admin'] });
      queryClient.invalidateQueries({ queryKey: ['navigation-menus'] });
    },
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      navigationMenusApi.update(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navigation-menus-admin'] });
      queryClient.invalidateQueries({ queryKey: ['navigation-menus'] });
    },
  });

  // Reorder menus mutation
  const reorderMutation = useMutation({
    mutationFn: navigationMenusApi.reorder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navigation-menus-admin'] });
      queryClient.invalidateQueries({ queryKey: ['navigation-menus'] });
    },
  });

  const openCreateModal = () => {
    setEditingMenu(null);
    setFormData({
      name: '',
      label: '',
      path: '',
      isActive: true,
      displayOrder: menus.length,
      icon: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (menu: NavigationMenu) => {
    setEditingMenu(menu);
    setFormData({
      name: menu.name,
      label: menu.label,
      path: menu.path,
      isActive: menu.isActive,
      displayOrder: menu.displayOrder,
      icon: menu.icon || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMenu(null);
    setFormData({
      name: '',
      label: '',
      path: '',
      isActive: true,
      displayOrder: 0,
      icon: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingMenu) {
      updateMenuMutation.mutate({
        id: editingMenu.id,
        updates: {
          label: formData.label,
          path: formData.path,
          isActive: formData.isActive,
          icon: formData.icon || undefined,
        },
      });
    } else {
      createMenuMutation.mutate({
        name: formData.name,
        label: formData.label,
        path: formData.path,
        isActive: formData.isActive,
        displayOrder: formData.displayOrder,
        icon: formData.icon || undefined,
      });
    }
  };

  const handleDelete = (menu: NavigationMenu) => {
    if (menu.isSystem) {
      alert('System menus cannot be deleted');
      return;
    }
    
    if (confirm(`Are you sure you want to delete "${menu.label}"?`)) {
      deleteMenuMutation.mutate(menu.id);
    }
  };

  const handleToggleActive = (menu: NavigationMenu) => {
    toggleActiveMutation.mutate({ id: menu.id, isActive: !menu.isActive });
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedItem === null || draggedItem === dropIndex) {
      setDraggedItem(null);
      return;
    }

    const reorderedMenus = [...sortedMenus];
    const [draggedMenu] = reorderedMenus.splice(draggedItem, 1);
    reorderedMenus.splice(dropIndex, 0, draggedMenu);

    // Update displayOrder and save
    const menuIds = reorderedMenus.map(menu => menu.id);
    reorderMutation.mutate(menuIds);
    
    setDraggedItem(null);
  };

  if (isLoading) {
    return <div className="p-6">Loading menus...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Navigation Menus</h1>
          <p className="text-gray-600 mt-1">Manage site navigation menus</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Add Menu
        </button>
      </div>

      {/* Menus Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-12 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Label
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Path
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Icon
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedMenus.map((menu, index) => (
              <tr
                key={menu.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`
                  ${draggedItem === index ? 'opacity-50' : ''}
                  hover:bg-gray-50 cursor-move
                `}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <GripVertical size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-900">{index + 1}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{menu.label}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{menu.path}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{menu.icon || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleActive(menu)}
                    className={`
                      inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
                      ${menu.isActive 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }
                    `}
                  >
                    {menu.isActive ? (
                      <>
                        <Eye size={12} />
                        Active
                      </>
                    ) : (
                      <>
                        <EyeOff size={12} />
                        Inactive
                      </>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`
                    inline-flex px-2 py-1 text-xs font-medium rounded
                    ${menu.isSystem 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                    }
                  `}>
                    {menu.isSystem ? 'System' : 'Custom'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openEditModal(menu)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit menu"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(menu)}
                      disabled={menu.isSystem}
                      className={`
                        ${menu.isSystem 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-red-600 hover:text-red-900'
                        }
                      `}
                      title={menu.isSystem ? 'System menus cannot be deleted' : 'Delete menu'}
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

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">
                {editingMenu ? 'Edit Menu' : 'Create Menu'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {!editingMenu && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name (identifier) *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., contact-us"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Lowercase, hyphens only. Cannot be changed later.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Label (display text) *
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Contact Us"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Path (URL) *
                </label>
                <input
                  type="text"
                  value={formData.path}
                  onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="/contact"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon (optional)
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Icon name"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active (visible in navigation)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMenuMutation.isPending || updateMenuMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <Save size={18} />
                  {editingMenu ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
