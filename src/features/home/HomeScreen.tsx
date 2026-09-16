import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MenuItem } from '@/types/menu';
import { CartBar, Toast, SkeletonRail } from '@/components/ui';
import { useCartStore } from '@/store/cart.store';
import { byId } from '@/data/menu';
import { isOpenAt } from '@/data/restaurant';
import { TAB_BAR_HEIGHT } from '@/components/navigation/CustomTabBar';
import { HomeHeader } from './components/HomeHeader';
import { ClosedStrip } from './components/ClosedStrip';
import { SignatureHero } from './components/SignatureHero';
import { OffersRail } from './components/OffersRail';
import { StatusStrip } from './components/StatusStrip';
import { CategoryRail } from './components/CategoryRail';
import { BestsellerRail } from './components/BestsellerRail';
import { SizzlerSpotlight } from './components/SizzlerSpotlight';
import { ReorderRow, LAST_ORDER } from './components/ReorderRow';

const ADDRESS = '351 Maison Street, Bandra W';
const SIGNATURE = byId['tandoori-chicken'];
const TOAST_MS = 1900;
/** Mock latency, matching the app's existing setTimeout convention. */
const LOAD_MS = 900;

export const HomeScreen = () => {
  const [serviceMode, setServiceMode] = useState('delivery');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const insets = useSafeAreaInsets();

  const addItem = useCartStore(s => s.addItem);
  const decrementItem = useCartStore(s => s.decrementItem);
  const quantityOf = useCartStore(s => s.quantityOf);
  // Subscribing to the derived values is what re-renders this screen on every
  // cart change; quantityOf above is a stable reference that reads current
  // state, so the rails recompute during that same render pass.
  const count = useCartStore(s => s.totalItems());
  const total = useCartStore(s => s.totalAmount());

  const isOpen = isOpenAt(new Date());

  // CustomTabBar is pinned to the screen bottom with its own
  // `paddingBottom: insets.bottom + 10` on top of TAB_BAR_HEIGHT, so its true
  // on-screen footprint is TAB_BAR_HEIGHT + insets.bottom, not TAB_BAR_HEIGHT
  // alone. Both the floating layer and the scroll content's bottom padding
  // must clear that full footprint, so both depend on the runtime inset and
  // can't be static StyleSheet.create values.
  const floatingBottom = TAB_BAR_HEIGHT + insets.bottom + 12;
  /** Layout-only: bottom clearance for the tab bar (plus its safe-area
   * inset) and the cart bar. */
  const contentContainerStyle = useMemo(
    () => ({ paddingBottom: 170 + insets.bottom }),
    [insets.bottom],
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
        <HomeHeader
          address={ADDRESS}
          serviceMode={serviceMode}
          onServiceModeChange={setServiceMode}
        />

        {!isOpen ? <ClosedStrip /> : null}

        <SignatureHero item={SIGNATURE} onAdd={() => handleAdd(SIGNATURE)} />
        <OffersRail />
        <StatusStrip
          isOpen={isOpen}
          isVegOnly={isVegOnly}
          onVegChange={setIsVegOnly}
        />

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
            />
            <SizzlerSpotlight
              quantityOf={quantityOf}
              onAdd={handleAdd}
              onRemove={handleRemove}
            />
            <ReorderRow onReorder={handleReorder} />
          </>
        )}
      </ScrollView>

      {/* Floating above the scroll view, clear of the tab bar's full
          footprint — TAB_BAR_HEIGHT plus its bottom safe-area inset. */}
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
