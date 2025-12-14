import apiClient from './client';
import { AuthResponse, LoginRequest, RegisterRequest, RegisterResponse, VerifyOtpRequest, BasicMessageResponse, ForgotPasswordRequest, ResetPasswordRequest } from './types';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  verifyOtp: async (data: VerifyOtpRequest): Promise<BasicMessageResponse> => {
    const response = await apiClient.post('/auth/verify-otp', data);
    return response.data;
  },

  resendOtp: async (email: string): Promise<BasicMessageResponse> => {
    const response = await apiClient.post('/auth/resend-otp', { email });
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<BasicMessageResponse> => {
    const response = await apiClient.post('/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<BasicMessageResponse> => {
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data;
  },
};
