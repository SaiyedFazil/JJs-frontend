import React from 'react';
import { View, ScrollView } from 'react-native';
import { CategoryTile } from '@/components/ui';
import { CATEGORIES } from '@/data/menu';
import { SectionHeader } from './SectionHeader';

/** The ten cuisines the design surfaces, in its order. Spec §5.4. */
export const RAIL_CATEGORY_IDS = [
  'chicken-tandoor',
  'mutton-tandoor',
  'seafood',
  'tawa',
  'sizzlers',
  'nonveg-chinese',
  'veg-main',
  'bread',
  'desserts',
  'beverages',
];

const RAIL = RAIL_CATEGORY_IDS.map(id => {
  const category = CATEGORIES.find(c => c.id === id);
  if (!category) throw new Error(`Unknown category in the home rail: ${id}`);
  return category;
});

export const CategoryRail = ({
  activeId,
  onSelect,
}: {
  activeId: string | null;
  onSelect: (id: string) => void;
}) => (
  <View className="pt-lg">
    <SectionHeader title="What are you craving?" />
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="px-md gap-md"
    >
      {RAIL.map(category => (
        <CategoryTile
          key={category.id}
          id={category.id}
          label={category.short}
          isActive={activeId === category.id}
          onPress={() => onSelect(category.id)}
        />
      ))}
    </ScrollView>
  </View>
);
