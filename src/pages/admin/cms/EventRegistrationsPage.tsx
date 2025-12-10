import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Users, CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import { format } from 'date-fns';
import { eventsApi, eventRegistrationsApi } from '../../../api/events-projects';

export function EventRegistrationsPage() {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: events } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventsApi.getAll(),
  });

  const { data: registrations, isLoading, error: registrationsError } = useQuery({
    queryKey: ['event-registrations', selectedEventId],
    queryFn: () => eventRegistrationsApi.getByEvent(selectedEventId!),
    enabled: !!selectedEventId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ eventId, userId, status }: { eventId: number; userId: number; status: 'approved' | 'rejected' }) =>
      eventRegistrationsApi.updateStatus(eventId, userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-registrations', selectedEventId] });
    },
  });

  const selectedEvent = events?.find(e => Number(e.id) === selectedEventId);
  const approvedCount = registrations?.filter(r => r.status === 'approved').length || 0;

  const exportToCSV = () => {
    if (!registrations || !selectedEvent) return;

    const approvedRegistrations = registrations.filter(r => r.status === 'approved');
    
    // CSV headers
    const headers = ['Name', 'Email', 'Organization', 'Registered At', 'Status'];
    
    // CSV rows
    const rows = approvedRegistrations.map(reg => [
      reg.user?.name || '',
      reg.user?.email || '',
      reg.user?.organization || '',
      format(new Date(reg.registered_at), 'MMM dd, yyyy hh:mm a'),
      reg.status
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
    link.setAttribute('download', `${selectedEvent.slug}-registrations-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Event Registrations</h1>
        <p className="text-gray-600 mt-1">Manage participant registrations for events</p>
      </div>

      {/* Event Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Event
        </label>
        <select
          value={selectedEventId || ''}
          onChange={(e) => setSelectedEventId(Number(e.target.value) || null)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value="">Choose an event...</option>
          {events?.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title} - {format(new Date(event.event_date), 'MMM dd, yyyy')}
            </option>
          ))}
        </select>
      </div>

      {/* Event Info & Registrations */}
      {selectedEvent && (
        <>
          {/* Event Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-teal-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Event Date</div>
                  <div className="font-semibold">{format(new Date(selectedEvent.event_date), 'MMM dd, yyyy')}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Participants</div>
                  <div className="font-semibold">
                    {approvedCount} / {selectedEvent.max_participants || '∞'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Approved</div>
                  <div className="font-semibold">{approvedCount}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Pending</div>
                  <div className="font-semibold">
                    {registrations?.filter(r => r.status === 'pending').length || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Registrations Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Registrations List</h2>
              {registrations && registrations.filter(r => r.status === 'approved').length > 0 && (
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export Approved (CSV)
                </button>
              )}
            </div>

            {registrationsError ? (
              <div className="p-8 text-center text-red-500">
                Error loading registrations: {(registrationsError as any).message}
              </div>
            ) : isLoading ? (
              <div className="p-8 text-center text-gray-500">Loading registrations...</div>
            ) : registrations && registrations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Participant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Organization
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registered At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {registrations.map((registration) => (
                      <tr key={registration.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-medium text-gray-900">{registration.user?.name}</div>
                            <div className="text-sm text-gray-500">{registration.user?.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {registration.user?.organization || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(registration.registered_at), 'MMM dd, yyyy hh:mm a')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(registration.status)}`}>
                            {registration.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {registration.status === 'pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateStatusMutation.mutate({
                                  eventId: selectedEventId!,
                                  userId: registration.user_id,
                                  status: 'approved'
                                })}
                                disabled={updateStatusMutation.isPending}
                                className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => updateStatusMutation.mutate({
                                  eventId: selectedEventId!,
                                  userId: registration.user_id,
                                  status: 'rejected'
                                })}
                                disabled={updateStatusMutation.isPending}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </div>
                          )}
                          {registration.status === 'approved' && (
                            <button
                              onClick={() => updateStatusMutation.mutate({
                                eventId: selectedEventId!,
                                userId: registration.user_id,
                                status: 'rejected'
                              })}
                              disabled={updateStatusMutation.isPending}
                              className="text-red-600 hover:text-red-900 text-xs disabled:opacity-50"
                            >
                              Revoke
                            </button>
                          )}
                          {registration.status === 'rejected' && (
                            <button
                              onClick={() => updateStatusMutation.mutate({
                                eventId: selectedEventId!,
                                userId: registration.user_id,
                                status: 'approved'
                              })}
                              disabled={updateStatusMutation.isPending}
                              className="text-green-600 hover:text-green-900 text-xs disabled:opacity-50"
                            >
                              Approve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                No registrations yet for this event
              </div>
            )}
          </div>
        </>
      )}

      {!selectedEventId && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Select an event to view and manage registrations</p>
        </div>
      )}
    </div>
  );
}
