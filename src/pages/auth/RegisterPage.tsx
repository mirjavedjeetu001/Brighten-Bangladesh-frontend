import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Alert } from '@/components/Alert';
import { Upload, X } from 'lucide-react';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    division: '',
    district: '',
    nid: '',
    educationStatus: '',
    organization: '',
    designation: '',
    highestEducation: '',
    educationMajor: '',
    areaOfInterest: '',
    reasonToJoin: '',
    profilePhoto: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { register } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
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

  const divisions = ['Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'];
  const educationLevels = ['SSC', 'HSC', 'Diploma', 'Bachelor', 'Masters', 'PhD'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!formData.agreedToTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }

    setIsLoading(true);

    try {
      const { confirmPassword, agreedToTerms, ...registerData } = formData;
      const response = await register(registerData);
      
      // Check if user needs approval
      if (response.message) {
        // Show success message and redirect to login
        navigate('/login', { 
          state: { 
            message: response.message,
            type: 'info'
          } 
        });
      } else {
        // User approved immediately, go to profile
        navigate('/profile');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Membership Registration
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </Link>
          </p>
        </div>

        <form className="mt-8 bg-white p-8 rounded-lg shadow" onSubmit={handleSubmit}>
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          {/* Profile Picture Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Picture (Optional)
            </label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Profile preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-4 border-gray-200">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  id="profilePhoto"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="profilePhoto"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Choose Photo
                </label>
                <p className="mt-2 text-sm text-gray-500">
                  JPG, PNG or GIF (max. 5MB)
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="input"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number *
              </label>
              <input
                id="mobileNumber"
                name="mobileNumber"
                type="tel"
                required
                className="input"
                placeholder="01XXXXXXXXX"
                value={formData.mobileNumber}
                onChange={handleChange}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Division */}
            <div>
              <label htmlFor="division" className="block text-sm font-medium text-gray-700 mb-1">
                Division *
              </label>
              <select
                id="division"
                name="division"
                required
                className="input"
                value={formData.division}
                onChange={handleChange}
              >
                <option value="">Select Division</option>
                {divisions.map(div => (
                  <option key={div} value={div}>{div}</option>
                ))}
              </select>
            </div>

            {/* District */}
            <div>
              <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                District *
              </label>
              <input
                id="district"
                name="district"
                type="text"
                required
                className="input"
                value={formData.district}
                onChange={handleChange}
              />
            </div>

            {/* NID */}
            <div>
              <label htmlFor="nid" className="block text-sm font-medium text-gray-700 mb-1">
                NID *
              </label>
              <input
                id="nid"
                name="nid"
                type="text"
                required
                className="input"
                value={formData.nid}
                onChange={handleChange}
              />
            </div>

            {/* Education Status */}
            <div>
              <label htmlFor="educationStatus" className="block text-sm font-medium text-gray-700 mb-1">
                Education Status *
              </label>
              <select
                id="educationStatus"
                name="educationStatus"
                required
                className="input"
                value={formData.educationStatus}
                onChange={handleChange}
              >
                <option value="">Select Status</option>
                <option value="Student">Student</option>
                <option value="Graduated">Graduated</option>
              </select>
            </div>

            {/* Organization */}
            <div>
              <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
                Organization (If have)
              </label>
              <input
                id="organization"
                name="organization"
                type="text"
                className="input"
                value={formData.organization}
                onChange={handleChange}
              />
            </div>

            {/* Designation */}
            <div>
              <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-1">
                Designation (If have)
              </label>
              <input
                id="designation"
                name="designation"
                type="text"
                className="input"
                value={formData.designation}
                onChange={handleChange}
              />
            </div>

            {/* Highest Level of Education */}
            <div>
              <label htmlFor="highestEducation" className="block text-sm font-medium text-gray-700 mb-1">
                Highest Level of Education *
              </label>
              <select
                id="highestEducation"
                name="highestEducation"
                required
                className="input"
                value={formData.highestEducation}
                onChange={handleChange}
              >
                <option value="">Select Level</option>
                {educationLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            {/* Major in Education */}
            <div>
              <label htmlFor="educationMajor" className="block text-sm font-medium text-gray-700 mb-1">
                Major in Education *
              </label>
              <input
                id="educationMajor"
                name="educationMajor"
                type="text"
                required
                className="input"
                value={formData.educationMajor}
                onChange={handleChange}
              />
            </div>

            {/* Area of Interest */}
            <div className="md:col-span-2">
              <label htmlFor="areaOfInterest" className="block text-sm font-medium text-gray-700 mb-1">
                Area of Interest *
              </label>
              <textarea
                id="areaOfInterest"
                name="areaOfInterest"
                required
                rows={3}
                className="input"
                value={formData.areaOfInterest}
                onChange={handleChange}
              />
            </div>

            {/* Reason to Join */}
            <div className="md:col-span-2">
              <label htmlFor="reasonToJoin" className="block text-sm font-medium text-gray-700 mb-1">
                Reason to Join (Optional)
              </label>
              <textarea
                id="reasonToJoin"
                name="reasonToJoin"
                rows={3}
                className="input"
                value={formData.reasonToJoin}
                onChange={handleChange}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="input"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            {/* Agreement Checkbox */}
            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="agreedToTerms"
                  checked={formData.agreedToTerms}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">
                  I agree to the terms and conditions *
                </span>
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary disabled:opacity-50"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
