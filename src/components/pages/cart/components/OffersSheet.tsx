import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text as RNText,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Text } from '@/components/ui';
import type { Offer } from '@/types/checkout.types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const OfferRow = ({
  offer,
  isApplied,
  blocker,
  onApply,
}: {
  offer: Offer;
  isApplied: boolean;
  /** Why it cannot apply to this cart yet, or null. */
  blocker: string | null;
  onApply: (offer: Offer) => void;
}) => (
  <View
    className={`flex-row items-center gap-3 rounded-md border-2 border-dashed px-4 py-3.5 ${
      isApplied ? 'border-veg bg-veg-tint' : 'border-border-strong bg-surface'
    }`}
  >
    <View className="w-10 h-10 items-center justify-center rounded-md bg-ember-tint">
      <RNText className="text-item">{offer.icon}</RNText>
    </View>
    <View className="flex-1">
      <Text variant="fine" weight="800">
        {offer.code}
      </Text>
      <Text variant="micro" tone="muted" weight="500">
        {offer.description}
      </Text>
      {blocker && !isApplied ? (
        <Text variant="micro" tone="chili" weight="700">
          {blocker}
        </Text>
      ) : null}
    </View>
    <TouchableOpacity
      onPress={() => onApply(offer)}
      disabled={isApplied || blocker !== null}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={
        isApplied ? `${offer.code} applied` : `Apply ${offer.code}`
      }
      accessibilityState={{ disabled: isApplied || blocker !== null }}
      className={`rounded-sm px-3.5 py-2 ${
        isApplied ? 'bg-veg' : blocker ? 'bg-sunken' : 'bg-hero'
      }`}
    >
      <Text
        variant="micro"
        weight="800"
        tone={isApplied ? 'on-ember' : blocker ? 'label' : 'on-hero'}
      >
        {isApplied ? 'Applied' : 'Apply'}
      </Text>
    </TouchableOpacity>
  </View>
);

/**
 * "Offers for you", as a bottom sheet over a scrim — the same Modal + slide
 * pattern as the invoice and avatar sheets. An offer this cart does not
 * qualify for says why and cannot be applied.
 */
export const OffersSheet = ({
  offers,
  applied,
  blockerOf,
  onApply,
  onClose,
}: {
  offers: Offer[];
  applied: string | null;
  blockerOf: (offer: Offer) => string | null;
  onApply: (offer: Offer) => void;
  onClose: () => void;
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <AnimatedPressable
          entering={FadeIn.duration(180)}
          style={StyleSheet.absoluteFill}
          className="bg-scrim"
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={onClose}
        />

        <View
          className="rounded-t-sheet bg-surface px-5 pt-4"
          // Layout-only: the gesture-bar inset is a runtime value.
          style={{ paddingBottom: insets.bottom + 22 }}
        >
          <View className="mb-4 h-1 w-10 self-center rounded-sm bg-border-strong" />
          <Text variant="title" className="mb-4">
            Offers for you
          </Text>
          <View className="gap-3">
            {offers.map(offer => (
              <OfferRow
                key={offer.code}
                offer={offer}
                isApplied={offer.code === applied}
                blocker={blockerOf(offer)}
                onApply={onApply}
              />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};
