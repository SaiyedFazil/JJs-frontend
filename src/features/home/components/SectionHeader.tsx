import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui';

/**
 * `title` is Jakarta 20/700, NOT Bricolage: the design system floors
 * Bricolage at 24px and the mock set these at 19px. Spec decision D3.
 */
export const SectionHeader = ({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) => (
  <View className="flex-row items-baseline justify-between px-md pb-md">
    <Text variant="title">{title}</Text>
    {actionLabel ? (
      <TouchableOpacity onPress={onAction} accessibilityRole="button">
        <Text variant="fine" tone="ember" weight="700">
          {actionLabel}
        </Text>
      </TouchableOpacity>
    ) : null}
  </View>
);
