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
