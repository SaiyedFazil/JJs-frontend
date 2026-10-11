import React, { memo, useCallback } from 'react';
import { TouchableOpacity, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  LayoutAnimationConfig,
  LinearTransition,
} from 'react-native-reanimated';
import { Plus } from 'lucide-react-native';
import { ImageTile, Icon, Text, VegBadge } from '@/components/ui';
import { byId } from '@/data/menu';
import { inr } from '@/data/orders';
import type { CartItem, CartItemOptions } from '@/store/cart.store';
import type { SpiceLevel } from '@/types/menu.types';
import { LineStepper } from './LineStepper';

const SPICE_LABEL: Record<SpiceLevel, string> = {
  mild: 'Mild spice',
  medium: 'Medium spice',
  spicy: 'Spicy',
};

/** A removed line fades as the rows below close up; Undo fades it back. */
const ROW_LAYOUT = LinearTransition.duration(220);
const ROW_ENTER = FadeIn.duration(220);
const ROW_EXIT = FadeOut.duration(160);

/**
 * A customised line's choices on one line — "Half · Medium spice · + Extra
 * Butter Naan". Empty for a dish added as-is.
 */
const describeOptions = (options?: CartItemOptions): string => {
  if (!options) return '';
  return [
    options.portion === 'half' ? 'Half' : options.portion ? 'Full' : '',
    options.spice ? SPICE_LABEL[options.spice] : '',
    ...options.addOns.map(a => `+ ${a.name}`),
    options.notes ? `“${options.notes}”` : '',
  ]
    .filter(Boolean)
    .join(' · ');
};

const CartLineRow = memo(
  ({
    item,
    isLast,
    onIncrement,
    onDecrement,
    onEdit,
  }: {
    item: CartItem;
    isLast: boolean;
    onIncrement: (item: CartItem) => void;
    onDecrement: (item: CartItem) => void;
    onEdit: (item: CartItem) => void;
  }) => {
    const dish = byId[item.dishId ?? item.id];
    const custom = describeOptions(item.options);

    const increment = useCallback(() => onIncrement(item), [onIncrement, item]);
    const decrement = useCallback(() => onDecrement(item), [onDecrement, item]);

    return (
      <Animated.View
        layout={ROW_LAYOUT}
        entering={ROW_ENTER}
        exiting={ROW_EXIT}
        className={`flex-row items-center gap-3 py-3.5 ${
          isLast ? '' : 'border-b border-row-divider'
        }`}
      >
        <View className="w-14 h-14 overflow-hidden rounded-md">
          <ImageTile
            source={dish?.image}
            categoryId={dish?.cat ?? ''}
            emojiSize={24}
          />
        </View>

        <View className="flex-1">
          <View className="flex-row items-start gap-1.5">
            {dish ? (
              <View className="mt-1">
                <VegBadge isVeg={dish.veg} size={13} />
              </View>
            ) : null}
            <Text
              variant="body"
              weight="700"
              numberOfLines={2}
              className="shrink"
            >
              {item.name}
            </Text>
          </View>

          {custom ? (
            <View className="mt-1 flex-row items-center gap-2">
              <Text
                variant="micro"
                tone="label"
                weight="500"
                numberOfLines={2}
                className="shrink"
              >
                {custom}
              </Text>
              <TouchableOpacity
                onPress={() => onEdit(item)}
                accessibilityRole="button"
                accessibilityLabel={`Edit ${item.name}`}
                hitSlop={{ top: 10, bottom: 10, left: 6, right: 10 }}
              >
                <Text variant="micro" tone="ember" weight="800">
                  Edit
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <View className="mt-1.5 flex-row items-baseline gap-1.5">
            <Text variant="fine" weight="800">
              {inr(item.price * item.quantity)}
            </Text>
            {item.quantity > 1 ? (
              <Text variant="micro" tone="label" weight="500">
                {`${inr(item.price)} each`}
              </Text>
            ) : null}
          </View>
        </View>

        <LineStepper
          quantity={item.quantity}
          name={item.name}
          onIncrement={increment}
          onDecrement={decrement}
        />
      </Animated.View>
    );
  },
);

CartLineRow.displayName = 'CartLineRow';

/**
 * The lines in the cart. Stepping a line to zero removes it (the screen
 * offers Undo); a customised line carries its choices and an Edit that
 * reopens the dish with them. "Add more items" heads back to the menu.
 */
export const CartItemsCard = ({
  items,
  onIncrement,
  onDecrement,
  onEdit,
  onAddMore,
}: {
  items: CartItem[];
  onIncrement: (item: CartItem) => void;
  onDecrement: (item: CartItem) => void;
  onEdit: (item: CartItem) => void;
  onAddMore: () => void;
}) => (
  <View className="px-4 pt-3.5">
    <View className="rounded-lg border border-card-hairline bg-surface px-4 pt-3.5">
      <Text variant="caption" tone="label" weight="800">
        Your order
      </Text>

      {/* The rows only animate from here on: opening the cart shows them
          as they are. */}
      <LayoutAnimationConfig skipEntering>
        {items.map((item, i) => (
          <CartLineRow
            key={item.id}
            item={item}
            isLast={i === items.length - 1}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            onEdit={onEdit}
          />
        ))}
      </LayoutAnimationConfig>

      <Animated.View
        layout={ROW_LAYOUT}
        className="border-t border-row-divider"
      >
        <TouchableOpacity
          onPress={onAddMore}
          activeOpacity={0.7}
          accessibilityRole="button"
          className="flex-row items-center gap-2 py-3.5"
        >
          <Icon
            icon={Plus}
            className="text-ember"
            size={17}
            strokeWidth={2.4}
          />
          <Text variant="fine" tone="ember" weight="800">
            Add more items
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  </View>
);
