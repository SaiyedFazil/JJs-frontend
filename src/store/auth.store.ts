import { create } from 'zustand';
import {
  clearAuthData,
  getAccessToken,
  getRefreshToken,
  getUserProfile,
  setAccessToken,
  setRefreshToken,
  setUserProfile,
  StoredUserProfile,
} from '@/utils/storage';
import { AuthResponse } from '@/types/api.types';

// ─────────────────────────────────────────────────────────────────────────────
// State Shape
// ─────────────────────────────────────────────────────────────────────────────
interface AuthState {
  /** True once the user has a valid, persisted session */
  isAuthenticated: boolean;

  /** In-memory snapshot of the user profile (mirrors MMKV) */
  user: StoredUserProfile | null;

  /** JWT access token kept in memory for fast reads by API interceptors */
  accessToken: string | null;

  /** Opaque refresh token kept in memory */
  refreshToken: string | null;

  /** Flag to track if we should show the splash screen (only on fresh app start) */
  isFirstLaunch: boolean;

  // ── Actions ────────────────────────────────────────────────────────────────

  /** Sets the first launch flag */
  setFirstLaunch: (isFirst: boolean) => void;

  /**
   * Called after a successful OTP verification.
   * Persists all personal data to MMKV and hydrates the in-memory state.
   */
  setAuth: (response: AuthResponse) => void;

  /**
   * Called once on app boot (from RootNavigator).
   * Reads MMKV and restores the session if one exists, so the user stays
   * logged in after closing and re-opening the app.
   */
  rehydrate: () => void;

  /**
   * Clears every piece of personal information from both MMKV and memory.
   * After this call the user is treated as a guest.
   */
  logout: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user:            null,
  accessToken:     null,
  refreshToken:    null,
  isFirstLaunch:   true,

  // ── setFirstLaunch ─────────────────────────────────────────────────────────
  setFirstLaunch: (isFirst: boolean) => set({ isFirstLaunch: isFirst }),

  // ── setAuth ────────────────────────────────────────────────────────────────
  setAuth: (response: AuthResponse) => {
    const {
      accessToken,
      refreshToken,
      // Strip auth-only fields — keep only profile fields in the profile store
      /* eslint-disable @typescript-eslint/no-unused-vars */
      isOtpVerified: _v,
      /* eslint-enable @typescript-eslint/no-unused-vars */
      ...profileFields
    } = response;

    const profile: StoredUserProfile = profileFields;

    // 1. Update in-memory state FIRST for immediate UI reaction
    // This triggers the RootNavigator to switch to MainTabNavigator instantly.
    set({
      isAuthenticated: true,
      user:            profile,
      accessToken,
      refreshToken,
    });

    // 2. Persist to MMKV in the background (next tick)
    // This prevents synchronous disk I/O from blocking the UI transition.
    setTimeout(() => {
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      setUserProfile(profile);
    }, 0);
  },

  // ── rehydrate ──────────────────────────────────────────────────────────────
  rehydrate: () => {
    const token   = getAccessToken();
    const refresh = getRefreshToken();
    const profile = getUserProfile();

    if (token && profile) {
      set({
        isAuthenticated: true,
        user:            profile,
        accessToken:     token,
        refreshToken:    refresh ?? null,
      });
    }
    // If no token found the state stays at the default (guest / unauthenticated)
  },

  // ── logout ─────────────────────────────────────────────────────────────────
  logout: () => {
    // 1. Wipe every piece of personal info from persistent storage
    clearAuthData();

    // 2. Reset in-memory state — nothing personal remains in RAM either
    set({
      isAuthenticated: false,
      user:            null,
      accessToken:     null,
      refreshToken:    null,
      isFirstLaunch:   false,
    });
  },
}));
