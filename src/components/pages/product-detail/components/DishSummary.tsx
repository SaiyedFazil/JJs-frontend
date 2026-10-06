import React from 'react';
import { View } from 'react-native';
import { Clock, Star, Users, type LucideIcon } from 'lucide-react-native';
import type { DishDetail, MenuItem } from '@/types/menu.types';
import { Icon, Text, VegBadge } from '@/components/ui';

const MetaChip = ({ icon, label }: { icon?: LucideIcon; label: string }) => (
  <View className="flex-row items-center gap-1.5 bg-surface border border-card-hairline rounded-sm px-2.5 py-1">
    {icon ? (
      <Icon icon={icon} className="text-muted" size={13} strokeWidth={2} />
    ) : null}
    <Text variant="fine" tone="ink-soft" weight="700">
      {label}
    </Text>
  </View>
);

/**
 * Tags, name, the meta row and the kitchen's copy. `serves` is passed in
 * because a portioned dish shows the chosen portion's, not the dish's.
 */
export const DishSummary = ({
  item,
  detail,
  serves,
}: {
  item: MenuItem;
  detail: DishDetail;
  serves: string;
}) => (
  <View className="mb-5.5">
    <View className="flex-row flex-wrap items-center gap-sm mb-2.5">
      <VegBadge isVeg={item.veg} size={19} />
      {item.tags.includes('bestseller') ? (
        <View className="bg-ember-tint rounded-sm px-2 py-1">
          <Text variant="micro" tone="ember-pressed" weight="800">
            BESTSELLER
          </Text>
        </View>
      ) : null}
      {item.tags.includes('chefs') ? (
        <View className="bg-tag-chef rounded-sm px-2 py-1">
          <Text variant="micro" tone="gold" weight="800">
            CHEF'S SPECIAL
          </Text>
        </View>
      ) : null}
    </View>

    <Text variant="h2" weight="800" className="mb-3">
      {item.name}
    </Text>

    <View className="flex-row flex-wrap gap-sm mb-4.5">
      {detail.rating ? (
        <>
          <View
            className="flex-row items-center gap-1 bg-veg rounded-sm px-2.5 py-1"
            accessibilityLabel={`Rated ${detail.rating.score.toFixed(1)} out of 5`}
          >
            <Icon
              icon={Star}
              className="text-on-ember"
              size={12}
              fill="currentColor"
            />
            <Text variant="fine" tone="on-ember" weight="800">
              {detail.rating.score.toFixed(1)}
            </Text>
          </View>
          <MetaChip label={`${detail.rating.count} ratings`} />
        </>
      ) : null}
      <MetaChip icon={Clock} label={`${detail.prepMinutes} min`} />
      <MetaChip icon={Users} label={serves} />
    </View>

    {detail.description ? (
      <Text variant="body" tone="ink-soft" weight="400" className="mb-1.5">
        {detail.description}
      </Text>
    ) : null}
    {detail.ingredients.length > 0 ? (
      <Text variant="fine" tone="label" weight="600">
        {`Key ingredients · ${detail.ingredients.join(' · ')}`}
      </Text>
    ) : null}
  </View>
);
