import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Bike, MapPin } from 'lucide-react-native';
import { Icon, Text } from '@/components/ui';
import type { DeliveryDetails } from '@/types/checkout.types';

/**
 * Where the order is going and when it should arrive, at the top of the
 * cart: the saved address with Change, over a strip with the ETA.
 */
export const DeliveryCard = ({
  details,
  onChange,
}: {
  details: DeliveryDetails;
  onChange: () => void;
}) => (
  <View className="px-4 pt-3.5">
    <View className="rounded-lg border border-card-hairline bg-surface">
      <View className="flex-row items-start gap-3 px-4 pt-3.5 pb-3">
        <View className="w-10 h-10 items-center justify-center rounded-md bg-ember-tint">
          <Icon icon={MapPin} className="text-ember" size={19} />
        </View>
        <View className="flex-1">
          <Text variant="body" weight="800">
            {`Delivering to ${details.label}`}
          </Text>
          <Text
            variant="fine"
            tone="muted"
            weight="500"
            numberOfLines={2}
            className="mt-0.5"
          >
            {details.address}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onChange}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Change delivery address"
          className="rounded-sm border-2 border-border-strong bg-surface px-3 py-2"
        >
          <Text variant="micro" tone="ember" weight="800">
            Change
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center gap-2 border-t border-row-divider px-4 py-2.5">
        <Icon icon={Bike} className="text-ember" size={16} strokeWidth={2} />
        <Text variant="fine" weight="700">
          {details.eta}
        </Text>
        <Text variant="fine" tone="label" weight="500">
          {`· ${details.distance}`}
        </Text>
      </View>
    </View>
  </View>
);
