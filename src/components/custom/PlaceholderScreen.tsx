import React from 'react';
import { View, Text } from 'react-native';

export const PlaceholderScreen = ({ name }: { name: string }) => (
  <View className="flex-1 items-center justify-center bg-canvas">
    <Text className="font-jakarta-700 text-title text-ink">{name}</Text>
    <Text className="font-jakarta-500 text-body text-muted mt-sm">
      Coming Soon...
    </Text>
  </View>
);
