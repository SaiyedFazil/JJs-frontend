import { createMMKV } from 'react-native-mmkv';

/**
 * Global MMKV storage instance.
 * MMKV is a fast, synchronous, persistent key-value store — the React Native
 * equivalent of browser cookies/localStorage for secure session persistence.
 */
export const storage = createMMKV({
  id: 'jjs-kitchen-storage',
});

// ─────────────────────────────────────────────────────────────────────────────
// Storage Keys — single source of truth, prevents typo bugs
// ─────────────────────────────────────────────────────────────────────────────
export const StorageKeys = {
  ACCESS_TOKEN:  'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PROFILE:  'user_profile',   // renamed from user_data for clarity
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// User Profile — matches the fields returned by the OTP verify response
// ─────────────────────────────────────────────────────────────────────────────
export interface StoredUserProfile {
  id:          number;
  firstName:   string | null;
  lastName:    string | null;
  email:       string | null;
  countryCode: string;
  phoneNumber: string;
  role:        string;
  status:      string;
}

// ── Access Token ──────────────────────────────────────────────────────────────
export const getAccessToken  = (): string | undefined =>
  storage.getString(StorageKeys.ACCESS_TOKEN);

export const setAccessToken  = (token: string): void =>
  storage.set(StorageKeys.ACCESS_TOKEN, token);

// ── Refresh Token ─────────────────────────────────────────────────────────────
export const getRefreshToken = (): string | undefined =>
  storage.getString(StorageKeys.REFRESH_TOKEN);

export const setRefreshToken = (token: string): void =>
  storage.set(StorageKeys.REFRESH_TOKEN, token);

// ── User Profile ──────────────────────────────────────────────────────────────
export const getUserProfile = (): StoredUserProfile | null => {
  const raw = storage.getString(StorageKeys.USER_PROFILE);
  if (!raw) { return null; }
  try {
    return JSON.parse(raw) as StoredUserProfile;
  } catch {
    return null;
  }
};

export const setUserProfile = (profile: StoredUserProfile): void =>
  storage.set(StorageKeys.USER_PROFILE, JSON.stringify(profile));

// ── Session management ────────────────────────────────────────────────────────
/**
 * Atomically wipe ALL auth data from persistent storage.
 * Called on logout so no personal information lingers on-device.
 */
export const clearAuthData = (): void => {
  storage.remove(StorageKeys.ACCESS_TOKEN);
  storage.remove(StorageKeys.REFRESH_TOKEN);
  storage.remove(StorageKeys.USER_PROFILE);
};

/**
 * Returns true if a valid access token exists in storage,
 * used as a lightweight "is session alive?" check on app boot.
 */
export const hasActiveSession = (): boolean =>
  !!storage.getString(StorageKeys.ACCESS_TOKEN);
