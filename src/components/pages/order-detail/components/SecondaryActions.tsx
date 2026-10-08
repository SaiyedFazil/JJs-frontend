import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Download, MessageCircle } from 'lucide-react-native';
import { Icon, Text } from '@/components/ui';

/** One outlined action button — an icon above-left of its label. */
const OutlineAction = ({
  icon,
  label,
  onPress,
}: {
  icon: typeof Download;
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.85}
    accessibilityRole="button"
    accessibilityLabel={label}
    className="h-12 flex-1 flex-row items-center justify-center gap-sm rounded-lg border border-border-strong bg-surface"
  >
    <Icon icon={icon} className="text-ink-strong" size={16} strokeWidth={2} />
    <Text variant="fine" tone="ink" weight="800">
      {label}
    </Text>
  </TouchableOpacity>
);

/**
 * The two secondary actions beneath the receipt — download the invoice and
 * reach support. Reorder is the primary action and lives in the sticky bar;
 * these are the quieter, outlined pair.
 */
export const SecondaryActions = ({
  onInvoice,
  onSupport,
}: {
  onInvoice: () => void;
  onSupport: () => void;
}) => (
  <View className="mb-md flex-row gap-sm">
    <OutlineAction icon={Download} label="Invoice" onPress={onInvoice} />
    <OutlineAction icon={MessageCircle} label="Support" onPress={onSupport} />
  </View>
);
