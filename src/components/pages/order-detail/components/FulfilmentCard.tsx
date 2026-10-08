import React from 'react';
import { View } from 'react-native';
import { MapPin, Star, Store } from 'lucide-react-native';
import { Icon, LinearFill, Text } from '@/components/ui';
import type { Fulfilment, OrderCourier } from '@/types/order.types';
import { ReceiptCard } from './ReceiptCard';

/** The rider's round, ember→saffron gradient avatar with their initial. */
const CourierAvatar = ({ name }: { name: string }) => (
  <View className="w-10 h-10 items-center justify-center overflow-hidden rounded-pill">
    <LinearFill from="ember" to="saffron" />
    <Text variant="fine" tone="on-ember" weight="800">
      {name.charAt(0)}
    </Text>
  </View>
);

/**
 * Where the order went. For delivery: a pin-marked address and, below a
 * hairline, the rider who brought it with their rating. For takeaway: a
 * storefront-marked pickup line and no rider.
 */
export const FulfilmentCard = ({
  fulfilment,
  addressLabel,
  address,
  courier,
}: {
  fulfilment: Fulfilment;
  addressLabel: string;
  address: string;
  courier?: OrderCourier;
}) => {
  const takeaway = fulfilment === 'takeaway';

  return (
    <ReceiptCard label={takeaway ? 'Pickup details' : 'Delivery details'}>
      <View className="flex-row gap-sm">
        <View className="w-9 h-9 items-center justify-center rounded-md bg-ember-tint">
          <Icon
            icon={takeaway ? Store : MapPin}
            className="text-ember"
            size={18}
            strokeWidth={2}
          />
        </View>
        <View className="flex-1">
          <Text variant="fine" tone="ink" weight="800">
            {addressLabel}
          </Text>
          <Text
            variant="fine"
            tone="muted"
            weight="500"
            className="mt-xs leading-5"
          >
            {address}
          </Text>
        </View>
      </View>

      {courier ? (
        <View className="mt-md flex-row items-center gap-sm border-t border-row-divider pt-md">
          <CourierAvatar name={courier.name} />
          <View className="flex-1">
            <Text variant="fine" tone="ink" weight="700">
              {`Delivered by ${courier.name}`}
            </Text>
            <View className="mt-xs flex-row items-center gap-xs">
              <Icon
                icon={Star}
                className="text-veg"
                size={11}
                fill="currentColor"
              />
              <Text variant="micro" tone="label" weight="600">
                {`${courier.rating} · ${courier.note}`}
              </Text>
            </View>
          </View>
        </View>
      ) : null}
    </ReceiptCard>
  );
};
