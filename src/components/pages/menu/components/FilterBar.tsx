import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import { Icon, Text, VegSwitch } from '@/components/ui';
import type { MenuSort } from '../hooks/use-menu-catalog';

const SORTS: { key: MenuSort; label: string }[] = [
  { key: 'bestseller', label: 'Bestseller' },
  { key: 'price', label: 'Price: Low to High' },
  { key: 'rating', label: 'Rating' },
];

/** Pure Veg, then the sort chips. Tapping the active chip clears the sort. */
export const FilterBar = ({
  vegOnly,
  onVegChange,
  sort,
  onSortChange,
  showRatingSort,
}: {
  vegOnly: boolean;
  onVegChange: (next: boolean) => void;
  sort: MenuSort | null;
  onSortChange: (next: MenuSort | null) => void;
  showRatingSort: boolean;
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    keyboardShouldPersistTaps="handled"
    className="bg-canvas"
    contentContainerClassName="items-center gap-sm px-md py-3"
  >
    <VegSwitch value={vegOnly} onChange={onVegChange} />

    {SORTS.filter(s => s.key !== 'rating' || showRatingSort).map(s => {
      const isOn = sort === s.key;
      return (
        <TouchableOpacity
          key={s.key}
          onPress={() => onSortChange(isOn ? null : s.key)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityState={{ selected: isOn }}
          accessibilityLabel={`Sort by ${s.label}`}
          className={`flex-row items-center gap-1.5 rounded-pill border-2 px-3 py-xs ${
            isOn ? 'bg-hero border-hero' : 'bg-surface border-card-hairline'
          }`}
          hitSlop={{ top: 8, bottom: 8 }}
        >
          {isOn ? (
            <Icon
              icon={Check}
              className="text-hero-foreground"
              size={12}
              strokeWidth={3}
            />
          ) : null}
          <Text
            variant="fine"
            weight="700"
            tone={isOn ? 'on-hero' : 'ink-soft'}
          >
            {s.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);
