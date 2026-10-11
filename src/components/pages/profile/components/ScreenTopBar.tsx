import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Icon, Text } from '@/components/ui';

/**
 * The white top bar of a screen pushed from Profile: back arrow and title,
 * on a hairline, with the safe-area strip above it in the same white rather
 * than the canvas. Matches My Orders' bar.
 */
export const ScreenTopBar = ({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View className="bg-surface border-b border-card-hairline">
      <View style={{ height: insets.top }} />
      <View className="flex-row items-center gap-sm px-md pt-xs pb-3">
        <TouchableOpacity
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
        >
          <Icon
            icon={ArrowLeft}
            className="text-ink"
            size={24}
            strokeWidth={2}
          />
        </TouchableOpacity>
        <Text variant="h2" accessibilityRole="header">
          {title}
        </Text>
      </View>
    </View>
  );
};
