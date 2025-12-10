import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, Shield, UserCog, Mail, Calendar } from 'lucide-react';
import { usersApi } from '../../../api/users';
import { toast } from 'react-hot-toast';

export const CMSUsersPage = () => {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const { data: usersResponse, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll(1, 1000), // Get up to 1000 users
  });

  const users = usersResponse?.data || [];

  console.log('Users Response:', usersResponse);
  console.log('Users Array:', users);
  console.log('Error:', error);

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      usersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
      setSelectedUser(null);
    },
    onError: () => toast.error('Failed to update user'),
  });

  const deleteUserMutation = useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
    },
    onError: () => toast.error('Failed to delete user'),
  });

  const approveUser = (user: any) => {
    updateUserMutation.mutate({
      id: user.id,
      data: { isApproved: true, role: 'member' },
    });
  };

  const rejectUser = (user: any) => {
    if (confirm('Are you sure you want to reject this user?')) {
      deleteUserMutation.mutate(user.id);
    }
  };

  const changeRole = (user: any, newRole: string) => {
    updateUserMutation.mutate({
      id: user.id,
      data: { role: newRole },
    });
  };

  // Only show pending/unapproved users (new registrations)
  const filteredUsers = users?.filter((user) => !user.isApproved) || [];

  const pendingCount = users?.filter(u => !u.isApproved).length || 0;
  const approvedCount = users?.filter(u => u.isApproved).length || 0;

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      super_admin: 'bg-pink-100 text-pink-800 font-bold',
      admin: 'bg-red-100 text-red-700',
      content_manager: 'bg-purple-100 text-purple-700',
      editor: 'bg-blue-100 text-blue-700',
      member: 'bg-green-100 text-green-700',
      guest: 'bg-gray-100 text-gray-700',
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  const roles = [
    { value: 'super_admin', label: 'Super Admin', description: 'Full system access, can manage admins', permissions: ['All permissions', 'Manage admins', 'Delete admins'] },
    { value: 'admin', label: 'Admin', description: 'Approve users, manage content', permissions: ['Approve users', 'Manage content', 'Cannot modify admins'] },
    { value: 'content_manager', label: 'Content Manager', description: 'Manage all content', permissions: ['Manage content', 'Edit blogs', 'No user management'] },
    { value: 'editor', label: 'Editor', description: 'Edit blogs and pages', permissions: ['Edit blogs', 'Edit pages'] },
    { value: 'member', label: 'Member', description: 'Create blogs, view content', permissions: ['Create blogs', 'View content'] },
    { value: 'guest', label: 'Guest', description: 'View only', permissions: ['View content only'] },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-gray-600">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Users</h2>
        <p className="text-red-600">{(error as any)?.message || 'Failed to load users'}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 btn btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Approvals</h1>
        <p className="text-gray-600 mt-1">Approve new user registrations</p>
        {filteredUsers.length === 0 && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">✅ No pending registrations. All users are approved!</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Registrations</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
            <Mail className="text-yellow-600" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved Today</p>
              <p className="text-3xl font-bold text-primary-600">
                {users?.filter(u => u.isApproved && new Date(u.createdAt).toDateString() === new Date().toDateString()).length || 0}
              </p>
            </div>
            <Check className="text-green-600" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Approved</p>
              <p className="text-2xl font-bold text-blue-600">{approvedCount}</p>
            </div>
            <UserCog className="text-blue-600" size={24} />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.isApproved ? (
                        <span className="flex items-center text-green-600 text-sm">
                          <Check size={16} className="mr-1" />
                          Approved
                        </span>
                      ) : (
                        <span className="flex items-center text-yellow-600 text-sm">
                          <Mail size={16} className="mr-1" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {!user.isApproved && (
                          <>
                            <button
                              onClick={() => approveUser(user)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Approve User"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              onClick={() => rejectUser(user)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Reject User"
                            >
                              <X size={18} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Manage Permissions"
                        >
                          <Shield size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Manage Permissions</h2>
                <p className="text-sm text-gray-600 mt-1">{selectedUser.name} ({selectedUser.email})</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Assign Role
                </label>
                <div className="space-y-3">
                  {roles.map((role) => (
                    <div
                      key={role.value}
                      onClick={() => changeRole(selectedUser, role.value)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                        selectedUser.role === role.value
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">{role.label}</div>
                          <div className="text-sm text-gray-600">{role.description}</div>
                        </div>
                        {selectedUser.role === role.value && (
                          <Check className="text-primary-600" size={24} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Permissions Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Role Permissions:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  {selectedUser.role === 'admin' && (
                    <>
                      <li>• Full system access</li>
                      <li>• Manage all users and permissions</li>
                      <li>• Access all CMS features</li>
                      <li>• Approve/reject users</li>
                    </>
                  )}
                  {selectedUser.role === 'content_manager' && (
                    <>
                      <li>• Manage all content (blogs, pages, focus areas)</li>
                      <li>• Edit hero sliders and statistics</li>
                      <li>• View contact submissions</li>
                      <li>• Cannot manage users</li>
                    </>
                  )}
                  {selectedUser.role === 'editor' && (
                    <>
                      <li>• Create and edit blogs</li>
                      <li>• Edit pages</li>
                      <li>• View published content</li>
                      <li>• Cannot manage CMS settings</li>
                    </>
                  )}
                  {selectedUser.role === 'member' && (
                    <>
                      <li>• Create own blogs (pending approval)</li>
                      <li>• View published content</li>
                      <li>• Access member dashboard</li>
                      <li>• Cannot edit others' content</li>
                    </>
                  )}
                  {selectedUser.role === 'guest' && (
                    <>
                      <li>• View published content only</li>
                      <li>• No editing permissions</li>
                    </>
                  )}
                </ul>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="btn btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
