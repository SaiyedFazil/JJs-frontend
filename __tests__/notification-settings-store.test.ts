import type { NotificationPreferences } from '../src/types/notification.types';

const mockGet = jest.fn<Partial<NotificationPreferences> | null, []>(
  () => null,
);
const mockSet = jest.fn();
jest.mock('../src/lib/storage', () => ({
  getNotificationPrefs: () => mockGet(),
  setNotificationPrefs: (prefs: NotificationPreferences) => mockSet(prefs),
}));

/**
 * The store hydrates when its module is first evaluated, so each test loads
 * a fresh copy after arranging what MMKV holds.
 */
const loadStore = () => {
  let mod!: typeof import('../src/store/notification-settings.store');
  jest.isolateModules(() => {
    mod = require('../src/store/notification-settings.store');
  });
  return mod;
};

beforeEach(() => {
  mockGet.mockReset().mockReturnValue(null);
  mockSet.mockReset();
});

describe('notification settings store', () => {
  it('starts with everything on when nothing is stored', () => {
    const { useNotificationSettingsStore, DEFAULT_NOTIFICATION_PREFS } =
      loadStore();
    expect(useNotificationSettingsStore.getState().prefs).toEqual(
      DEFAULT_NOTIFICATION_PREFS,
    );
  });

  it('layers stored choices over the defaults, so a new topic starts on', () => {
    mockGet.mockReturnValue({ offers: false });
    const { useNotificationSettingsStore } = loadStore();
    const { prefs } = useNotificationSettingsStore.getState();
    expect(prefs.offers).toBe(false);
    expect(prefs.newDishes).toBe(true);
  });

  it('forces locked topics on, even if storage says otherwise', () => {
    mockGet.mockReturnValue({ orderUpdates: false });
    const { useNotificationSettingsStore } = loadStore();
    expect(useNotificationSettingsStore.getState().prefs.orderUpdates).toBe(
      true,
    );
  });

  it('saves a change the moment it is made', () => {
    const { useNotificationSettingsStore } = loadStore();
    useNotificationSettingsStore.getState().setTopic('offers', false);
    expect(useNotificationSettingsStore.getState().prefs.offers).toBe(false);
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ offers: false, orderUpdates: true }),
    );
  });

  it('refuses to turn a locked topic off, and writes nothing', () => {
    const { useNotificationSettingsStore } = loadStore();
    useNotificationSettingsStore.getState().setTopic('orderUpdates', false);
    expect(useNotificationSettingsStore.getState().prefs.orderUpdates).toBe(
      true,
    );
    expect(mockSet).not.toHaveBeenCalled();
  });

  it('resets to the defaults in memory', () => {
    const { useNotificationSettingsStore, DEFAULT_NOTIFICATION_PREFS } =
      loadStore();
    useNotificationSettingsStore.getState().setTopic('newDishes', false);
    useNotificationSettingsStore.getState().reset();
    expect(useNotificationSettingsStore.getState().prefs).toEqual(
      DEFAULT_NOTIFICATION_PREFS,
    );
  });
});
