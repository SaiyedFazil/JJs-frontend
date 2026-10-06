import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Share,
  StatusBar,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MenuItem } from '@/types/menu.types';
import type { MainStackParamList } from '@/types/navigation.types';
import { EmptyState, FormScreen, Toast } from '@/components/ui';
import { byId } from '@/data/menu';
import { PORTION_SERVES, dishDetailOf } from '@/data/dish-details';
import { useCartStore } from '@/store/cart.store';
import { useFavouritesStore } from '@/store/favourites.store';
import { useDishOrder } from './hooks/use-dish-order';
import { DishGallery } from './components/DishGallery';
import { GalleryChrome } from './components/GalleryChrome';
import { DishSummary } from './components/DishSummary';
import { PortionPicker } from './components/PortionPicker';
import { SpicePicker } from './components/SpicePicker';
import { AddOnList } from './components/AddOnList';
import { CookingNotes } from './components/CookingNotes';
import { QuantityCard } from './components/QuantityCard';
import { PairingsRail } from './components/PairingsRail';
import { ReviewsSection } from './components/ReviewsSection';
import { OrderBar } from './components/OrderBar';

type Navigation = NativeStackNavigationProp<
  MainStackParamList,
  'ProductDetail'
>;

const TOAST_MS = 1900;
/** The photo's height as a share of the window's width (the design's 318/392). */
const GALLERY_RATIO = 0.81;
/** The floating chrome's gap below the status bar. */
const CHROME_GAP = 8;
/** Clearance between the toast and the bar it floats over. */
const TOAST_GAP = 12;

/**
 * A dish's full page: the photo, what it is, every choice the kitchen takes
 * for it, what goes with it and what people said — with a bar underneath that
 * prices the order as it is configured.
 *
 * Mock-only, like the home and menu screens: content comes from
 * src/data/dish-details.ts, the seam when the API phase starts.
 */
const ProductDetail = ({ item }: { item: MenuItem }) => {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const detail = useMemo(() => dishDetailOf(item), [item]);
  const order = useDishOrder(item, detail);

  const isFavourite = useFavouritesStore(s => s.ids.includes(item.id));
  const toggleFavourite = useFavouritesStore(s => s.toggle);
  const cartItems = useCartStore(s => s.items);
  const addItem = useCartStore(s => s.addItem);

  const [toast, setToast] = useState<string | null>(null);
  const [barHeight, setBarHeight] = useState(0);

  // The photo runs up under the status bar, so its glyphs go light — only
  // while this screen is focused, so the screen beneath gets its own back.
  //
  // Deferred a frame: on a push, this effect runs as the screen mounts, before
  // the navigator tells the screen underneath that it has blurred. The Menu
  // tab resets the bar to dark on blur, and without the deferral that reset
  // lands last and leaves dark glyphs on the photo.
  useFocusEffect(
    useCallback(() => {
      const frame = requestAnimationFrame(() =>
        StatusBar.setBarStyle('light-content'),
      );
      return () => {
        cancelAnimationFrame(frame);
        StatusBar.setBarStyle('dark-content');
      };
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

  const isSoldOut = !!item.soldOut;
  const galleryHeight = Math.round(width * GALLERY_RATIO) + insets.top;
  const serves = item.portion ? PORTION_SERVES[order.portion] : detail.serves;

  const isInCart = useCallback(
    (id: string) => cartItems.some(i => i.id === id),
    [cartItems],
  );

  const handleAdd = () => {
    order.addToCart();
    showToast(`${item.name} added to cart`);
  };

  const handleAddPairing = (pairing: MenuItem) => {
    addItem({ id: pairing.id, name: pairing.name, price: pairing.base });
    showToast(`${pairing.name} added`);
  };

  const handleShare = () => {
    // Dismissing the share sheet rejects on some platforms; nothing to do.
    Share.share({
      message: `${item.name} at JJ's Kitchen — ₹${item.base}`,
    }).catch(() => {});
  };

  return (
    <View className="flex-1 bg-canvas">
      <FormScreen contentContainerStyle={styles.content}>
        <DishGallery
          photos={detail.gallery}
          categoryId={item.cat}
          height={galleryHeight}
          isSoldOut={isSoldOut}
        />

        {/* Pulled up over the photo's lower edge, as a sheet resting on it. */}
        <View className="-mt-5 rounded-t-xl bg-canvas px-5 pt-5">
          <DishSummary item={item} detail={detail} serves={serves} />

          {item.portion ? (
            <PortionPicker
              portion={item.portion}
              value={order.portion}
              onChange={order.setPortion}
            />
          ) : null}

          {detail.hasSpiceLevel ? (
            <SpicePicker value={order.spice} onChange={order.setSpice} />
          ) : null}

          {detail.addOns.length > 0 ? (
            <AddOnList
              addOns={detail.addOns}
              selectedIds={order.addOnIds}
              onToggle={order.toggleAddOn}
            />
          ) : null}

          {detail.takesNotes ? (
            <CookingNotes
              value={order.notes}
              onChange={order.setNotes}
              isVeg={item.veg}
            />
          ) : null}

          {isSoldOut ? null : (
            <QuantityCard
              unitPrice={order.unitPrice}
              quantity={order.quantity}
              canDecrement={order.canDecrement}
              onIncrement={order.increment}
              onDecrement={order.decrement}
            />
          )}
        </View>

        {detail.pairings.length > 0 ? (
          <PairingsRail
            items={detail.pairings}
            isInCart={isInCart}
            onAdd={handleAddPairing}
            onOpen={pairing =>
              navigation.push('ProductDetail', { dishId: pairing.id })
            }
          />
        ) : null}

        <ReviewsSection
          rating={detail.rating}
          reviews={detail.reviews}
          categoryId={item.cat}
        />
      </FormScreen>

      <GalleryChrome
        top={insets.top + CHROME_GAP}
        isFavourite={isFavourite}
        onBack={navigation.goBack}
        onShare={handleShare}
        onToggleFavourite={() => toggleFavourite(item.id)}
      />

      {toast ? (
        <View
          pointerEvents="none"
          // Layout-only: floats just above the bar, whose height is measured.
          style={{ bottom: barHeight + TOAST_GAP }}
          className="absolute left-md right-md"
        >
          <Toast message={toast} />
        </View>
      ) : null}

      <OrderBar
        isSoldOut={isSoldOut}
        isInCart={order.isInCart}
        quantity={order.quantity}
        canDecrement={order.canDecrement}
        total={order.total}
        bottomInset={insets.bottom}
        onIncrement={order.increment}
        onDecrement={order.decrement}
        onAdd={handleAdd}
        onLayout={e => setBarHeight(e.nativeEvent.layout.height)}
      />
    </View>
  );
};

export const ProductDetailScreen = () => {
  const navigation = useNavigation<Navigation>();
  const { params } = useRoute<RouteProp<MainStackParamList, 'ProductDetail'>>();
  const item = byId[params.dishId];

  if (!item) {
    return (
      <View className="flex-1 bg-canvas">
        <EmptyState
          title="Dish not found"
          message="It may have come off the menu."
          actionLabel="Go back"
          onAction={navigation.goBack}
        />
      </View>
    );
  }

  // Keyed by dish so a different dish never inherits this one's choices.
  return <ProductDetail key={item.id} item={item} />;
};

/** Layout-only: room under the last review before the bar. */
const styles = StyleSheet.create({
  content: { paddingBottom: 32 },
});
