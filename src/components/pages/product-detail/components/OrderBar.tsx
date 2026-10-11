import React from 'react';
import { TouchableOpacity, View, type LayoutChangeEvent } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { Icon, Text } from '@/components/ui';
import { QuantityControl } from '@/components/custom/QuantityControl';

/**
 * The sticky bar under the page, in one of four states:
 *  - sold out: a dead button and nothing else;
 *  - opened from a cart line's Edit, with its choices since changed: the
 *    stepper sets the new quantity, and the ember button updates that line;
 *  - this configuration is in the cart: its stepper edits the cart line, and
 *    the dark button heads to the cart;
 *  - otherwise: the stepper sets how many to add, and the total rides on the
 *    ember button.
 */
export const OrderBar = ({
  isSoldOut,
  isUpdating,
  isInCart,
  quantity,
  canDecrement,
  total,
  bottomInset,
  onIncrement,
  onDecrement,
  onAdd,
  onUpdate,
  onViewCart,
  onLayout,
}: {
  isSoldOut: boolean;
  isUpdating: boolean;
  isInCart: boolean;
  quantity: number;
  canDecrement: boolean;
  total: number;
  bottomInset: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onAdd: () => void;
  onUpdate: () => void;
  onViewCart: () => void;
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

        {isUpdating ? (
          <TouchableOpacity
            onPress={onUpdate}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={`Update item to ${quantity} for ₹${total}`}
            className="flex-1 h-13 rounded-lg bg-ember shadow-ember-glow flex-row items-center justify-between px-4.5"
          >
            <Text variant="body" weight="800" tone="on-ember">
              Update item
            </Text>
            <Text variant="body" weight="800" tone="on-ember">
              {`₹${total}`}
            </Text>
          </TouchableOpacity>
        ) : isInCart ? (
          <TouchableOpacity
            onPress={onViewCart}
            activeOpacity={0.9}
            accessibilityRole="button"
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
