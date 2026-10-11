import React from 'react';
import { Text as RNText, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui';
import { inr } from '@/data/orders';

/**
 * The coupon slot. With a coupon in effect it is a dashed green panel saying
 * what it saved, with REMOVE; otherwise a row that opens the offers sheet,
 * naming the best offer and how many more there are.
 */
export const CouponCard = ({
  applied,
  savings,
  bestOffer,
  otherOffers,
  onOpen,
  onRemove,
}: {
  applied: string | null;
  savings: number;
  bestOffer: string;
  otherOffers: number;
  onOpen: () => void;
  onRemove: () => void;
}) => (
  <View className="px-4 pt-3.5">
    {applied ? (
      <View className="flex-row items-center gap-3 rounded-md border border-dashed border-veg bg-veg-tint px-4 py-3">
        <RNText className="text-title">{'\u{1F389}'}</RNText>
        <View className="flex-1">
          <Text variant="fine" tone="veg" weight="800">
            {`‘${applied}’ applied`}
          </Text>
          <Text variant="micro" tone="savings-muted" weight="600">
            {`You saved ${inr(savings)} on this order`}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onRemove}
          accessibilityRole="button"
          accessibilityLabel={`Remove coupon ${applied}`}
          hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
        >
          <Text variant="micro" tone="muted" weight="800">
            REMOVE
          </Text>
        </TouchableOpacity>
      </View>
    ) : (
      <TouchableOpacity
        onPress={onOpen}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Apply coupon, view offers"
        className="flex-row items-center gap-3 rounded-md border border-card-hairline bg-surface px-3.5 py-3"
      >
        <View className="w-8.5 h-8.5 items-center justify-center rounded-md bg-ember-tint">
          <RNText className="text-body">{'\u{1F3F7}\u{FE0F}'}</RNText>
        </View>
        <View className="flex-1">
          <Text variant="fine" weight="700">
            Apply coupon
          </Text>
          <Text variant="micro" tone="label" weight="500">
            {`${bestOffer} · ${otherOffers} more ${
              otherOffers === 1 ? 'offer' : 'offers'
            } available`}
          </Text>
        </View>
        <View className="rounded-sm bg-ember-tint px-2.5 py-1.5">
          <Text variant="micro" tone="ember-pressed" weight="800">
            VIEW
          </Text>
        </View>
      </TouchableOpacity>
    )}
  </View>
);
