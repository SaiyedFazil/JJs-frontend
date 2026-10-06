import React from 'react';
import { TouchableOpacity, View, type LayoutChangeEvent } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { Icon, Text } from '@/components/ui';
import { QuantityControl } from './QuantityControl';

/**
 * The sticky bar under the page, in one of three states:
 *  - sold out: a dead button and nothing else;
 *  - this configuration is in the cart: its stepper edits the cart line, and
 *    the dark button heads to the cart;
 *  - otherwise: the stepper sets how many to add, and the total rides on the
 *    ember button.
 */
export const OrderBar = ({
  isSoldOut,
  isInCart,
  quantity,
  canDecrement,
  total,
  bottomInset,
  onIncrement,
  onDecrement,
  onAdd,
  onViewCart,
  onLayout,
}: {
  isSoldOut: boolean;
  isInCart: boolean;
  quantity: number;
  canDecrement: boolean;
  total: number;
  bottomInset: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onAdd: () => void;
  /** Unset until there is a cart screen to go to; the button then does nothing. */
  onViewCart?: () => void;
  onLayout: (e: LayoutChangeEvent) => void;
}) => (
  <View
    onLayout={onLayout}
    // Layout-only: the gesture-bar inset is a runtime value.
    style={{ paddingBottom: bottomInset + 16 }}
    className="bg-surface border-t border-card-hairline px-4 pt-3 shadow-e3"
  >
    {isSoldOut ? (
      <View
        className="h-13 rounded-lg bg-sunken items-center justify-center"
        accessibilityRole="button"
        accessibilityState={{ disabled: true }}
      >
        <Text variant="body" weight="800" tone="label">
          Sold out today
        </Text>
      </View>
    ) : (
      <View className="flex-row items-center gap-3">
        <QuantityControl
          size="lg"
          quantity={quantity}
          canDecrement={canDecrement}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
        />

        {isInCart ? (
          <TouchableOpacity
            onPress={onViewCart}
            activeOpacity={0.9}
            accessibilityRole={onViewCart ? 'button' : undefined}
            accessibilityLabel={`In cart, ${quantity} for ₹${total}. View cart`}
            className="flex-1 h-13 rounded-lg bg-hero flex-row items-center justify-between px-4.5"
          >
            <View className="flex-row items-center gap-2">
              <Text variant="body" weight="800" tone="on-hero">
                In cart · View
              </Text>
              <Icon
                icon={ArrowRight}
                className="text-saffron"
                size={17}
                strokeWidth={2.4}
              />
            </View>
            <Text variant="body" weight="800" tone="saffron">
              {`₹${total}`}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={onAdd}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={`Add ${quantity} to cart, ₹${total}`}
            className="flex-1 h-13 rounded-lg bg-ember shadow-ember-glow flex-row items-center justify-between px-4.5"
          >
            <Text variant="body" weight="800" tone="on-ember">
              Add to cart
            </Text>
            <Text variant="body" weight="800" tone="on-ember">
              {`₹${total}`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    )}
  </View>
);
