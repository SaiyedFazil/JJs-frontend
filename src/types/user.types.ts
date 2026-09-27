/**
 * The user profile as the app persists it — matches the fields returned by
 * the OTP verify response. Mirrored in MMKV by src/lib/storage.ts.
 */
export interface StoredUserProfile {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  countryCode: string;
  phoneNumber: string;
  role: string;
  status: string;
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

/** PATCH /user/profile body — snake_case, every field optional. */
export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  email?: string;
}
