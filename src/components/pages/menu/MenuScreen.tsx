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
import { Search } from 'lucide-react-native';
import type { MenuItem } from '@/types/menu.types';
import type { MainTabNavigationProp } from '@/types/navigation.types';
import { CartBar, EmptyState, Icon, Text, Toast } from '@/components/ui';
import { useCartStore } from '@/store/cart.store';
import { useTabBarHeight } from '@/hooks/use-tab-bar-height';
import {
  HAS_RATINGS,
  useMenuCatalog,
  type MenuSort,
} from './hooks/use-menu-catalog';
import { useScrollSpy } from './hooks/use-scroll-spy';
import { MenuTopBar } from './components/MenuTopBar';
import { FilterBar } from './components/FilterBar';
import { CategoryTabs } from './components/CategoryTabs';
import { MenuSectionHeader } from './components/MenuSectionHeader';
import { MenuRow } from './components/MenuRow';
import { MenuPill } from './components/MenuPill';
import { CategorySheet } from './components/CategorySheet';

const ADDRESS = '351 Maison Street';
const TOAST_MS = 1900;

/** Vertical gap between the cart bar and the tab bar's real top edge. */
const CART_BAR_GAP = 12;
/**
 * Room for the floating stack above `floatingBottom`: the Menu pill (py-3 +
 * a 17px icon row, ~42) + gap-sm (8) + CartBar (~56) ≈ 106, rounded up so
 * the last row clears it with some air.
 */
const FLOATING_STACK_ALLOWANCE = 120;

/**
 * The rail is the ScrollView's third child — top bar, filter bar, rail — and
 * the only sticky one. It is not rendered while searching, and nothing is
 * sticky then.
 */
const STICKY_RAIL = [2];

/**
 * The full menu: every section of src/data/menu.ts under a sticky category
 * rail that scroll-spies the list, with Pure Veg, sort and in-place search.
 *
 * Mock-only, like the home screen — the catalog comes from src/data/menu.ts
 * through useMenuCatalog, which is the seam when the API phase starts.
 */
