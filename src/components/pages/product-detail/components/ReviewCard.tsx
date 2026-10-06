import React from 'react';
import { View } from 'react-native';
import { Star } from 'lucide-react-native';
import type { DishReview } from '@/types/menu.types';
import { Icon, ImageTile, Text } from '@/components/ui';

/** Initials grounds, rotated down the list so neighbours never match. */
const AVATAR_GROUNDS = ['bg-ember', 'bg-veg', 'bg-info'];

export const ReviewCard = ({
  review,
  index,
  categoryId,
}: {
  review: DishReview;
  index: number;
  /** ImageTile's fallback tint, should a photo fail to arrive. */
  categoryId: string;
}) => (
  <View className="bg-surface border border-card-hairline rounded-lg px-4 py-3.5">
    <View className="flex-row items-center gap-3 mb-2.5">
      <View
        className={`w-9.5 h-9.5 rounded-pill items-center justify-center ${
          AVATAR_GROUNDS[index % AVATAR_GROUNDS.length]
        }`}
      >
        <Text variant="body" weight="800" tone="on-ember">
          {review.author.charAt(0)}
        </Text>
      </View>
      <View className="flex-1">
        <Text variant="fine" weight="700">
          {review.author}
        </Text>
        <Text variant="micro" tone="label">
          {review.postedAgo}
        </Text>
      </View>
      <View
        className="flex-row items-center gap-0.5 bg-veg rounded-sm px-1.5 py-0.5"
        accessibilityLabel={`${review.stars} stars`}
      >
        <Icon
          icon={Star}
          className="text-on-ember"
          size={9}
          strokeWidth={0}
          fill="currentColor"
        />
        <Text variant="micro" tone="on-ember" weight="800">
          {review.stars}
        </Text>
      </View>
    </View>

    <Text variant="fine" tone="ink-soft">
      {review.text}
    </Text>

    {review.photos && review.photos.length > 0 ? (
      <View className="flex-row gap-2 mt-2.5">
        {review.photos.map((photo, i) => (
          <View key={i} className="w-14 h-14 rounded-md overflow-hidden">
            <ImageTile source={photo} categoryId={categoryId} emojiSize={20} />
          </View>
        ))}
      </View>
    ) : null}
  </View>
);
