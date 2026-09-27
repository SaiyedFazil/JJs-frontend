import type { AuthResponse } from '../src/types/api.types';
import type { StoredUserProfile } from '../src/types/user.types';

jest.mock('../src/lib/storage', () => ({
  clearAuthData: jest.fn(),
  getAccessToken: jest.fn(),
  getRefreshToken: jest.fn(),
  getUserProfile: jest.fn(),
  setAccessToken: jest.fn(),
  setRefreshToken: jest.fn(),
  setUserProfile: jest.fn(),
  getAvatarId: jest.fn(() => null),
  setAvatarId: jest.fn(),
}));

const mockLogout = jest.fn();
jest.mock('../src/lib/api/auth/auth-api', () => ({
  authApi: { logout: () => mockLogout() },
}));

import * as storage from '../src/lib/storage';
import { useAuthStore } from '../src/store/auth.store';
import { useProfileStore } from '../src/store/profile.store';
import { DEFAULT_AVATAR_ID } from '../src/constants/avatars';

const profile: StoredUserProfile = {
  id: 1,
  firstName: 'Asha',
  lastName: 'Rao',
  email: null,
  countryCode: '+91',
  phoneNumber: '9999999999',
  role: 'user',
  status: 'active',
};

const verified = (overrides: Partial<AuthResponse> = {}): AuthResponse => ({
  ...profile,
  isOtpVerified: true,
  accessToken: 'access',
  refreshToken: 'refresh',
  profileCompleted: false,
  ...overrides,
});

const GUEST = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  isFirstLaunch: true,
  profileCompleted: true,
};

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState(GUEST);
});

afterEach(() => jest.useRealTimers());

describe('setAuth — profile completion after OTP', () => {
  it('counts both names as complete even when the server flag is false', () => {
    useAuthStore.getState().setAuth(verified());
    expect(useAuthStore.getState().profileCompleted).toBe(true);
  });

  it('treats a whitespace-only name as missing', () => {
    useAuthStore.getState().setAuth(verified({ lastName: '   ' }));
    expect(useAuthStore.getState().profileCompleted).toBe(false);
  });

  it('trusts the server flag when a name is missing', () => {
    useAuthStore
      .getState()
      .setAuth(verified({ firstName: null, profileCompleted: true }));
    expect(useAuthStore.getState().profileCompleted).toBe(true);
  });

  it('keeps only profile fields on the user', () => {
    useAuthStore.getState().setAuth(verified());
    expect(useAuthStore.getState().user).toEqual(profile);
    expect(useAuthStore.getState().accessToken).toBe('access');
  });

  it('persists to storage on the next tick, not synchronously', () => {
    jest.useFakeTimers();
    useAuthStore.getState().setAuth(verified());
    expect(storage.setAccessToken).not.toHaveBeenCalled();
    jest.runOnlyPendingTimers();
    expect(storage.setAccessToken).toHaveBeenCalledWith('access');
    expect(storage.setRefreshToken).toHaveBeenCalledWith('refresh');
    expect(storage.setUserProfile).toHaveBeenCalledWith(profile);
  });
});

describe('rehydrate — profile completion after relaunch', () => {
  it('restores a session whose profile has both names', () => {
    jest.mocked(storage.getAccessToken).mockReturnValue('access');
    jest.mocked(storage.getUserProfile).mockReturnValue(profile);
    useAuthStore.getState().rehydrate();
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().profileCompleted).toBe(true);
  });

  it('judges completion by names alone', () => {
    jest.mocked(storage.getAccessToken).mockReturnValue('access');
    jest
      .mocked(storage.getUserProfile)
      .mockReturnValue({ ...profile, lastName: null });
    useAuthStore.getState().rehydrate();
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().profileCompleted).toBe(false);
  });

  it('stays a guest when no token is stored', () => {
    jest.mocked(storage.getAccessToken).mockReturnValue(undefined);
    jest.mocked(storage.getUserProfile).mockReturnValue(profile);
    useAuthStore.getState().rehydrate();
    expect(useAuthStore.getState()).toMatchObject(GUEST);
  });
});

describe('logout', () => {
  it('wipes the session and the avatar even when the server call fails', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockLogout.mockRejectedValue(new Error('offline'));
    useAuthStore.getState().setAuth(verified());
    useProfileStore.getState().setAvatar(5);

    await useAuthStore.getState().logout();

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(storage.clearAuthData).toHaveBeenCalledTimes(1);
    expect(useProfileStore.getState().avatarId).toBe(DEFAULT_AVATAR_ID);
    expect(useAuthStore.getState()).toMatchObject({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      isFirstLaunch: false,
    });
    warn.mockRestore();
  });
});
