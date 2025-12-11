import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, FileText, Settings as SettingsIcon, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSettings } from '@/contexts/SettingsContext';
import { canManageContent, getImageUrl } from '@/utils/helpers';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { settings } = useSettings();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <nav className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl">
        <div className="flex items-center justify-between gap-8 py-3">
          {/* Logo and Site Name */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity duration-300 flex-shrink-0">
            {settings?.siteLogo ? (
              <>
                <img src={getImageUrl(settings.siteLogo) || ''} alt={settings.siteName || 'Logo'} className="h-12 md:h-14 lg:h-16 w-auto object-contain" />
                <span className="hidden md:block text-base lg:text-lg xl:text-xl font-bold text-primary-600 leading-tight whitespace-nowrap">
                  {settings?.siteName || 'Brighten Bangladesh'}
                </span>
              </>
            ) : (
              <span className="text-xl md:text-2xl lg:text-3xl font-bold text-primary-600">
                {settings?.siteName || 'Brighten Bangladesh'}
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8 flex-1 justify-end">
            <Link to="/" className="text-gray-700 hover:text-primary-600 font-medium text-sm xl:text-base transition-colors duration-200 relative group">
              <span>Home</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-primary-600 font-medium text-sm xl:text-base transition-colors duration-200 relative group">
              <span>About</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/blogs" className="text-gray-700 hover:text-primary-600 font-medium text-sm xl:text-base transition-colors duration-200 relative group">
              <span>Blogs & Articles</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/events" className="text-gray-700 hover:text-primary-600 font-medium text-sm xl:text-base transition-colors duration-200 relative group">
              <span>Events</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/projects" className="text-gray-700 hover:text-primary-600 font-medium text-sm xl:text-base transition-colors duration-200 relative group">
              <span>Projects</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/magazines" className="text-gray-700 hover:text-primary-600 font-medium text-sm xl:text-base transition-colors duration-200 relative group">
              <span>Magazines</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>

            {isAuthenticated ? (
              <div className="relative ml-2" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200 rounded-lg hover:bg-gray-50"
                >
                  <User size={18} />
                  <span className="text-sm xl:text-base">{user?.name || 'Profile'}</span>
                  <ChevronDown size={16} className={`transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                    >
                      <User size={18} />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      to="/my-blogs"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                    >
                      <FileText size={18} />
                      <span>My Blogs</span>
                    </Link>
                    {user && canManageContent(user.role) && (
                      <Link
                        to="/admin/cms"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                      >
                        <SettingsIcon size={18} />
                        <span>CMS Panel</span>
                      </Link>
                    )}
                    <hr className="my-2 border-gray-100" />
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-all duration-200">
                  Login
                </Link>
                <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-primary-600 hover:text-primary-700 transition-colors p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 space-y-1 border-t border-gray-100 pt-4">
            <Link
              to="/"
              className="block text-gray-700 hover:text-primary-600 font-medium py-2.5 px-4 rounded-lg hover:bg-primary-50 transition-all duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/about"
              className="block text-gray-700 hover:text-primary-600 font-medium py-2.5 px-4 rounded-lg hover:bg-primary-50 transition-all duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/blogs"
              className="block text-gray-700 hover:text-primary-600 font-medium py-2.5 px-4 rounded-lg hover:bg-primary-50 transition-all duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Blogs & Articles
            </Link>
            <Link
              to="/events"
              className="block text-gray-700 hover:text-primary-600 font-medium py-2.5 px-4 rounded-lg hover:bg-primary-50 transition-all duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Events
            </Link>
            <Link
              to="/projects"
              className="block text-gray-700 hover:text-primary-600 font-medium py-2.5 px-4 rounded-lg hover:bg-primary-50 transition-all duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Projects
            </Link>
            <Link
              to="/magazines"
              className="block text-gray-700 hover:text-primary-600 font-medium py-2.5 px-4 rounded-lg hover:bg-primary-50 transition-all duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Magazines
            </Link>

            {isAuthenticated ? (
              <>
                <div className="border-t border-gray-100 my-2 pt-2">
                  <Link
                    to="/profile"
                    className="block text-gray-700 hover:text-primary-600 font-medium py-2.5 px-4 rounded-lg hover:bg-primary-50 transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/my-blogs"
                    className="block text-gray-700 hover:text-primary-600 font-medium py-2.5 px-4 rounded-lg hover:bg-primary-50 transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Blogs
                  </Link>
                  {user && canManageContent(user.role) && (
                    <Link
                      to="/admin/cms"
                      className="block text-gray-700 hover:text-primary-600 font-medium py-2.5 px-4 rounded-lg hover:bg-primary-50 transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      CMS Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full mt-2 px-4 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-all duration-200"
                >
                  Logout
                </button>
                </div>
              </>
            ) : (
              <div className="border-t border-gray-100 my-2 pt-2 space-y-2">
                <Link
                  to="/login"
                  className="block w-full px-4 py-2.5 text-center font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block w-full px-4 py-2.5 text-center font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};
