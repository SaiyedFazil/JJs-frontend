import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { Icon, RadialGlow, Text } from '@/components/ui';

/** One row of five large, tappable stars for the rate prompt. */
const RateStars = ({
  value,
  onPick,
}: {
  value: number;
  onPick: (value: number) => void;
}) => (
  <View className="flex-row justify-center gap-sm">
    {[1, 2, 3, 4, 5].map(i => (
      <TouchableOpacity
        key={i}
        onPress={() => onPick(i)}
        accessibilityRole="button"
        accessibilityLabel={`Rate ${i} ${i === 1 ? 'star' : 'stars'}`}
        hitSlop={6}
      >
        <Icon
          icon={Star}
          className={i <= value ? 'text-saffron' : 'text-hero-muted'}
          size={36}
          strokeWidth={1.5}
          fill={i <= value ? 'currentColor' : 'none'}
        />
      </TouchableOpacity>
    ))}
  </View>
);

/** The small read-only star row inside the green rated confirmation. */
const RatedStars = ({ value }: { value: number }) => (
  <View className="flex-row gap-xs">
    {[1, 2, 3, 4, 5].map(i => (
      <Icon
        key={i}
        icon={Star}
        className={i <= value ? 'text-on-ember' : 'text-veg-bright'}
        size={14}
        strokeWidth={1.5}
        fill="currentColor"
      />
    ))}
  </View>
);

/**
 * The post-order rating block, which switches on state:
 *
 * - unrated → a charcoal card: "How was your meal?", five big stars, and a
 *   Submit button that appears once a star is picked.
 * - rated → a green confirmation: the stars left, a thank-you, and EDIT to
 *   re-open the prompt.
 *
 * Shown only for a non-cancelled order; the screen decides that.
 */
export const RateCard = ({
  isRated,
  rating,
  pending,
  onPick,
  onSubmit,
  onEdit,
}: {
  isRated: boolean;
  /** The committed rating, for the confirmation. */
  rating: number;
  /** The star count picked but not yet submitted, 0 when none. */
  pending: number;
  onPick: (value: number) => void;
  onSubmit: () => void;
  onEdit: () => void;
}) => {
  if (isRated) {
    return (
      <View className="mb-md flex-row items-center gap-sm rounded-lg border border-paid-hairline bg-paid-tint px-md py-sm">
        <View className="w-11 h-11 items-center justify-center rounded-md bg-veg">
          <RatedStars value={rating} />
        </View>
        <View className="flex-1">
          <Text variant="fine" tone="ink" weight="800">
            {`You rated this order ${rating}★`}
          </Text>
          <Text variant="micro" tone="veg" weight="600" className="mt-xs">
            Thanks — your feedback keeps the tandoor honest.
          </Text>
        </View>
        <TouchableOpacity
          onPress={onEdit}
          accessibilityRole="button"
          accessibilityLabel="Edit your rating"
          hitSlop={8}
        >
          <Text variant="micro" tone="veg" weight="800">
            EDIT
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="relative mb-md overflow-hidden rounded-lg bg-hero p-md">
      <RadialGlow
        token="saffron"
        size={150}
        opacity={0.2}
        style={{ top: -50, right: -30 }}
      />
      <View className="relative">
        <Text variant="item" tone="on-hero" weight="700">
          How was your meal?
        </Text>
        <Text
          variant="fine"
          tone="hero-muted"
          weight="500"
          className="mb-md mt-xs"
        >
          Rate your food &amp; your rider — it helps us improve
        </Text>

        <View className="mb-md">
          <RateStars value={pending} onPick={onPick} />
        </View>

        {pending > 0 ? (
          <TouchableOpacity
            onPress={onSubmit}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel={`Submit ${pending} star rating`}
            className="h-12 items-center justify-center rounded-md bg-ember shadow-ember-glow"
          >
            <Text variant="body" tone="on-ember" weight="800">
              {`Submit ${pending}★ rating`}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};
