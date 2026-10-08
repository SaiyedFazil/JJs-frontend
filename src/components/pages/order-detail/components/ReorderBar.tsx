import React from 'react';
import { TouchableOpacity, View, type LayoutChangeEvent } from 'react-native';
import { RotateCcw } from 'lucide-react-native';
import { Icon, Text } from '@/components/ui';

/**
 * The sticky bottom bar. Reorder is the receipt's primary action; a cancelled
 * order reads "Order again" instead, since there is nothing to repeat so much
 * as to retry. The bar owns the bottom safe-area inset so its button never
 * sits under the home indicator.
 */
export const ReorderBar = ({
  label,
  bottomInset,
  onReorder,
  onLayout,
}: {
  label: string;
  bottomInset: number;
  onReorder: () => void;
  onLayout?: (e: LayoutChangeEvent) => void;
}) => (
  <View
    onLayout={onLayout}
    style={{ paddingBottom: bottomInset + 16 }}
    className="border-t border-card-hairline bg-surface px-md pt-sm shadow-e3"
  >
    <TouchableOpacity
      onPress={onReorder}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="h-14 flex-row items-center justify-center gap-sm rounded-lg bg-ember shadow-ember-glow"
    >
      <Icon
        icon={RotateCcw}
        className="text-on-ember"
        size={18}
        strokeWidth={2.4}
      />
      <Text variant="body" tone="on-ember" weight="800">
        {label}
      </Text>
    </TouchableOpacity>
  </View>
);
