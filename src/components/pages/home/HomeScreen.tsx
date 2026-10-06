import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { MenuItem } from '@/types/menu.types';
import type { MainTabNavigationProp } from '@/types/navigation.types';
import { CartBar, Toast, SkeletonRail } from '@/components/ui';
import { useCartStore } from '@/store/cart.store';
import { byId, signatures } from '@/data/menu';
import { isOpenAt } from '@/data/restaurant';
import { useTabBarHeight } from '@/hooks/use-tab-bar-height';
import { HomeHeader } from './components/HomeHeader';
import { ClosedStrip } from './components/ClosedStrip';
import { SignatureHero } from './components/SignatureHero';
import { OffersRail } from './components/OffersRail';
import { CategoryRail } from './components/CategoryRail';
import { BestsellerRail } from './components/BestsellerRail';
import { SizzlerSpotlight } from './components/SizzlerSpotlight';
import { ReorderRow, LAST_ORDER } from './components/ReorderRow';

const ADDRESS = '351 Maison Street, Bandra W';
/** Every photographed dish, in menu order — the hero carousel's slides. */
const SIGNATURES = signatures();
const TOAST_MS = 1900;
/** Mock latency, matching the app's existing setTimeout convention. */
const LOAD_MS = 900;

/** Vertical gap between the cart bar and the tab bar's real top edge. */
const CART_BAR_GAP = 12;
/**
 * Room for the floating stack itself, above `floatingBottom`: Toast
 * (px-md/py-sm + a 24px icon row, ~40) + the container's gap-sm (8) +
 * CartBar (px-md/py-sm + its content row, ~56) ≈ 104, rounded up for
 * breathing room.
 */
const FLOATING_STACK_ALLOWANCE = 110;

export const HomeScreen = () => {
  const navigation = useNavigation<MainTabNavigationProp<'Home'>>();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const tabBarHeight = useTabBarHeight();

  const addItem = useCartStore(s => s.addItem);
  const decrementItem = useCartStore(s => s.decrementItem);
  const quantityOf = useCartStore(s => s.quantityOf);
  // Subscribing to the derived values is what re-renders this screen on every
  // cart change; quantityOf above is a stable reference that reads current
  // state, so the rails recompute during that same render pass.
  const count = useCartStore(s => s.totalItems());
  const total = useCartStore(s => s.totalAmount());

  const isOpen = isOpenAt(new Date());

  // The tab bar floats over the bottom of this screen, so both the floating
  // layer and the scroll content's bottom padding must clear its full
  // footprint. That depends on the runtime safe-area inset, so neither can
  // be a static StyleSheet.create value; both derive from the one
  // floatingBottom below so they cannot drift out of sync.
  const floatingBottom = tabBarHeight + CART_BAR_GAP;
  /** Layout-only: scroll content must clear the tab bar's full footprint
   * plus the floating stack (cart bar + toast) sitting above it. */
  const contentContainerStyle = useMemo(
    () => ({ paddingBottom: floatingBottom + FLOATING_STACK_ALLOWANCE }),
    [floatingBottom],
  );

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  useEffect(() => {
    const load = setTimeout(() => setIsLoading(false), LOAD_MS);
    return () => {
      clearTimeout(load);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const handleAdd = useCallback(
    (item: MenuItem) => {
      addItem({ id: item.id, name: item.name, price: item.base });
      showToast(`${item.name} added to cart`);
    },
    [addItem, showToast],
  );

  const handleRemove = useCallback(
    (item: MenuItem) => decrementItem(item.id),
    [decrementItem],
  );

  const handleOpen = useCallback(
    (item: MenuItem) =>
      navigation.navigate('ProductDetail', { dishId: item.id }),
    [navigation],
  );

  const handleReorder = useCallback(() => {
    LAST_ORDER.forEach(line => {
      const item = byId[line.id];
      for (let i = 0; i < line.quantity; i++) {
        addItem({ id: item.id, name: item.name, price: item.base });
      }
    });
    showToast('Your last order is back in the cart');
  }, [addItem, showToast]);

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={contentContainerStyle}
      >
        <HomeHeader address={ADDRESS} />

        {!isOpen ? <ClosedStrip /> : null}

        <SignatureHero
          items={SIGNATURES}
          onAdd={handleAdd}
          onOpen={handleOpen}
        />
        <OffersRail />

        {isLoading ? (
          <View className="pt-lg">
            <SkeletonRail />
          </View>
        ) : (
          <>
            <CategoryRail
              activeId={activeCategory}
              onSelect={setActiveCategory}
            />
            <BestsellerRail
              quantityOf={quantityOf}
              onAdd={handleAdd}
              onRemove={handleRemove}
              onOpen={handleOpen}
            />
            <SizzlerSpotlight
              quantityOf={quantityOf}
              onAdd={handleAdd}
              onRemove={handleRemove}
              onOpen={handleOpen}
            />
            <ReorderRow onReorder={handleReorder} />
          </>
        )}
      </ScrollView>

      {/* Floating above the scroll view, clear of the tab bar's full
          footprint (useTabBarHeight). */}
      <View
        style={{ bottom: floatingBottom }}
        className="absolute left-md right-md gap-sm"
        pointerEvents="box-none"
      >
        {toast ? <Toast message={toast} /> : null}
        {count > 0 ? <CartBar count={count} total={total} /> : null}
      </View>
    </View>
  );
};
