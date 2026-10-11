import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShoppingBag } from 'lucide-react-native';
import type { Offer } from '@/types/checkout.types';
import type { MainStackParamList } from '@/types/navigation.types';
import { EmptyState, FormScreen, Icon, Toast } from '@/components/ui';
import { UndoBanner } from '@/components/custom/UndoBanner';
import { DELIVERY, OFFERS } from '@/data/checkout';
import { useCartStore, type CartItem } from '@/store/cart.store';
import { useCheckoutStore } from '@/store/checkout.store';
import { offerBlocker, useCartBill } from './hooks/use-cart-bill';
import { CartTopBar } from './components/CartTopBar';
import { DeliveryCard } from './components/DeliveryCard';
import { CartItemsCard } from './components/CartItemsCard';
import { CouponCard } from './components/CouponCard';
import { TipCard } from './components/TipCard';
import { BillCard } from './components/BillCard';
import { CheckoutBar } from './components/CheckoutBar';
import { OffersSheet } from './components/OffersSheet';

type Navigation = NativeStackNavigationProp<MainStackParamList, 'Cart'>;

const TOAST_MS = 1900;
/** How long "… removed · UNDO" lingers before the removal sticks. */
const UNDO_MS = 4000;
/** Clearance between the floating toast and the sticky bar it floats over. */
const TOAST_GAP = 12;

/** A line stepped out of the cart, and where it stood — what Undo puts back. */
interface Removed {
  item: CartItem;
  index: number;
}

/**
 * Review & pay: where the order is going and when, the lines with live
 * quantities, the coupon and the rider tip, then a bill that reprices as
 * anything above it changes — with Proceed to Pay pinned below.
 *
 * Mock-only in the same sense as the menu: the lines are the real cart store,
 * but fees, offers and the delivery copy come from src/data/checkout.ts, and
 * there is no payment or address screen yet — those two actions say so.
 */
