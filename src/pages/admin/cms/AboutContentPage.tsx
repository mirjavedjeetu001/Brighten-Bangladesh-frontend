import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, RefreshCw, Plus, Edit, Trash2, X } from 'lucide-react';
import { aboutPageAPI, UpdateAboutPageDto } from '../../../api/about';
import { teamMemberAPI, TeamMember, CreateTeamMemberDto } from '../../../api/team-members';
import { usersApi } from '../../../api/users';
import { toast } from 'react-hot-toast';
import { getImageUrl } from '../../../utils/helpers';

export const AboutContentPage = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<UpdateAboutPageDto>({});
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  const [teamFormData, setTeamFormData] = useState<CreateTeamMemberDto>({
    user_id: 0,
    role: '',
    category: '',
    contributions: '',
    social_links: {},
    is_active: true,
  });

  const { data: aboutContent, isLoading } = useQuery({
    queryKey: ['about-page'],
    queryFn: aboutPageAPI.getAboutPage,
  });

  const { data: teamMembers } = useQuery({
    queryKey: ['team-members'],
    queryFn: teamMemberAPI.getAll,
  });

  const { data: approvedUsers } = useQuery({
    queryKey: ['approved-users'],
    queryFn: () => usersApi.getApprovedUsers(),
  });

  // Update form data when content loads
  React.useEffect(() => {
    if (aboutContent) {
      setFormData({
        hero_title: aboutContent.hero_title,
        hero_subtitle: aboutContent.hero_subtitle || '',
        hero_image: aboutContent.hero_image || '',
        mission_title: aboutContent.mission_title || '',
        mission_content: aboutContent.mission_content || '',
        vision_title: aboutContent.vision_title || '',
        vision_content: aboutContent.vision_content || '',
        values_title: aboutContent.values_title || '',
        values_content: aboutContent.values_content || '',
        story_title: aboutContent.story_title || '',
        story_content: aboutContent.story_content || '',
        team_title: aboutContent.team_title || '',
        team_subtitle: aboutContent.team_subtitle || '',
      });
    }
  }, [aboutContent]);

  const updateMutation = useMutation({
    mutationFn: aboutPageAPI.updateAboutPage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['about-page'] });
      toast.success('About page updated successfully');
    },
    onError: () => toast.error('Failed to update about page'),
  });

  const createTeamMemberMutation = useMutation({
    mutationFn: teamMemberAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast.success('Team member added successfully');
      setIsTeamModalOpen(false);
      resetTeamForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add team member');
    },
  });

  const updateTeamMemberMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateTeamMemberDto> }) =>
      teamMemberAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast.success('Team member updated successfully');
      setIsTeamModalOpen(false);
      resetTeamForm();
    },
    onError: () => toast.error('Failed to update team member'),
  });

  const deleteTeamMemberMutation = useMutation({
    mutationFn: teamMemberAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast.success('Team member removed successfully');
    },
    onError: () => toast.error('Failed to remove team member'),
  });

  const toggleActiveTeamMemberMutation = useMutation({
    mutationFn: teamMemberAPI.toggleActive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast.success('Team member status updated');
    },
    onError: () => toast.error('Failed to update status'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleReset = () => {
    if (aboutContent) {
      setFormData({
        hero_title: aboutContent.hero_title,
        hero_subtitle: aboutContent.hero_subtitle || '',
        hero_image: aboutContent.hero_image || '',
        mission_title: aboutContent.mission_title || '',
        mission_content: aboutContent.mission_content || '',
        vision_title: aboutContent.vision_title || '',
        vision_content: aboutContent.vision_content || '',
        values_title: aboutContent.values_title || '',
        values_content: aboutContent.values_content || '',
        story_title: aboutContent.story_title || '',
        story_content: aboutContent.story_content || '',
        team_title: aboutContent.team_title || '',
        team_subtitle: aboutContent.team_subtitle || '',
      });
      toast.success('Form reset to saved values');
    }
  };

  const resetTeamForm = () => {
    setTeamFormData({
      user_id: 0,
      role: '',
      category: '',
      contributions: '',
      social_links: {},
      is_active: true,
    });
    setEditingTeamMember(null);
  };

  const handleAddTeamMember = () => {
    resetTeamForm();
    setIsTeamModalOpen(true);
  };

  const handleEditTeamMember = (member: TeamMember) => {
    setEditingTeamMember(member);
    setTeamFormData({
      user_id: member.user_id,
      role: member.role,
      category: member.category || '',
      contributions: member.contributions || '',
      social_links: member.social_links || {},
      is_active: member.is_active,
    });
    setIsTeamModalOpen(true);
  };

  const handleTeamMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeamMember) {
      const { user_id, ...updateData } = teamFormData;
      updateTeamMemberMutation.mutate({ id: editingTeamMember.id, data: updateData });
    } else {
      createTeamMemberMutation.mutate(teamFormData);
    }
  };

  const handleDeleteTeamMember = (id: number) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      deleteTeamMemberMutation.mutate(id);
    }
  };

  const availableUsers = (approvedUsers || []).filter(
    user => !teamMembers?.some(member => member.user_id === user.id)
  );

  if (isLoading) {
    return <div className="flex justify-center p-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">About Page Content</h1>
          <p className="text-gray-600 mt-1">Manage the about page sections and content</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="btn btn-secondary flex items-center space-x-2"
            type="button"
          >
            <RefreshCw size={20} />
            <span>Reset</span>
          </button>
          <button
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Save size={20} />
            <span>{updateMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Hero Section */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 border-b pb-3">Hero Section</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hero Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.hero_title || ''}
                onChange={(e) => setFormData({ ...formData, hero_title: e.target.value })}
                className="input w-full"
                required
                placeholder="About Brighten Bangladesh"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hero Subtitle
              </label>
              <input
                type="text"
                value={formData.hero_subtitle || ''}
                onChange={(e) => setFormData({ ...formData, hero_subtitle: e.target.value })}
                className="input w-full"
                placeholder="Empowering Communities, Brightening Futures"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hero Background Image URL
              </label>
              <input
                type="text"
                value={formData.hero_image || ''}
                onChange={(e) => setFormData({ ...formData, hero_image: e.target.value })}
                className="input w-full"
                placeholder="https://example.com/image.jpg or /uploads/image.jpg"
              />
              <p className="text-sm text-gray-500 mt-1">
                Optional: Leave empty for gradient background
              </p>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 border-b pb-3">Mission Section</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mission Title
              </label>
              <input
                type="text"
                value={formData.mission_title || ''}
                onChange={(e) => setFormData({ ...formData, mission_title: e.target.value })}
                className="input w-full"
                placeholder="Our Mission"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mission Content
              </label>
              <textarea
                value={formData.mission_content || ''}
                onChange={(e) => setFormData({ ...formData, mission_content: e.target.value })}
                className="input w-full min-h-32"
                placeholder="Enter mission content (HTML supported)"
                rows={6}
              />
              <p className="text-sm text-gray-500 mt-1">
                HTML tags are supported for formatting
              </p>
            </div>
          </div>
        </div>

        {/* Vision Section */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 border-b pb-3">Vision Section</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vision Title
              </label>
              <input
                type="text"
                value={formData.vision_title || ''}
                onChange={(e) => setFormData({ ...formData, vision_title: e.target.value })}
                className="input w-full"
                placeholder="Our Vision"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vision Content
              </label>
              <textarea
                value={formData.vision_content || ''}
                onChange={(e) => setFormData({ ...formData, vision_content: e.target.value })}
                className="input w-full min-h-32"
                placeholder="Enter vision content (HTML supported)"
                rows={6}
              />
              <p className="text-sm text-gray-500 mt-1">
                HTML tags are supported for formatting
              </p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 border-b pb-3">Values Section</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Values Title
              </label>
              <input
                type="text"
                value={formData.values_title || ''}
                onChange={(e) => setFormData({ ...formData, values_title: e.target.value })}
                className="input w-full"
                placeholder="Our Values"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Values Content
              </label>
              <textarea
                value={formData.values_content || ''}
                onChange={(e) => setFormData({ ...formData, values_content: e.target.value })}
                className="input w-full min-h-48"
                placeholder="Enter values as HTML list: <ul><li>Value 1</li><li>Value 2</li></ul>"
                rows={10}
              />
              <p className="text-sm text-gray-500 mt-1">
                Use HTML list format: &lt;ul&gt;&lt;li&gt;Integrity&lt;/li&gt;&lt;li&gt;Collaboration&lt;/li&gt;&lt;/ul&gt;
              </p>
            </div>
          </div>
        </div>

        {/* Story Section */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 border-b pb-3">Story Section</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Story Title
              </label>
              <input
                type="text"
                value={formData.story_title || ''}
                onChange={(e) => setFormData({ ...formData, story_title: e.target.value })}
                className="input w-full"
                placeholder="Our Story"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Story Content
              </label>
              <textarea
                value={formData.story_content || ''}
                onChange={(e) => setFormData({ ...formData, story_content: e.target.value })}
                className="input w-full min-h-48"
                placeholder="Enter your organization's story (HTML supported)"
                rows={10}
              />
              <p className="text-sm text-gray-500 mt-1">
                HTML tags are supported for formatting
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 border-b pb-3">Team Section</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team Title
              </label>
              <input
                type="text"
                value={formData.team_title || ''}
                onChange={(e) => setFormData({ ...formData, team_title: e.target.value })}
                className="input w-full"
                placeholder="Our Team"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team Subtitle
              </label>
              <input
                type="text"
                value={formData.team_subtitle || ''}
                onChange={(e) => setFormData({ ...formData, team_subtitle: e.target.value })}
                className="input w-full"
                placeholder="Meet the people making a difference"
              />
            </div>

            {/* Team Members Management */}
            <div className="mt-6 pt-6 border-t">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Team Members</h3>
                <button
                  type="button"
                  onClick={handleAddTeamMember}
                  className="btn btn-primary btn-sm flex items-center space-x-2"
                >
                  <Plus size={16} />
                  <span>Add Team Member</span>
                </button>
              </div>

              {teamMembers && teamMembers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex flex-col items-center text-center">
                        {/* Profile Picture */}
                        <img
                          src={
                            member.user.profilePhoto
                              ? getImageUrl(member.user.profilePhoto)
                              : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  member.user.name
                                )}&background=059669&color=fff&size=200`
                          }
                          alt={member.user.name}
                          className="w-24 h-24 rounded-full object-cover border-4 border-green-100 mb-4"
                        />
                        
                        {/* User Name */}
                        <h4 className="text-lg font-bold text-gray-900 mb-1">
                          {member.user.name}
                        </h4>
                        
                        {/* Role/Position */}
                        <p className="text-sm font-semibold text-green-600 mb-2">
                          {member.role}
                        </p>
                        
                        {/* Department/Category */}
                        {member.category && (
                          <p className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full mb-3">
                            {member.category}
                          </p>
                        )}
                        
                        {/* Active Status */}
                        <button
                          type="button"
                          onClick={() =>
                            toggleActiveTeamMemberMutation.mutate(member.id)
                          }
                          className={`text-xs px-3 py-1 rounded-full mb-3 font-medium ${
                            member.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {member.is_active ? '✓ Active' : '○ Inactive'}
                        </button>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-2 w-full">
                          <button
                            type="button"
                            onClick={() => handleEditTeamMember(member)}
                            className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                            title="Edit"
                          >
                            <Edit size={14} className="inline mr-1" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTeamMember(member.id)}
                            className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} className="inline mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 mb-3">No team members added yet</p>
                  <button
                    type="button"
                    onClick={handleAddTeamMember}
                    className="btn btn-primary btn-sm"
                  >
                    Add First Team Member
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 sticky bottom-4 bg-white p-4 rounded-lg shadow-lg border">
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <RefreshCw size={20} />
            <span>Reset</span>
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Save size={20} />
            <span>{updateMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>

      {/* Team Member Add/Edit Modal */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingTeamMember ? 'Edit Team Member' : 'Add Team Member'}
                </h2>
                <button
                  onClick={() => {
                    setIsTeamModalOpen(false);
                    resetTeamForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleTeamMemberSubmit} className="p-6 space-y-4">
              {!editingTeamMember && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select User <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={teamFormData.user_id}
                    onChange={(e) =>
                      setTeamFormData({ ...teamFormData, user_id: parseInt(e.target.value) })
                    }
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

              {editingTeamMember && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <img
                      src={
                        editingTeamMember.user.profilePhoto
                          ? getImageUrl(editingTeamMember.user.profilePhoto)
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              editingTeamMember.user.name
                            )}`
                      }
                      alt={editingTeamMember.user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-medium text-gray-900">
                        {editingTeamMember.user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {editingTeamMember.user.email}
                      </div>
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
                  value={teamFormData.role}
                  onChange={(e) =>
                    setTeamFormData({ ...teamFormData, role: e.target.value })
                  }
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
                  value={teamFormData.category}
                  onChange={(e) =>
                    setTeamFormData({ ...teamFormData, category: e.target.value })
                  }
                  className="input w-full"
                  placeholder="e.g., Leadership, Content Team, Tech Team"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contributions/Description
                </label>
                <textarea
                  value={teamFormData.contributions}
                  onChange={(e) =>
                    setTeamFormData({ ...teamFormData, contributions: e.target.value })
                  }
                  className="input w-full min-h-24"
                  placeholder="Brief description of their contributions and expertise"
                  rows={4}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={teamFormData.is_active}
                  onChange={(e) =>
                    setTeamFormData({ ...teamFormData, is_active: e.target.checked })
                  }
                  className="mr-2"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">
                  Active (Show on website)
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsTeamModalOpen(false);
                    resetTeamForm();
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    createTeamMemberMutation.isPending || updateTeamMemberMutation.isPending
                  }
                  className="btn btn-primary"
                >
                  {editingTeamMember ? 'Update' : 'Add'} Team Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
