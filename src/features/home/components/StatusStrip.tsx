import React from 'react';
import { View } from 'react-native';
import { Star } from 'lucide-react-native';
import { Text, VegSwitch } from '@/components/ui';
import { SERVICE } from '@/data/restaurant';

export const StatusStrip = ({
  isOpen,
  isVegOnly,
  onVegChange,
}: {
  isOpen: boolean;
  isVegOnly: boolean;
  onVegChange: (next: boolean) => void;
}) => (
  <View className="px-md">
    <View className="flex-row items-center gap-sm bg-surface border border-hairline rounded-lg px-md py-sm">
      <View className="flex-row items-center gap-xs">
        <View
          className={`w-2 h-2 rounded-pill ${isOpen ? 'bg-veg' : 'bg-chili'}`}
        />
        <Text variant="fine" tone={isOpen ? 'veg' : 'chili'} weight="700">
          {isOpen ? 'Open now' : 'Closed'}
        </Text>
      </View>

      <View className="w-px h-4 bg-hairline" />

      <View className="flex-row items-center gap-xs">
        <Star size={13} className="text-veg" fill="currentColor" />
        <Text variant="fine" tone="ink" weight="700">
          {SERVICE.rating}
        </Text>
      </View>

      <Text variant="fine" tone="muted">
        {`· ${SERVICE.etaMinutes} min · ${SERVICE.distanceKm} km`}
      </Text>

      <View className="ml-auto">
        <VegSwitch value={isVegOnly} onChange={onVegChange} />
      </View>
    </View>
  </View>
);
