import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, Trash2, Eye, MessageSquare, Phone, User, Calendar } from 'lucide-react';
import { contactApi, ContactSubmission } from '../../../api/cms';
import { toast } from 'react-hot-toast';

export const ContactSubmissionsPage = () => {
  const queryClient = useQueryClient();
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const { data: submissions, isLoading } = useQuery({
    queryKey: ['contact-submissions'],
    queryFn: contactApi.getSubmissions,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: ContactSubmission['status'] }) =>
      contactApi.updateStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['contact-unread'] });
      toast.success('Status updated successfully');
    },
    onError: () => toast.error('Failed to update status'),
  });

  const deleteMutation = useMutation({
    mutationFn: contactApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['contact-unread'] });
      toast.success('Submission deleted successfully');
      setSelectedSubmission(null);
    },
    onError: () => toast.error('Failed to delete submission'),
  });

  const handleViewSubmission = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    if (submission.status === 'unread') {
      updateStatusMutation.mutate({ id: submission.id, status: 'read' });
    }
  };

  const filteredSubmissions = submissions?.filter((sub) => {
    if (filterStatus === 'all') return true;
    return sub.status === filterStatus;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread':
        return 'bg-yellow-100 text-yellow-700';
      case 'read':
        return 'bg-blue-100 text-blue-700';
      case 'replied':
        return 'bg-green-100 text-green-700';
      case 'archived':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
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
          <h1 className="text-3xl font-bold text-gray-900">Contact Submissions</h1>
          <p className="text-gray-600 mt-1">Manage contact form submissions</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input"
          >
            <option value="all">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['unread', 'read', 'replied', 'archived'].map((status) => {
          const count = submissions?.filter((s) => s.status === status).length || 0;
          return (
            <div key={status} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 capitalize">{status}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
                <Mail className="text-primary-600" size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Submissions List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Submissions ({filteredSubmissions.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredSubmissions.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No submissions found
            </div>
          ) : (
            filteredSubmissions.map((submission) => (
              <div
                key={submission.id}
                className={`flex items-center p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                  submission.status === 'unread' ? 'bg-yellow-50' : ''
                }`}
                onClick={() => handleViewSubmission(submission)}
              >
                {/* Icon */}
                <MessageSquare
                  className={`mr-4 ${
                    submission.status === 'unread' ? 'text-yellow-600' : 'text-primary-600'
                  }`}
                  size={24}
                />

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{submission.name}</h3>
                    {submission.subject && (
                      <span className="text-sm text-gray-600">• {submission.subject}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{submission.message}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Mail size={12} className="mr-1" />
                      {submission.email}
                    </span>
                    {submission.phone && (
                      <span className="flex items-center">
                        <Phone size={12} className="mr-1" />
                        {submission.phone}
                      </span>
                    )}
                    <span className="flex items-center">
                      <Calendar size={12} className="mr-1" />
                      {new Date(submission.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="mr-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                    {submission.status}
                  </span>
                </div>

                {/* Actions */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewSubmission(submission);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  <Eye size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Submission Details</h2>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <div className="flex items-center text-gray-900">
                    <User size={16} className="mr-2 text-gray-400" />
                    {selectedSubmission.name}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="flex items-center text-gray-900">
                    <Mail size={16} className="mr-2 text-gray-400" />
                    <a href={`mailto:${selectedSubmission.email}`} className="text-primary-600 hover:underline">
                      {selectedSubmission.email}
                    </a>
                  </div>
                </div>
                {selectedSubmission.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <div className="flex items-center text-gray-900">
                      <Phone size={16} className="mr-2 text-gray-400" />
                      <a href={`tel:${selectedSubmission.phone}`} className="text-primary-600 hover:underline">
                        {selectedSubmission.phone}
                      </a>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <div className="flex items-center text-gray-900">
                    <Calendar size={16} className="mr-2 text-gray-400" />
                    {new Date(selectedSubmission.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Subject */}
              {selectedSubmission.subject && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <p className="text-gray-900 font-medium">{selectedSubmission.subject}</p>
                </div>
              )}

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <div className="bg-gray-50 rounded-lg p-4 text-gray-900 whitespace-pre-wrap">
                  {selectedSubmission.message}
                </div>
              </div>

              {/* Status Update */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="flex items-center space-x-2">
                  {(['unread', 'read', 'replied', 'archived'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() =>
                        updateStatusMutation.mutate({ id: selectedSubmission.id, status })
                      }
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        selectedSubmission.status === status
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this submission?')) {
                      deleteMutation.mutate(selectedSubmission.id);
                    }
                  }}
                  className="btn btn-secondary text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="btn btn-primary"
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
