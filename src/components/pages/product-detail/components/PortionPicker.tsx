import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import type { Portion, PortionSize } from '@/types/menu.types';
import { Text } from '@/components/ui';
import { PORTION_SERVES } from '@/data/dish-details';
import { SectionLabel } from './SectionLabel';

const SIZES: { size: PortionSize; label: string }[] = [
  { size: 'full', label: 'Full' },
  { size: 'half', label: 'Half' },
];

/** Full / Half as a two-segment control, each segment carrying its price. */
export const PortionPicker = ({
  portion,
  value,
  onChange,
}: {
  portion: Portion;
  value: PortionSize;
  onChange: (size: PortionSize) => void;
}) => (
  <View className="mb-5.5">
    <SectionLabel title="Portion" hint="Required" />
    <View
      className="flex-row bg-sunken rounded-lg p-1 gap-1"
      accessibilityRole="radiogroup"
    >
      {SIZES.map(({ size, label }) => {
        const isSelected = value === size;
        return (
          <TouchableOpacity
            key={size}
            onPress={() => onChange(size)}
            activeOpacity={0.8}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${label}, ₹${portion[size]}, ${PORTION_SERVES[size]}`}
            className={`flex-1 rounded-md p-3 ${
              isSelected ? 'bg-surface shadow-e1' : ''
            }`}
          >
            <Text
              variant="body"
              weight="800"
              tone={isSelected ? 'ink' : 'muted'}
            >
              {label}
            </Text>
            <Text
              variant="body"
              weight="700"
              tone={isSelected ? 'ember' : 'label'}
              className="mt-1"
            >
              {`₹${portion[size]}`}
            </Text>
            <Text variant="micro" tone="label" className="mt-0.5">
              {PORTION_SERVES[size]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);
