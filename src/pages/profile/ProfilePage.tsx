import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { usersApi } from '@/api/users';
import { membershipsApi } from '@/api/memberships';
import { settingsApi } from '@/api/settings';
import { Loader } from '@/components/Loader';
import { Badge } from '@/components/Badge';
import { Alert } from '@/components/Alert';
import { formatDate } from '@/utils/helpers';
import { User, Award, CheckCircle, XCircle, Calendar, Edit2, Save, X, Phone, MapPin, GraduationCap, Briefcase, Upload } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const DIVISIONS = ['Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'];
const EDUCATION_LEVELS = ['SSC', 'HSC', 'Diploma', 'Bachelor', 'Masters', 'PhD'];
const EDUCATION_STATUS_OPTIONS = ['Student', 'Graduated'];

export const ProfilePage = () => {
  const { user, loadUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobileNumber: user?.mobileNumber || '',
    division: user?.division || '',
    district: user?.district || '',
    nid: user?.nid || '',
    educationStatus: user?.educationStatus || '',
    organization: user?.organization || '',
    designation: user?.designation || '',
    highestEducation: user?.highestEducation || '',
    educationMajor: user?.educationMajor || '',
    areaOfInterest: user?.areaOfInterest || '',
    reasonToJoin: user?.reasonToJoin || '',
    profilePhoto: user?.profilePhoto || '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(user?.profilePhoto || null);

  const { data: membership, isLoading: membershipLoading } = useQuery({
    queryKey: ['membership', 'me'],
    queryFn: membershipsApi.getMyMembership,
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities', 'me'],
    queryFn: membershipsApi.getMyActivities,
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.getSettings,
  });

  const checkEligibilityMutation = useMutation({
    mutationFn: membershipsApi.checkEligibility,
  });

  const applyMembershipMutation = useMutation({
    mutationFn: membershipsApi.applyForMembership,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership'] });
      setMessage({ type: 'success', text: 'Membership activated successfully!' });
    },
    onError: (error: any) => {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to activate membership',
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => usersApi.updateMe(data),
    onSuccess: () => {
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      loadUser();
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });

  const handleEdit = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      mobileNumber: user?.mobileNumber || '',
      division: user?.division || '',
      district: user?.district || '',
      nid: user?.nid || '',
      educationStatus: user?.educationStatus || '',
      organization: user?.organization || '',
      designation: user?.designation || '',
      highestEducation: user?.highestEducation || '',
      educationMajor: user?.educationMajor || '',
      areaOfInterest: user?.areaOfInterest || '',
      reasonToJoin: user?.reasonToJoin || '',
      profilePhoto: user?.profilePhoto || '',
    });
    setImagePreview(user?.profilePhoto || null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      mobileNumber: user?.mobileNumber || '',
      division: user?.division || '',
      district: user?.district || '',
      nid: user?.nid || '',
      educationStatus: user?.educationStatus || '',
      organization: user?.organization || '',
      designation: user?.designation || '',
      highestEducation: user?.highestEducation || '',
      educationMajor: user?.educationMajor || '',
      areaOfInterest: user?.areaOfInterest || '',
      reasonToJoin: user?.reasonToJoin || '',
      profilePhoto: user?.profilePhoto || '',
    });
    setImagePreview(user?.profilePhoto || null);
  };

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      // Compress and convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          // Create canvas for compression
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Max dimensions
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          ctx?.drawImage(img, 0, 0, width, height);
          const base64String = canvas.toDataURL('image/jpeg', 0.8); // 80% quality
          
          setFormData({ ...formData, profilePhoto: base64String });
          setImagePreview(base64String);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, profilePhoto: '' });
    setImagePreview(null);
  };

  const handleCheckEligibility = async () => {
    const result = await checkEligibilityMutation.mutateAsync();
    if (result.eligible) {
      if (confirm('You are eligible for membership! Would you like to apply now?')) {
        applyMembershipMutation.mutate();
      }
    }
  };

  if (!user) return <Loader />;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">My Profile</h1>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={updateProfileMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {message && (
        <div className="mb-6">
          <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
        </div>
      )}

      {/* Profile Information */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold flex items-center">
            <User className="mr-2" size={28} />
            Profile Information
          </h2>
          <div className="flex items-center gap-2">
            {user.isApproved ? (
              <>
                <CheckCircle size={20} className="text-green-600" />
                <Badge status="approved">Approved</Badge>
              </>
            ) : (
              <>
                <XCircle size={20} className="text-yellow-600" />
                <Badge status="pending">Pending Approval</Badge>
              </>
            )}
          </div>
        </div>

        {/* Profile Picture */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Picture</h3>
          <div className="flex items-center gap-6">
            {imagePreview || user.profilePhoto ? (
              <div className="relative">
                <img
                  src={imagePreview || user.profilePhoto}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                />
                {isEditing && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full bg-teal-100 flex items-center justify-center border-4 border-gray-200">
                <User className="w-16 h-16 text-teal-600" />
              </div>
            )}
            {isEditing && (
              <div>
                <input
                  type="file"
                  id="profilePhotoEdit"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="profilePhotoEdit"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Change Photo
                </label>
                <p className="mt-2 text-sm text-gray-500">
                  JPG, PNG or GIF (max. 5MB)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Personal Information */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              ) : (
                <p className="font-medium text-gray-900">{user.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              ) : (
                <p className="font-medium text-gray-900">{user.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Phone className="w-4 h-4" />
                Mobile Number *
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              ) : (
                <p className="font-medium text-gray-900">{user.mobileNumber || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NID *</label>
              {isEditing ? (
                <input
                  type="text"
                  name="nid"
                  value={formData.nid}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              ) : (
                <p className="font-medium text-gray-900">{user.nid || 'Not provided'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Division *</label>
              {isEditing ? (
                <select
                  name="division"
                  value={formData.division}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Division</option>
                  {DIVISIONS.map(div => (
                    <option key={div} value={div}>{div}</option>
                  ))}
                </select>
              ) : (
                <p className="font-medium text-gray-900">{user.division || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
              {isEditing ? (
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              ) : (
                <p className="font-medium text-gray-900">{user.district || 'Not provided'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Education
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Education Status *</label>
              {isEditing ? (
                <select
                  name="educationStatus"
                  value={formData.educationStatus}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Status</option>
                  {EDUCATION_STATUS_OPTIONS.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              ) : (
                <p className="font-medium text-gray-900">{user.educationStatus || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Highest Level of Education *</label>
              {isEditing ? (
                <select
                  name="highestEducation"
                  value={formData.highestEducation}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Level</option>
                  {EDUCATION_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              ) : (
                <p className="font-medium text-gray-900">{user.highestEducation || 'Not provided'}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Major in Education *</label>
              {isEditing ? (
                <input
                  type="text"
                  name="educationMajor"
                  value={formData.educationMajor}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              ) : (
                <p className="font-medium text-gray-900">{user.educationMajor || 'Not provided'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Professional */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Professional Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
              {isEditing ? (
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              ) : (
                <p className="font-medium text-gray-900">{user.organization || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
              {isEditing ? (
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              ) : (
                <p className="font-medium text-gray-900">{user.designation || 'Not provided'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Interests & Motivation */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Interests & Motivation</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area of Interest *</label>
              {isEditing ? (
                <textarea
                  name="areaOfInterest"
                  value={formData.areaOfInterest}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              ) : (
                <p className="text-gray-900 whitespace-pre-wrap">{user.areaOfInterest || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason to Join (Optional)</label>
              {isEditing ? (
                <textarea
                  name="reasonToJoin"
                  value={formData.reasonToJoin}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 whitespace-pre-wrap">{user.reasonToJoin || 'Not provided'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Role</p>
              <Badge status={user.role}>{user.role?.replace('_', ' ')}</Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="font-medium">{formatDate(user.createdAt)}</p>
            </div>
            {user.isApproved && user.role === 'member' && settings && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Blog Posting Limit</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                  <p className="text-sm text-blue-800">
                    {settings.memberBlogLimit} blog{settings.memberBlogLimit > 1 ? 's' : ''} per {settings.blogLimitPeriodDays} day{settings.blogLimitPeriodDays > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">

        {/* Membership Status Card */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold flex items-center">
              <Award className="mr-2" size={28} />
              Membership Status
            </h2>
            {membership && (
              <Badge status={membership.status}>{membership.status}</Badge>
            )}
          </div>

          {membershipLoading ? (
            <Loader />
          ) : membership && membership.status === 'active' ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium mb-2">🎉 Congratulations!</p>
                <p className="text-green-700">
                  You have an active membership with Brighten Bangladesh
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Membership ID</p>
                  <p className="font-mono font-semibold">{membership.membershipId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valid Until</p>
                  <p className="font-medium">
                    {membership.validTo && formatDate(membership.validTo)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <button
                onClick={handleCheckEligibility}
                disabled={checkEligibilityMutation.isPending}
                className="btn btn-primary"
              >
                {checkEligibilityMutation.isPending ? 'Checking...' : 'Check Eligibility'}
              </button>

              {checkEligibilityMutation.data && (
                <div className="space-y-4">
                  <Alert
                    type={checkEligibilityMutation.data.eligible ? 'success' : 'info'}
                    message={checkEligibilityMutation.data.message}
                  />

                  <div className="space-y-3">
                    <h3 className="font-semibold">Eligibility Requirements:</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {checkEligibilityMutation.data.rules.blogs ? (
                          <CheckCircle size={20} className="text-green-600" />
                        ) : (
                          <XCircle size={20} className="text-red-600" />
                        )}
                        <span>
                          {settings?.minBlogsForMembership || 4}+ approved blogs per month (Current:{' '}
                          {checkEligibilityMutation.data.counts.approvedBlogsLast30Days})
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {checkEligibilityMutation.data.rules.events ? (
                          <CheckCircle size={20} className="text-green-600" />
                        ) : (
                          <XCircle size={20} className="text-red-600" />
                        )}
                        <span>
                          {settings?.minEventsForMembership || 1}+ event every 3 months (Current:{' '}
                          {checkEligibilityMutation.data.counts.eventParticipationsLast90Days})
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {checkEligibilityMutation.data.rules.projects ? (
                          <CheckCircle size={20} className="text-green-600" />
                        ) : (
                          <XCircle size={20} className="text-red-600" />
                        )}
                        <span>
                          {settings?.minProjectsForMembership || 1}+ project every 6 months (Current:{' '}
                          {checkEligibilityMutation.data.counts.projectParticipationsLast180Days})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Activities Section */}
      <div className="mt-8 card">
        <h2 className="text-2xl font-semibold mb-6">Recent Activities</h2>
        {activitiesLoading ? (
          <Loader />
        ) : activities && activities.length > 0 ? (
          <div className="space-y-3">
            {activities.slice(0, 10).map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-3 border-b last:border-0">
                <div>
                  <p className="font-medium capitalize">{activity.type.replace(/_/g, ' ')}</p>
                  {activity.meta && (
                    <p className="text-sm text-gray-600">
                      {JSON.stringify(activity.meta).slice(0, 100)}
                    </p>
                  )}
                </div>
                <p className="text-sm text-gray-500 flex items-center">
                  <Calendar size={14} className="mr-1" />
                  {formatDate(activity.createdAt)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No activities yet</p>
        )}
      </div>
    </div>
  );
};
