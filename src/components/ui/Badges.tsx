import React from 'react';
import { View } from 'react-native';
import { Star } from 'lucide-react-native';
import { Text } from './Text';

/** PDF section 05 · the square-outline veg / non-veg marker. */
export const VegBadge = ({
  isVeg,
  size = 16,
}: {
  isVeg: boolean;
  size?: number;
}) => (
  <View
    accessibilityLabel={isVeg ? 'Vegetarian' : 'Non-vegetarian'}
    style={{ width: size, height: size }}
    className={`border-2 items-center justify-center rounded-sm ${
      isVeg ? 'border-veg' : 'border-non-veg'
    }`}
  >
    <View
      style={{ width: size * 0.4, height: size * 0.4 }}
      className={`rounded-pill ${isVeg ? 'bg-veg' : 'bg-non-veg'}`}
    />
  </View>
);

/** PDF section 05 · rating pill. */
export const RatingBadge = ({
  rating,
  reviews,
}: {
  rating: number;
  reviews?: number;
}) => (
  <View className="flex-row items-center self-start bg-sunken px-sm py-xs rounded-sm gap-xs">
    <Star size={11} className="text-saffron" fill="currentColor" />
    <Text variant="caption" tone="ink">
      {rating}
      {reviews ? ` (${reviews})` : ''}
    </Text>
  </View>
);

/** PDF section 05 · BESTSELLER-style tag. */
export const Tag = ({
  label,
  tone = 'ember',
}: {
  label: string;
  tone?: 'ember' | 'saffron';
}) => (
  <View
    className={`self-start px-sm py-xs rounded-sm ${
      tone === 'ember' ? 'bg-ember' : 'bg-saffron'
    }`}
  >
    <Text variant="caption" tone={tone === 'ember' ? 'on-ember' : 'ink'}>
      {label}
    </Text>
  </View>
);

/** PDF section 05 · spice marker. */
export const SpiceBadge = ({ label = 'SPICY' }: { label?: string }) => (
  <View className="flex-row items-center self-start bg-ember-tint px-sm py-xs rounded-sm gap-xs">
    <Text variant="caption" tone="ember">
      {`\u{1F336} ${label}`}
    </Text>
  </View>
);
