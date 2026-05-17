import React from 'react';
import { View, Text } from 'react-native';

export const PlaceholderScreen = ({ name }: { name: string }) => (
  <View className="flex-1 items-center justify-center bg-background dark:bg-background-dark">
    <Text className="text-xl font-black text-foreground dark:text-foreground-dark">
      {name}
    </Text>
    <Text className="text-muted dark:text-muted-dark mt-2">Coming Soon...</Text>
  </View>
);
