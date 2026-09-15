import React, { memo } from 'react';
import { View } from 'react-native';
import { Star } from 'lucide-react-native';
import type { MenuItem } from '@/types/menu';
import { Text } from './Text';
import { VegBadge } from './Badges';
import { ImageTile } from './ImageTile';
import { QuantityStepper } from './QuantityStepper';
import type { Surface } from './surface';

export interface DishCardProps {
  item: MenuItem;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  /** `canvas` = the bestseller rail. `hero` = inside a spotlight panel. */
  surface?: Surface;
  showRating?: boolean;
}

const CARD: Record<Surface, string> = {
  canvas:
    'w-40 bg-surface border border-hairline rounded-xl overflow-hidden shadow-e2',
  hero: 'w-36 bg-hero-surface border border-hero-hairline-lifted rounded-lg overflow-hidden',
};

const IMAGE_HEIGHT: Record<Surface, string> = {
  canvas: 'h-28',
  hero: 'h-24',
};

/** A mock rating, stable per dish — the menu carries no ratings yet. */
const ratingFor = (item: MenuItem) =>
  (4.3 + (item.name.length % 6) * 0.1).toFixed(1);

/** The horizontal-rail dish card. Spec §7.2. */
export const DishCard = memo(
  ({
    item,
    quantity,
    onAdd,
    onRemove,
    surface = 'canvas',
    showRating = false,
  }: DishCardProps) => {
    const onHero = surface === 'hero';

    return (
      <View className={`${CARD[surface]} ${item.soldOut ? 'opacity-50' : ''}`}>
        <View className={`relative w-full ${IMAGE_HEIGHT[surface]}`}>
          <ImageTile categoryId={item.cat} uri={item.image} emojiSize={30} />

          <View className="absolute top-sm left-sm bg-surface rounded-sm p-0.5 shadow-e1">
            <VegBadge isVeg={item.veg} size={13} />
          </View>

          {showRating ? (
            <View className="absolute bottom-sm left-sm flex-row items-center gap-xs bg-veg px-xs py-0.5 rounded-sm">
              <Star size={9} className="text-on-ember" fill="currentColor" />
              <Text variant="caption" tone="on-ember">
                {ratingFor(item)}
              </Text>
            </View>
          ) : null}
        </View>

        <View className="p-sm gap-sm">
          <Text
            variant="body"
            tone={onHero ? 'on-hero' : 'ink'}
            numberOfLines={2}
            weight="700"
            className="min-h-10"
          >
            {item.name}
          </Text>

          <View className="flex-row items-center justify-between">
            <Text variant="body" tone={onHero ? 'ember' : 'ink'} weight="800">
              {item.mrp ? `MRP ₹${item.base}` : `₹${item.base}`}
            </Text>

            {item.soldOut ? (
              <Text variant="caption" tone="muted">
                SOLD OUT
              </Text>
            ) : (
              <QuantityStepper
                quantity={quantity}
                onAdd={onAdd}
                onRemove={onRemove}
                variant="outline"
                size="sm"
              />
            )}
          </View>
        </View>
      </View>
    );
  },
);

DishCard.displayName = 'DishCard';
