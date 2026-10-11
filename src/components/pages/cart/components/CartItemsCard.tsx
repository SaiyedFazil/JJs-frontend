import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Plus } from 'lucide-react-native';
import { Icon, Text, VegBadge } from '@/components/ui';
import { QuantityControl } from '@/components/custom/QuantityControl';
import { byId } from '@/data/menu';
import { inr } from '@/data/orders';
import type { CartItem, CartItemOptions } from '@/store/cart.store';
import type { SpiceLevel } from '@/types/menu.types';

const SPICE_LABEL: Record<SpiceLevel, string> = {
  mild: 'Mild spice',
  medium: 'Medium spice',
  spicy: 'Spicy',
};

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

const CartLineRow = ({
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

  return (
    <View
      className={`flex-row gap-3 py-3.5 ${
        isLast ? '' : 'border-b border-row-divider'
      }`}
    >
      {dish ? (
        <View className="mt-0.5">
          <VegBadge isVeg={dish.veg} size={18} />
        </View>
      ) : null}

      <View className="flex-1">
        <Text variant="body" weight="700" className="mb-1">
          {item.name}
        </Text>
        {custom ? (
          <View className="mb-1.5 flex-row items-center gap-2">
            <Text variant="micro" tone="label" weight="500" className="shrink">
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
        <Text variant="fine" weight="800">
          {inr(item.price * item.quantity)}
        </Text>
      </View>

      <QuantityControl
        size="sm"
        name={item.name}
        quantity={item.quantity}
        canDecrement
        onIncrement={() => onIncrement(item)}
        onDecrement={() => onDecrement(item)}
      />
    </View>
  );
};

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
    <View className="rounded-lg border border-card-hairline bg-surface px-4 py-1">
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

      <TouchableOpacity
        onPress={onAddMore}
        activeOpacity={0.7}
        accessibilityRole="button"
        className="flex-row items-center gap-2 py-3.5"
      >
        <Icon icon={Plus} className="text-ember" size={17} strokeWidth={2.4} />
        <Text variant="fine" tone="ember" weight="800">
          Add more items
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);
