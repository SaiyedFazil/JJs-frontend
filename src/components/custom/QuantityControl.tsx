import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { Icon, Text, type TextVariant } from '@/components/ui';

const SIZE: Record<
  'sm' | 'md' | 'lg',
  { button: string; count: string; variant: TextVariant; icon: number }
> = {
  /** A cart row, beside the line's name and price. */
  sm: { button: 'w-7.5 h-8', count: 'w-6', variant: 'body', icon: 14 },
  /** The product page's Quantity card. */
  md: { button: 'w-11 h-11.5', count: 'w-10', variant: 'item', icon: 18 },
  /** The product page's bottom bar, matched to the button beside it. */
  lg: { button: 'w-11 h-13', count: 'w-9', variant: 'item', icon: 18 },
};

/**
 * − n + in an ember outline, the + face filled. Never collapses to an ADD
 * button the way the kit's QuantityStepper does: where this is used the line
 * already exists, so there is always a quantity to show.
 *
 * `name` makes the buttons' labels say what they change — needed wherever
 * several of these share a screen, as in the cart.
 */
export const QuantityControl = ({
  quantity,
  onIncrement,
  onDecrement,
  canDecrement,
  size = 'md',
  name,
}: {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  canDecrement: boolean;
  size?: keyof typeof SIZE;
  name?: string;
}) => {
  const s = SIZE[size];

  return (
    <View className="flex-row items-center bg-surface border-2 border-ember rounded-md overflow-hidden">
      <TouchableOpacity
        onPress={onDecrement}
        disabled={!canDecrement}
        accessibilityRole="button"
        accessibilityLabel={name ? `Remove one ${name}` : 'Decrease quantity'}
        accessibilityState={{ disabled: !canDecrement }}
        className={`${s.button} items-center justify-center bg-surface ${
          canDecrement ? '' : 'opacity-40'
        }`}
      >
        <Icon
          icon={Minus}
          className="text-ember"
          size={s.icon}
          strokeWidth={2.6}
        />
      </TouchableOpacity>
      <Text
        variant={s.variant}
        weight="800"
        className={`${s.count} text-center`}
        accessibilityLabel={`Quantity ${quantity}`}
      >
        {quantity}
      </Text>
      <TouchableOpacity
        onPress={onIncrement}
        accessibilityRole="button"
        accessibilityLabel={name ? `Add one ${name}` : 'Increase quantity'}
        className={`${s.button} items-center justify-center bg-ember`}
      >
        <Icon
          icon={Plus}
          className="text-on-ember"
          size={s.icon}
          strokeWidth={2.6}
        />
      </TouchableOpacity>
    </View>
  );
};
