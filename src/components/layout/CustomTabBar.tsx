import React, { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Platform,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from '@react-native-community/blur';
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { Text, GlassSheen, useClassColor } from '@/components/ui';
import {
  CART_FAB_OVERHANG,
  TAB_BAR_HEIGHT,
  TAB_BAR_SIDE_INSET,
  tabBarBottomOffset,
} from '@/constants/layout';
import type { MainTabParamList } from '@/types/navigation.types';
import { TAB_GLYPHS, type TabGlyph, type TabGlyphColors } from './TabIcons';
import { CartFab, useCartPresence } from './CartTabButton';

const AnimatedText = Animated.createAnimatedComponent(Text);

const ICON_SIZE = 26;
const ICON_STROKE = 1.75;
/** Press feedback, and the settle of a newly selected icon. */
const SPRING = { damping: 15, stiffness: 300 };
const PRESSED_SCALE = 0.9;
/** Where a newly selected icon springs from: 2 low and at 0.9 scale. */
const POP_LIFT = 2;
const POP_SCALE = 0.9;
/** The crossfade between ink-outline and ember-filled as focus moves. */
const FOCUS_TIMING = { duration: 200 };
/**
 * Tabs are drawn either side of the cart, which sits after this many. Its
 * slot is narrower than a tab, so the four labels keep their room.
 */
const TABS_BEFORE_CART = 2;
const CART_SLOT_WIDTH = 56;

/**
 * One tab: icon over label, and nothing behind it.
 *
 * Selection is carried by colour and fill alone — ink outline to ember
 * silhouette — with no lozenge or indicator. The two forms of the icon are
 * stacked and crossfaded, which reads as the colour interpolating while the
 * fill comes in, and keeps every animated value off the layout pass.
 */
interface TabButtonProps {
  Glyph: TabGlyph | undefined;
  label: string;
  accessibilityLabel: string;
  isFocused: boolean;
  colors: TabGlyphColors;
  onPress: () => void;
  onLongPress: () => void;
}

const TabButton = memo(
  ({
    Glyph,
    label,
    accessibilityLabel,
    isFocused,
    colors,
    onPress,
    onLongPress,
  }: TabButtonProps) => {
    const focus = useSharedValue(isFocused ? 1 : 0);
    const pop = useSharedValue(1);
    const press = useSharedValue(1);
    const isFirstRun = useRef(true);

    useEffect(() => {
      focus.value = withTiming(isFocused ? 1 : 0, FOCUS_TIMING);
      // Mounting already selected is not a tab change, so it does not pop.
      if (isFirstRun.current) {
        isFirstRun.current = false;
        return;
      }
      if (isFocused) {
        pop.value = withSequence(
          withTiming(0, { duration: 0 }),
          withSpring(1, SPRING),
        );
      }
    }, [isFocused, focus, pop]);

    const iconStyle = useAnimatedStyle(() => ({
      transform: [
        { translateY: (1 - pop.value) * POP_LIFT },
        { scale: press.value * (POP_SCALE + (1 - POP_SCALE) * pop.value) },
      ],
    }));
    const outlineStyle = useAnimatedStyle(() => ({ opacity: 1 - focus.value }));
    const filledStyle = useAnimatedStyle(() => ({ opacity: focus.value }));

    // If either colour failed to resolve, the label keeps its tone class
    // rather than interpolating towards nothing.
    const { ink, ember } = colors;
    const labelStyle = useAnimatedStyle(() =>
      ink && ember
        ? { color: interpolateColor(focus.value, [0, 1], [ink, ember]) }
        : {},
    );

    const onPressIn = useCallback(() => {
      press.value = withSpring(PRESSED_SCALE, SPRING);
    }, [press]);
    const onPressOut = useCallback(() => {
      press.value = withSpring(1, SPRING);
    }, [press]);

    return (
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        accessibilityRole="tab"
        accessibilityState={{ selected: isFocused }}
        accessibilityLabel={accessibilityLabel}
        className="flex-1 basis-0 min-w-0 items-center justify-center gap-xs"
      >
        {Glyph ? (
          <Animated.View style={[styles.glyph, iconStyle]}>
            <Animated.View className="absolute inset-0" style={outlineStyle}>
              <Glyph
                filled={false}
                colors={colors}
                size={ICON_SIZE}
                strokeWidth={ICON_STROKE}
              />
            </Animated.View>
            <Animated.View className="absolute inset-0" style={filledStyle}>
              <Glyph
                filled
                colors={colors}
                size={ICON_SIZE}
                strokeWidth={ICON_STROKE}
              />
            </Animated.View>
          </Animated.View>
        ) : null}
        <AnimatedText
          variant="fine"
          tone={isFocused ? 'ember' : 'ink'}
          weight={isFocused ? '600' : '500'}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
          style={labelStyle}
        >
          {label}
        </AnimatedText>
      </Pressable>
    );
  },
);

TabButton.displayName = 'TabButton';

/**
 * The cart's place in the tab row: an empty icon box under the floating
 * button, and a label lined up with the tabs'. Tapping it opens the cart too,
 * but it is hidden from screen readers — the button above is the one control.
 *
 * Its width follows `open`, so the tabs either side slide apart as the cart
 * arrives and back together as it empties. The content keeps its full width
 * inside and is clipped, so the label never re-wraps or ellipsizes mid-way;
 * it fades in only once the gap is nearly open.
 */
const CartSlot = memo(
  ({ onPress, open }: { onPress: () => void; open: SharedValue<number> }) => {
    const slotStyle = useAnimatedStyle(() => ({
      width: CART_SLOT_WIDTH * open.value,
    }));
    const labelStyle = useAnimatedStyle(() => ({
      opacity: interpolate(open.value, [0.6, 1], [0, 1], Extrapolation.CLAMP),
    }));

    return (
      <Animated.View
        className="items-center justify-center overflow-hidden"
        style={slotStyle}
      >
        <Pressable
          onPress={onPress}
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          className="h-full items-center justify-center gap-xs"
          style={styles.cartSlot}
        >
          <View style={styles.glyph} />
          <AnimatedText
            variant="fine"
            tone="ink"
            weight="500"
            numberOfLines={1}
            style={labelStyle}
          >
            Cart
          </AnimatedText>
        </Pressable>
      </Animated.View>
    );
  },
);

CartSlot.displayName = 'CartSlot';

/**
 * Custom Tab Bar Component
 *
 * A see-through glass pill floating inset from the screen's sides and
 * bottom, with content scrolling blurred behind it. Bottom to top:
 *
 *   1. shadow-glass, on an outer view with no clip so the shadow survives
 *   2. a native backdrop blur
 *   3. the light glass tint (Android paints it as the blur's overlayColor)
 *   4. GlassSheen, the top-down gloss
 *   5. a hairline border, owned by the clipping view
 *
 * While the cart holds anything, a cart button (CartFab) sits in the middle
 * of the row and rises CART_FAB_OVERHANG above the pill's top edge; with an
 * empty cart the row closes up to four tabs. The dock is that much taller
 * than the pill so the overhang stays inside its bounds — Android delivers no
 * touch to a child drawn outside its parent — and it passes touches through
 * everywhere but the pill and the button.
 *
 * One palette serves both device colour schemes, as everywhere in the design
 * system, so there is deliberately no dark variant of the glass.
 *
 * Screens clear the bar with useTabBarHeight (src/hooks/use-tab-bar-height.ts),
 * which sums the same constants this positions itself from.
 */
export const CustomTabBar = memo(
  ({ state, navigation, descriptors, insets }: BottomTabBarProps) => {
    // Insets come from props rather than useSafeAreaInsets to keep this a
    // pure memoized component with no hook-order risk under the navigator.
    const bottomOffset = tabBarBottomOffset(insets.bottom);
    const position = useMemo(() => ({ bottom: bottomOffset }), [bottomOffset]);

    // Slide the whole pill below the screen's edge while the keyboard is up,
    // in step with the keyboard's own animation. A bar floating mid-screen
    // over a focused field covers exactly what the user is typing into.
    const { progress } = useReanimatedKeyboardAnimation();
    const hideDistance = TAB_BAR_HEIGHT + CART_FAB_OVERHANG + bottomOffset;
    const keyboardStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: progress.value * hideDistance }],
    }));

    // BlurView, SVG and Reanimated all take colour STRINGS, not class names,
    // so these resolve literal utilities — still no hex in this file.
    //
    // The tint matters on Android specifically: as `overlayColor` it replaces
    // the library's own default, a dark charcoal wash that would sink the
    // pill on our cream canvas. iOS ignores the prop, so it gets a tint view.
    const tint = useClassColor('text-glass');
    // Shown instead of the blur when iOS "Reduce Transparency" is on (the
    // library checks the setting itself). It must be opaque, or the pill
    // becomes an unreadable ghost for the users who enabled that setting
    // precisely to avoid one. Android's blur needs no fallback: it renders on
    // every API level this app supports.
    const fallbackColor = useClassColor('text-surface');

    const ink = useClassColor('text-ink');
    const ember = useClassColor('text-ember');
    const onEmber = useClassColor('text-on-ember');
    const colors = useMemo(
      () => ({ ink, ember, onEmber }),
      [ink, ember, onEmber],
    );

    // Cart belongs to the stack above the tabs; navigate bubbles up to it,
    // so it opens over the bar the way ProductDetail does.
    const openCart = useCallback(
      () => navigation.navigate('Cart'),
      [navigation],
    );
    // The cart shows only while it holds something; this re-renders the bar
    // only as it goes empty ↔ non-empty.
    const cart = useCartPresence();

    // A screen nested inside a tab can ask for the whole viewport by setting
    // `tabBarStyle: { display: 'none' }`, the same contract the default bar
    // honours. Flattened rather than read directly, because the option is a
    // StyleProp and may arrive as an array.
    //
    // This sits AFTER every hook above on purpose: an early return placed
    // among them would change the hook count between renders.
    const focusedOptions = descriptors[state.routes[state.index].key]?.options;
    const tabBarStyle = StyleSheet.flatten(
      focusedOptions?.tabBarStyle as StyleProp<ViewStyle>,
    );
    if (tabBarStyle?.display === 'none') return null;

    return (
      <Animated.View
        pointerEvents="box-none"
        style={[styles.dock, position, keyboardStyle]}
      >
        {/* Shadow and clip are deliberately on two different views: the clip
            that rounds the blur would also cut the shadow away. */}
        <View className="rounded-pill shadow-glass" style={styles.pill}>
          {/* BlurView is a native ViewGroup: it honours neither flex layout
            nor a className borderRadius. So it stays an absolutely-positioned
            backdrop, and this plain RN view — which respects both — owns the
            radius, the border and the row. Its overflow-hidden is what
            rounds the blur's corners. */}
          <View className="flex-1 rounded-pill border border-glass-hairline overflow-hidden">
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType={BLUR_TYPE}
              blurAmount={BLUR_AMOUNT}
              blurRadius={BLUR_RADIUS}
              downsampleFactor={BLUR_DOWNSAMPLE}
              reducedTransparencyFallbackColor={fallbackColor}
              overlayColor={tint}
              pointerEvents="none"
            />
            {/* iOS only: on Android overlayColor above already paints this
              same token, and stacking both would apply the wash twice. */}
            {Platform.OS === 'ios' ? (
              <View
                pointerEvents="none"
                className="absolute inset-0 bg-glass"
              />
            ) : null}
            <GlassSheen />
            <View accessibilityRole="tablist" style={styles.row}>
              {state.routes.map((route, index) => {
                const isFocused = state.index === index;
                const { options } = descriptors[route.key];
                const label =
                  typeof options.tabBarLabel === 'string'
                    ? options.tabBarLabel
                    : (options.title ?? route.name);

                const onPress = () => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });

                  if (!isFocused && !event.defaultPrevented) {
                    navigation.navigate(route.name, route.params);
                  }
                };

                const onLongPress = () => {
                  navigation.emit({ type: 'tabLongPress', target: route.key });
                };

                const tab = (
                  <TabButton
                    key={route.key}
                    Glyph={TAB_GLYPHS[route.name as keyof MainTabParamList]}
                    label={label}
                    accessibilityLabel={
                      options.tabBarAccessibilityLabel ?? label
                    }
                    isFocused={isFocused}
                    colors={colors}
                    onPress={onPress}
                    onLongPress={onLongPress}
                  />
                );
                return index === TABS_BEFORE_CART ? (
                  <React.Fragment key={route.key}>
                    <CartSlot onPress={openCart} open={cart.slot} />
                    {tab}
                  </React.Fragment>
                ) : (
                  tab
                );
              })}
            </View>
          </View>
        </View>
        <View pointerEvents="box-none" style={styles.fabRow}>
          <CartFab
            onPress={openCart}
            visible={cart.hasItems}
            shown={cart.fab}
          />
        </View>
      </Animated.View>
    );
  },
);

