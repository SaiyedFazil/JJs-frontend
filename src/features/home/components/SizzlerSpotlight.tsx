import React from 'react';
import { View, ScrollView, StyleSheet, Text as RNText } from 'react-native';
import type { MenuItem } from '@/types/menu';
import { Text, DishCard, RadialGlow } from '@/components/ui';
import { byCategory } from '@/data/menu';

const ITEMS = byCategory('sizzlers');

export const SizzlerSpotlight = ({
  quantityOf,
  onAdd,
  onRemove,
}: {
  quantityOf: (id: string) => number;
  onAdd: (item: MenuItem) => void;
  onRemove: (item: MenuItem) => void;
}) => (
  <View className="px-md pt-lg">
    <View className="relative overflow-hidden bg-hero rounded-xl p-md">
      <RadialGlow size={200} opacity={0.28} style={{ top: -70, right: -40 }} />

      <View className="flex-row items-center justify-between mb-md">
        <View>
          <Text variant="caption" tone="saffron">
            Served spitting hot
          </Text>
          <Text variant="title" tone="on-hero" className="mt-xs">
            Special Sizzlers
          </Text>
        </View>
        <RNText style={styles.flame}>{'\u{1F525}'}</RNText>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}
      >
        {ITEMS.map(item => (
          <DishCard
            key={item.id}
            item={item}
            surface="hero"
            quantity={quantityOf(item.id)}
            onAdd={() => onAdd(item)}
            onRemove={() => onRemove(item)}
          />
        ))}
      </ScrollView>
    </View>
  </View>
);

const styles = StyleSheet.create({
  rail: { gap: 12 },
  flame: { fontSize: 26 },
});
