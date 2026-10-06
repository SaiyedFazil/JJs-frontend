import React from 'react';
import {
  StyleSheet,
  Text as RNText,
  TouchableOpacity,
  View,
} from 'react-native';
import type { SpiceLevel } from '@/types/menu.types';
import { Text } from '@/components/ui';
import { SectionLabel } from './SectionLabel';

const LEVELS: { level: SpiceLevel; label: string; emoji: string }[] = [
  { level: 'mild', label: 'Mild', emoji: '\u{1F33F}' },
  { level: 'medium', label: 'Medium', emoji: '\u{1F336}\u{FE0F}' },
  { level: 'spicy', label: 'Spicy', emoji: '\u{1F525}' },
];

export const SpicePicker = ({
  value,
  onChange,
}: {
  value: SpiceLevel;
  onChange: (level: SpiceLevel) => void;
}) => (
  <View className="mb-5.5">
    <SectionLabel title="Spice level" />
    <View className="flex-row gap-2" accessibilityRole="radiogroup">
      {LEVELS.map(({ level, label, emoji }) => {
        const isSelected = value === level;
        return (
          <TouchableOpacity
            key={level}
            onPress={() => onChange(level)}
            activeOpacity={0.8}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${label} spice`}
            className={`flex-1 items-center gap-1 rounded-md border-2 px-1.5 py-2.5 ${
              isSelected
                ? 'bg-ember-wash border-ember'
                : 'bg-surface border-hairline'
            }`}
          >
            {/* Dimmed rather than greyed: React Native has no portable
                grayscale filter for a glyph. */}
            <RNText style={[styles.emoji, !isSelected && styles.dimmed]}>
              {emoji}
            </RNText>
            <Text
              variant="fine"
              weight="700"
              tone={isSelected ? 'ember-pressed' : 'ink-soft'}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

/** Layout-only: the emoji is a glyph, not type. */
const styles = StyleSheet.create({
  emoji: { fontSize: 16, lineHeight: 21 },
  dimmed: { opacity: 0.45 },
});
