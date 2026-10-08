import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { ChevronRight, RotateCcw } from 'lucide-react-native';
import { Icon, Text } from '@/components/ui';
import { inr } from '@/data/orders';
import type { Order } from '@/types/order.types';
import { OrderStatusChip } from './OrderStatusChip';
import { OrderThumbs } from './OrderThumbs';
import { StarRow } from './StarRow';

/**
 * A past-order card: lead with the dishes, carry the date, total and status,
 * and make reordering one tap. The whole card opens the order's detail (a stub
 * for now); the rating row and the Reorder / Help buttons stop that with their
 * own handlers so a tap on them does one thing, not two.
 *
 * The middle row switches on state: a rated order shows its stars read-only, a
 * delivered-but-unrated one shows the "Rate this order" prompt, and a cancelled
 * one shows its refund line instead.
 */
export const OrderCard = ({
  order,
  onOpen,
  onReorder,
  onRate,
  onHelp,
}: {
  order: Order;
  onOpen: (order: Order) => void;
  onReorder: (order: Order) => void;
  onRate: (order: Order, value: number) => void;
  onHelp: (order: Order) => void;
}) => {
  const isCancelled = order.status === 'cancelled';
  const summary = order.lines
    .map(l => (l.quantity > 1 ? `${l.name} ×${l.quantity}` : l.name))
    .join(', ');
  const meta = `${order.itemCount} items · ${inr(order.total)} · #${order.ref}`;

  return (
    <TouchableOpacity
      onPress={() => onOpen(order)}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={`Order ${order.ref}, ${summary}`}
      className="rounded-xl border border-card-hairline bg-surface p-md"
    >
      {/* Date + status. */}
      <View className="mb-sm flex-row items-center justify-between">
        <Text variant="fine" tone="muted" weight="700">
          {order.placedAt}
        </Text>
        {isCancelled ? (
          <OrderStatusChip status="cancelled" />
        ) : (
          <OrderStatusChip status="delivered" />
        )}
      </View>

      {/* Thumbnails + item names + meta. */}
      <View className="mb-sm flex-row items-center gap-md">
        <OrderThumbs lines={order.lines} />
        <View className="flex-1">
          <Text variant="fine" tone="ink" weight="700" numberOfLines={2}>
            {summary}
          </Text>
          <Text variant="micro" tone="label" weight="600" className="mt-xs">
            {meta}
          </Text>
        </View>
      </View>

      {/* Rating / refund row, fenced by hairlines. */}
      <View className="mb-sm flex-row items-center justify-between border-y border-row-divider py-sm">
        {isCancelled ? (
          <View className="flex-row items-center gap-xs">
            <Icon
              icon={RotateCcw}
              className="text-muted"
              size={13}
              strokeWidth={2}
            />
            <Text variant="fine" tone="muted" weight="700">
              {`Refunded to ${order.payment}`}
            </Text>
          </View>
        ) : order.rating != null ? (
          <View className="flex-row items-center gap-sm">
            <StarRow value={order.rating} />
            <Text variant="fine" tone="label" weight="600">
              You rated this
            </Text>
          </View>
        ) : (
          <View className="flex-row items-center gap-sm">
            <StarRow value={0} onRate={value => onRate(order, value)} />
            <Text variant="fine" tone="ember" weight="800">
              Rate this order
            </Text>
          </View>
        )}
        <View className="flex-row items-center">
          <Text variant="fine" tone="ember" weight="700">
            Details
          </Text>
          <Icon
            icon={ChevronRight}
            className="text-ember"
            size={15}
            strokeWidth={2.4}
          />
        </View>
      </View>

      {/* Actions. */}
      <View className="flex-row gap-sm">
        <TouchableOpacity
          onPress={() => onReorder(order)}
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityLabel={
            isCancelled ? `Order ${order.ref} again` : `Reorder ${order.ref}`
          }
          className="h-11 flex-1 flex-row items-center justify-center gap-xs rounded-lg bg-ember shadow-ember-glow"
        >
          <Icon
            icon={RotateCcw}
            className="text-on-ember"
            size={15}
            strokeWidth={2.4}
          />
          <Text variant="fine" tone="on-ember" weight="800">
            {isCancelled ? 'Order again' : 'Reorder'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onHelp(order)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={`Get help with order ${order.ref}`}
          className="h-11 flex-row items-center justify-center rounded-lg border border-border-strong bg-surface px-md"
        >
          <Text variant="fine" tone="ink" weight="800">
            Help
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};
