import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, Ban } from 'lucide-react';
import { format } from 'date-fns';
import { eventsApi } from '../../api/events-projects';
import { getImageUrl } from '../../utils/helpers';

export default function EventsListPage() {
  const [filter, setFilter] = useState<'all' | 'upcoming'>('upcoming');

  const { data: events, isLoading } = useQuery({
    queryKey: ['events', filter],
    queryFn: () => filter === 'upcoming' ? eventsApi.getUpcoming() : eventsApi.getAllActive(),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading events...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Events</h1>
          <p className="text-xl text-teal-100 max-w-2xl">
            Join us in making a difference. Participate in our community events and initiatives.
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              filter === 'upcoming'
                ? 'bg-teal-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Upcoming Events
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-teal-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Events
          </button>
        </div>

        {/* Events Grid */}
        {events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const isEventInPast = new Date(event.event_date) < new Date();
              return (
                <Link
                  key={event.id}
                  to={`/events/${event.slug}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Event Image */}
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    {event.image_url ? (
                      <img
                        src={getImageUrl(event.image_url)}
                        alt={event.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Calendar className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Event Content */}
                  <div className="p-6">
                    {event.is_featured && (
                      <span className="inline-block bg-orange-100 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                        Featured
                      </span>
                    )}

                    <div className="flex items-center gap-2 mb-3">
                      <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                        event.status === 'completed' || isEventInPast
                          ? 'bg-gray-100 text-gray-700'
                          : event.status === 'cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-teal-100 text-teal-700'
                      }`}>
                        {(event.status === 'completed' || isEventInPast) && 'Completed'}
                        {event.status === 'cancelled' && 'Cancelled'}
                        {event.status === 'upcoming' && 'Upcoming'}
                        {event.status === 'ongoing' && 'Ongoing'}
                      </span>
                      {!event.is_active && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                          <Ban className="w-3 h-3" /> Disabled
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-teal-600 transition-colors">
                      {event.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {event.short_description}
                    </p>

                    {/* Event Meta */}
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{format(new Date(event.event_date), 'MMM dd, yyyy • hh:mm a')}</span>
                      </div>
                      
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      
                      {event.max_participants && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>Max {event.max_participants} participants</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <span className="text-teal-600 font-medium hover:text-teal-700">
                        Learn More →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No events found</p>
          </div>
        )}
      </div>
    </div>
  );
}
