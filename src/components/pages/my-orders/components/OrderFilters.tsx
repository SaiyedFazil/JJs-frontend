import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui';
import type { OrderFilter } from '@/types/order.types';
import { ORDER_FILTERS } from '../hooks/use-orders';

/**
 * The Active / Past filter pills under the title. Selected reads as the brand's
 * charcoal fill (the `hero` token), the rest as outlined white chips — the
 * same selected/outlined split the menu's category chips use, in pill form.
 * Horizontally scrollable so the four never crowd on a narrow phone.
 */
export const OrderFilters = ({
  value,
  onChange,
}: {
  value: OrderFilter;
  onChange: (filter: OrderFilter) => void;
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerClassName="gap-sm"
  >
    {ORDER_FILTERS.map(({ key, label }) => {
      const selected = value === key;
      return (
        <TouchableOpacity
          key={key}
          onPress={() => onChange(key)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityState={{ selected }}
          accessibilityLabel={`${label} orders`}
          className={`rounded-pill border px-md py-sm ${
            selected ? 'bg-hero border-hero' : 'bg-surface border-border-strong'
          }`}
        >
          <Text variant="fine" weight="700" tone={selected ? 'on-hero' : 'ink'}>
            {label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);
