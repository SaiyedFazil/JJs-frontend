import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Check } from 'lucide-react-native';
import type { MenuItem } from '@/types/menu.types';
import { Icon, ImageTile, Text, VegBadge } from '@/components/ui';

const PairingCard = ({
  item,
  isInCart,
  onAdd,
  onOpen,
}: {
  item: MenuItem;
  isInCart: boolean;
  onAdd: (item: MenuItem) => void;
  onOpen: (item: MenuItem) => void;
}) => (
  <View className="w-34 bg-surface border border-card-hairline rounded-lg overflow-hidden shadow-e1">
    <TouchableOpacity
      onPress={() => onOpen(item)}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, view details`}
    >
      <View className="h-22.5">
        <ImageTile categoryId={item.cat} source={item.image} emojiSize={30} />
        <View className="absolute top-2 left-2 bg-surface rounded-sm p-0.5">
          <VegBadge isVeg={item.veg} size={12} />
        </View>
      </View>
      <View className="px-2.5 pt-2.5">
        <Text variant="fine" weight="700" numberOfLines={2} className="min-h-9">
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>

    <View className="flex-row items-center justify-between px-2.5 pt-1.5 pb-3">
      <Text variant="fine" weight="800">
        {item.mrp ? `MRP ₹${item.base}` : `₹${item.base}`}
      </Text>
      {isInCart ? (
        <View
          className="w-6.5 h-6.5 rounded-sm bg-veg items-center justify-center"
          accessibilityLabel={`${item.name} is in your cart`}
        >
          <Icon
            icon={Check}
            className="text-on-ember"
            size={14}
            strokeWidth={3}
          />
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => onAdd(item)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Add ${item.name}`}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="bg-surface border-2 border-ember rounded-sm px-2.5 py-1"
        >
          <Text variant="micro" tone="ember" weight="800">
            ADD
          </Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

/** The cross-sell rail. A card opens that dish's page; ADD drops it in as-is. */
export const PairingsRail = ({
  items,
  isInCart,
  onAdd,
  onOpen,
}: {
  items: MenuItem[];
  isInCart: (id: string) => boolean;
  onAdd: (item: MenuItem) => void;
  onOpen: (item: MenuItem) => void;
}) => (
  <View className="pt-1">
    <Text variant="title" className="px-5 mb-3">
      Pairs well with
    </Text>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="px-5 gap-3 pt-0.5 pb-2"
    >
      {items.map(item => (
        <PairingCard
          key={item.id}
          item={item}
          isInCart={isInCart(item.id)}
          onAdd={onAdd}
          onOpen={onOpen}
        />
      ))}
    </ScrollView>
  </View>
);
