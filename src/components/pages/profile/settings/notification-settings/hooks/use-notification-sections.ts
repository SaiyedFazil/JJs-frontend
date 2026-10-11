import { useMemo } from 'react';
import {
  BadgePercent,
  Bike,
  RefreshCw,
  Sparkles,
  Star,
  type LucideIcon,
} from 'lucide-react-native';
import {
  LOCKED_TOPICS,
  useNotificationSettingsStore,
} from '@/store/notification-settings.store';
import type { NotificationTopic } from '@/types/notification.types';

export interface NotificationTopicRow {
  topic: NotificationTopic;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  /** The icon tile's ground and the icon's colour, as literal utilities. */
  tile: string;
  iconClass: string;
  isOn: boolean;
  /** Shown on and cannot be switched off — see LOCKED_TOPICS. */
  isLocked: boolean;
}

export interface NotificationSection {
  label: string;
  rows: NotificationTopicRow[];
}

type TopicCopy = Omit<NotificationTopicRow, 'isOn' | 'isLocked'>;

/**
 * Every topic, grouped as the screen shows them. Order-related topics take
 * the ember tile, as the Profile tab's Activity rows do; marketing takes the
 * sand tile of its account rows.
 */
const SECTIONS: { label: string; topics: TopicCopy[] }[] = [
  {
    label: 'Orders',
    topics: [
      {
        topic: 'orderUpdates',
        title: 'Order updates',
        subtitle: 'Confirmed, on the way & delivered. Always on.',
        icon: Bike,
        tile: 'bg-ember-tint',
        iconClass: 'text-ember',
      },
      {
        topic: 'ratingReminders',
        title: 'Rating reminders',
        subtitle: 'A nudge to rate your meal after it arrives',
        icon: Star,
        tile: 'bg-ember-tint',
        iconClass: 'text-ember',
      },
    ],
  },
  {
    label: 'Offers & updates',
    topics: [
      {
        topic: 'offers',
        title: 'Offers & discounts',
        subtitle: 'Coupons, deals and festive specials',
        icon: BadgePercent,
        tile: 'bg-tile-sand',
        iconClass: 'text-tile-gold',
      },
      {
        topic: 'newDishes',
        title: 'New on the menu',
        subtitle: 'Fresh dishes and seasonal specials',
        icon: Sparkles,
        tile: 'bg-tile-sand',
        iconClass: 'text-tile-gold',
      },
      {
        topic: 'reorderReminders',
        title: 'Reorder reminders',
        subtitle: "When it's been a while since your favourites",
        icon: RefreshCw,
        tile: 'bg-tile-sand',
        iconClass: 'text-tile-gold',
      },
    ],
  },
];

/**
 * The Notifications screen's sections, each topic carrying its current
 * value, plus the setter. Re-renders only when a preference changes.
 */
export const useNotificationSections = () => {
  const prefs = useNotificationSettingsStore(s => s.prefs);
  const setTopic = useNotificationSettingsStore(s => s.setTopic);

  const sections = useMemo<NotificationSection[]>(
    () =>
      SECTIONS.map(({ label, topics }) => ({
        label,
        rows: topics.map(copy => ({
          ...copy,
          isOn: prefs[copy.topic],
          isLocked: LOCKED_TOPICS.includes(copy.topic),
        })),
      })),
    [prefs],
  );

  return { sections, setTopic };
};
