import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui';

/**
 * The white rounded card every receipt section sits in — one hairline, one
 * radius, one ground, so the stack reads as a single bill. An optional
 * uppercase section label sits at the top.
 */
export const ReceiptCard = ({
  label,
  children,
  className = '',
}: {
  label?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <View
    className={`mb-md rounded-lg border border-card-hairline bg-surface p-md ${className}`}
  >
    {label ? (
      <Text
        variant="micro"
        tone="label"
        weight="800"
        className="mb-sm uppercase"
      >
        {label}
      </Text>
    ) : null}
    {children}
  </View>
);
