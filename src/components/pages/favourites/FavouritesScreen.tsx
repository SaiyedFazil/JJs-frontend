import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ScrollView, StatusBar, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heart } from 'lucide-react-native';
import type { MenuItem } from '@/types/menu.types';
import type { MainTabNavigationProp } from '@/types/navigation.types';
import {
  CartBar,
  EmptyState,
  Icon,
  Text,
  Toast,
  VegSwitch,
} from '@/components/ui';
import { useTabBarHeight } from '@/hooks/use-tab-bar-height';
import { useCartStore } from '@/store/cart.store';
import { useFavouritesStore } from '@/store/favourites.store';
import { MenuRow } from '@/components/pages/menu/components/MenuRow';
import { useFavourites } from './hooks/use-favourites';
import { FavouritesSectionHeader } from './components/FavouritesSectionHeader';
import { UndoBanner } from './components/UndoBanner';

const TOAST_MS = 1900;
/** How long the "Removed … · UNDO" banner lingers before it gives up. */
const UNDO_MS = 4000;

/** Vertical gap between the floating stack and the tab bar's real top edge. */
const FLOATING_GAP = 12;
/**
 * Room for the floating stack above `floatingBottom`: the undo banner or cart
 * bar (~56) plus air. The last row scrolls clear of it.
 */
const FLOATING_ALLOWANCE = 84;

/**
 * The Saved tab: hearted dishes grouped by section, each drawn with the Menu
 * item-card (MenuRow) so the two screens read identically. A dish is removed
 * with the card's heart — optimistically, with a 4-second Undo — and can be
 * added to the cart from here like anywhere else.
 *
 * Mock-only in the same sense as the Menu: the saved ids come from
 * favourites.store and resolve to src/data/menu.ts through useFavourites,
 * which is the seam when the API phase starts.
 */
export const FavouritesScreen = () => {
  const navigation = useNavigation<MainTabNavigationProp<'Favourites'>>();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useTabBarHeight();

  const [vegOnly, setVegOnly] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  /** The just-removed dish, held so UNDO can restore it. */
  const [pendingUndo, setPendingUndo] = useState<MenuItem | null>(null);

  const { sections, savedCount, isEmpty } = useFavourites(vegOnly);
  const toggleFavourite = useFavouritesStore(s => s.toggle);

  const cartItems = useCartStore(s => s.items);
  const addItem = useCartStore(s => s.addItem);
  const decrementItem = useCartStore(s => s.decrementItem);
  const count = useCartStore(s => s.totalItems());
  const total = useCartStore(s => s.totalAmount());
  const quantities = useMemo(
    () =>
      Object.fromEntries(cartItems.map(i => [i.id, i.quantity])) as Record<
        string,
        number
      >,
    [cartItems],
  );

  // The top of this screen is light (a white bar on the cream canvas), so its
  // status-bar glyphs stay dark — only while the tab is focused, since tabs
  // stay mounted and a bare <StatusBar> here would outlive the blur.
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

  const handleUnfavourite = useCallback(
    (item: MenuItem) => {
      if (undoTimer.current) clearTimeout(undoTimer.current);
      toggleFavourite(item.id);
      setPendingUndo(item);
      undoTimer.current = setTimeout(() => setPendingUndo(null), UNDO_MS);
    },
    [toggleFavourite],
  );

  const handleUndo = useCallback(() => {
    if (undoTimer.current) clearTimeout(undoTimer.current);
    setPendingUndo(current => {
      if (current) toggleFavourite(current.id);
      return null;
    });
  }, [toggleFavourite]);

  const handleBrowse = useCallback(
    () => navigation.navigate('Menu'),
    [navigation],
  );

  const floatingBottom = tabBarHeight + FLOATING_GAP;
  const contentContainerStyle = useMemo(
    () => ({ paddingBottom: floatingBottom + FLOATING_ALLOWANCE }),
    [floatingBottom],
  );

  return (
    <View className="flex-1 bg-canvas">
      {/* The top bar is white, so the safe-area strip above it matches rather
          than showing the canvas through the notch. */}
      <View style={{ height: insets.top }} className="bg-surface" />

      <View className="flex-row items-center gap-md bg-surface border-b border-hairline px-md pb-3 pt-1">
        <View className="flex-1">
          <Text variant="h2">Favourites</Text>
          {savedCount > 0 ? (
            <Text variant="fine" tone="muted" weight="600" className="mt-1">
              {`${savedCount} saved ${savedCount === 1 ? 'dish' : 'dishes'}`}
            </Text>
          ) : null}
        </View>
        {isEmpty ? null : (
          <VegSwitch value={vegOnly} onChange={setVegOnly} label="Veg only" />
        )}
      </View>

      {isEmpty ? (
        <EmptyState
          icon={
            <View className="w-24 h-24 rounded-pill bg-ember-tint items-center justify-center mb-sm">
              <Icon
                icon={Heart}
                className="text-ember"
                size={44}
                strokeWidth={1.8}
              />
            </View>
          }
          title="No favourites yet"
          message="Tap the ♥ on any dish to save it here for quick reordering."
          actionLabel="Browse the menu"
          onAction={handleBrowse}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={contentContainerStyle}
          contentContainerClassName="px-md pt-md"
        >
          {sections.map(section => (
            <View key={section.id} className="mb-lg">
              <FavouritesSectionHeader name={section.name} />
              <View className="gap-lg">
                {section.items.map(item => (
                  <MenuRow
                    key={item.id}
                    item={item}
                    quantity={quantities[item.id] ?? 0}
                    onAdd={handleAdd}
                    onRemove={handleRemove}
                    onOpen={handleOpen}
                    onUnfavourite={handleUnfavourite}
                  />
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Floating above the scroll view, clear of the tab bar's full
          footprint. Toast on top, then the undo banner or the cart bar. */}
      <View
        style={{ bottom: floatingBottom }}
        className="absolute left-md right-md gap-sm"
        pointerEvents="box-none"
      >
        {toast ? <Toast message={toast} /> : null}
        {pendingUndo ? (
          <UndoBanner name={pendingUndo.name} onUndo={handleUndo} />
        ) : null}
        {count > 0 ? <CartBar count={count} total={total} /> : null}
      </View>
    </View>
  );
};
