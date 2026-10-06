import React, { useState } from 'react';
import {
  StyleSheet,
  Text as RNText,
  TouchableOpacity,
  View,
} from 'react-native';
import type { DishRating, DishReview } from '@/types/menu.types';
import { Text } from '@/components/ui';
import { RatingSummary } from './RatingSummary';
import { ReviewCard } from './ReviewCard';

/**
 * The score summary and the written reviews under it. The reviews start open
 * and fold away; the summary always stays. A dish nobody has rated yet gets
 * an empty state instead of a zero.
 */
export const ReviewsSection = ({
  rating,
  reviews,
  categoryId,
}: {
  rating?: DishRating;
  reviews: DishReview[];
  categoryId: string;
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasReviews = reviews.length > 0;

  return (
    <View className="px-5 pt-4.5">
      <View className="flex-row items-center justify-between mb-3.5">
        <Text variant="title">Reviews</Text>
        {hasReviews ? (
          <TouchableOpacity
            onPress={() => setIsOpen(open => !open)}
            accessibilityRole="button"
            accessibilityState={{ expanded: isOpen }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text variant="fine" tone="ember" weight="700">
              {isOpen ? 'Hide' : 'See all reviews'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {rating ? <RatingSummary rating={rating} /> : null}

      {hasReviews && isOpen ? (
        <View className="gap-3">
          {reviews.map((review, i) => (
            <ReviewCard
              key={review.id}
              review={review}
              index={i}
              categoryId={categoryId}
            />
          ))}
        </View>
      ) : null}

      {!rating && !hasReviews ? (
        <View className="items-center bg-surface border border-dashed border-border-strong rounded-lg px-5 py-8.5">
          <RNText style={styles.emoji}>{'\u{270D}\u{FE0F}'}</RNText>
          <Text variant="body" weight="700" className="mt-2.5 mb-1.5">
            No reviews yet
          </Text>
          <Text variant="fine" tone="muted" className="text-center">
            Be the first to review this dish after your order.
          </Text>
        </View>
      ) : null}
    </View>
  );
};

/** Layout-only: the emoji is a glyph, not type. */
const styles = StyleSheet.create({
  emoji: { fontSize: 32, lineHeight: 40 },
});