CustomTabBar.displayName = 'CustomTabBar';

/**
 * iOS reads blurAmount as UIBlurEffect intensity, 0–100. Android IGNORES it —
 * its BlurViewManager.setBlurAmount and setBlurType are both empty method
 * bodies, so only blurRadius, overlayColor and downsampleFactor do anything
 * there. Passing the radius explicitly rather than letting the JS shim derive
 * it from blurAmount is what makes the two platforms agree.
 */
const BLUR_AMOUNT = 50;
/**
 * Android's own cap is 25; anything above it throws from the JS shim. The
 * glass is see-through, so it sits at the cap: the more diffuse the content
 * behind, the cleaner the labels read over it.
 */
const BLUR_RADIUS = 25;
/**
 * A no-op on both platforms in this library version (Android's setter is an
 * empty body; iOS has no such prop). Kept so the JS shim does not fall back
 * to deriving it from blurRadius.
 */
const BLUR_DOWNSAMPLE = 4;

/**
 * iOS: the thinnest system material, and the -Light variant so it ignores
 * the device's dark mode, as the rest of the palette does. The plain 'light'
 * style bakes in a heavy white wash of its own, which stacked on --glass and
 * kept the pill milky however low that token went.
 *
 * Android: 'light', whatever iOS uses. Its native blurType is a codegen enum
 * of dark | light | xlight, and an unknown value aborts the app while the
 * props are parsed. The value itself is ignored there (see BLUR_AMOUNT).
 */
const BLUR_TYPE = Platform.OS === 'ios' ? 'ultraThinMaterialLight' : 'light';

/**
 * Layout-only: the pill's placement depends on the runtime safe-area inset,
 * and its padding is off the spacing scale, so neither is a utility.
 */
const styles = StyleSheet.create({
  dock: {
    position: 'absolute',
    left: TAB_BAR_SIDE_INSET,
    right: TAB_BAR_SIDE_INSET,
    height: TAB_BAR_HEIGHT + CART_FAB_OVERHANG,
  },
  /** The glass pill, along the bottom of the dock. */
  pill: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: TAB_BAR_HEIGHT,
  },
  /** Centres the cart button over its slot, at the top of the dock. */
  fabRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  /** The cart's column in the tab row, under the floating button. */
  cartSlot: {
    width: CART_SLOT_WIDTH,
  },
  /**
   * The tab row, above the blur, tint and sheen inside the clipped pill.
   * Tabs stretch to its full height: 52 of the pill's 72, so every hit
   * target clears 48 in both directions.
   */
  row: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 6,
    paddingVertical: 10,
  },
  /** The box both icon forms are stacked in. */
  glyph: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
});
