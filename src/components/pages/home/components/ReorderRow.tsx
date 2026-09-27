import React from 'react';
import {
  View,
  TouchableOpacity,
  Text as RNText,
  StyleSheet,
} from 'react-native';
import { Text } from '@/components/ui';
import { byId } from '@/data/menu';

/** The previous order the mock replays. */
export const LAST_ORDER = [
  { id: 'butter-chicken', quantity: 1 },
  { id: 'butter-garlic-naan', quantity: 2 },
];

const SUMMARY = LAST_ORDER.map(line => {
  const item = byId[line.id];
  if (!item)
    throw new Error(`Unknown dish in ReorderRow's last order: ${line.id}`);
  return line.quantity > 1 ? `${item.name} ×${line.quantity}` : item.name;
}).join(', ');

export const ReorderRow = ({ onReorder }: { onReorder: () => void }) => (
  <View className="px-md pt-md">
    <View className="flex-row items-center gap-md bg-surface border border-dashed border-hairline rounded-lg px-md py-sm">
      <View className="w-11 h-11 rounded-md bg-ember-tint items-center justify-center">
        <RNText style={styles.glyph}>{'\u{1F37D}'}</RNText>
      </View>

      <View className="flex-1">
        <Text variant="caption" tone="muted">
          Order again
        </Text>
        <Text
          variant="fine"
          tone="ink"
          weight="700"
          numberOfLines={1}
          className="mt-xs"
        >
          {SUMMARY}
        </Text>
      </View>

      <TouchableOpacity
        onPress={onReorder}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Reorder your last order"
        className="bg-hero rounded-md px-md h-10 items-center justify-center"
      >
        <Text variant="caption" tone="on-hero">
          Reorder
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({ glyph: { fontSize: 22 } });
