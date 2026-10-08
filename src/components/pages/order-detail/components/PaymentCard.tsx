import React from 'react';
import { View } from 'react-native';
import { Check, CreditCard, RotateCcw } from 'lucide-react-native';
import { Icon, Text } from '@/components/ui';
import type { OrderPayment } from '@/types/order.types';
import { ReceiptCard } from './ReceiptCard';

/**
 * How the order was settled: a payment-instrument tile, the method and its
 * detail line, and a status chip. A paid order reads affirmative (green PAID
 * on a veg tint); a refunded one reads neutral (sand), because a refund is a
 * fact, not an error — the same reasoning the cancelled status chip follows.
 */
export const PaymentCard = ({ payment }: { payment: OrderPayment }) => {
  const refunded = payment.state === 'refunded';

  return (
    <ReceiptCard>
      <View className="flex-row items-center gap-sm">
        <View
          className={`w-11 h-11 items-center justify-center rounded-md ${
            refunded ? 'bg-badge' : 'bg-pay-card-tile'
          }`}
        >
          <Icon
            icon={refunded ? RotateCcw : CreditCard}
            className={refunded ? 'text-muted' : 'text-info'}
            size={20}
            strokeWidth={2}
          />
        </View>

        <View className="flex-1">
          <Text variant="fine" tone="ink" weight="800">
            {payment.method}
          </Text>
          <Text variant="micro" tone="label" weight="600" className="mt-xs">
            {payment.detail}
          </Text>
        </View>

        <View
          className={`flex-row items-center gap-xs rounded-sm px-sm py-xs ${
            refunded ? 'bg-badge' : 'bg-paid-tint'
          }`}
        >
          {refunded ? null : (
            <Icon
              icon={Check}
              className="text-veg"
              size={11}
              strokeWidth={3.4}
            />
          )}
          <Text variant="micro" tone={refunded ? 'muted' : 'veg'} weight="800">
            {refunded ? 'REFUNDED' : 'PAID'}
          </Text>
        </View>
      </View>
    </ReceiptCard>
  );
};
