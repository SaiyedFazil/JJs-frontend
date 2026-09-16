import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Text } from './Text';

/**
 * The Pure Veg pill. Interactive, but does not filter yet — spec decision D6.
 * The knob's offset is a position Tailwind cannot express, so it comes from
 * StyleSheet — two static positions the toggle picks between, rather than one
 * object rebuilt on every render.
 */
export const VegSwitch = ({
  value,
  onChange,
  label = 'Pure Veg',
}: {
  value: boolean;
  onChange: (next: boolean) => void;
  label?: string;
}) => (
  <TouchableOpacity
    onPress={() => onChange(!value)}
    activeOpacity={0.8}
    accessibilityRole="switch"
    accessibilityState={{ checked: value }}
    accessibilityLabel={label}
    className={`flex-row items-center gap-sm rounded-pill border-2 px-sm py-xs ${
      value ? 'bg-veg-tint border-veg' : 'bg-surface border-hairline'
    }`}
    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
  >
    <View
      className={`w-7 h-4 rounded-pill justify-center ${
        value ? 'bg-veg' : 'bg-switch-track-off'
      }`}
    >
      <View
        style={value ? styles.knobOn : styles.knobOff}
        className="absolute w-3 h-3 rounded-pill bg-surface"
      />
    </View>
    <Text variant="fine" tone={value ? 'veg' : 'muted'} weight="700">
      {label}
    </Text>
  </TouchableOpacity>
);

/** Layout-only: the knob's two resting positions inside a 28px track. */
const styles = StyleSheet.create({
  knobOff: { left: 2 },
  knobOn: { left: 14 },
});
