/**
 * Global API Response Types
 * Standardized structure for backend responses.
 */

export interface ApiResponse<T> {
  status: boolean;
  message?: string;
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  status: boolean;
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface User {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  countryCode: string;
  phoneNumber: string;
  isOtpVerified: boolean;
  status: string;
  role: string;
}

export interface AuthResponse extends User {
  accessToken: string;
  refreshToken: string;
  profileCompleted: boolean;
}

/**
 * The envelope /user/profile uses.
 *
 * Deliberately separate from ApiResponse: the two generations of this API
 * disagree on the flag's name — the auth endpoints send `status`, these send
 * `success` — and quietly widening ApiResponse would make `status` optional
 * for the callers that legitimately depend on it.
 */
export interface ProfileApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

/**
 * /user/profile's payload, exactly as it comes off the wire: snake_case, and
 * without the `role`/`status` that the auth response carries. Nothing outside
 * user-api should see this shape — it maps to UserProfile there.
 */
export interface UserProfilePayload {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  country_code: string;
  phone_number: string;
}
