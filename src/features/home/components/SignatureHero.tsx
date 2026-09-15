import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Star } from 'lucide-react-native';
import type { MenuItem } from '@/types/menu';
import { Text, ImageTile, ScrimFill, VegBadge } from '@/components/ui';

/** The lead visual: one signature dish, full-bleed, with an ADD on the photo. */
export const SignatureHero = ({
  item,
  onAdd,
}: {
  item: MenuItem;
  onAdd: () => void;
}) => (
  <View className="px-md pt-md">
    <View className="relative h-56 rounded-xl overflow-hidden shadow-e3">
      <ImageTile categoryId={item.cat} uri={item.image} emojiSize={64} />
      <ScrimFill />

      <View className="absolute top-md left-md flex-row gap-xs">
        <View className="bg-ember rounded-sm px-sm py-xs">
          <Text variant="caption" tone="on-ember">
            Signature
          </Text>
        </View>
        <View className="flex-row items-center gap-xs bg-hero/60 rounded-sm px-sm py-xs">
          <Star size={10} className="text-saffron" fill="currentColor" />
          <Text variant="caption" tone="saffron">
            4.8
          </Text>
        </View>
      </View>

      <View className="absolute left-md right-md bottom-md flex-row items-end justify-between gap-md">
        <View className="flex-1">
          <View className="flex-row items-center gap-xs mb-xs">
            <VegBadge isVeg={item.veg} size={14} tone="bright" />
            <Text variant="fine" tone="hero-muted" weight="700">
              Smoky · Charcoal-grilled
            </Text>
          </View>

          <Text variant="h2" tone="on-hero" numberOfLines={1} weight="800">
            {item.name}
          </Text>

          <View className="flex-row items-baseline gap-xs mt-xs">
            <Text variant="body" tone="ember" weight="800">
              {`₹${item.base}`}
            </Text>
            {item.portion ? (
              <Text variant="fine" tone="hero-muted">
                · Full / Half
              </Text>
            ) : null}
          </View>
        </View>

        <TouchableOpacity
          onPress={onAdd}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={`Add ${item.name}`}
          className="bg-ember rounded-md px-md h-11 items-center justify-center shadow-ember-glow"
        >
          <Text variant="caption" tone="on-ember">
            Add +
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);
