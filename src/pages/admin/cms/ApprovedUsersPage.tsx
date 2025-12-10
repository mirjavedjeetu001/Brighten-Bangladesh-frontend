import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, UserCheck, Mail, Phone, MapPin, GraduationCap, Briefcase, Eye, Download } from 'lucide-react';
import { format } from 'date-fns';
import { usersApi } from '../../../api/users';
import { User as UserType } from '../../../api/types';

export function ApprovedUsersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const pageSize = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['approved-users', currentPage],
    queryFn: () => usersApi.getApproved(currentPage, pageSize),
  });

  const exportToCSV = () => {
    if (!data?.data) return;

    // CSV headers
    const headers = [
      'Name',
      'Email',
      'Mobile Number',
      'Division',
      'District',
      'NID',
      'Education Status',
      'Organization',
      'Designation',
      'Highest Education',
      'Education Major',
      'Area of Interest',
      'Reason to Join',
      'Role',
      'Registered At'
    ];

    // CSV rows
    const rows = data.data.map(user => [
      user.name || '',
      user.email || '',
      user.mobileNumber || '',
      user.division || '',
      user.district || '',
      user.nid || '',
      user.educationStatus || '',
      user.organization || '',
      user.designation || '',
      user.highestEducation || '',
      user.educationMajor || '',
      user.areaOfInterest || '',
      user.reasonToJoin || '',
      user.role || '',
      format(new Date(user.createdAt), 'MMM dd, yyyy')
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `approved-members-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      super_admin: 'bg-purple-100 text-purple-800',
      admin: 'bg-red-100 text-red-800',
      content_manager: 'bg-blue-100 text-blue-800',
      editor: 'bg-yellow-100 text-yellow-800',
      member: 'bg-green-100 text-green-800',
      volunteer: 'bg-teal-100 text-teal-800',
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Approved Members</h1>
          <p className="text-gray-600 mt-1">View all approved member profiles and details</p>
        </div>
        {data && data.data.length > 0 && (
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Approved</div>
              <div className="text-2xl font-bold">{data?.total || 0}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Current Page</div>
              <div className="text-2xl font-bold">{currentPage} / {data?.totalPages || 1}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Showing</div>
              <div className="text-2xl font-bold">{data?.data.length || 0} members</div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Members List</h2>
        </div>

        {error ? (
          <div className="p-8 text-center text-red-500">
            Error loading members: {(error as any).message}
          </div>
        ) : isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading members...</div>
        ) : data && data.data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Education</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.data.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.profilePhoto ? (
                          <img
                            src={user.profilePhoto}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-teal-600" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          {user.organization && (
                            <div className="text-sm text-gray-500">{user.organization}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-gray-900">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </div>
                        {user.mobileNumber && (
                          <div className="flex items-center gap-1 text-gray-500 mt-1">
                            <Phone className="w-4 h-4" />
                            {user.mobileNumber}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {user.district && user.division ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {user.district}, {user.division}
                          </div>
                        ) : (
                          <span className="text-gray-400">Not specified</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {user.highestEducation && (
                          <div className="flex items-center gap-1 text-gray-900">
                            <GraduationCap className="w-4 h-4" />
                            {user.highestEducation}
                          </div>
                        )}
                        {user.educationMajor && (
                          <div className="text-gray-500 ml-5">{user.educationMajor}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadge(user.role)}`}>
                        {user.role?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="flex items-center gap-1 text-teal-600 hover:text-teal-700"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">No approved members found</div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {data.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(data.totalPages, p + 1))}
              disabled={currentPage === data.totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-semibold text-gray-900">Member Details</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile Picture */}
              {selectedUser.profilePhoto && (
                <div className="flex justify-center pb-6 border-b border-gray-200">
                  <img
                    src={selectedUser.profilePhoto}
                    alt={selectedUser.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                  />
                </div>
              )}

              {/* Personal Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-500">Full Name</div>
                    <div className="font-medium text-gray-900">{selectedUser.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium text-gray-900">{selectedUser.email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Mobile Number</div>
                    <div className="font-medium text-gray-900">{selectedUser.mobileNumber || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">NID</div>
                    <div className="font-medium text-gray-900">{selectedUser.nid || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-500">Division</div>
                    <div className="font-medium text-gray-900">{selectedUser.division || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">District</div>
                    <div className="font-medium text-gray-900">{selectedUser.district || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Education */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Education
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-500">Education Status</div>
                    <div className="font-medium text-gray-900">{selectedUser.educationStatus || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Highest Education</div>
                    <div className="font-medium text-gray-900">{selectedUser.highestEducation || 'N/A'}</div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-sm text-gray-500">Major/Field of Study</div>
                    <div className="font-medium text-gray-900">{selectedUser.educationMajor || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Professional */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Professional
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-500">Organization</div>
                    <div className="font-medium text-gray-900">{selectedUser.organization || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Designation</div>
                    <div className="font-medium text-gray-900">{selectedUser.designation || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Interests & Motivation */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Area of Interest</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedUser.areaOfInterest || 'Not specified'}</p>
                </div>
              </div>

              {selectedUser.reasonToJoin && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Reason to Join</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedUser.reasonToJoin}</p>
                  </div>
                </div>
              )}

              {/* Account Info */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Account Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-500">Role</div>
                    <div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadge(selectedUser.role)}`}>
                        {selectedUser.role?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Member Since</div>
                    <div className="font-medium text-gray-900">
                      {format(new Date(selectedUser.createdAt), 'MMMM dd, yyyy')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setSelectedUser(null)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
