import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, FileText, Settings as SettingsIcon, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSettings } from '@/contexts/SettingsContext';
import { canManageContent } from '@/utils/helpers';

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

  const getImageUrl = (path: string | undefined) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `http://localhost:3000${path}`;
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-md">
      <nav className="container mx-auto px-6 md:px-12 max-w-7xl py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity duration-300">
            {settings?.siteLogo ? (
              <img src={getImageUrl(settings.siteLogo) || ''} alt={settings.siteName || 'Logo'} className="h-14 md:h-16 w-auto object-contain" />
            ) : (
              <span className="text-2xl md:text-3xl font-bold text-primary-600">
                {settings?.siteName || 'Brighten Bangladesh'}
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-10">
            <Link to="/" className="text-gray-700 hover:text-primary-600 font-semibold text-base transition-all duration-300 hover:scale-110 relative group">
              <span>Home</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-primary-600 font-semibold text-base transition-all duration-300 hover:scale-110 relative group">
              <span>About</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/blogs" className="text-gray-700 hover:text-primary-600 font-semibold text-base transition-all duration-300 hover:scale-110 relative group">
              <span>Blogs & Articles</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/events" className="text-gray-700 hover:text-primary-600 font-semibold text-base transition-all duration-300 hover:scale-110 relative group">
              <span>Events</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/projects" className="text-gray-700 hover:text-primary-600 font-semibold text-base transition-all duration-300 hover:scale-110 relative group">
              <span>Projects</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/magazines" className="text-gray-700 hover:text-primary-600 font-semibold text-base transition-all duration-300 hover:scale-110 relative group">
              <span>Magazines</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>

            {isAuthenticated ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 font-medium transition-colors duration-300"
                >
                  <User size={20} />
                  <span>{user?.name || 'Profile'}</span>
                  <ChevronDown size={16} className={`transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User size={18} />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      to="/my-blogs"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FileText size={18} />
                      <span>My Blogs</span>
                    </Link>
                    {user && canManageContent(user.role) && (
                      <Link
                        to="/admin/cms"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <SettingsIcon size={18} />
                        <span>CMS Panel</span>
                      </Link>
                    )}
                    <hr className="my-2 border-gray-200" />
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary text-sm px-5 py-2.5">
                  Login
                </Link>
                <Link to="/register" className="btn btn-accent text-sm px-5 py-2.5">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-primary-600 hover:text-primary-700 transition-colors duration-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden mt-6 pb-4 space-y-4 bg-gradient-to-b from-gray-50 to-white rounded-xl p-6 shadow-inner">
            <Link
              to="/"
              className="block text-gray-700 hover:text-primary-600 font-semibold py-3 px-4 rounded-lg hover:bg-primary-50 transition-all duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/about"
              className="block text-gray-700 hover:text-primary-600 font-semibold py-3 px-4 rounded-lg hover:bg-primary-50 transition-all duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/blogs"
              className="block text-gray-700 hover:text-primary-600 font-semibold py-3 px-4 rounded-lg hover:bg-primary-50 transition-all duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Blogs & Articles
            </Link>
            <Link
              to="/events"
              className="block text-gray-700 hover:text-primary-600 font-semibold py-3 px-4 rounded-lg hover:bg-primary-50 transition-all duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Events
            </Link>
            <Link
              to="/projects"
              className="block text-gray-700 hover:text-primary-600 font-semibold py-3 px-4 rounded-lg hover:bg-primary-50 transition-all duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Projects
            </Link>
            <Link
              to="/magazines"
              className="block text-gray-700 hover:text-primary-600 font-semibold py-3 px-4 rounded-lg hover:bg-primary-50 transition-all duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Magazines
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="block text-gray-700 hover:text-primary-600 font-semibold py-3 px-4 rounded-lg hover:bg-primary-50 transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/my-blogs"
                  className="block text-gray-700 hover:text-primary-600 font-semibold py-3 px-4 rounded-lg hover:bg-primary-50 transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Blogs
                </Link>
                {user && canManageContent(user.role) && (
                  <Link
                    to="/admin/cms"
                    className="block text-gray-700 hover:text-primary-600 font-semibold py-3 px-4 rounded-lg hover:bg-primary-50 transition-all duration-300"
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
                  className="w-full btn btn-primary"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block w-full btn btn-outline"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block w-full btn btn-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};
