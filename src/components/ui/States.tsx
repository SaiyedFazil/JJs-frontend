import React from 'react';
import { View } from 'react-native';
import { Skeleton } from 'heroui-native';
import { Text } from './Text';
import { Button } from './Button';

/** PDF section 05 · empty state. */
export const EmptyState = ({
  title,
  message,
  actionLabel,
  onAction,
  icon,
}: {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}) => (
  <View className="flex-1 items-center justify-center px-xl gap-md">
    {icon}
    <Text variant="h2" className="text-center">
      {title}
    </Text>
    <Text variant="body" tone="muted" className="text-center">
      {message}
    </Text>
    {actionLabel ? (
      <Button label={actionLabel} onPress={onAction} className="mt-sm" />
    ) : null}
  </View>
);

/** PDF section 05 · error state. */
export const ErrorState = ({
  title = "Couldn't load menu",
  message = 'Check your connection and try again.',
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) => (
  <View className="flex-1 items-center justify-center px-xl gap-md">
    <Text variant="h2" className="text-center">
      {title}
    </Text>
    <Text variant="body" tone="muted" className="text-center">
      {message}
    </Text>
    {onRetry ? (
      <Button
        label="Retry"
        variant="secondary"
        onPress={onRetry}
        className="mt-sm"
      />
    ) : null}
  </View>
);

/** PDF section 05 · skeleton loading, shaped like a FoodCard list row. */
export const SkeletonCard = ({ count = 3 }: { count?: number }) => (
  <View className="gap-lg px-lg">
    {Array.from({ length: count }).map((_, i) => (
      <View key={i} className="flex-row items-start gap-md py-md">
        <View className="flex-1 gap-sm">
          <Skeleton className="h-4 w-2/3 rounded-sm" />
          <Skeleton className="h-4 w-1/3 rounded-sm" />
          <Skeleton className="h-3 w-full rounded-sm" />
          <Skeleton className="h-3 w-4/5 rounded-sm" />
        </View>
        <Skeleton className="w-32 h-32 rounded-lg" />
      </View>
    ))}
  </View>
);
