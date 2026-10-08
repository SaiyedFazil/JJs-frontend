import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { Icon } from '@/components/ui';

/**
 * A row of five stars. A filled star uses saffron (fill and stroke both),
 * an empty one the `star-off` token — the same split the product detail
 * screen's rating bar uses. Read-only by default; pass `onRate` to make the
 * empty row the "Rate this order" affordance.
 */
export const StarRow = ({
  value,
  size = 13,
  onRate,
}: {
  /** 0–5 filled. */
  value: number;
  size?: number;
  onRate?: (value: number) => void;
}) => {
  const stars = [1, 2, 3, 4, 5].map(i => {
    const filled = i <= value;
    const star = (
      <Icon
        icon={Star}
        className={filled ? 'text-saffron' : 'text-star-off'}
        size={size}
        strokeWidth={1.6}
        fill="currentColor"
      />
    );
    return onRate ? (
      <TouchableOpacity
        key={i}
        onPress={() => onRate(i)}
        accessibilityRole="button"
        accessibilityLabel={`Rate ${i} ${i === 1 ? 'star' : 'stars'}`}
        hitSlop={6}
      >
        {star}
      </TouchableOpacity>
    ) : (
      <View key={i}>{star}</View>
    );
  });

  return <View className="flex-row gap-xs">{stars}</View>;
};
