import { create } from 'zustand';
import {
  clearAuthData,
  getAccessToken,
  getRefreshToken,
  getUserProfile,
  setAccessToken,
  setRefreshToken,
  setUserProfile,
} from '@/lib/storage';
import type { StoredUserProfile } from '@/types/user.types';
import { AuthResponse } from '@/types/api.types';
import { authApi } from '@/lib/api/auth/auth-api';
import { useProfileStore } from '@/store/profile.store';

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

  /**
   * Partially updates the in-memory user profile AND persists the change to MMKV.
   * Safe to call after any profile-editing API call — it merges into the
   * existing user object so no other fields are accidentally wiped.
   */
  updateUser: (updates: Partial<StoredUserProfile>) => void;

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

/**
 * True when both names are on file. Whitespace-only counts as missing: the
 * complete-profile flow trims before saving, so a blank-looking name is one
 * the user never actually gave.
 */
const hasFullName = (profile: StoredUserProfile): boolean => {
  const hasFirstName = profile.firstName && profile.firstName.trim().length > 0;
  const hasLastName = profile.lastName && profile.lastName.trim().length > 0;
  return Boolean(hasFirstName) && Boolean(hasLastName);
};

// ─────────────────────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>((set, get) => ({
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

  // ── updateUser ─────────────────────────────────────────────────────────────
  /**
   * Merges `updates` into the current user profile, then:
   *  1. Flushes the merged object to MMKV so it survives app restarts.
   *  2. Updates the Zustand in-memory state for immediate UI re-render.
   * Using a merge pattern (spreading existing user) prevents fields that
   * are NOT being changed (e.g. phoneNumber, role) from becoming null.
   */
  updateUser: (updates: Partial<StoredUserProfile>) => {
    const current = get().user;
    if (!current) return;

    const merged: StoredUserProfile = { ...current, ...updates };

    // 1. Persist to MMKV first — ensures durability even if the process dies
    setUserProfile(merged);

    // 2. Update in-memory state for immediate UI re-render
    set({ user: merged });
  },

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

    const isProfileComplete = Boolean(profileCompleted) || hasFullName(profile);

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
      set({
        isAuthenticated: true,
        user: profile,
        accessToken: token,
        refreshToken: refresh ?? null,
        profileCompleted: hasFullName(profile),
      });
    }
    // If no token found the state stays at the default (guest / unauthenticated)
  },

  // ── logout ─────────────────────────────────────────────────────────────────
  logout: async () => {
    try {
      // 1. Call API while token is still available in state/storage
      // The interceptor in apiClient will automatically pick up the token
      await authApi.logout();
    } catch (error) {
      // We log the error but proceed with clearing local state anyway
      // Logout should be "best effort" on the server side
      console.warn('Logout API call failed:', error);
    } finally {
      // 2. Wipe every piece of personal info from persistent storage
      clearAuthData();

      // 3. Device-local preferences are personal too. clearAuthData() drops
      //    the stored avatar; this drops the copy already in memory, so the
      //    next sign-in on this device starts from the default.
      useProfileStore.getState().reset();

      // 4. Reset in-memory state — nothing personal remains in RAM either
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
