import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StatusBar, TouchableOpacity, View } from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, HelpCircle } from 'lucide-react-native';
import { EmptyState, Icon, Text, Toast } from '@/components/ui';
import { byId } from '@/data/menu';
import { orderById } from '@/data/orders';
import { useCartStore } from '@/store/cart.store';
import type { MainStackParamList } from '@/types/navigation.types';
import type { Order } from '@/types/order.types';
import { useOrderDetail } from './hooks/use-order-detail';
import { OrderStatusHeader } from './components/OrderStatusHeader';
import { RateCard } from './components/RateCard';
import { OrderMetaCard } from './components/OrderMetaCard';
import { OrderItemsCard } from './components/OrderItemsCard';
import { BillSummaryCard } from './components/BillSummaryCard';
import { PaymentCard } from './components/PaymentCard';
import { FulfilmentCard } from './components/FulfilmentCard';
import { SecondaryActions } from './components/SecondaryActions';
import { ReorderBar } from './components/ReorderBar';
import { InvoiceSheet } from './components/InvoiceSheet';

type Navigation = NativeStackNavigationProp<MainStackParamList, 'OrderDetail'>;

const TOAST_MS = 1900;
/** Clearance between the floating toast and the sticky bar it floats over. */
const TOAST_GAP = 12;
/** Room below the last card so it clears the sticky bar. */
const CONTENT_ALLOWANCE = 24;

/**
 * One order's receipt: the settled/cancelled status band, an optional rate
 * block, then the restaurant, the items, the priced bill, the payment and the
 * delivery or pickup details — with Reorder pinned at the bottom.
 *
 * Mock-only like the rest of the order surfaces: the order comes from
 * src/data/orders.ts (the API seam), while Reorder acts on the real cart store,
 * so it genuinely fills the cart. Rating is session-local, keyed by order id,
 * the seam the API's optimistic update will use.
 */
const OrderDetail = ({ order }: { order: Order }) => {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();

  /** A rating left this session wins over the stored one. */
  const [rating, setRating] = useState<number | undefined>(undefined);
  /** The star picked in the prompt but not yet submitted. */
  const [pendingStars, setPendingStars] = useState(0);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [barHeight, setBarHeight] = useState(0);

  const addItem = useCartStore(s => s.addItem);
  const receipt = useOrderDetail(order, rating);

  // A white top bar on the cream canvas keeps the status-bar glyphs dark.
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('dark-content');
    }, []),
  );

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  const handleReorder = useCallback(() => {
    let added = 0;
    for (const line of order.lines) {
      const dish = byId[line.dishId];
      if (!dish || dish.soldOut) continue;
      addItem(
        { id: dish.id, name: dish.name, price: dish.base },
        line.quantity,
      );
      added += line.quantity;
    }
    showToast(
      added > 0
        ? `${added} ${added === 1 ? 'item' : 'items'} added to your cart`
        : 'Those dishes are off the menu right now',
    );
  }, [order, addItem, showToast]);

  const handleSubmitRating = useCallback(() => {
    if (pendingStars === 0) return;
    setRating(pendingStars);
    showToast(`Thanks for the ${pendingStars}★ rating!`);
  }, [pendingStars, showToast]);

  const handleEditRating = useCallback(() => {
    setRating(0);
    setPendingStars(0);
  }, []);

  return (
    <View className="flex-1 bg-canvas">
      {/* White top bar; the safe-area strip matches it, not the canvas. */}
      <View style={{ height: insets.top }} className="bg-surface" />
      <View className="flex-row items-center gap-sm border-b border-card-hairline bg-surface px-md pb-sm pt-xs">
        <TouchableOpacity
          onPress={navigation.goBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
        >
          <Icon
            icon={ArrowLeft}
            className="text-ink"
            size={24}
            strokeWidth={2}
          />
        </TouchableOpacity>
        <View className="flex-1">
          <Text variant="item" tone="ink" weight="800">
            Order details
          </Text>
          <Text variant="micro" tone="label" weight="600" className="mt-xs">
            {`#${order.ref}`}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => showToast('Opening help & support…')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={`Get help with order ${order.ref}`}
          className="h-9 flex-row items-center gap-xs rounded-md border border-card-hairline bg-surface px-sm"
        >
          <Icon
            icon={HelpCircle}
            className="text-ink-strong"
            size={14}
            strokeWidth={2}
          />
          <Text variant="fine" tone="ink" weight="700">
            Help
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: CONTENT_ALLOWANCE }}
      >
        <OrderStatusHeader header={receipt.header} />

        <View className="px-md pt-md">
          {receipt.isCancelled ? null : (
            <RateCard
              isRated={receipt.isRated}
              rating={receipt.rating}
              pending={pendingStars}
              onPick={setPendingStars}
              onSubmit={handleSubmitRating}
              onEdit={handleEditRating}
            />
          )}

          <OrderMetaCard
            meta={`#${order.ref} · ${order.placedAt}`}
            fulfilment={receipt.fulfilment}
          />
          <OrderItemsCard lines={order.lines} />
          <BillSummaryCard bill={receipt.bill} />
          <PaymentCard payment={receipt.payment} />
          <FulfilmentCard
            fulfilment={receipt.fulfilment}
            addressLabel={receipt.addressLabel}
            address={receipt.address}
            courier={receipt.courier}
          />
          <SecondaryActions
            onInvoice={() => setInvoiceOpen(true)}
            onSupport={() => showToast('Opening help & support…')}
          />
        </View>
      </ScrollView>

      {toast ? (
        <View
          pointerEvents="none"
          style={{ bottom: barHeight + TOAST_GAP }}
          className="absolute left-md right-md"
        >
          <Toast message={toast} accent="ember" />
        </View>
      ) : null}

      <ReorderBar
        label={receipt.isCancelled ? 'Order again' : 'Reorder'}
        bottomInset={insets.bottom}
        onReorder={handleReorder}
        onLayout={e => setBarHeight(e.nativeEvent.layout.height)}
      />

      {invoiceOpen ? (
        <InvoiceSheet
          invoiceName={`Invoice_${order.ref}.pdf`}
          onClose={() => setInvoiceOpen(false)}
        />
      ) : null}
    </View>
  );
};

export const OrderDetailScreen = () => {
  const navigation = useNavigation<Navigation>();
  const { params } = useRoute<RouteProp<MainStackParamList, 'OrderDetail'>>();
  const order = orderById(params.orderId);

  if (!order) {
    return (
      <View className="flex-1 bg-canvas">
        <EmptyState
          title="Order not found"
          message="We couldn't find this order. It may have been removed."
          actionLabel="Go back"
          onAction={navigation.goBack}
        />
      </View>
    );
  }

  // Keyed by order so a different order never inherits this one's rate state.
  return <OrderDetail key={order.id} order={order} />;
};
