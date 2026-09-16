import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from './Text';
import type { Surface } from './surface';

export interface SegmentedOption {
  value: string;
  label: string;
}

const TRACK: Record<Surface, string> = {
  canvas: 'bg-sunken rounded-pill p-xs',
  hero: 'bg-hero-foreground/10 border border-hero-foreground/10 rounded-md p-xs gap-xs',
};

const ACTIVE: Record<Surface, string> = {
  canvas: 'bg-surface shadow-e1 rounded-pill',
  hero: 'bg-ember rounded-md',
};

/** PDF section 05 · segmented control. `hero` is the service-mode switch. */
export const Segmented = ({
  options,
  value,
  onChange,
  surface = 'canvas',
}: {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  surface?: Surface;
}) => (
  <View className={`flex-row ${TRACK[surface]}`}>
    {options.map(option => {
      const isActive = option.value === value;
      const ground = isActive ? ACTIVE[surface] : '';
      const tone = isActive
        ? surface === 'hero'
          ? 'on-ember'
          : 'ink'
        : surface === 'hero'
          ? 'hero-muted'
          : 'muted';

      return (
        <TouchableOpacity
          key={option.value}
          onPress={() => onChange(option.value)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityState={{ selected: isActive }}
          className={`flex-1 items-center justify-center py-sm ${ground}`}
        >
          <Text variant="caption" tone={tone}>
            {option.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);
