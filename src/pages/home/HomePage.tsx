import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight,
  Users,
  UserCheck,
  MapPin,
  Award,
  Briefcase,
  BookOpen,
  GraduationCap,
  Leaf,
  Home,
  Heart,
  Target,
  Zap,
  TrendingUp,
  Globe,
  Shield,
  Star
} from 'lucide-react';
import { heroSliderApi, focusAreaApi, statisticApi } from '../../api/cms';
import { blogsApi } from '../../api/blogs';
import { eventsApi, projectsApi } from '../../api/events-projects';
import { Calendar as CalendarIcon } from 'lucide-react';
import { getImageUrl } from '../../utils/helpers';

// Icon mapping function
const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, any> = {
    'users': Users,
    'user-check': UserCheck,
    'map-pin': MapPin,
    'award': Award,
    'briefcase': Briefcase,
    'book-open': BookOpen,
    'graduation-cap': GraduationCap,
    'leaf': Leaf,
    'home': Home,
    'heart': Heart,
    'target': Target,
    'zap': Zap,
    'trending-up': TrendingUp,
    'globe': Globe,
    'shield': Shield,
    'star': Star,
    'female': Users, // Using Users as fallback for female
  };
  
  return iconMap[iconName.toLowerCase()] || null;
};

export const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animatedStats, setAnimatedStats] = useState<Record<number, number>>({});

  // Fetch CMS data
  const { data: heroSliders } = useQuery({
    queryKey: ['hero-sliders-active'],
    queryFn: heroSliderApi.getAllActive,
  });

  const { data: focusAreas } = useQuery({
    queryKey: ['focus-areas-active'],
    queryFn: focusAreaApi.getAllActive,
  });

  const { data: statistics } = useQuery({
    queryKey: ['statistics-active'],
    queryFn: statisticApi.getAllActive,
  });

  const { data: recentBlogsData } = useQuery({
    queryKey: ['recent-blogs'],
    queryFn: () => blogsApi.getAll({ page: 1, limit: 3, status: 'published' }),
  });

  const { data: upcomingEvents } = useQuery({
    queryKey: ['upcoming-events'],
    queryFn: eventsApi.getUpcoming,
  });

  const { data: featuredProjects } = useQuery({
    queryKey: ['featured-projects'],
    queryFn: projectsApi.getFeatured,
  });

  const recentBlogs = recentBlogsData?.data || [];

  // Auto-play hero slider
  useEffect(() => {
    if (!heroSliders || heroSliders.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSliders.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [heroSliders]);

  // Animate statistics on mount
  useEffect(() => {
    if (!statistics) return;

    statistics.forEach((stat) => {
      const numericValue = parseInt(stat.value.replace(/[^0-9]/g, ''));
      if (isNaN(numericValue)) return;

      let current = 0;
      const increment = Math.ceil(numericValue / 50);
      const timer = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
          current = numericValue;
          clearInterval(timer);
        }
        setAnimatedStats((prev) => ({ ...prev, [stat.id]: current }));
      }, 30);
    });
  }, [statistics]);

  const nextSlide = () => {
    if (!heroSliders) return;
    setCurrentSlide((prev) => (prev + 1) % heroSliders.length);
  };

  const prevSlide = () => {
    if (!heroSliders) return;
    setCurrentSlide((prev) => (prev - 1 + heroSliders.length) % heroSliders.length);
  };

  return (
    <div className="bg-white">
      {/* Hero Slider Section */}
      <section className="relative h-[650px] md:h-[700px] overflow-hidden">
        {heroSliders && heroSliders.length > 0 ? (
          <>
            {heroSliders.map((slider, index) => (
              <div
                key={slider.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transform scale-105"
                  style={{ backgroundImage: `url(${slider.image_url})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
                </div>
                <div className="relative h-full flex items-center text-white">
                  <div className="container mx-auto px-6 md:px-12 max-w-7xl">
                    <div className="max-w-3xl">
                      <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-in">
                        {slider.title}
                      </h1>
                      {slider.subtitle && (
                        <p className="text-lg md:text-2xl mb-10 leading-relaxed text-gray-100 animate-fade-in-delay">
                          {slider.subtitle}
                        </p>
                      )}
                      {slider.button_text && slider.button_url && (
                        <Link
                          to={slider.button_url}
                          className="inline-flex items-center btn btn-accent btn-lg text-lg px-8 py-4 animate-fade-in-delay-2"
                        >
                          {slider.button_text}
                          <ArrowRight className="ml-3" size={22} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Navigation Arrows */}
            {heroSliders.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white p-4 rounded-full transition-all duration-300 z-10 hover:scale-110"
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white p-4 rounded-full transition-all duration-300 z-10 hover:scale-110"
                >
                  <ChevronRight size={28} />
                </button>

                {/* Dots */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
                  {heroSliders.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === currentSlide ? 'bg-accent-500 w-10' : 'bg-white/60 w-2 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          // Fallback hero if no sliders
          <div className="h-full bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white flex items-center">
            <div className="container mx-auto px-6 md:px-12 max-w-7xl">
              <div className="max-w-3xl">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">Brighten Bangladesh</h1>
                <p className="text-xl md:text-2xl mb-10 leading-relaxed text-gray-100">
                  Empowering communities through education, collaboration, and positive change
                </p>
                <Link to="/register" className="inline-flex items-center btn btn-accent btn-lg text-lg px-8 py-4">
                  Join Us Today
                  <ArrowRight className="ml-3" size={22} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Statistics Section */}
      {statistics && statistics.length > 0 && (
        <section className="relative bg-gradient-to-br from-primary-50 via-white to-accent-50 py-24 overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 w-72 h-72 bg-primary-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-500 rounded-full blur-3xl"></div>
          </div>
          
          <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-10">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="text-4xl md:text-5xl font-bold mb-5 text-gray-900">Our Impact</h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                Making a difference in communities across Bangladesh
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {statistics
                .sort((a, b) => a.display_order - b.display_order)
                .map((stat, index) => (
                  <div 
                    key={stat.id} 
                    className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 group border border-gray-100 hover:border-primary-200 animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start space-x-5">
                      {stat.icon && (() => {
                        const IconComponent = getIconComponent(stat.icon);
                        return IconComponent ? (
                          <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                            <IconComponent className="w-8 h-8" />
                          </div>
                        ) : null;
                      })()}
                      <div className="flex-1 min-w-0">
                        <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-300">
                          {stat.value.includes('+') || stat.value.includes('%') || isNaN(parseInt(stat.value))
                            ? stat.value
                            : (animatedStats[stat.id] || 0).toLocaleString() + '+'}
                        </div>
                        <div className="text-base md:text-lg text-gray-600 font-semibold leading-snug">
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Focus Areas Section */}
      {focusAreas && focusAreas.length > 0 && (
        <section className="relative py-28 bg-gradient-to-br from-gray-50 via-primary-50/30 to-accent-50/30 overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-400 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-accent-400 rounded-full blur-3xl"></div>
          </div>
          
          <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-10">
            <div className="text-center mb-20 animate-fade-in">
              <div className="inline-block mb-4 px-6 py-2 bg-gradient-to-r from-primary-100 to-accent-100 rounded-full">
                <span className="text-primary-700 font-semibold text-sm uppercase tracking-wider">Our Mission</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 leading-tight">
                Focus <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600">Areas</span>
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                We work across multiple sectors to create lasting impact in communities
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {focusAreas
                .sort((a, b) => a.display_order - b.display_order)
                .map((area, index) => (
                  <div
                    key={area.id}
                    className="group relative bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 animate-slide-up hover:-translate-y-2"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Card gradient border effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-accent-500 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl -z-10"></div>
                    <div className="absolute inset-[2px] bg-white rounded-2xl z-0"></div>
                    
                    {area.image_url && (
                      <div className="h-72 overflow-hidden relative">
                        <img
                          src={getImageUrl(area.image_url)}
                          alt={area.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                        
                        {/* Icon overlay on image */}
                        {area.icon && (() => {
                          const IconComponent = getIconComponent(area.icon);
                          return IconComponent ? (
                            <div className="absolute top-6 right-6 w-16 h-16 bg-white/95 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                              <IconComponent className="w-8 h-8 text-primary-600" />
                            </div>
                          ) : null;
                        })()}
                      </div>
                    )}
                    
                    <div className="relative p-8 z-10">
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary-600 group-hover:to-accent-600 transition-all duration-300">
                        {area.title}
                      </h3>
                      <p className="text-gray-600 mb-8 leading-relaxed text-base line-clamp-3">
                        {area.short_description || area.full_description}
                      </p>
                      
                      <Link
                        to={`/focus-areas/${area.slug}`}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-accent-600 hover:to-accent-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group/link"
                      >
                        Learn More
                        <ArrowRight className="ml-2 group-hover/link:translate-x-1 transition-transform duration-300" size={20} />
                      </Link>
                    </div>
                    
                    {/* Bottom gradient accent */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Events Section */}
      {upcomingEvents && upcomingEvents.length > 0 && (
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6 md:px-12 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-5 text-gray-900">Latest Events</h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                Join us in our upcoming events and be part of the change
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingEvents.slice(0, 3).map((event, index) => (
                <div key={event.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2" style={{ animationDelay: `${index * 0.1}s` }}>
                  {event.image_url && (
                    <div className="h-56 overflow-hidden">
                      <img src={getImageUrl(event.image_url)} alt={event.title} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-primary-600 mb-3">
                      <CalendarIcon size={16} />
                      <span>{new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{event.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{event.short_description}</p>
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <MapPin size={16} />
                        <span>{event.location}</span>
                      </div>
                    )}
                    <Link to={`/events/${event.slug}`} className="text-primary-600 hover:text-accent-500 font-semibold inline-flex items-center group">
                      Learn More
                      <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" size={18} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link to="/events" className="btn btn-primary btn-lg">View All Events</Link>
            </div>
          </div>
        </section>
      )}

      {/* Our Projects Section */}
      {featuredProjects && featuredProjects.length > 0 && (
        <section className="py-24 bg-gradient-to-br from-gray-50 via-primary-50/30 to-accent-50/30">
          <div className="container mx-auto px-6 md:px-12 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-5 text-gray-900">Our Projects</h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                Discover the impactful projects we're working on across Bangladesh
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProjects.map((project, index) => (
                <div key={project.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2" style={{ animationDelay: `${index * 0.1}s` }}>
                  {project.image_url && (
                    <div className="h-56 overflow-hidden relative">
                      <img src={getImageUrl(project.image_url)} alt={project.title} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                      <div className="absolute top-4 right-4 px-3 py-1 bg-white rounded-full text-sm font-semibold text-primary-600">
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </div>
                    </div>
                  )}
                  <div className="p-6">
                    {project.category && (
                      <span className="text-sm text-primary-600 font-semibold mb-2 block">{project.category}</span>
                    )}
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{project.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{project.short_description}</p>
                    {(project.location || project.beneficiaries) && (
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        {project.location && (
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            <span>{project.location}</span>
                          </div>
                        )}
                        {project.beneficiaries && (
                          <div className="flex items-center gap-1">
                            <Users size={14} />
                            <span>{project.beneficiaries}+</span>
                          </div>
                        )}
                      </div>
                    )}
                    <Link to={`/projects/${project.slug}`} className="text-primary-600 hover:text-accent-500 font-semibold inline-flex items-center group">
                      Learn More
                      <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" size={18} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link to="/projects" className="btn btn-primary btn-lg">View All Projects</Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-2xl overflow-hidden">
            <div className="grid md:grid-cols-5">
              <div className="md:col-span-3 p-10 md:p-16 text-white">
                <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                  Ready to Make a Difference?
                </h2>
                <p className="text-lg md:text-xl mb-10 text-gray-100 leading-relaxed">
                  Join thousands of members who are actively contributing to building a
                  brighter future for Bangladesh.
                </p>
                <div className="flex flex-col sm:flex-row gap-5">
                  <Link to="/register" className="btn btn-accent btn-lg text-lg px-8 py-4">
                    Get Started Now
                  </Link>
                  <Link to="/about" className="btn btn-secondary btn-lg text-lg px-8 py-4">
                    Learn More
                  </Link>
                </div>
              </div>
              <div className="hidden md:block md:col-span-2 bg-gradient-to-br from-primary-700 to-primary-900 p-10 md:p-12">
                <div className="h-full flex flex-col justify-center space-y-8">
                  <div className="flex items-start space-x-4 group">
                    <div className="bg-accent-500 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-white">
                      <h3 className="font-bold text-lg mb-1">Make an Impact</h3>
                      <p className="text-sm text-gray-200">
                        Contribute to meaningful projects
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 group">
                    <div className="bg-accent-500 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                    </div>
                    <div className="text-white">
                      <h3 className="font-bold text-lg mb-1">Join Community</h3>
                      <p className="text-sm text-gray-200">
                        Connect with like-minded people
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 group">
                    <div className="bg-accent-500 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z" />
                      </svg>
                    </div>
                    <div className="text-white">
                      <h3 className="font-bold text-lg mb-1">Get Recognition</h3>
                      <p className="text-sm text-gray-200">
                        Earn badges and certificates
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Blogs Preview */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-block px-6 py-2 bg-primary-100 rounded-full mb-6">
              <span className="text-primary-700 font-semibold text-sm uppercase tracking-wider">Latest Updates</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold mb-5 bg-gradient-to-r from-primary-600 via-accent-600 to-primary-800 bg-clip-text text-transparent">
              Blogs & Articles
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Read inspiring stories, insights and transformative updates from our community
            </p>
            <Link
              to="/blogs"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
            >
              View All Articles
              <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform duration-300" size={20} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {recentBlogs.length > 0 ? (
              recentBlogs.map((blog: any, i: number) => (
                <div
                  key={blog.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group transform hover:-translate-y-3 animate-fade-in border-2 border-gray-100 hover:border-primary-200"
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  <div className="h-64 bg-gradient-to-br from-primary-400 to-primary-600 relative overflow-hidden">
                    {blog.coverImage ? (
                      <img 
                        src={blog.coverImage} 
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-600"></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xs font-bold text-white bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-1.5 rounded-full shadow-md">
                        Published
                      </span>
                      <span className="text-sm text-gray-500 font-medium">
                        {new Date(blog.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold mb-4 text-gray-900 group-hover:text-primary-600 transition-colors duration-300 leading-tight line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-gray-600 text-base leading-relaxed mb-6 line-clamp-3">
                      {blog.summary || 'Read this inspiring story from our community...'}
                    </p>
                    <Link
                      to={`/blogs/${blog.slug}`}
                      className="text-primary-600 hover:text-accent-500 font-semibold inline-flex items-center group/link transition-colors duration-300"
                    >
                      Read More
                      <ArrowRight className="ml-2 group-hover/link:translate-x-2 transition-transform duration-300" size={16} />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-500 group animate-fade-in"
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  <div className="h-56 bg-gradient-to-br from-primary-400 to-primary-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500"></div>
                  </div>
                  <div className="p-7">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                        Coming Soon
                      </span>
                      <span className="text-sm text-gray-500">Dec {10 - i}, 2025</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-primary-600 transition-colors duration-300 leading-tight">
                      Latest Blog Posts
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-5">
                      Check back soon for inspiring stories and updates from our community.
                    </p>
                    <Link
                      to="/blogs"
                      className="text-primary-600 hover:text-accent-500 font-semibold inline-flex items-center group/link transition-colors duration-300"
                    >
                      Read More
                      <ArrowRight className="ml-2 group-hover/link:translate-x-2 transition-transform duration-300" size={16} />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
