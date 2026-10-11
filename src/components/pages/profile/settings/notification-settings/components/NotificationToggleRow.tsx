import React, { memo, useCallback } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Switch } from 'heroui-native';
import { Icon, Text } from '@/components/ui';
import type { NotificationTopic } from '@/types/notification.types';
import type { NotificationTopicRow } from '../hooks/use-notification-sections';

/** The switch's track colours, off then on, resolved by the screen. */
export type TrackColors = [string, string] | undefined;

/**
 * One topic: icon tile, title over subtitle, and a switch. The whole row
 * toggles, not only the switch, and it is one control to a screen reader —
 * a switch with the title as its label — so the inner switch is hidden.
 *
 * Laid out like ProfileRow, so this screen reads as part of Profile.
 */
export const NotificationToggleRow = memo(
  ({
    row,
    trackColors,
    isLast,
    onChange,
  }: {
    row: NotificationTopicRow;
    trackColors: TrackColors;
    isLast: boolean;
    onChange: (topic: NotificationTopic, isOn: boolean) => void;
  }) => {
    const { topic, title, subtitle, icon, tile, iconClass, isOn, isLocked } =
      row;

    const toggle = useCallback(
      () => onChange(topic, !isOn),
      [onChange, topic, isOn],
    );
    const select = useCallback(
      (next: boolean) => onChange(topic, next),
      [onChange, topic],
    );

    return (
      <TouchableOpacity
        onPress={toggle}
        disabled={isLocked}
        activeOpacity={0.6}
        accessibilityRole="switch"
        accessibilityLabel={title}
        accessibilityHint={subtitle}
        accessibilityState={{ checked: isOn, disabled: isLocked }}
        className={`flex-row items-center gap-3 px-4 py-3.5 ${
          isLast ? '' : 'border-b border-row-divider'
        }`}
      >
        <View
          className={`w-9.5 h-9.5 rounded-md items-center justify-center ${tile}`}
        >
          <Icon icon={icon} className={iconClass} />
        </View>

        <View className="flex-1">
          <Text variant="body" weight="700">
            {title}
          </Text>
          <Text variant="fine" tone="label" className="mt-1">
            {subtitle}
          </Text>
        </View>

        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Switch
            isSelected={isOn}
            isDisabled={isLocked}
            onSelectedChange={select}
            animation={
              trackColors
                ? { backgroundColor: { value: trackColors } }
                : undefined
            }
          />
        </View>
      </TouchableOpacity>
    );
  },
);

NotificationToggleRow.displayName = 'NotificationToggleRow';
