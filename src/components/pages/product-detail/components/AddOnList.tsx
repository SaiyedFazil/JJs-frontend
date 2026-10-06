import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Check } from 'lucide-react-native';
import type { AddOn } from '@/types/menu.types';
import { Icon, Text, VegBadge } from '@/components/ui';
import { SectionLabel } from './SectionLabel';

/** Optional extras as a card of checkbox rows; any number may be ticked. */
export const AddOnList = ({
  addOns,
  selectedIds,
  onToggle,
}: {
  addOns: AddOn[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) => (
  <View className="mb-5.5">
    <SectionLabel title="Add-ons" hint="Optional · pick any" />
    <View className="bg-surface border border-card-hairline rounded-lg overflow-hidden">
      {addOns.map((addOn, i) => {
        const isChecked = selectedIds.includes(addOn.id);
        const isLast = i === addOns.length - 1;
        return (
          <TouchableOpacity
            key={addOn.id}
            onPress={() => onToggle(addOn.id)}
            activeOpacity={0.8}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isChecked }}
            accessibilityLabel={`${addOn.name}, plus ₹${addOn.price}`}
            className={`flex-row items-center gap-3 px-3.5 py-3 ${
              isChecked ? 'bg-ember-wash' : 'bg-surface'
            } ${isLast ? '' : 'border-b border-row-divider'}`}
          >
            <VegBadge isVeg={addOn.veg} size={15} />
            <Text variant="body" weight="600" className="flex-1">
              {addOn.name}
            </Text>
            <Text variant="body" weight="700" tone="ink-soft">
              {`+₹${addOn.price}`}
            </Text>
            <View
              className={`w-5.5 h-5.5 rounded-sm border-2 items-center justify-center ${
                isChecked
                  ? 'bg-ember border-ember'
                  : 'bg-surface border-control-off'
              }`}
            >
              {isChecked ? (
                <Icon
                  icon={Check}
                  className="text-on-ember"
                  size={13}
                  strokeWidth={3}
                />
              ) : null}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);
