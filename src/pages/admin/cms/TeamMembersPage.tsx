import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical, Save, X } from 'lucide-react';
import { teamMemberAPI, TeamMember, CreateTeamMemberDto, UpdateTeamMemberDto } from '../../../api/team-members';
import { usersApi } from '../../../api/users';
import { toast } from 'react-hot-toast';
import { getImageUrl } from '../../../utils/helpers';

export const TeamMembersPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [formData, setFormData] = useState<CreateTeamMemberDto>({
    user_id: 0,
    role: '',
    category: '',
    contributions: '',
    social_links: {},
    is_active: true,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: teamMemberAPI.getAll,
  });

  const { data: approvedUsers } = useQuery({
    queryKey: ['approved-users'],
    queryFn: () => usersApi.getApprovedUsers(),
  });

  React.useEffect(() => {
    if (data) {
      setMembers(data);
    }
  }, [data]);

  const createMutation = useMutation({
    mutationFn: teamMemberAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast.success('Team member added successfully');
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add team member');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTeamMemberDto }) =>
      teamMemberAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast.success('Team member updated successfully');
      setIsModalOpen(false);
      setEditingMember(null);
      resetForm();
    },
    onError: () => toast.error('Failed to update team member'),
  });

  const deleteMutation = useMutation({
    mutationFn: teamMemberAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast.success('Team member removed successfully');
    },
    onError: () => toast.error('Failed to remove team member'),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: teamMemberAPI.toggleActive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast.success('Status updated successfully');
    },
    onError: () => toast.error('Failed to update status'),
  });

  const reorderMutation = useMutation({
    mutationFn: teamMemberAPI.reorder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast.success('Order saved successfully');
    },
    onError: () => toast.error('Failed to save order'),
  });

  const resetForm = () => {
    setFormData({
      user_id: 0,
      role: '',
      category: '',
      contributions: '',
      social_links: {},
      is_active: true,
    });
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      user_id: member.user_id,
      role: member.role,
      category: member.category || '',
      contributions: member.contributions || '',
      social_links: member.social_links || {},
      is_active: member.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingMember) {
      const { user_id, ...updateData } = formData;
      updateMutation.mutate({ id: editingMember.id, data: updateData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      deleteMutation.mutate(id);
    }
  };

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
    const newMembers = [...members];
    const [removed] = newMembers.splice(dragIndex, 1);
    newMembers.splice(dropIndex, 0, removed);
    setMembers(newMembers);
  };

  const handleSaveOrder = () => {
    const order = members.map(m => m.id);
    reorderMutation.mutate(order);
  };

  if (isLoading) {
    return <div className="flex justify-center p-12">Loading...</div>;
  }

  // Filter out users who are already team members
  const availableUsers = (approvedUsers || []).filter(
    user => !members.some(member => member.user_id === user.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
          <p className="text-gray-600 mt-1">Manage team members from approved users</p>
        </div>
        <div className="flex gap-3">
          {members.length > 0 && (
            <button
              onClick={handleSaveOrder}
              disabled={reorderMutation.isPending}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <Save size={20} />
              <span>Save Order</span>
            </button>
          )}
          <button
            onClick={() => {
              setEditingMember(null);
              resetForm();
              setIsModalOpen(true);
            }}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Team Member</span>
          </button>
        </div>
      </div>

      {/* Team Members List */}
      <div className="card">
        {members.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No team members added yet</p>
            <button
              onClick={() => {
                setEditingMember(null);
                resetForm();
                setIsModalOpen(true);
              }}
              className="btn btn-primary"
            >
              Add First Team Member
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Member
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map((member, index) => (
                  <tr
                    key={member.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    className="hover:bg-gray-50 cursor-move"
                  >
                    <td className="px-4 py-4">
                      <GripVertical size={16} className="text-gray-400" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={member.user.profilePhoto ? getImageUrl(member.user.profilePhoto) : `https://ui-avatars.com/api/?name=${encodeURIComponent(member.user.name)}`}
                          alt={member.user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{member.user.name}</div>
                          <div className="text-sm text-gray-500">{member.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-medium text-gray-900">{member.role}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">{member.category || '-'}</span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleActiveMutation.mutate(member.id)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          member.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {member.is_active ? (
                          <>
                            <Eye size={12} className="mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <EyeOff size={12} className="mr-1" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(member)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Remove"
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
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingMember ? 'Edit Team Member' : 'Add Team Member'}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingMember(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {!editingMember && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select User <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.user_id}
                    onChange={(e) => setFormData({ ...formData, user_id: parseInt(e.target.value) })}
                    className="input w-full"
                    required
                  >
                    <option value={0}>Select a user...</option>
                    {availableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    Only approved users who are not already team members are shown
                  </p>
                </div>
              )}

              {editingMember && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <img
                      src={editingMember.user.profilePhoto ? getImageUrl(editingMember.user.profilePhoto) : `https://ui-avatars.com/api/?name=${encodeURIComponent(editingMember.user.name)}`}
                      alt={editingMember.user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{editingMember.user.name}</div>
                      <div className="text-sm text-gray-500">{editingMember.user.email}</div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role/Position <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="input w-full"
                  placeholder="e.g., Founder, Admin, Content Manager"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category/Department
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input w-full"
                  placeholder="e.g., Leadership, Operations, Content, Community"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contributions
                </label>
                <textarea
                  value={formData.contributions}
                  onChange={(e) => setFormData({ ...formData, contributions: e.target.value })}
                  className="input w-full min-h-24"
                  placeholder="Describe their key contributions..."
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Display on website
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingMember(null);
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
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Saving...'
                    : editingMember
                    ? 'Update Member'
                    : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
