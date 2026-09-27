import { create } from 'zustand';
import { getAvatarId, setAvatarId } from '@/utils/storage';
import { DEFAULT_AVATAR_ID } from '@/constants/avatars';

/**
 * Profile preferences that belong to the device, not to the account.
 *
 * The avatar lives here rather than in auth.store because the backend's
 * profile has no avatar field — it is a preference, and mixing it into the
 * object we PATCH would invent a column the API does not have.
 */
interface ProfileState {
  /** Index into AVATARS (src/constants/avatars.ts). */
  avatarId: number;

  /** Picks an avatar and writes it through to MMKV in the same call. */
  setAvatar: (id: number) => void;

  /**
   * Drops back to the default. Called from logout: MMKV is wiped there, and
   * without this the next person to sign in on this device would inherit the
   * previous one's avatar from memory.
   */
  reset: () => void;
}

export const useProfileStore = create<ProfileState>(set => ({
  // Hydrated once, when the store is first created — MMKV reads are
  // synchronous, so there is no loading state to carry here.
  avatarId: getAvatarId() ?? DEFAULT_AVATAR_ID,

  setAvatar: (id: number) => {
    setAvatarId(id);
    set({ avatarId: id });
  },

  reset: () => set({ avatarId: DEFAULT_AVATAR_ID }),
}));
