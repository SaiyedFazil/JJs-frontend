import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ScrollView, StatusBar, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, ClipboardList } from 'lucide-react-native';
import { EmptyState, Icon, Text, Toast } from '@/components/ui';
import { useCartStore } from '@/store/cart.store';
import { byId } from '@/data/menu';
import type { MainStackParamList } from '@/types/navigation.types';
import type { Order, OrderFilter } from '@/types/order.types';
import { useOrders } from './hooks/use-orders';
import { OrderFilters } from './components/OrderFilters';
import { ActiveOrderCard } from './components/ActiveOrderCard';
import { OrderCard } from './components/OrderCard';
import { OrderSkeleton } from './components/OrderSkeleton';

type Navigation = NativeStackNavigationProp<MainStackParamList, 'MyOrders'>;

const TOAST_MS = 1900;
/** How long the mock "fetch" spins before the list appears — the API seam. */
const LOAD_MS = 900;
/** Clearance between the floating toast and the screen's bottom edge. */
const TOAST_GAP = 16;
/** Room below the last card so it clears the floating toast. */
const LIST_ALLOWANCE = 96;

/**
 * Order history, built for one job — reorder fast. The active order is pinned
 * at the top with live status; past orders lead with their dishes and make
 * reordering one tap. The Active/Past filter pills narrow the list.
 *
 * Mock-only in the same sense as the Menu and Home screens: orders come from
 * src/data/orders.ts and the loading state is a timer, not a request — both are
 * the seam when the API phase starts. Reorder, though, acts on the real cart
 * store, so it genuinely fills the cart.
 */
export const MyOrdersScreen = () => {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();

  const [filter, setFilter] = useState<OrderFilter>('all');
  const [isLoading, setLoading] = useState(true);
  /** Ratings left this session, keyed by order id — overrides the mock. */
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [toast, setToast] = useState<string | null>(null);

  const addItem = useCartStore(s => s.addItem);

  const view = useOrders(filter, ratings);

  // The top bar is white on the cream canvas, so its status-bar glyphs stay
  // dark — set on focus, since the screen beneath may have left them light.
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('dark-content');
    }, []),
  );

  // Mock fetch: spin briefly on first mount, then show the list.
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), LOAD_MS);
    return () => clearTimeout(timer);
  }, []);

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

  const handleReorder = useCallback(
    (order: Order) => {
      // Add each still-available line back to the real cart at its quantity.
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
    },
    [addItem, showToast],
  );

  const handleRate = useCallback(
    (order: Order, value: number) => {
      setRatings(r => ({ ...r, [order.id]: value }));
      showToast('Thanks for rating your order!');
    },
    [showToast],
  );

  const handleOpen = useCallback(
    (order: Order) => navigation.navigate('OrderDetail', { orderId: order.id }),
    [navigation],
  );

  const handleHelp = useCallback(
    (order: Order) => showToast(`Help for #${order.ref} is coming soon`),
    [showToast],
  );

  const handleTrack = useCallback(
    () => showToast('Live order tracking is coming soon'),
    [showToast],
  );

  const handleBrowse = useCallback(
    () => navigation.navigate('Tabs', { screen: 'Menu' }),
    [navigation],
  );

  const contentContainerStyle = useMemo(
    () => ({ paddingBottom: insets.bottom + LIST_ALLOWANCE }),
    [insets.bottom],
  );

  // Empty = nothing has ever been ordered (no active order, no past orders).
  const isEmpty =
    !isLoading && !view.active && view.past.length === 0 && filter === 'all';

  return (
    <View className="flex-1 bg-canvas">
      {/* White top bar; the safe-area strip matches it rather than the canvas. */}
      <View style={{ height: insets.top }} className="bg-surface" />
      <View className="border-b border-card-hairline bg-surface px-md pb-sm pt-xs">
        <View className="mb-sm flex-row items-center gap-sm">
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
          <Text variant="h2">My Orders</Text>
        </View>
        {isEmpty ? null : <OrderFilters value={filter} onChange={setFilter} />}
      </View>

      {isLoading ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-md pt-md"
        >
          <OrderSkeleton />
        </ScrollView>
      ) : isEmpty ? (
        <EmptyState
          icon={
            <View className="mb-sm h-24 w-24 items-center justify-center rounded-pill bg-sunken">
              <Icon
                icon={ClipboardList}
                className="text-chevron"
                size={44}
                strokeWidth={1.5}
              />
            </View>
          }
          title="You haven't ordered yet"
          message="Your JJ's Kitchen orders will show up here. Time for some smoky tandoori?"
          actionLabel="Browse the menu"
          onAction={handleBrowse}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={contentContainerStyle}
          contentContainerClassName="px-md pt-md"
        >
          {view.active ? (
            <ActiveOrderCard order={view.active} onTrack={handleTrack} />
          ) : null}

          {view.past.length > 0 ? (
            <View>
              <Text
                variant="micro"
                tone="label"
                weight="800"
                className="mb-sm ml-xs uppercase"
              >
                {view.pastHeading}
              </Text>
              <View className="gap-md">
                {view.past.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onOpen={handleOpen}
                    onReorder={handleReorder}
                    onRate={handleRate}
                    onHelp={handleHelp}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {view.isEmptyInFilter ? (
            <View className="items-center px-lg pt-2xl">
              <Text variant="h2" className="text-center">
                Nothing here yet
              </Text>
              <Text variant="body" tone="muted" className="mt-sm text-center">
                {`No ${filter} orders to show.`}
              </Text>
            </View>
          ) : null}
        </ScrollView>
      )}

      {toast ? (
        <View
          pointerEvents="none"
          style={{ bottom: insets.bottom + TOAST_GAP }}
          className="absolute left-md right-md"
        >
          <Toast message={toast} accent="ember" />
        </View>
      ) : null}
    </View>
  );
};
