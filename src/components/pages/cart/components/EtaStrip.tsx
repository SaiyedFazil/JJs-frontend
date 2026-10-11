import React from 'react';
import { Text as RNText, View } from 'react-native';
import { Text } from '@/components/ui';
import type { ModeDetails } from '@/types/checkout.types';

/** When the food will be ready or arrive, for the mode chosen above it. */
export const EtaStrip = ({ details }: { details: ModeDetails }) => (
  <View className="px-4 pt-3 pb-1">
    <View className="flex-row items-center gap-2.5 rounded-md border border-card-hairline bg-surface px-3.5 py-2.5">
      <View className="w-8 h-8 items-center justify-center rounded-sm bg-ember-tint">
        <RNText className="text-body">{details.etaIcon}</RNText>
      </View>
      <View className="flex-1">
        <Text variant="fine" weight="800">
          {details.etaTitle}
        </Text>
        <Text variant="micro" tone="label" weight="600">
          {details.etaNote}
        </Text>
      </View>
    </View>
  </View>
);
