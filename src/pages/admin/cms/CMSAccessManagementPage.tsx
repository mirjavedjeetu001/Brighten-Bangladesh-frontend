import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Edit, Trash2, Check } from 'lucide-react';
import { usersApi } from '../../../api/users';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../../stores/authStore';

export const CMSAccessManagementPage = () => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  const { data: usersResponse, isLoading, error } = useQuery({
    queryKey: ['approved-users'],
    queryFn: () => usersApi.getAll(1, 1000),
  });

  const users = usersResponse?.data || [];

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      usersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approved-users'] });
      toast.success('User access updated successfully');
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update user');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approved-users'] });
      toast.success('User removed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove user');
    },
  });

  const changeRole = (user: any, newRole: string) => {
    updateUserMutation.mutate({
      id: user.id,
      data: { role: newRole },
    });
  };

  const removeUser = (user: any) => {
    if (confirm(`Are you sure you want to remove ${user.name}?`)) {
      deleteUserMutation.mutate(user.id);
    }
  };

  // Only show approved users
  const approvedUsers = users.filter(u => u.isApproved);

  const filteredUsers = approvedUsers.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      super_admin: 'bg-pink-100 text-pink-800 font-bold',
      admin: 'bg-red-100 text-red-700',
      content_manager: 'bg-purple-100 text-purple-700',
      editor: 'bg-blue-100 text-blue-700',
      member: 'bg-green-100 text-green-700',
      volunteer: 'bg-cyan-100 text-cyan-700',
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  const roles = [
    { 
      value: 'super_admin', 
      label: 'Super Admin', 
      description: 'Full system access',
      permissions: ['All permissions', 'Manage admins', 'Delete admins']
    },
    { 
      value: 'admin', 
      label: 'Admin', 
      description: 'Approve users, manage content',
      permissions: ['Approve users', 'Manage content', 'Cannot modify admins']
    },
    { 
      value: 'content_manager', 
      label: 'Content Manager', 
      description: 'Manage all website content',
      permissions: ['Hero sliders', 'Pages', 'Focus areas', 'Statistics', 'Blogs']
    },
    { 
      value: 'editor', 
      label: 'Editor', 
      description: 'Edit blogs and pages',
      permissions: ['Edit blogs', 'Edit pages', 'Moderate comments']
    },
    { 
      value: 'member', 
      label: 'Member', 
      description: 'Create own content',
      permissions: ['Create blogs', 'Edit own blogs', 'View content']
    },
    { 
      value: 'volunteer', 
      label: 'Volunteer', 
      description: 'Special volunteer access',
      permissions: ['View activities', 'Submit reports', 'Join events']
    },
  ];

  const canModifyUser = (user: any) => {
    if (currentUser?.role === 'super_admin') return true;
    if (user.role === 'super_admin' || user.role === 'admin') return false;
    return true;
  };

  const availableRoles = currentUser?.role === 'super_admin' 
    ? roles 
    : roles.filter(r => r.value !== 'super_admin' && r.value !== 'admin');

  const roleStats = {
    super_admin: approvedUsers.filter(u => u.role === 'super_admin').length,
    admin: approvedUsers.filter(u => u.role === 'admin').length,
    content_manager: approvedUsers.filter(u => u.role === 'content_manager').length,
    editor: approvedUsers.filter(u => u.role === 'editor').length,
    member: approvedUsers.filter(u => u.role === 'member').length,
    volunteer: approvedUsers.filter(u => u.role === 'volunteer').length,
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-gray-600">Loading access management...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Users</h2>
        <p className="text-red-600">{(error as any)?.message || 'Failed to load users'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Access Management</h1>
        <p className="text-gray-600 mt-1">Manage roles and permissions for approved users</p>
      </div>

      {/* Role Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {Object.entries(roleStats).map(([role, count]) => (
          <div key={role} className="bg-white rounded-lg shadow p-4 text-center">
            <p className={`text-2xl font-bold mb-1 ${getRoleBadge(role).split(' ')[0].replace('bg-', 'text-').replace('100', '700')}`}>
              {count}
            </p>
            <p className="text-xs text-gray-600 capitalize">{role.replace('_', ' ')}</p>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="input"
          >
            <option value="all">All Roles ({approvedUsers.length})</option>
            <option value="super_admin">Super Admin ({roleStats.super_admin})</option>
            <option value="admin">Admin ({roleStats.admin})</option>
            <option value="content_manager">Content Manager ({roleStats.content_manager})</option>
            <option value="editor">Editor ({roleStats.editor})</option>
            <option value="member">Member ({roleStats.member})</option>
            <option value="volunteer">Volunteer ({roleStats.volunteer})</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadge(user.role)}`}>
                        {user.role?.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {canModifyUser(user) ? (
                        <>
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition"
                          >
                            <Edit size={16} className="mr-1" />
                            Change Role
                          </button>
                          <button
                            onClick={() => removeUser(user)}
                            className="inline-flex items-center px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition"
                          >
                            <Trash2 size={16} className="mr-1" />
                            Remove
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Protected</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Change Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900">Change User Role</h3>
              <p className="text-gray-600 mt-1">
                Update access level for <span className="font-semibold">{selectedUser.name}</span>
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Current Role:</p>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRoleBadge(selectedUser.role)}`}>
                  {selectedUser.role?.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="space-y-3">
                <p className="font-semibold text-gray-900">Select New Role:</p>
                {availableRoles.map((role) => (
                  <div
                    key={role.value}
                    onClick={() => changeRole(selectedUser, role.value)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                      selectedUser.role === role.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{role.label}</h4>
                        <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {role.permissions.map((perm, idx) => (
                            <span key={idx} className="text-xs bg-white px-2 py-1 rounded border border-gray-200">
                              {perm}
                            </span>
                          ))}
                        </div>
                      </div>
                      {selectedUser.role === role.value && (
                        <Check className="text-primary-600 ml-2" size={24} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
