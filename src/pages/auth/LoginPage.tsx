import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Alert } from '@/components/Alert';
import { authApi } from '@/api/auth';
import { X } from 'lucide-react';

export const LoginPage = () => {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState((location.state as any)?.message || '');
  const [infoType, setInfoType] = useState((location.state as any)?.type || 'success');

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request');
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const { login } = useAuthStore();
  const navigate = useNavigate();

  const from = (location.state as any)?.from?.pathname || '/profile';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
              create a new account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {infoMessage && <Alert type={infoType as any} message={infoMessage} />}
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="mt-2 text-right">
                <button
                  type="button"
                  className="text-sm text-primary-600 hover:text-primary-700"
                  onClick={() => {
                    setShowResetModal(true);
                    setResetEmail(email);
                    setResetStep('request');
                    setResetError('');
                    setResetMessage('');
                  }}
                >
                  Forgot password?
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>

      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 relative">
            <button
              type="button"
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              onClick={() => setShowResetModal(false)}
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">Reset password</h3>
            <p className="text-sm text-gray-600 mb-4">
              {resetStep === 'request'
                ? 'Enter your account email and we will send a 6-digit code to reset your password.'
                : `We sent a code to ${resetEmail}. Enter it below with your new password.`}
            </p>

            {resetMessage && <Alert type="info" message={resetMessage} />}
            {resetError && <Alert type="error" message={resetError} onClose={() => setResetError('')} />}

            {resetStep === 'request' ? (
              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setResetError('');
                  setResetMessage('');
                  if (!resetEmail) {
                    setResetError('Please enter your email.');
                    return;
                  }
                  setIsSendingReset(true);
                  try {
                    const res = await authApi.forgotPassword({ email: resetEmail });
                    setResetMessage(res.message || 'If the account exists, a code has been sent.');
                    setResetStep('verify');
                  } catch (err: any) {
                    setResetError(err.response?.data?.message || 'Could not send reset code');
                  } finally {
                    setIsSendingReset(false);
                  }
                }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="input"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSendingReset}
                  className="w-full btn btn-primary disabled:opacity-50"
                >
                  {isSendingReset ? 'Sending...' : 'Send reset code'}
                </button>
              </form>
            ) : (
              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setResetError('');
                  setResetMessage('');
                  if (!resetOtp || !resetNewPassword) {
                    setResetError('Please enter the code and a new password.');
                    return;
                  }
                  if (resetNewPassword !== resetConfirmPassword) {
                    setResetError('Passwords do not match.');
                    return;
                  }
                  if (resetNewPassword.length < 6) {
                    setResetError('Password must be at least 6 characters.');
                    return;
                  }
                  setIsResettingPassword(true);
                  try {
                    const res = await authApi.resetPassword({
                      email: resetEmail,
                      otp: resetOtp,
                      newPassword: resetNewPassword,
                    });
                    setInfoMessage(res.message || 'Password reset successful. Please sign in.');
                    setInfoType('success');
                    setShowResetModal(false);
                    setResetOtp('');
                    setResetNewPassword('');
                    setResetConfirmPassword('');
                  } catch (err: any) {
                    setResetError(err.response?.data?.message || 'Could not reset password');
                  } finally {
                    setIsResettingPassword(false);
                  }
                }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">6-digit code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    className="input tracking-widest text-center"
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
                  <input
                    type="password"
                    className="input"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
                  <input
                    type="password"
                    className="input"
                    value={resetConfirmPassword}
                    onChange={(e) => setResetConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isResettingPassword}
                  className="w-full btn btn-primary disabled:opacity-50"
                >
                  {isResettingPassword ? 'Resetting...' : 'Reset password'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
