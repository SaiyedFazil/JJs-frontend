import apiClient from '@/api/apiClient';
import { ENDPOINTS } from '@/api/endpoints';
import { ApiResponse, AuthResponse } from '@/types/api.types';

/**
 * Auth Service
 * Encapsulates all authentication related API calls.
 */
export const AuthService = {
  /**
   * Send OTP to the provided phone number (also registers user if new)
   * @param countryCode e.g., '+91'
   * @param phoneNumber e.g., '1111111111'
   */
  sendOtp: async (countryCode: string, phoneNumber: string) => {
    const response = await apiClient.post<ApiResponse<{ authToken: string }>>(
      ENDPOINTS.AUTH.SEND_OTP,
      {
        country_code: countryCode,
        phone_number: phoneNumber,
      },
    );
    return response.data;
  },

  /**
   * Verify the OTP received by the user
   * @param otp 6-digit code
   * @param preVerifyToken Token received from sendOtp API
   */
  verifyOtp: async (otp: string, preVerifyToken: string) => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      ENDPOINTS.AUTH.VERIFY_OTP,
      { otp },
      {
        headers: {
          Authorization: `Bearer ${preVerifyToken}`,
        },
      },
    );
    return response.data;
  },

  /**
   * Resend OTP verification code
   * @param preVerifyToken Token received from sendOtp or previous resendOtp API
   */
  resendOtp: async (preVerifyToken: string) => {
    const response = await apiClient.post<ApiResponse<{ authToken: string }>>(
      ENDPOINTS.AUTH.RESEND_OTP,
      {},
      {
        headers: {
          Authorization: `Bearer ${preVerifyToken}`,
        },
      },
    );
    return response.data;
  },

  /**
   * Log the user out from the server
   */
  logout: async () => {
    return await apiClient.post(ENDPOINTS.AUTH.LOGOUT, {});
  },
};
