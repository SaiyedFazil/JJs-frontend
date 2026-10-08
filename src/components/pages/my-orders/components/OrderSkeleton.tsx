import React from 'react';
import { View } from 'react-native';
import { Skeleton } from 'heroui-native';

/**
 * Loading placeholders shaped like the order cards they replace — header line,
 * a couple of thumbnails and an action bar — so the list does not reflow when
 * the real orders arrive.
 */
export const OrderSkeleton = ({ count = 3 }: { count?: number }) => (
  <View className="gap-md">
    {Array.from({ length: count }).map((_, i) => (
      <View
        key={i}
        className="rounded-xl border border-card-hairline bg-surface p-md"
      >
        <View className="mb-md flex-row justify-between">
          <Skeleton className="h-3 w-2/5 rounded-sm" />
          <Skeleton className="h-3 w-1/5 rounded-sm" />
        </View>
        <View className="mb-md flex-row gap-sm">
          <Skeleton className="w-11 h-11 rounded-md" />
          <Skeleton className="w-11 h-11 rounded-md" />
          <View className="flex-1" />
        </View>
        <Skeleton className="h-10 w-full rounded-lg" />
      </View>
    ))}
  </View>
);
