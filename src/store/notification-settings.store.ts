import { create } from 'zustand';
import { getNotificationPrefs, setNotificationPrefs } from '@/lib/storage';
import type {
  NotificationPreferences,
  NotificationTopic,
} from '@/types/notification.types';

/** Everything on, as a new customer starts. */
export const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  orderUpdates: true,
  ratingReminders: true,
  offers: true,
  newDishes: true,
  reorderReminders: true,
};

/**
 * Topics the customer cannot turn off: an order in flight has to be able to
 * say it is on its way. The screen shows these locked on, and the store
 * refuses to turn them off even if asked.
 */
export const LOCKED_TOPICS: readonly NotificationTopic[] = ['orderUpdates'];

/**
 * The stored choices over the defaults, so a topic added in a later release
 * starts at its default rather than undefined; locked topics are forced on.
 */
const hydrate = (): NotificationPreferences => {
  const prefs = { ...DEFAULT_NOTIFICATION_PREFS, ...getNotificationPrefs() };
  LOCKED_TOPICS.forEach(topic => {
    prefs[topic] = true;
  });
  return prefs;
};

interface NotificationSettingsState {
  prefs: NotificationPreferences;

  /** Turns one topic on or off and writes it through to MMKV. */
  setTopic: (topic: NotificationTopic, isOn: boolean) => void;

  /**
   * Back to the defaults. Called from logout: MMKV is wiped there, and this
   * drops the copy in memory, so the next person to sign in on this device
   * does not inherit the previous one's choices.
   */
  reset: () => void;
}

/**
 * Notification preferences. Device-local for now — there is no preferences
 * endpoint yet, and nothing sends notifications — so this records the
 * customer's choices for when both exist.
 */
export const useNotificationSettingsStore = create<NotificationSettingsState>(
  (set, get) => ({
    // MMKV reads are synchronous, so this hydrates once with no loading state.
    prefs: hydrate(),

    setTopic: (topic, isOn) => {
      if (LOCKED_TOPICS.includes(topic) || get().prefs[topic] === isOn) return;
      const prefs = { ...get().prefs, [topic]: isOn };
      setNotificationPrefs(prefs);
      set({ prefs });
    },

    reset: () => set({ prefs: { ...DEFAULT_NOTIFICATION_PREFS } }),
  }),
);
