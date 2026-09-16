import React from 'react';
import { View, ScrollView, StyleSheet, Text as RNText } from 'react-native';
import { Text, LinearFill } from '@/components/ui';

const OfferCode = ({
  code,
  tone,
}: {
  code: string;
  tone: 'ember' | 'saffron';
}) => (
  <View
    className={`self-start rounded-sm px-sm py-0.5 ${
      tone === 'ember' ? 'bg-surface/25' : 'bg-saffron/20'
    }`}
  >
    <Text variant="caption" tone={tone === 'ember' ? 'on-ember' : 'saffron'}>
      {code}
    </Text>
  </View>
);

/** Two promo cards, horizontally scrollable. */
export const OffersRail = () => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerClassName="px-md py-sm gap-sm"
  >
    <View className="relative overflow-hidden w-64 rounded-lg p-md gap-xs">
      <LinearFill from="ember" to="ember-deep" />
      <RNText style={styles.glyph}>{'\u{1F525}'}</RNText>
      <Text variant="caption" tone="on-ember-muted">
        First order
      </Text>
      <Text variant="h2" tone="on-ember" weight="800">
        15% OFF
      </Text>
      <View className="flex-row items-center gap-xs">
        <Text variant="fine" tone="on-ember-muted">
          Code
        </Text>
        <OfferCode code="WELCOME15" tone="ember" />
      </View>
    </View>

    <View className="relative overflow-hidden w-64 bg-hero rounded-lg p-md gap-xs">
      <RNText style={styles.glyph}>{'\u{1F362}'}</RNText>
      <Text variant="caption" tone="saffron">
        Free delivery
      </Text>
      <Text variant="h2" tone="on-hero" weight="800">
        {'On ₹599+'}
      </Text>
      <View className="flex-row items-center gap-xs">
        <Text variant="fine" tone="hero-muted">
          Code
        </Text>
        <OfferCode code="FREEDEL" tone="saffron" />
      </View>
    </View>
  </ScrollView>
);

/** Layout-only: a glyph bled past the card's bottom edge from a runtime-free
 * but Tailwind-inexpressible absolute offset. */
const styles = StyleSheet.create({
  glyph: {
    position: 'absolute',
    right: 10,
    bottom: -16,
    fontSize: 56,
    opacity: 0.9,
  },
});
