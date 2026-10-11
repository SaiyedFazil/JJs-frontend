import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { Icon, Text } from '@/components/ui';

/**
 * The white bar at the top: a bordered back button, "Cart" over its item
 * count, and — once there is something in it — the restaurant it is from.
 * Owns the status-bar strip above it, so the white runs to the screen's edge.
 */
export const CartTopBar = ({
  topInset,
  count,
  onBack,
}: {
  topInset: number;
  count: number;
  onBack: () => void;
}) => (
  <View className="bg-surface border-b border-card-hairline">
    {/* Layout-only: the status-bar inset is a runtime value. */}
    <View style={{ height: topInset }} />
    <View className="flex-row items-center gap-3 px-4.5 pt-2 pb-3">
      <TouchableOpacity
        onPress={onBack}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        className="w-9.5 h-9.5 items-center justify-center rounded-md border border-card-hairline bg-surface"
      >
        <Icon
          icon={ChevronLeft}
          className="text-ink-strong"
          size={19}
          strokeWidth={2}
        />
      </TouchableOpacity>

      <View className="flex-1">
        <Text variant="item" weight="800">
          Cart
        </Text>
        <Text variant="micro" tone="label" weight="600" className="mt-0.5">
          {`${count} ${count === 1 ? 'item' : 'items'}`}
        </Text>
      </View>

      {count > 0 ? (
        <View className="rounded-sm bg-sunken px-2.5 py-1.5">
          <Text variant="micro" tone="label" weight="700">
            JJ’s Kitchen
          </Text>
        </View>
      ) : null}
    </View>
  </View>
);