export const MenuScreen = () => {
  const navigation = useNavigation<MainTabNavigationProp<'Menu'>>();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useTabBarHeight();

  const [query, setQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [sort, setSort] = useState<MenuSort | null>(null);
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const { sections, results, dishCount, isSearching } = useMenuCatalog({
    query,
    vegOnly,
    sort,
  });
  const sectionIds = useMemo(() => sections.map(s => s.id), [sections]);
  const {
    scrollRef,
    stuckId,
    activeId,
    railHeight,
    onScroll,
    onScrollBeginDrag,
    onRailLayout,
    onBodyLayout,
    onSectionLayout,
    jumpTo,
  } = useScrollSpy(sectionIds);
  const stuck = sections.find(s => s.id === stuckId);

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

  // The top of this screen is charcoal, so its status-bar glyphs go light —
  // only while the tab is focused. Tabs stay mounted, so a <StatusBar>
  // element here would keep overriding the other tabs after the user left.
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('light-content');
      return () => StatusBar.setBarStyle('dark-content');
    }, []),
  );

  const floatingBottom = tabBarHeight + CART_BAR_GAP;
  /** Layout-only: the last row must scroll clear of the tab bar and the
   * floating stack above it, both of which depend on the safe-area inset. */
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

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
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

  const handleSheetSelect = useCallback(
    (id: string) => {
      setSheetOpen(false);
      jumpTo(id);
    },
    [jumpTo],
  );

  const renderRow = (item: MenuItem) => (
    <MenuRow
      key={item.id}
      item={item}
      quantity={quantities[item.id] ?? 0}
      onAdd={handleAdd}
      onRemove={handleRemove}
      onOpen={handleOpen}
    />
  );

  const trimmedQuery = query.trim();

  return (
    <View className="flex-1 bg-canvas">
      {/* The status bar gets a charcoal strip of its own and the list starts
          below it, so the sticky rail pins under the strip rather than
          under the clock. */}
      <View style={{ height: insets.top }} className="bg-hero" />

      <View className="flex-1">
        <ScrollView
          ref={scrollRef}
          stickyHeaderIndices={isSearching ? undefined : STICKY_RAIL}
          onScroll={onScroll}
          onScrollBeginDrag={onScrollBeginDrag}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={contentContainerStyle}
        >
          <MenuTopBar
            address={ADDRESS}
            query={query}
            onChangeQuery={setQuery}
            onBack={() => navigation.navigate('Home')}
          />

          <FilterBar
            vegOnly={vegOnly}
            onVegChange={setVegOnly}
            sort={sort}
            onSortChange={setSort}
            showRatingSort={HAS_RATINGS}
          />

          {isSearching ? null : (
            <CategoryTabs
              sections={sections}
              activeId={activeId}
              onSelect={jumpTo}
              onLayout={onRailLayout}
            />
          )}

          {isSearching ? (
            <View className="px-md pt-3.5">
              {results.length > 0 ? (
                <>
                  <Text
                    variant="fine"
                    tone="muted"
                    weight="700"
                    className="mb-3.5"
                  >
                    {`${results.length} ${
                      results.length === 1 ? 'result' : 'results'
                    } for "${trimmedQuery}"`}
                  </Text>
                  <View className="gap-lg">{results.map(renderRow)}</View>
                </>
              ) : (
                <View className="py-2xl">
                  <EmptyState
                    icon={
                      <View className="w-18 h-18 rounded-pill bg-sunken items-center justify-center">
                        <Icon
                          icon={Search}
                          className="text-chevron"
                          size={34}
                          strokeWidth={1.7}
                        />
                      </View>
                    }
                    title="No dishes found"
                    message={`We couldn't find anything for "${trimmedQuery}". ${
                      vegOnly
                        ? 'Try another dish, or turn off Pure Veg.'
                        : 'Try another dish.'
                    }`}
                  />
                </View>
              )}
            </View>
          ) : (
            <View onLayout={onBodyLayout}>
              {sections.map(section => (
                <View
                  key={section.id}
                  onLayout={e => onSectionLayout(section.id, e)}
                  className="pb-md"
                >
                  <MenuSectionHeader
                    name={section.name}
                    count={section.items.length}
                  />
                  <View className="px-md gap-lg">
                    {section.items.map(renderRow)}
                  </View>
                </View>
              ))}

              <View className="items-center px-xl pt-sm pb-lg">
                <Text variant="body" tone="footnote" weight="700">
                  JJ's Kitchen · Dine in & Catering
                </Text>
                <Text
                  variant="fine"
                  tone="footnote"
                  className="text-center mt-1.5"
                >
                  FSSAI licensed · Prices incl. of taxes shown at checkout
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* The stuck section's header, held under the rail. A ScrollView can
            only keep one sticky child up at a time, and that slot is the
            rail's; this copy takes over from the in-list header at the moment
            the two coincide, so the hand-off is invisible. Touches fall
            through to the list beneath. */}
        {!isSearching && stuck ? (
          <View
            pointerEvents="none"
            style={{ top: railHeight }}
            className="absolute left-0 right-0"
          >
            <MenuSectionHeader name={stuck.name} count={stuck.items.length} />
          </View>
        ) : null}
      </View>

      {/* Floating above the scroll view, clear of the tab bar's full
          footprint (useTabBarHeight). */}
      <View
        style={{ bottom: floatingBottom }}
        className="absolute left-md right-md gap-sm"
        pointerEvents="box-none"
      >
        {toast ? <Toast message={toast} /> : null}
        {isSearching || isSheetOpen ? null : (
          <MenuPill dishCount={dishCount} onPress={() => setSheetOpen(true)} />
        )}
        {count > 0 ? <CartBar count={count} total={total} /> : null}
      </View>

      {isSheetOpen ? (
        <CategorySheet
          sections={sections}
          activeId={activeId}
          onSelect={handleSheetSelect}
          onClose={() => setSheetOpen(false)}
        />
      ) : null}
    </View>
  );
};
