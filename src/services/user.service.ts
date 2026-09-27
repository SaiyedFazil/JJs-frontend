import apiClient from '@/api/apiClient';
import { ENDPOINTS } from '@/api/endpoints';
import { ProfileApiResponse, UserProfilePayload } from '@/types/api.types';

export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  email?: string;
}

/**
 * The profile as the app speaks it: camelCase, and a subset of
 * StoredUserProfile, so it can be handed straight to `updateUser()`.
 */
export interface UserProfile {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  countryCode: string;
  phoneNumber: string;
}

/**
 * The wire format stops here. Screens read `UserProfile`, so a rename on the
 * server costs one edit in this file rather than one per component.
 */
const fromWire = (payload: UserProfilePayload): UserProfile => ({
  id: payload.id,
  firstName: payload.first_name,
  lastName: payload.last_name,
  email: payload.email,
  countryCode: payload.country_code,
  phoneNumber: payload.phone_number,
});

/**
 * Both calls below let a non-2xx response reject — that is the documented
 * failure path (401/403/404/422), and apiClient's interceptor has already
 * turned it into an Error carrying the server's message. `success: false` on
 * a 200 is not in the contract, but it is cheap to refuse rather than hand
 * back an empty profile.
 */
const unwrap = (
  response: ProfileApiResponse<UserProfilePayload>,
): UserProfile => {
  if (response.success === false) {
    throw new Error(response.message ?? 'Profile request failed');
  }
  return fromWire(response.data);
};

/**
 * User Service
 * Encapsulates all user and profile related API calls.
 */
export const UserService = {
  /** Read the current authenticated user's profile. */
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get<
      ProfileApiResponse<UserProfilePayload>
    >(ENDPOINTS.USER.PROFILE);
    return unwrap(response.data);
  },

  /**
   * Update current authenticated user's profile info.
   *
   * Returns the SERVER's copy of the profile, not the payload that was sent:
   * the response is the authority on what was actually stored, so callers
   * should persist what comes back rather than what they asked for.
   */
  updateProfile: async (
    payload: UpdateProfilePayload,
  ): Promise<UserProfile> => {
    const response = await apiClient.patch<
      ProfileApiResponse<UserProfilePayload>
    >(ENDPOINTS.USER.PROFILE, payload);
    return unwrap(response.data);
  },
};
