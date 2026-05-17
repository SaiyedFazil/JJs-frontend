import apiClient from '@/api/apiClient';
import { ENDPOINTS } from '@/api/endpoints';
import { ApiResponse } from '@/types/api.types';

export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  email?: string;
}

/**
 * User Service
 * Encapsulates all user and profile related API calls.
 */
export const UserService = {
  /**
   * Update current authenticated user's profile info
   * @param payload containing first_name, last_name, and/or email
   */
  updateProfile: async (payload: UpdateProfilePayload) => {
    const response = await apiClient.patch<ApiResponse<any>>(
      ENDPOINTS.USER.UPDATE_PROFILE,
      payload,
    );
    return response.data;
  },
};
