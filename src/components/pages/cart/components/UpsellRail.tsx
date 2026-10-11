import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import type { MenuItem } from '@/types/menu.types';
import { ImageTile, Text, VegBadge } from '@/components/ui';
import { inr } from '@/data/orders';

const UpsellCard = ({
  dish,
  isInCart,
  onAdd,
}: {
  dish: MenuItem;
  isInCart: boolean;
  onAdd: (dish: MenuItem) => void;
}) => (
  <View className="w-32 overflow-hidden rounded-md border border-card-hairline bg-surface">
    <View className="h-18">
      <ImageTile categoryId={dish.cat} source={dish.image} emojiSize={32} />
      <View className="absolute top-1.5 left-1.5 rounded-sm bg-surface p-0.5">
        <VegBadge isVeg={dish.veg} size={11} />
      </View>
    </View>

    <View className="px-2.5 pt-2 pb-3">
      <Text
        variant="fine"
        weight="700"
        numberOfLines={2}
        className="mb-1 min-h-9"
      >
        {dish.name}
      </Text>
      <View className="flex-row items-center justify-between">
        <Text variant="fine" weight="800">
          {dish.mrp ? `MRP ${inr(dish.base)}` : inr(dish.base)}
        </Text>
        {/* Stays a button once added: another tap adds one more, as in the
            design — it is a quick ADD, not a toggle. */}
        <TouchableOpacity
          onPress={() => onAdd(dish)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={
            isInCart ? `Add another ${dish.name}` : `Add ${dish.name}`
          }
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className={`rounded-sm border-2 border-ember px-2.5 py-1 ${
            isInCart ? 'bg-ember' : 'bg-surface'
          }`}
        >
          <Text
            variant="micro"
            weight="800"
            tone={isInCart ? 'on-ember' : 'ember'}
          >
            {isInCart ? 'Added' : 'Add'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

/** "Complete your meal": a drink, a bread, a salad — one tap each. */
export const UpsellRail = ({
  dishes,
  isInCart,
  onAdd,
}: {
  dishes: MenuItem[];
  isInCart: (id: string) => boolean;
  onAdd: (dish: MenuItem) => void;
}) => (
  <View className="pt-5 pb-1">
    <Text variant="title" className="mb-3 px-4">
      {'Complete your meal \u{1F37D}\u{FE0F}'}
    </Text>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-3 px-4 pt-0.5 pb-2"
    >
      {dishes.map(dish => (
        <UpsellCard
          key={dish.id}
          dish={dish}
          isInCart={isInCart(dish.id)}
          onAdd={onAdd}
        />
      ))}
    </ScrollView>
  </View>
);
