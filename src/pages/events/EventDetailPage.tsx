import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, MapPin, Users, ExternalLink, ArrowLeft, User as UserIcon, Clock, Ban } from 'lucide-react';
import { format } from 'date-fns';
import { eventsApi, eventRegistrationsApi } from '../../api/events-projects';
import { useAuthStore } from '../../stores/authStore';
import { useState, useEffect } from 'react';
import { getImageUrl } from '../../utils/helpers';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', slug],
    queryFn: () => eventsApi.getBySlug(slug!),
    enabled: !!slug,
  });

  const { data: registrations } = useQuery({
    queryKey: ['event-registrations', event?.id],
    queryFn: () => eventRegistrationsApi.getByEvent(event!.id),
    enabled: !!event?.id,
  });

  const { data: userRegistration } = useQuery({
    queryKey: ['my-event-registration', event?.id],
    queryFn: () => eventRegistrationsApi.getMyRegistration(event!.id),
    enabled: !!event?.id && !!user,
  });

  const registerMutation = useMutation({
    mutationFn: () => eventRegistrationsApi.register(event!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-registrations', event!.id] });
      queryClient.invalidateQueries({ queryKey: ['my-event-registration', event!.id] });
      setRegistrationError(null);
    },
    onError: (error: any) => {
      setRegistrationError(error.response?.data?.message || 'Failed to register for event');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => eventRegistrationsApi.cancel(event!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-registrations', event!.id] });
      queryClient.invalidateQueries({ queryKey: ['my-event-registration', event!.id] });
      setRegistrationError(null);
    },
    onError: (error: any) => {
      setRegistrationError(error.response?.data?.message || 'Failed to cancel registration');
    },
  });

  // Countdown timer
  useEffect(() => {
    if (!event) return;

    const calculateTimeLeft = () => {
      const eventDate = new Date(event.event_date).getTime();
      const nowTs = new Date().getTime();
      const difference = eventDate - nowTs;

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return null;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [event]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading event details...</div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Event not found</h2>
          <button
            onClick={() => navigate('/events')}
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            ← Back to Events
          </button>
        </div>
      </div>
    );
  }

  const currentParticipants = registrations?.filter(r => r.status === 'approved').length || 0;
  const isFull = event.max_participants ? currentParticipants >= event.max_participants : false;
  const isRegistered = userRegistration && userRegistration.status !== 'cancelled';
  const eventDate = new Date(event.event_date);
  const registrationStart = event.registration_start ? new Date(event.registration_start) : null;
  const registrationDeadline = event.registration_deadline ? new Date(event.registration_deadline) : null;
  const now = new Date();
  const isEventInPast = eventDate < now;
  const isRegistrationClosed =
    event.status === 'completed' ||
    event.status === 'cancelled' ||
    isEventInPast ||
    !!(registrationDeadline && registrationDeadline < now);
  const isRegistrationNotOpen = !!(registrationStart && registrationStart > now);
  const canRegister = user && !isRegistered && !isFull && !isRegistrationClosed && !isRegistrationNotOpen;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/events')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </button>
        </div>
      </div>

      {/* Event Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Event Image */}
            <div className="rounded-lg overflow-hidden bg-gray-200 h-96">
              {event.image_url ? (
                <img
                  src={getImageUrl(event.image_url)}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Calendar className="w-24 h-24 text-gray-400" />
                </div>
              )}
            </div>

            {/* Event Info */}
            <div>
              {event.is_featured && (
                <span className="inline-block bg-orange-100 text-orange-600 text-sm font-semibold px-3 py-1 rounded-full mb-4">
                  Featured Event
                </span>
              )}

              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                    event.status === 'completed'
                      ? 'bg-gray-100 text-gray-700'
                      : event.status === 'cancelled'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-teal-100 text-teal-700'
                  }`}
                >
                  {(event.status === 'completed' || isEventInPast) && 'Completed'}
                  {event.status === 'cancelled' && 'Cancelled'}
                  {event.status === 'upcoming' && !isEventInPast && 'Upcoming'}
                  {event.status === 'ongoing' && !isEventInPast && 'Ongoing'}
                </span>
                {!event.is_active && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                    <Ban className="w-3 h-3" /> Disabled
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {event.title}
              </h1>
              
              <p className="text-xl text-gray-600 mb-6">
                {event.short_description}
              </p>

              {/* Countdown Timer */}
              {timeLeft && (
                <div className="mb-6 p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg border border-teal-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-teal-600" />
                    <span className="font-semibold text-gray-900">Event Starts In:</span>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-teal-600">{timeLeft.days}</div>
                      <div className="text-xs text-gray-600 uppercase">Days</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-teal-600">{timeLeft.hours}</div>
                      <div className="text-xs text-gray-600 uppercase">Hours</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-teal-600">{timeLeft.minutes}</div>
                      <div className="text-xs text-gray-600 uppercase">Minutes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-teal-600">{timeLeft.seconds}</div>
                      <div className="text-xs text-gray-600 uppercase">Seconds</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Event Meta */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-teal-600 mt-1" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {format(new Date(event.event_date), 'EEEE, MMMM dd, yyyy')}
                    </div>
                    <div className="text-gray-600">
                      {format(new Date(event.event_date), 'hh:mm a')}
                    </div>
                  </div>
                </div>

                {event.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-teal-600 mt-1" />
                    <div className="font-medium text-gray-900">{event.location}</div>
                  </div>
                )}

                {event.organizer && (
                  <div className="flex items-start gap-3">
                    <UserIcon className="w-5 h-5 text-teal-600 mt-1" />
                    <div>
                      <div className="text-sm text-gray-500">Organized by</div>
                      <div className="font-medium text-gray-900">{event.organizer}</div>
                    </div>
                  </div>
                )}

                {event.max_participants && (
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-teal-600 mt-1" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {currentParticipants} / {event.max_participants} participants
                      </div>
                      {isFull && (
                        <div className="text-sm text-orange-600 font-medium">Event is full</div>
                      )}
                    </div>
                  </div>
                )}

                {event.registration_start && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-teal-600 mt-1" />
                    <div>
                      <div className="text-sm text-gray-500">Registration opens</div>
                      <div className="font-medium text-gray-900">
                        {format(new Date(event.registration_start), 'EEE, MMM dd, yyyy • hh:mm a')}
                      </div>
                    </div>
                  </div>
                )}

                {event.registration_deadline && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-teal-600 mt-1" />
                    <div>
                      <div className="text-sm text-gray-500">Registration closes</div>
                      <div className="font-medium text-gray-900">
                        {format(new Date(event.registration_deadline), 'EEE, MMM dd, yyyy • hh:mm a')}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Registration Status & Actions */}
              {registrationError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {registrationError}
                </div>
              )}

              {(isRegistrationClosed || isRegistrationNotOpen) && (
                <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                  {(event.status === 'completed' || isEventInPast) && 'This event has been completed. Registration is closed.'}
                  {event.status === 'cancelled' && 'This event was cancelled. Registration is closed.'}
                  {registrationDeadline && registrationDeadline < now &&
                    event.status !== 'completed' &&
                    event.status !== 'cancelled' &&
                    'Registration deadline has passed.'}
                  {isRegistrationNotOpen && 'Registration has not opened yet.'}
                </div>
              )}

              {isRegistered && (
                <div className={`mb-4 p-4 rounded-lg border ${
                  userRegistration.status === 'approved' 
                    ? 'bg-green-50 border-green-200' 
                    : userRegistration.status === 'pending'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`font-medium ${
                        userRegistration.status === 'approved' 
                          ? 'text-green-900' 
                          : userRegistration.status === 'pending'
                          ? 'text-yellow-900'
                          : 'text-red-900'
                      }`}>
                        {userRegistration.status === 'approved' && "You're registered!"}
                        {userRegistration.status === 'pending' && "Registration Pending"}
                        {userRegistration.status === 'rejected' && "Registration Rejected"}
                      </div>
                      <div className={`text-sm ${
                        userRegistration.status === 'approved' 
                          ? 'text-green-700' 
                          : userRegistration.status === 'pending'
                          ? 'text-yellow-700'
                          : 'text-red-700'
                      }`}>
                        {userRegistration.status === 'pending' 
                          ? 'Waiting for admin approval'
                          : userRegistration.status === 'rejected'
                          ? 'Your registration was not approved'
                          : 'Your registration is confirmed'}
                      </div>
                    </div>
                    {(userRegistration.status === 'pending' || userRegistration.status === 'approved') && (
                      <button
                        onClick={() => cancelMutation.mutate()}
                        disabled={cancelMutation.isPending}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        Cancel Registration
                      </button>
                    )}
                  </div>
                </div>
              )}

              {canRegister && (
                <div className="mb-4">
                  <button
                    onClick={() => registerMutation.mutate()}
                    disabled={registerMutation.isPending}
                    className="w-full py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 mb-2"
                  >
                    {registerMutation.isPending ? 'Registering...' : 'Register for Event'}
                  </button>
                  <p className="text-sm text-gray-600 text-center">
                    Your registration will be pending until approved by an admin
                  </p>
                </div>
              )}

              {!user && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 mb-4">
                  Please <a href="/login" className="underline font-medium">log in</a> to register for this event
                </div>
              )}

              {event.registration_link && (
                <a
                  href={event.registration_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
                >
                  External Registration Link
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Event Description */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">About This Event</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 whitespace-pre-line">{event.full_description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
