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
import { AuthService } from '@/services/auth.service';

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

  /** True once the user's display name is on file. New users start as false. */
  profileCompleted: boolean;

  // ── Actions ────────────────────────────────────────────────────────────────

  /** Sets the first launch flag */
  setFirstLaunch: (isFirst: boolean) => void;

  /** Marks the profile as filled — triggers RootNavigator to show MainTabNavigator. */
  setProfileCompleted: (value: boolean) => void;

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
  logout: () => Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>(set => ({
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  isFirstLaunch: true,
  profileCompleted: true, // default true so rehydrated sessions skip CompleteProfileScreen

  // ── setFirstLaunch ─────────────────────────────────────────────────────────
  setFirstLaunch: (isFirst: boolean) => set({ isFirstLaunch: isFirst }),

  // ── setProfileCompleted ────────────────────────────────────────────────────
  setProfileCompleted: (value: boolean) => set({ profileCompleted: value }),

  // ── setAuth ────────────────────────────────────────────────────────────────
  setAuth: (response: AuthResponse) => {
    const {
      accessToken,
      refreshToken,
      profileCompleted,
      // Strip auth-only fields — keep only profile fields in the profile store
      /* eslint-disable @typescript-eslint/no-unused-vars */
      isOtpVerified: _v,
      /* eslint-enable @typescript-eslint/no-unused-vars */
      ...profileFields
    } = response;

    const profile: StoredUserProfile = profileFields;

    const hasFirstName =
      profile.firstName && profile.firstName.trim().length > 0;
    const hasLastName = profile.lastName && profile.lastName.trim().length > 0;
    const isProfileComplete =
      Boolean(profileCompleted) ||
      (Boolean(hasFirstName) && Boolean(hasLastName));

    // 1. Update in-memory state FIRST for immediate UI reaction
    set({
      isAuthenticated: true,
      user: profile,
      accessToken,
      refreshToken,
      profileCompleted: isProfileComplete,
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
    const token = getAccessToken();
    const refresh = getRefreshToken();
    const profile = getUserProfile();

    if (token && profile) {
      const hasFirstName =
        profile.firstName && profile.firstName.trim().length > 0;
      const hasLastName =
        profile.lastName && profile.lastName.trim().length > 0;
      const isProfileComplete = Boolean(hasFirstName) && Boolean(hasLastName);

      set({
        isAuthenticated: true,
        user: profile,
        accessToken: token,
        refreshToken: refresh ?? null,
        profileCompleted: isProfileComplete,
      });
    }
    // If no token found the state stays at the default (guest / unauthenticated)
  },

  // ── logout ─────────────────────────────────────────────────────────────────
  logout: async () => {
    try {
      // 1. Call API while token is still available in state/storage
      // The interceptor in apiClient will automatically pick up the token
      await AuthService.logout();
    } catch (error) {
      // We log the error but proceed with clearing local state anyway
      // Logout should be "best effort" on the server side
      console.warn('Logout API call failed:', error);
    } finally {
      // 2. Wipe every piece of personal info from persistent storage
      clearAuthData();

      // 3. Reset in-memory state — nothing personal remains in RAM either
      set({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        isFirstLaunch: false,
      });
    }
  },
}));
