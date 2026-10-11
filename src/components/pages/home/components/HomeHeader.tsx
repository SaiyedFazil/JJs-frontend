import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, ChevronDown } from 'lucide-react-native';
import { Text, SearchButton, RadialGlow, Icon } from '@/components/ui';

export const HomeHeader = ({
  address,
  onSearch,
  onNotifications,
  hasUnread = true,
}: {
  address: string;
  onSearch?: () => void;
  /** A placeholder until notifications exist: the screen says so. */
  onNotifications?: () => void;
  hasUnread?: boolean;
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingTop: insets.top + 16 }}
      className="relative overflow-hidden bg-hero px-md pb-md gap-md"
    >
      {/* Bleeds past the top-right corner, as in the design. */}
      <RadialGlow size={240} style={styles.glow} />

      <View className="flex-row items-center justify-between">
        <View>
          <Text variant="caption" tone="ember">
            Deliver to · Home
          </Text>
          <View className="flex-row items-center gap-xs mt-xs">
            <Text
              variant="item"
              tone="on-hero"
              numberOfLines={1}
              className="max-w-56"
            >
              {address}
            </Text>
            <ChevronDown
              size={15}
              className="text-hero-muted"
              strokeWidth={2.4}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={onNotifications}
          accessibilityRole="button"
          accessibilityLabel={
            hasUnread ? 'Notifications, unread' : 'Notifications'
          }
          className="w-10 h-10 rounded-md bg-hero-surface items-center justify-center"
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <Icon
            icon={Bell}
            className="text-hero-foreground"
            size={19}
            strokeWidth={1.9}
          />
          {hasUnread ? (
            <View className="absolute top-2 right-2 w-2 h-2 rounded-pill bg-ember border border-hero-surface" />
          ) : null}
        </TouchableOpacity>
      </View>

      <SearchButton onPress={onSearch} />
    </View>
  );
};

/** Layout-only: the glow bleeds past the header's top-right corner by design. */
const styles = StyleSheet.create({
  glow: { top: -90, right: -50 },
});
