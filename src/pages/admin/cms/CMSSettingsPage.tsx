import { useState, useEffect } from 'react';
import { Settings, Save, Upload, Image } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '@/api/settings';
import { uploadsApi } from '@/api/uploads';
import { Loader } from '@/components/Loader';

export const CMSSettingsPage = () => {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.getSettings,
  });

  const getImageUrl = (path: string | undefined) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `http://localhost:3000${path}`;
  };

  const [formData, setFormData] = useState({
    siteName: '',
    siteTagline: '',
    siteLogo: '',
    siteFavicon: '',
    primaryColor: '#0d9488',
    secondaryColor: '#f97316',
    contactEmail: '',
    contactPhone: '',
    contactAddress: '',
    facebookUrl: '',
    twitterUrl: '',
    linkedinUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
    metaDescription: '',
    metaKeywords: '',
    memberBlogLimit: 1,
    blogLimitPeriodDays: 7,
    volunteerBlogLimit: 2,
    editorBlogLimit: 5,
    minBlogsForMembership: 4,
    minEventsForMembership: 1,
    minProjectsForMembership: 1,
    footerText: '',
    copyrightText: '',
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        siteName: settings.siteName || '',
        siteTagline: settings.siteTagline || '',
        siteLogo: settings.siteLogo || '',
        siteFavicon: settings.siteFavicon || '',
        primaryColor: settings.primaryColor || '#0d9488',
        secondaryColor: settings.secondaryColor || '#f97316',
        contactEmail: settings.contactEmail || '',
        contactPhone: settings.contactPhone || '',
        contactAddress: settings.contactAddress || '',
        facebookUrl: settings.facebookUrl || '',
        twitterUrl: settings.twitterUrl || '',
        linkedinUrl: settings.linkedinUrl || '',
        instagramUrl: settings.instagramUrl || '',
        youtubeUrl: settings.youtubeUrl || '',
        metaDescription: settings.metaDescription || '',
        metaKeywords: settings.metaKeywords || '',
        memberBlogLimit: settings.memberBlogLimit,
        blogLimitPeriodDays: settings.blogLimitPeriodDays,
        volunteerBlogLimit: settings.volunteerBlogLimit,
        editorBlogLimit: settings.editorBlogLimit,
        minBlogsForMembership: settings.minBlogsForMembership,
        minEventsForMembership: settings.minEventsForMembership,
        minProjectsForMembership: settings.minProjectsForMembership,
        footerText: settings.footerText || '',
        copyrightText: settings.copyrightText || '',
      });
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: settingsApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings saved successfully!');
    },
    onError: () => {
      toast.error('Failed to save settings');
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleChange = (key: string, value: any) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'siteLogo' | 'siteFavicon') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadsApi.uploadFile(file);
      handleChange(field, url);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Settings className="mr-3" size={32} />
          System Settings
        </h1>
        <p className="text-gray-600 mt-1">Configure system-wide settings and limits</p>
      </div>

      {/* Site Information */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Site Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
            <input
              type="text"
              value={formData.siteName}
              onChange={(e) => handleChange('siteName', e.target.value)}
              className="input w-full"
              placeholder="Brighten Bangladesh"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Site Tagline</label>
            <input
              type="text"
              value={formData.siteTagline}
              onChange={(e) => handleChange('siteTagline', e.target.value)}
              className="input w-full"
              placeholder="Your site tagline"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Site Logo</label>
            <div className="flex items-center space-x-3">
              {formData.siteLogo && (
                <img src={getImageUrl(formData.siteLogo)} alt="Logo" className="h-12 w-auto object-contain" />
              )}
              <label className="btn btn-secondary cursor-pointer">
                <Upload size={16} className="mr-2" />
                Upload Logo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'siteLogo')}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Favicon</label>
            <div className="flex items-center space-x-3">
              {formData.siteFavicon && (
                <img src={getImageUrl(formData.siteFavicon)} alt="Favicon" className="h-8 w-8 object-contain" />
              )}
              <label className="btn btn-secondary cursor-pointer">
                <Upload size={16} className="mr-2" />
                Upload Favicon
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'siteFavicon')}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={formData.primaryColor}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                className="h-10 w-20 rounded border"
              />
              <input
                type="text"
                value={formData.primaryColor}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                className="input flex-1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={formData.secondaryColor}
                onChange={(e) => handleChange('secondaryColor', e.target.value)}
                className="h-10 w-20 rounded border"
              />
              <input
                type="text"
                value={formData.secondaryColor}
                onChange={(e) => handleChange('secondaryColor', e.target.value)}
                className="input flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => handleChange('contactEmail', e.target.value)}
              className="input w-full"
              placeholder="contact@brightenbd.org"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="text"
              value={formData.contactPhone}
              onChange={(e) => handleChange('contactPhone', e.target.value)}
              className="input w-full"
              placeholder="+880 123 456 7890"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <textarea
              value={formData.contactAddress}
              onChange={(e) => handleChange('contactAddress', e.target.value)}
              className="input w-full"
              rows={2}
              placeholder="Your organization address"
            />
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Social Media Links</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Facebook URL</label>
            <input
              type="url"
              value={formData.facebookUrl}
              onChange={(e) => handleChange('facebookUrl', e.target.value)}
              className="input w-full"
              placeholder="https://facebook.com/your-page"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Twitter URL</label>
            <input
              type="url"
              value={formData.twitterUrl}
              onChange={(e) => handleChange('twitterUrl', e.target.value)}
              className="input w-full"
              placeholder="https://twitter.com/your-handle"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
            <input
              type="url"
              value={formData.linkedinUrl}
              onChange={(e) => handleChange('linkedinUrl', e.target.value)}
              className="input w-full"
              placeholder="https://linkedin.com/company/your-company"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Instagram URL</label>
            <input
              type="url"
              value={formData.instagramUrl}
              onChange={(e) => handleChange('instagramUrl', e.target.value)}
              className="input w-full"
              placeholder="https://instagram.com/your-handle"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">YouTube URL</label>
            <input
              type="url"
              value={formData.youtubeUrl}
              onChange={(e) => handleChange('youtubeUrl', e.target.value)}
              className="input w-full"
              placeholder="https://youtube.com/@your-channel"
            />
          </div>
        </div>
      </div>

      {/* SEO Settings */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">SEO Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
            <textarea
              value={formData.metaDescription}
              onChange={(e) => handleChange('metaDescription', e.target.value)}
              className="input w-full"
              rows={3}
              placeholder="Brief description of your website for search engines"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Meta Keywords</label>
            <input
              type="text"
              value={formData.metaKeywords}
              onChange={(e) => handleChange('metaKeywords', e.target.value)}
              className="input w-full"
              placeholder="keyword1, keyword2, keyword3"
            />
          </div>
        </div>
      </div>

      {/* Blog Posting Limits */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Blog Posting Limits</h2>
        <p className="text-sm text-gray-600 mb-6">
          Control how many blogs users can post based on their role
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Member Blog Limit
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                min="1"
                max="10"
                value={formData.memberBlogLimit}
                onChange={(e) => handleChange('memberBlogLimit', parseInt(e.target.value))}
                className="input w-24"
              />
              <span className="text-sm text-gray-600">
                blog(s) per {formData.blogLimitPeriodDays} days
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Standard members can post this many blogs per week
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Blog Limit Period (Days)
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                min="1"
                max="30"
                value={formData.blogLimitPeriodDays}
                onChange={(e) => handleChange('blogLimitPeriodDays', parseInt(e.target.value))}
                className="input w-24"
              />
              <span className="text-sm text-gray-600">days</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Time period for blog posting limit
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Volunteer Blog Limit
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                min="1"
                max="20"
                value={formData.volunteerBlogLimit}
                onChange={(e) => handleChange('volunteerBlogLimit', parseInt(e.target.value))}
                className="input w-24"
              />
              <span className="text-sm text-gray-600">
                blog(s) per {formData.blogLimitPeriodDays} days
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Volunteers can post this many blogs per period
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Editor Blog Limit
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                min="1"
                max="50"
                value={formData.editorBlogLimit}
                onChange={(e) => handleChange('editorBlogLimit', parseInt(e.target.value))}
                className="input w-24"
              />
              <span className="text-sm text-gray-600">
                blog(s) per {formData.blogLimitPeriodDays} days
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Editors can post this many blogs per period
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Admins, Super Admins, and Content Managers have unlimited blog posting privileges.
          </p>
        </div>
      </div>

      {/* Membership Eligibility Requirements */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Membership Eligibility</h2>
        <p className="text-sm text-gray-600 mb-6">
          Set the minimum requirements for users to qualify for membership
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Approved Blogs
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                min="1"
                max="20"
                value={formData.minBlogsForMembership}
                onChange={(e) => handleChange('minBlogsForMembership', parseInt(e.target.value))}
                className="input w-24"
              />
              <span className="text-sm text-gray-600">per month</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Event Participations
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                min="1"
                max="10"
                value={formData.minEventsForMembership}
                onChange={(e) => handleChange('minEventsForMembership', parseInt(e.target.value))}
                className="input w-24"
              />
              <span className="text-sm text-gray-600">per 3 months</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Project Participations
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                min="1"
                max="10"
                value={formData.minProjectsForMembership}
                onChange={(e) => handleChange('minProjectsForMembership', parseInt(e.target.value))}
                className="input w-24"
              />
              <span className="text-sm text-gray-600">per 6 months</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Settings */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Footer Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Footer Text</label>
            <textarea
              value={formData.footerText}
              onChange={(e) => handleChange('footerText', e.target.value)}
              className="input w-full"
              rows={3}
              placeholder="About your organization (shown in footer)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Copyright Text</label>
            <input
              type="text"
              value={formData.copyrightText}
              onChange={(e) => handleChange('copyrightText', e.target.value)}
              className="input w-full"
              placeholder="© 2025 Your Organization. All rights reserved."
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button 
          onClick={handleSave} 
          disabled={updateMutation.isPending}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Save size={20} />
          <span>{updateMutation.isPending ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>
    </div>
  );
};
