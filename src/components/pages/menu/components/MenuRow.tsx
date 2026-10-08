import React, { memo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Heart, Plus, Star } from 'lucide-react-native';
import type { MenuItem } from '@/types/menu.types';
import {
  Icon,
  ImageTile,
  QuantityStepper,
  Text,
  VegBadge,
} from '@/components/ui';
import { isBestseller } from '../hooks/use-menu-catalog';

/**
 * One dish in the full menu: copy on the left, photo on the right with the
 * stepper overlapping its lower edge (the FoodCard list layout). The copy and
 * the photo open the dish's page; the stepper stays a target of its own.
 *
 * `onUnfavourite` adds a filled-heart button to the photo's top-right — the
 * Favourites tab reuses this same card and removes a dish with it (the Menu
 * tab leaves it off). Memoised, with the item passed back through the
 * callbacks, so a cart change re-renders only the row whose quantity moved —
 * not all 125.
 */
export const MenuRow = memo(
  ({
    item,
    quantity,
    onAdd,
    onRemove,
    onOpen,
    onUnfavourite,
  }: {
    item: MenuItem;
    quantity: number;
    onAdd: (item: MenuItem) => void;
    onRemove: (item: MenuItem) => void;
    onOpen: (item: MenuItem) => void;
    onUnfavourite?: (item: MenuItem) => void;
  }) => {
    const soldOut = !!item.soldOut;

    return (
      <View className="flex-row items-start gap-md">
        <TouchableOpacity
          onPress={() => onOpen(item)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`${item.name}, view details`}
          className="flex-1 gap-1.5"
        >
          <View className="flex-row items-center gap-sm">
            <VegBadge isVeg={item.veg} />
            {isBestseller(item) ? (
              <View className="bg-ember-tint rounded-sm px-1.5 py-0.5">
                <Text variant="micro" tone="ember-pressed" weight="800">
                  BESTSELLER
                </Text>
              </View>
            ) : null}
          </View>

          <Text
            variant="item"
            weight="700"
            tone={soldOut ? 'label' : 'ink'}
            numberOfLines={2}
          >
            {item.name}
          </Text>

          <View className="flex-row items-center gap-sm">
            <Text variant="body" weight="800" tone={soldOut ? 'label' : 'ink'}>
              {item.mrp ? `MRP ₹${item.base}` : `₹${item.base}`}
            </Text>
            {item.rating != null ? (
              <View className="flex-row items-center gap-0.5">
                <Icon
                  icon={Star}
                  className="text-veg"
                  size={12}
                  fill="currentColor"
                />
                <Text variant="fine" tone="veg" weight="700">
                  {item.rating.toFixed(1)}
                </Text>
              </View>
            ) : null}
          </View>

          {item.desc ? (
            <Text variant="fine" tone="muted" numberOfLines={2}>
              {item.desc}
            </Text>
          ) : null}

          {item.portion ? (
            <View className="flex-row items-center gap-1">
              <Icon
                icon={Plus}
                className="text-tile-gold"
                size={11}
                strokeWidth={2.4}
              />
              <Text variant="micro" tone="gold" weight="700">
                {`Customizable · Full ₹${item.portion.full} · Half ₹${item.portion.half}`}
              </Text>
            </View>
          ) : null}
        </TouchableOpacity>

        <View className="w-28 items-center">
          {/* A second target for the same page, so screen readers skip it. */}
          <TouchableOpacity
            onPress={() => onOpen(item)}
            activeOpacity={0.85}
            accessible={false}
            className="w-28 h-24 rounded-lg overflow-hidden border border-hairline"
          >
            <ImageTile
              categoryId={item.cat}
              source={item.image}
              emojiSize={30}
            />
            {soldOut ? (
              <View className="absolute inset-0 bg-scrim items-center justify-center">
                <Text variant="caption" tone="on-ember">
                  SOLD OUT
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>

          {/* Favourites-only: a filled heart on the photo removes the dish. */}
          {onUnfavourite ? (
            <TouchableOpacity
              onPress={() => onUnfavourite(item)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${item.name} from favourites`}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="absolute top-1.5 right-1.5 w-8 h-8 rounded-pill bg-surface items-center justify-center shadow-e2"
            >
              <Icon
                icon={Heart}
                className="text-ember"
                size={16}
                fill="currentColor"
                strokeWidth={2}
              />
            </TouchableOpacity>
          ) : null}

          {/* Overlaps the photo's lower edge, as in FoodCard's list layout. */}
          {soldOut ? null : (
            <View className="-mt-5">
              <QuantityStepper
                quantity={quantity}
                onAdd={() => onAdd(item)}
                onRemove={() => onRemove(item)}
                variant="outline"
              />
            </View>
          )}
        </View>
      </View>
    );
  },
);

MenuRow.displayName = 'MenuRow';
