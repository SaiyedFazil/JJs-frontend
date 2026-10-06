import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui';

/** The heading over each choice on the page — "Portion  Required". */
export const SectionLabel = ({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) => (
  <View className="flex-row items-center gap-sm mb-3">
    <Text variant="body" weight="800">
      {title}
    </Text>
    {hint ? (
      <Text variant="fine" tone="label" weight="600">
        {hint}
      </Text>
    ) : null}
  </View>
);
