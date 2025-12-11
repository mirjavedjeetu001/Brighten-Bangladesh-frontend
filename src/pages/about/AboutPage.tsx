import { useQuery } from '@tanstack/react-query';
import { aboutPageAPI } from '../../api/about';
import { teamMemberAPI } from '../../api/team-members';
import { Loader } from '../../components/Loader';
import { getImageUrl } from '../../utils/helpers';

export const AboutPage = () => {
  const { data: aboutContent, isLoading, error } = useQuery({
    queryKey: ['about-page'],
    queryFn: aboutPageAPI.getAboutPage,
  });

  const { data: teamMembers, isLoading: teamLoading } = useQuery({
    queryKey: ['team-members-active'],
    queryFn: teamMemberAPI.getActive,
  });

  if (isLoading || teamLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error || !aboutContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to load content</h2>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div 
        className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden"
        style={aboutContent.hero_image ? {
          backgroundImage: `linear-gradient(rgba(22, 101, 52, 0.85), rgba(21, 94, 117, 0.85)), url(${getImageUrl(aboutContent.hero_image)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : undefined}
      >
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {aboutContent.hero_title}
            </h1>
            {aboutContent.hero_subtitle && (
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
                {aboutContent.hero_subtitle}
              </p>
            )}
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="white"/>
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Mission & Vision Section */}
        {(aboutContent.mission_title || aboutContent.vision_title) && (
          <div className="mb-20">
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Mission Card */}
              {aboutContent.mission_title && (
                <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-primary-600"></div>
                  <div className="p-8 md:p-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      {aboutContent.mission_title}
                    </h2>
                    {aboutContent.mission_content && (
                      <div 
                        className="text-gray-600 leading-relaxed prose prose-lg max-w-none"
                        dangerouslySetInnerHTML={{ __html: aboutContent.mission_content }}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Vision Card */}
              {aboutContent.vision_title && (
                <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                  <div className="p-8 md:p-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      {aboutContent.vision_title}
                    </h2>
                    {aboutContent.vision_content && (
                      <div 
                        className="text-gray-600 leading-relaxed prose prose-lg max-w-none"
                        dangerouslySetInnerHTML={{ __html: aboutContent.vision_content }}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Values Section */}
        {aboutContent.values_title && (
          <div className="mb-20 max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {aboutContent.values_title}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-primary-600 mx-auto rounded-full"></div>
            </div>
            {aboutContent.values_content && (
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg p-8 md:p-12">
                <div 
                  className="prose prose-lg max-w-none 
                    prose-headings:text-gray-900 prose-headings:font-bold prose-headings:mb-3
                    prose-p:text-gray-600 prose-p:leading-relaxed
                    prose-ul:list-none prose-ul:grid prose-ul:md:grid-cols-2 prose-ul:gap-6
                    prose-li:flex prose-li:items-start prose-li:gap-3
                    prose-li:bg-white prose-li:rounded-xl prose-li:p-6 prose-li:shadow-md
                    prose-li:hover:shadow-xl prose-li:transition-shadow prose-li:duration-300
                    prose-li:before:content-['✓'] prose-li:before:flex-shrink-0
                    prose-li:before:w-8 prose-li:before:h-8 prose-li:before:rounded-lg
                    prose-li:before:bg-gradient-to-br prose-li:before:from-primary-500 prose-li:before:to-primary-600
                    prose-li:before:text-white prose-li:before:flex prose-li:before:items-center prose-li:before:justify-center
                    prose-li:before:font-bold prose-li:before:text-lg"
                  dangerouslySetInnerHTML={{ __html: aboutContent.values_content }}
                />
              </div>
            )}
          </div>
        )}

        {/* Story Section */}
        {aboutContent.story_title && (
          <div className="mb-20 max-w-4xl mx-auto">
            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary-500 to-primary-600"></div>
              <div className="p-8 md:p-12 md:pl-16">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                    {aboutContent.story_title}
                  </h2>
                </div>
                {aboutContent.story_content && (
                  <div 
                    className="text-gray-600 leading-relaxed prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: aboutContent.story_content }}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Team Section Header */}
        {aboutContent.team_title && (
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {aboutContent.team_title}
            </h2>
            {aboutContent.team_subtitle && (
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {aboutContent.team_subtitle}
              </p>
            )}
            <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-primary-600 mx-auto rounded-full mt-6"></div>
          </div>
        )}

        {/* Team Members Grid */}
        {teamMembers && teamMembers.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                <div className="p-8 flex flex-col items-center text-center">
                  {/* Profile Picture */}
                  <div className="relative w-32 h-32 mb-4">
                    <img
                      src={
                        member.user.profilePhoto
                          ? getImageUrl(member.user.profilePhoto)
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(member.user.name)}&size=300&background=166534&color=fff`
                      }
                      alt={member.user.name}
                      className="w-full h-full rounded-full object-cover border-4 border-primary-100 group-hover:border-primary-300 transition-colors duration-300"
                    />
                  </div>
                  
                  {/* Name */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {member.user.name}
                  </h3>
                  
                  {/* Position */}
                  <p className="text-primary-600 font-medium mb-3">{member.role}</p>
                  
                  {/* Department */}
                  {member.category && (
                    <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-700 text-sm rounded-full font-medium">
                      {member.category}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
