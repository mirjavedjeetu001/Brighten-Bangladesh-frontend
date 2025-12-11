import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SettingsProvider } from './contexts/SettingsContext';
import { Preloader } from './components/Preloader';

// Pages
import { HomePage } from './pages/home/HomePage';
import { AboutPage } from './pages/about/AboutPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { BlogsListPage } from './pages/blogs/BlogsListPage';
import { BlogDetailPage } from './pages/blogs/BlogDetailPage';
import { MagazinesPage } from './pages/magazines/MagazinesPage';
import { FocusAreaDetailPage } from './pages/focus-areas/FocusAreaDetailPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { MyBlogsPage } from './pages/profile/MyBlogsPage';
import { CMSLayout } from './pages/admin/cms/CMSLayout';
import { CMSDashboard } from './pages/admin/cms/CMSDashboard';
import { CMSUsersPage } from './pages/admin/cms/CMSUsersPage';
import { CMSAccessManagementPage } from './pages/admin/cms/CMSAccessManagementPage';
import { CMSBlogsPage } from './pages/admin/cms/CMSBlogsPage';
import { HeroSlidersPage } from './pages/admin/cms/HeroSlidersPage';
import { AboutContentPage } from './pages/admin/cms/AboutContentPage';
import { PagesPage } from './pages/admin/cms/PagesPage';
import { FocusAreasPage } from './pages/admin/cms/FocusAreasPage';
import { StatisticsPage } from './pages/admin/cms/StatisticsPage';
import { ContactSubmissionsPage } from './pages/admin/cms/ContactSubmissionsPage';
import { CMSSettingsPage } from './pages/admin/cms/CMSSettingsPage';
import { BlogCommentsPage } from './pages/admin/cms/BlogCommentsPage';
import { EventsPage } from './pages/admin/cms/EventsPage';
import { ProjectsPage } from './pages/admin/cms/ProjectsPage';
import { EventRegistrationsPage } from './pages/admin/cms/EventRegistrationsPage';
import { ApprovedUsersPage } from './pages/admin/cms/ApprovedUsersPage';
import { TeamMembersPage } from './pages/admin/cms/TeamMembersPage';
import EventsListPage from './pages/events/EventsListPage';
import EventDetailPage from './pages/events/EventDetailPage';
import ProjectsListPage from './pages/projects/ProjectsListPage';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const { loadUser, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadUser();
    }
    
    // Show preloader for 1.5 seconds
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Preloader />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <Toaster position="top-right" />
        <BrowserRouter>
          <Routes>
          {/* Auth routes without layout */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Public routes with layout */}
          <Route
            path="/"
            element={
              <Layout>
                <HomePage />
              </Layout>
            }
          />
          <Route
            path="/about"
            element={
              <Layout>
                <AboutPage />
              </Layout>
            }
          />
          <Route
            path="/blogs"
            element={
              <Layout>
                <BlogsListPage />
              </Layout>
            }
          />
          <Route
            path="/blogs/:slug"
            element={
              <Layout>
                <BlogDetailPage />
              </Layout>
            }
          />
          <Route
            path="/focus-areas/:slug"
            element={
              <Layout>
                <FocusAreaDetailPage />
              </Layout>
            }
          />
          <Route
            path="/events"
            element={
              <Layout>
                <EventsListPage />
              </Layout>
            }
          />
          <Route
            path="/events/:slug"
            element={
              <Layout>
                <EventDetailPage />
              </Layout>
            }
          />
          <Route
            path="/projects"
            element={
              <Layout>
                <ProjectsListPage />
              </Layout>
            }
          />
          <Route
            path="/projects/:slug"
            element={
              <Layout>
                <ProjectDetailPage />
              </Layout>
            }
          />
          <Route
            path="/magazines"
            element={
              <Layout>
                <MagazinesPage />
              </Layout>
            }
          />

          {/* Protected routes */}
          <Route
            path="/profile"
            element={
              <Layout>
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              </Layout>
            }
          />

          <Route
            path="/my-blogs"
            element={
              <Layout>
                <ProtectedRoute>
                  <MyBlogsPage />
                </ProtectedRoute>
              </Layout>
            }
          />

          {/* CMS Admin Panel - All admin features in one place */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'content_manager', 'editor']}>
                <CMSLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/cms" replace />} />
            <Route path="cms" element={<CMSDashboard />} />
            <Route path="cms/users" element={<CMSUsersPage />} />
            <Route path="cms/approved-users" element={<ApprovedUsersPage />} />
            <Route path="cms/access-management" element={<CMSAccessManagementPage />} />
            <Route path="cms/blogs" element={<CMSBlogsPage />} />
            <Route path="cms/hero-sliders" element={<HeroSlidersPage />} />
            <Route path="cms/pages" element={<PagesPage />} />
            <Route path="cms/focus-areas" element={<FocusAreasPage />} />
            <Route path="cms/statistics" element={<StatisticsPage />} />
            <Route path="cms/contact" element={<ContactSubmissionsPage />} />
            <Route path="cms/comments" element={<BlogCommentsPage />} />
            <Route path="cms/events" element={<EventsPage />} />
            <Route path="cms/event-registrations" element={<EventRegistrationsPage />} />
            <Route path="cms/projects" element={<ProjectsPage />} />
            <Route path="cms/about" element={<AboutContentPage />} />
            <Route path="cms/team" element={<TeamMembersPage />} />
            <Route
              path="cms/testimonials"
              element={<div className="card">Testimonials Management (Coming Soon)</div>}
            />
            <Route
              path="cms/events"
              element={<div className="card">Events Management (Coming Soon)</div>}
            />
            <Route
              path="cms/projects"
              element={<div className="card">Projects Management (Coming Soon)</div>}
            />
            <Route
              path="cms/menus"
              element={<div className="card">Menus Management (Coming Soon)</div>}
            />
            <Route
              path="cms/settings"
              element={<CMSSettingsPage />}
            />
            <Route
              path="cms/magazines"
              element={<div className="card">Magazines Management (Coming Soon)</div>}
            />
            <Route
              path="cms/memberships"
              element={<div className="card">Memberships Management (Coming Soon)</div>}
            />
          </Route>

          {/* 404 */}
          <Route
            path="*"
            element={
              <Layout>
                <div className="container mx-auto px-4 py-12 text-center">
                  <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
                  <p className="text-gray-600 mb-6">
                    The page you're looking for doesn't exist.
                  </p>
                  <a href="/" className="btn btn-primary">
                    Go Home
                  </a>
                </div>
              </Layout>
            }
          />
          </Routes>
        </BrowserRouter>
      </SettingsProvider>
    </QueryClientProvider>
  );
}

export default App;
