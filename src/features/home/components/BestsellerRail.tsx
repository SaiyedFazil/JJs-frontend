import React from 'react';
import { View, ScrollView } from 'react-native';
import type { MenuItem } from '@/types/menu';
import { DishCard } from '@/components/ui';
import { bestsellers } from '@/data/menu';
import { SectionHeader } from './SectionHeader';

const ITEMS = bestsellers();

export const BestsellerRail = ({
  quantityOf,
  onAdd,
  onRemove,
  onSeeAll,
}: {
  quantityOf: (id: string) => number;
  onAdd: (item: MenuItem) => void;
  onRemove: (item: MenuItem) => void;
  onSeeAll?: () => void;
}) => (
  <View className="pt-lg">
    <SectionHeader
      title="Bestsellers"
      actionLabel="See all"
      onAction={onSeeAll}
    />
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="px-md gap-md pb-sm"
    >
      {ITEMS.map(item => (
        <DishCard
          key={item.id}
          item={item}
          showRating
          quantity={quantityOf(item.id)}
          onAdd={() => onAdd(item)}
          onRemove={() => onRemove(item)}
        />
      ))}
    </ScrollView>
  </View>
);
