import React from 'react';
import { Text as RNText, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui';
import type { ModeDetails } from '@/types/checkout.types';

/**
 * Where the order is going: the delivery address (with Change), the pickup
 * counter, or the booked table — whichever the mode says.
 */
export const PlaceCard = ({
  details,
  onChange,
}: {
  details: ModeDetails;
  onChange: () => void;
}) => (
  <View className="px-4 pt-3.5">
    <View className="flex-row items-start gap-3 rounded-lg border border-card-hairline bg-surface px-4 py-3.5">
      <View className="w-9 h-9 items-center justify-center rounded-md bg-ember-tint">
        <RNText className="text-body">{details.placeIcon}</RNText>
      </View>
      <View className="flex-1">
        <Text variant="fine" weight="800" className="mb-0.5">
          {details.placeTitle}
        </Text>
        <Text variant="fine" tone="muted" weight="500">
          {details.placeNote}
        </Text>
      </View>
      {details.canChangePlace ? (
        <TouchableOpacity
          onPress={onChange}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Change delivery address"
          className="rounded-sm border-2 border-border-strong bg-surface px-3 py-2"
        >
          <Text variant="micro" tone="ember" weight="800">
            Change
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  </View>
);
