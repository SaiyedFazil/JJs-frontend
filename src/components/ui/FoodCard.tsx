import React, { memo } from 'react';
import { View, Image } from 'react-native';
import { Text } from './Text';
import { VegBadge, RatingBadge, Tag, SpiceBadge } from './Badges';
import { PriceTag } from './PriceTag';
import { QuantityStepper } from './QuantityStepper';

export interface FoodItem {
  id: string;
  name: string;
  price: number;
  rating: number;
  image: string;
  description?: string;
  isVeg?: boolean;
  reviews?: number;
  strikePrice?: number;
  tag?: string;
  isSpicy?: boolean;
}

export interface FoodCardProps {
  item: FoodItem;
  layout?: 'list' | 'grid';
  quantity?: number;
  onAdd?: () => void;
  onRemove?: () => void;
}

const noop = () => {};

/** PDF section 05 · food item card, list and grid layouts. */
export const FoodCard = memo(
  ({
    item,
    layout = 'list',
    quantity = 0,
    onAdd = noop,
    onRemove = noop,
  }: FoodCardProps) => {
    if (layout === 'grid') {
      return (
        <View className="bg-surface rounded-lg overflow-hidden shadow-e1 border border-hairline">
          <Image
            source={{ uri: item.image }}
            className="w-full h-32"
            resizeMode="cover"
          />
          <View className="p-md gap-sm">
            <View className="flex-row items-center gap-sm">
              <VegBadge isVeg={!!item.isVeg} size={14} />
              {item.tag ? <Tag label={item.tag} /> : null}
            </View>
            <Text variant="item" numberOfLines={2}>
              {item.name}
            </Text>
            <View className="flex-row items-center justify-between">
              <PriceTag price={item.price} strikePrice={item.strikePrice} />
              <QuantityStepper
                quantity={quantity}
                onAdd={onAdd}
                onRemove={onRemove}
              />
            </View>
          </View>
        </View>
      );
    }

    return (
      <View className="py-lg flex-row items-start border-b border-hairline">
        <View className="flex-1 pr-md gap-sm">
          <View className="flex-row items-center gap-sm">
            <VegBadge isVeg={!!item.isVeg} />
            {item.tag ? <Tag label={item.tag} /> : null}
            {item.isSpicy ? <SpiceBadge /> : null}
          </View>

          <Text variant="item" numberOfLines={2}>
            {item.name}
          </Text>

          <PriceTag price={item.price} strikePrice={item.strikePrice} />

          <RatingBadge rating={item.rating} reviews={item.reviews} />

          {item.description ? (
            <Text variant="body" tone="muted" numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
        </View>

        <View className="items-center">
          <Image
            source={{ uri: item.image }}
            className="w-32 h-32 rounded-lg"
            resizeMode="cover"
          />
          {/* Overlaps the image's lower edge, as in the PDF. */}
          <View className="-mt-5">
            <QuantityStepper
              quantity={quantity}
              onAdd={onAdd}
              onRemove={onRemove}
            />
          </View>
        </View>
      </View>
    );
  },
);

FoodCard.displayName = 'FoodCard';
