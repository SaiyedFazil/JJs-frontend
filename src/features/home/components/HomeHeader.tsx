import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, ChevronDown } from 'lucide-react-native';
import {
  Text,
  Segmented,
  SearchButton,
  RadialGlow,
  LinearFill,
  type SegmentedOption,
} from '@/components/ui';

export const SERVICE_MODES: SegmentedOption[] = [
  { value: 'delivery', label: 'Delivery' },
  { value: 'takeaway', label: 'Takeaway' },
  { value: 'dinein', label: 'Dine-in' },
];

export const HomeHeader = ({
  address,
  serviceMode,
  onServiceModeChange,
  onSearch,
  hasUnread = true,
}: {
  address: string;
  serviceMode: string;
  onServiceModeChange: (value: string) => void;
  onSearch?: () => void;
  hasUnread?: boolean;
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingTop: insets.top + 16 }}
      className="relative overflow-hidden bg-hero px-md pb-md gap-md"
    >
      {/* Bleeds past the top-right corner, as in the design. */}
      <RadialGlow size={240} style={{ top: -90, right: -50 }} />

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

        <View className="flex-row gap-sm">
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={
              hasUnread ? 'Notifications, unread' : 'Notifications'
            }
            className="w-10 h-10 rounded-md bg-hero-surface items-center justify-center"
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <Bell
              size={19}
              className="text-hero-foreground"
              strokeWidth={1.9}
            />
            {hasUnread ? (
              <View className="absolute top-2 right-2 w-2 h-2 rounded-pill bg-ember border border-hero-surface" />
            ) : null}
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityLabel="Your profile"
            className="relative overflow-hidden w-10 h-10 rounded-md items-center justify-center"
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <LinearFill from="ember" to="saffron" diagonal />
            <Text variant="item" tone="on-ember">
              A
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Segmented
        options={SERVICE_MODES}
        value={serviceMode}
        onChange={onServiceModeChange}
        surface="hero"
      />

      <SearchButton onPress={onSearch} />
    </View>
  );
};
