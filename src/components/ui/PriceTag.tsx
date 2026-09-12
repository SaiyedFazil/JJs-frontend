import React from 'react';
import { View } from 'react-native';
import { Text } from './Text';

/** Rupee-formatted price. The PDF uses the bare symbol with no space. */
const rupees = (amount: number) => `₹${amount}`;

/** PDF section 05 · price, optionally with a struck-through original. */
export const PriceTag = ({
  price,
  strikePrice,
  size = 'md',
}: {
  price: number;
  strikePrice?: number;
  size?: 'md' | 'sm';
}) => (
  <View className="flex-row items-baseline gap-sm">
    <Text variant={size === 'md' ? 'item' : 'body'}>{rupees(price)}</Text>
    {strikePrice ? (
      <Text variant="body" tone="muted" className="line-through">
        {rupees(strikePrice)}
      </Text>
    ) : null}
  </View>
);

/** PDF section 05 · portion price — "Full ₹499  Half ₹279". */
export const PortionPrice = ({
  full,
  half,
}: {
  full: number;
  half?: number;
}) => (
  <View className="flex-row items-center gap-md">
    <View className="flex-row items-baseline gap-xs">
      <Text variant="caption" tone="muted">
        Full
      </Text>
      <Text variant="item">{rupees(full)}</Text>
    </View>
    {half ? (
      <View className="flex-row items-baseline gap-xs">
        <Text variant="caption" tone="muted">
          Half
        </Text>
        <Text variant="item">{rupees(half)}</Text>
      </View>
    ) : null}
  </View>
);
