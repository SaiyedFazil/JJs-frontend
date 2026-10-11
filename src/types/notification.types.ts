/**
 * The kinds of notification a customer can opt in or out of, on the
 * Settings → Notifications screen.
 */
export type NotificationTopic =
  | 'orderUpdates'
  | 'ratingReminders'
  | 'offers'
  | 'newDishes'
  | 'reorderReminders';

/** Whether each topic is on. */
export type NotificationPreferences = Record<NotificationTopic, boolean>;
