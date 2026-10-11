import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui';
import type { OrderMode } from '@/types/checkout.types';

const MODES: { mode: OrderMode; label: string }[] = [
  { mode: 'delivery', label: 'Delivery' },
  { mode: 'takeaway', label: 'Takeaway' },
  { mode: 'dinein', label: 'Dine-in' },
];

/**
 * Delivery / Takeaway / Dine-in. The choice reprices the bill and rewrites the
 * ETA strip, the details card and the footer, so it sits first.
 *
 * Not the kit's Segmented: that one is a pill with uppercase captions, and
 * this design is a rounded slab in sentence case.
 */
export const ModeToggle = ({
  value,
  onChange,
}: {
  value: OrderMode;
  onChange: (mode: OrderMode) => void;
}) => (
  <View className="px-4 pt-3.5 pb-1">
    <View className="flex-row gap-1 rounded-md bg-sunken p-1">
      {MODES.map(({ mode, label }) => {
        const isActive = mode === value;
        return (
          <TouchableOpacity
            key={mode}
            onPress={() => onChange(mode)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            className={`flex-1 items-center rounded-sm py-2.5 ${
              isActive ? 'bg-surface shadow-e1' : ''
            }`}
          >
            <Text variant="fine" weight="700" tone={isActive ? 'ink' : 'muted'}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);
