import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { Icon, Text } from '@/components/ui';

const SIZE = {
  /** The Quantity card in the body. */
  md: { button: 'w-11 h-11.5', count: 'w-10' },
  /** The bottom bar, matched to the height of the button beside it. */
  lg: { button: 'w-11 h-13', count: 'w-9' },
} as const;

/**
 * − n + in an ember outline, the + face filled. Never collapses to an ADD
 * button the way the kit's QuantityStepper does: on this page the quantity is
 * always at least one, and adding is the bar's job.
 */
export const QuantityControl = ({
  quantity,
  onIncrement,
  onDecrement,
  canDecrement,
  size = 'md',
}: {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  canDecrement: boolean;
  size?: keyof typeof SIZE;
}) => {
  const s = SIZE[size];

  return (
    <View className="flex-row items-center bg-surface border-2 border-ember rounded-md overflow-hidden">
      <TouchableOpacity
        onPress={onDecrement}
        disabled={!canDecrement}
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        accessibilityState={{ disabled: !canDecrement }}
        className={`${s.button} items-center justify-center bg-surface ${
          canDecrement ? '' : 'opacity-40'
        }`}
      >
        <Icon icon={Minus} className="text-ember" size={18} strokeWidth={2.6} />
      </TouchableOpacity>
      <Text
        variant="item"
        weight="800"
        className={`${s.count} text-center`}
        accessibilityLabel={`Quantity ${quantity}`}
      >
        {quantity}
      </Text>
      <TouchableOpacity
        onPress={onIncrement}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        className={`${s.button} items-center justify-center bg-ember`}
      >
        <Icon
          icon={Plus}
          className="text-on-ember"
          size={18}
          strokeWidth={2.6}
        />
      </TouchableOpacity>
    </View>
  );
};
