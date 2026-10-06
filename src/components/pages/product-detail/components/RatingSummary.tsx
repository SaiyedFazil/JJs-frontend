import React from 'react';
import { View } from 'react-native';
import { Star } from 'lucide-react-native';
import type { DishRating } from '@/types/menu.types';
import { Icon, Text } from '@/components/ui';

const STARS = [1, 2, 3, 4, 5];

/** The score, its stars, and a bar per star level. */
export const RatingSummary = ({ rating }: { rating: DishRating }) => {
  const earned = Math.round(rating.score);

  return (
    <View className="flex-row items-center gap-4.5 bg-surface border border-card-hairline rounded-lg px-4.5 py-4 mb-3.5">
      <View
        className="items-center"
        accessibilityLabel={`${rating.score.toFixed(1)} out of 5, from ${rating.count} ratings`}
      >
        <Text variant="h1" weight="800">
          {rating.score.toFixed(1)}
        </Text>
        <View className="flex-row gap-0.5 mt-1 mb-1">
          {STARS.map(n => (
            <Icon
              key={n}
              icon={Star}
              className={n <= earned ? 'text-saffron' : 'text-star-off'}
              size={12}
              strokeWidth={0}
              fill="currentColor"
            />
          ))}
        </View>
        <Text variant="micro" tone="label">
          {`${rating.count} ratings`}
        </Text>
      </View>

      <View className="flex-1 gap-1.5" accessible={false}>
        {rating.breakdown.map((percent, i) => (
          <View key={i} className="flex-row items-center gap-2">
            <Text variant="micro" tone="label" weight="700" className="w-2">
              {5 - i}
            </Text>
            <View className="flex-1 h-1.5 rounded-pill bg-meter-track overflow-hidden">
              {/* Layout-only: the bar's length is data. */}
              <View
                style={{ width: `${percent}%` }}
                className="h-full rounded-pill bg-saffron"
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};