export const CartScreen = () => {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();

  const items = useCartStore(s => s.items);
  const count = useCartStore(s => s.totalItems());
  const addItem = useCartStore(s => s.addItem);
  const decrementItem = useCartStore(s => s.decrementItem);
  const removeItem = useCartStore(s => s.removeItem);
  const restoreItem = useCartStore(s => s.restoreItem);

  const setCoupon = useCheckoutStore(s => s.setCoupon);
  const tipChoice = useCheckoutStore(s => s.tipChoice);
  const setTipChoice = useCheckoutStore(s => s.setTipChoice);
  const customTip = useCheckoutStore(s => s.customTip);
  const setCustomTip = useCheckoutStore(s => s.setCustomTip);

  const bill = useCartBill();

  const [toast, setToast] = useState<string | null>(null);
  const [removed, setRemoved] = useState<Removed | null>(null);
  const [isOffersOpen, setOffersOpen] = useState(false);
  const [barHeight, setBarHeight] = useState(0);

  // A white top bar on the cream canvas keeps the status-bar glyphs dark.
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('dark-content');
    }, []),
  );

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      if (undoTimer.current) clearTimeout(undoTimer.current);
    },
    [],
  );

  const goToMenu = () =>
    navigation.navigate('Tabs', { screen: 'Menu' }, { pop: true });

  // The line handlers are stable, so a change to one line re-renders that
  // row alone.
  const handleIncrement = useCallback(
    (item: CartItem) => addItem(item),
    [addItem],
  );

  /** At one, the minus removes the line — with a few seconds to take it back. */
  const handleDecrement = useCallback(
    (item: CartItem) => {
      if (item.quantity > 1) {
        decrementItem(item.id);
        return;
      }
      const index = useCartStore
        .getState()
        .items.findIndex(i => i.id === item.id);
      removeItem(item.id);
      setRemoved({ item, index });
      if (undoTimer.current) clearTimeout(undoTimer.current);
      undoTimer.current = setTimeout(() => setRemoved(null), UNDO_MS);
    },
    [decrementItem, removeItem],
  );

  const handleUndo = () => {
    if (!removed) return;
    if (undoTimer.current) clearTimeout(undoTimer.current);
    restoreItem(removed.item, removed.index);
    setRemoved(null);
  };

  const handleEdit = useCallback(
    (item: CartItem) =>
      navigation.navigate('ProductDetail', {
        dishId: item.dishId ?? item.id,
        lineId: item.id,
      }),
    [navigation],
  );

  const blockerOf = (offer: Offer) => offerBlocker(offer, bill.itemTotal);

  const handleApplyOffer = (offer: Offer) => {
    setCoupon(offer.code);
    setOffersOpen(false);
    showToast(`${offer.code} applied`);
  };

  const handleRemoveCoupon = () => {
    setCoupon(null);
    showToast('Coupon removed');
  };

  const undoBanner = removed ? (
    <UndoBanner
      message={`${removed.item.name} removed`}
      undoLabel={`Undo removing ${removed.item.name}`}
      onUndo={handleUndo}
    />
  ) : null;

  if (items.length === 0) {
    return (
      <View className="flex-1 bg-canvas">
        <CartTopBar
          topInset={insets.top}
          count={0}
          onBack={navigation.goBack}
        />
        <EmptyState
          icon={
            <View className="mb-2 w-24 h-24 items-center justify-center rounded-pill bg-sunken">
              <Icon
                icon={ShoppingBag}
                className="text-empty-glyph"
                size={46}
                strokeWidth={1.5}
              />
            </View>
          }
          title="Your cart is empty"
          message="Add some smoky tandoori goodness and it'll show up here."
          actionLabel="Browse the menu"
          onAction={goToMenu}
        />
        {/* Stepping the last line out empties the cart; Undo still reaches it. */}
        {undoBanner ? (
          <View style={{ paddingBottom: insets.bottom + 16 }} className="px-4">
            {undoBanner}
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-canvas">
      <CartTopBar
        topInset={insets.top}
        count={count}
        onBack={navigation.goBack}
      />

      <FormScreen contentContainerStyle={styles.content}>
        <DeliveryCard
          details={DELIVERY}
          onChange={() => showToast('Saved addresses are coming soon')}
        />

        <CartItemsCard
          items={items}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
          onEdit={handleEdit}
          onAddMore={goToMenu}
        />
        {undoBanner ? <View className="px-4 pt-3">{undoBanner}</View> : null}

        <CouponCard
          applied={bill.appliedCoupon}
          savings={bill.savings}
          bestOffer={OFFERS[0].code}
          otherOffers={OFFERS.length - 1}
          onOpen={() => setOffersOpen(true)}
          onRemove={handleRemoveCoupon}
        />

        <TipCard
          choice={tipChoice}
          customTip={customTip}
          onChoose={setTipChoice}
          onCustomChange={setCustomTip}
        />

        <BillCard bill={bill} />
      </FormScreen>

      {toast ? (
        <View
          pointerEvents="none"
          // Layout-only: floats just above the bar, whose height is measured.
          style={{ bottom: barHeight + TOAST_GAP }}
          className="absolute left-md right-md"
        >
          <Toast message={toast} accent="ember" />
        </View>
      ) : null}

      <CheckoutBar
        bill={bill}
        bottomInset={insets.bottom}
        onPay={() => showToast('Payment is coming soon')}
        onLayout={e => setBarHeight(e.nativeEvent.layout.height)}
      />

      {isOffersOpen ? (
        <OffersSheet
          offers={OFFERS}
          applied={bill.appliedCoupon}
          blockerOf={blockerOf}
          onApply={handleApplyOffer}
          onClose={() => setOffersOpen(false)}
        />
      ) : null}
    </View>
  );
};

/** Layout-only: room under the last card so it clears the sticky bar. */
const styles = StyleSheet.create({
  content: { paddingBottom: 32 },
});
