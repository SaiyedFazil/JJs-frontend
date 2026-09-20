import React, { useMemo, memo, useCallback } from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, Bookmark, ClipboardList, User } from 'lucide-react-native';
import { BlurView } from '@react-native-community/blur';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Text, GlassSheen, LinearFill, useToken } from '@/components/ui';

/**
 * Tab Icon Component
 *
 * PDF section 04: rounded line icons at 1.9px stroke, with filled variants
 * reserved for the active tab and the rating star.
 */
interface TabIconProps {
  name: string;
  isFocused: boolean;
}

const TabIcon = memo(({ name, isFocused }: TabIconProps) => {
  // Active sits on the ember lozenge, so it flips to on-ember. Inactive uses
  // ink-strong rather than muted: over a live blurred backdrop the warm grey
  // loses too much contrast against whatever happens to scroll underneath.
  const className = isFocused ? 'text-on-ember' : 'text-ink-strong';
  const size = 22;
  const strokeWidth = isFocused ? 2.4 : 1.9;
  const fill = isFocused ? 'currentColor' : 'none';

  switch (name) {
    case 'Home':
      return (
        <Home
          size={size}
          className={className}
          strokeWidth={strokeWidth}
          fill={fill}
        />
      );
    case 'Saved':
      return (
        <Bookmark
          size={size}
          className={className}
          strokeWidth={strokeWidth}
          fill={fill}
        />
      );
    case 'Orders':
      return (
        <ClipboardList
          size={size}
          className={className}
          strokeWidth={strokeWidth}
          fill={fill}
        />
      );
    case 'Profile':
      return (
        <User
          size={size}
          className={className}
          strokeWidth={strokeWidth}
          fill={fill}
        />
      );
    default:
      return null;
  }
});

TabIcon.displayName = 'TabIcon';

/**
 * One tab.
 *
 * The active tab is an ember lozenge carrying icon + label side by side; the
 * inactive ones are icon over label. That asymmetry is the whole point of the
 * design — the selected tab grows sideways into a pill, so `flex` is animated
 * rather than fixed, and only the active tab pays for the gradient fill.
 */
interface TabButtonProps {
  name: string;
  isFocused: boolean;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Lozenge expansion — soft enough to read as glass settling, not a snap. */
const SPRING = { damping: 18, stiffness: 190, mass: 0.7 };
const PRESS_TIMING = { duration: 110 };
/** The lozenge's crossfade as focus moves between tabs. */
const LOZENGE_TIMING = { duration: 180 };

const TabButton = memo(({ name, isFocused, onPress }: TabButtonProps) => {
  const pressed = useSharedValue(0);

  // Only opacity and transform are animated here.
  //
  // This previously animated flexGrow, which caused the bug where the active
  // tab's lozenge spilled out past the pill's rounded edge with a square
  // corner and a clipped label. Two reasons it cannot work: Reanimated drives
  // styles on the UI thread but Yoga layout runs on the shadow thread, so the
  // ember background painted at one width while layout settled at another;
  // and flexShrink: 0 on a tab asking for 1.75x let the four tabs' total
  // exceed the row, pushing the active one outside its parent's clip.
  //
  // Every tab now holds an equal, static share of the row. The lozenge is an
  // absolutely-positioned child INSIDE that share, so it is bounded by its
  // own tab and can never overflow the pill however it animates.
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withTiming(pressed.value ? 0.94 : 1, PRESS_TIMING) }],
  }));

  // The lozenge fades and scales in behind the content rather than resizing
  // the tab, which keeps the whole effect off the layout pass.
  const lozengeStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isFocused ? 1 : 0, LOZENGE_TIMING),
    transform: [{ scale: withSpring(isFocused ? 1 : 0.82, SPRING) }],
  }));

  const onPressIn = useCallback(() => {
    pressed.value = 1;
  }, [pressed]);
  const onPressOut = useCallback(() => {
    pressed.value = 0;
  }, [pressed]);

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={name}
      style={[styles.tabButton, pressStyle]}
      className="items-center justify-center gap-xs"
    >
      {/* The lozenge, inset inside the tab's own share of the row. Its
          overflow-hidden clips the gradient to the rounded ends, and because
          it is absolutely positioned within this tab it cannot reach the
          pill's edge — which is exactly what the old animated-flex version
          did wrong. */}
      <Animated.View
        pointerEvents="none"
        className="rounded-pill overflow-hidden"
        style={[styles.lozenge, lozengeStyle]}
      >
        <LinearFill from="ember" to="ember-deep" diagonal />
      </Animated.View>
      <TabIcon name={name} isFocused={isFocused} />
      <Text
        variant="fine"
        tone={isFocused ? 'on-ember' : 'ink'}
        weight={isFocused ? '700' : '600'}
        numberOfLines={1}
      >
        {name}
      </Text>
    </AnimatedPressable>
  );
});

TabButton.displayName = 'TabButton';

/**
 * Custom Tab Bar Component
 *
 * A floating frosted pill inset from all four edges, rather than a bar welded
 * to the screen's bottom edge. There is no blur library in this project, so
 * the frost is built from tokens instead: a two-stop glass gradient for the
 * bevel, a lit inner rim, and a warm outer hairline. That reads as glass on
 * the cream canvas and survives content scrolling beneath it.
 */
export const CustomTabBar = memo(
  ({ state, navigation, insets }: BottomTabBarProps) => {
    // Insets come from props rather than useSafeAreaInsets to keep this a
    // pure memoized component with no hook-order risk under the navigator.
    const containerStyle = useMemo(
      () => [styles.dock, { paddingBottom: insets.bottom + DOCK_GAP }],
      [insets.bottom],
    );

    // BlurView takes color STRINGS, not class names, so these resolve the
    // tokens at runtime the same way Gradient.tsx does — still no literal.
    //
    // overlayColor matters on Android specifically: the library's own default
    // is a dark charcoal wash that would sink the pill on our cream canvas.
    // On iOS the prop is ignored, so passing it is harmless.
    const overlayColor = useToken('--color-glass');
    // Shown instead of the blur when the OS "Reduce Transparency" setting is
    // on. It must be opaque, or the pill becomes an unreadable ghost for the
    // users who enabled that setting precisely to avoid one.
    const fallbackColor = useToken('--color-surface');

    return (
      <View style={containerStyle} pointerEvents="box-none">
        {/* Shadow and clip are deliberately on two different views. The pill
            needs overflow-hidden to clip the blur to its radius, but on
            Android that same property clips the elevation shadow away. So the
            outer view casts, the inner view clips. */}
        <View className="rounded-pill shadow-glass" style={styles.pillShadow}>
          {/* BlurView is a native ViewGroup: it honours neither flex layout
              nor a className borderRadius. Making it the row container
              collapsed every tab into a stack and squared off the pill. So it
              stays an absolutely-positioned backdrop, and this clipping View
              — a plain RN view, which does respect both — owns the radius and
              the row. overflow-hidden here is what rounds the blur's corners.

              No bg-glass layer either: overlayColor already paints that same
              token over the blur on Android, and stacking both applied the
              wash twice, which is what turned the pill opaque white. */}
          <View
            className="rounded-pill border border-glass-hairline overflow-hidden"
            style={styles.pill}
          >
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="xlight"
              blurAmount={BLUR_AMOUNT}
              blurRadius={BLUR_RADIUS}
              downsampleFactor={BLUR_DOWNSAMPLE}
              reducedTransparencyFallbackColor={fallbackColor}
              overlayColor={overlayColor}
              pointerEvents="none"
            />
            <GlassSheen />
            <View
              pointerEvents="none"
              className="bg-glass-highlight"
              style={styles.rim}
            />
            <View className="flex-row items-center" style={styles.row}>
              {state.routes.map((route, index) => {
                const isFocused = state.index === index;

                const onPress = () => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });

                  if (!isFocused && !event.defaultPrevented) {
                    navigation.navigate(route.name);
                  }
                };

                return (
                  <TabButton
                    key={route.key}
                    name={route.name}
                    isFocused={isFocused}
                    onPress={onPress}
                  />
                );
              })}
            </View>
          </View>
        </View>
      </View>
    );
  },
);

CustomTabBar.displayName = 'CustomTabBar';

/** Clearance between the floating pill and the bottom safe-area edge. */
const DOCK_GAP = 12;

/**
 * iOS reads blurAmount as UIBlurEffect intensity. Android IGNORES it — its
 * BlurViewManager.setBlurAmount and setBlurType are both empty method bodies,
 * so only blurRadius, overlayColor and downsampleFactor do anything there.
 * Passing the radius explicitly rather than letting the JS shim derive it
 * from blurAmount is what makes the two platforms agree.
 */
const BLUR_AMOUNT = 18;
/** Android's own cap is 25; anything above it throws from the JS shim. */
const BLUR_RADIUS = 20;
/** Lower = sharper and more expensive. 4 keeps the glass readable. */
const BLUR_DOWNSAMPLE = 4;

/**
 * The pill's own height: icon 22 + gap 4 + fine line-height 18 = 44 of
 * content, in a 72 shell. The 28 of slack is the point — the reference's
 * glass reads as a thick, airy slab, and tightening this to hug the content
 * is what made the first pass look like a toolbar instead.
 */
const PILL_HEIGHT = 72;

/**
 * The bar's full on-screen footprint, excluding the safe-area inset the dock
 * adds on top via `paddingBottom: insets.bottom + DOCK_GAP`:
 *
 *   dock paddingTop (styles.dock)            10
 *   pill height (PILL_HEIGHT)                72
 *   DOCK_GAP below the pill                  12
 *                                            ---
 *                                            94
 *
 * HomeScreen adds insets.bottom to this to clear the pill entirely. Check
 * this arithmetic against the JSX above before changing either number.
 */
export const TAB_BAR_HEIGHT = 94;

/**
 * Layout-only: the dock is pinned across the screen's bottom and the pill
 * floats inside it, inset horizontally. Neither is expressible as a Tailwind
 * utility because both depend on the runtime safe-area inset.
 */
const styles = StyleSheet.create({
  dock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 10,
    paddingHorizontal: 16,
  },
  /**
   * Android draws shadows only from `elevation`, which no Tailwind class
   * emits, so shadow-glass alone leaves the pill flat there. This is the
   * layout-only exception the styling rule allows.
   */
  pillShadow: {
    ...Platform.select({ android: { elevation: 12 }, default: {} }),
  },
  pill: {
    height: PILL_HEIGHT,
  },
  /** The tab row, above the blur and sheen layers inside the clipped pill. */
  row: {
    flex: 1,
    paddingHorizontal: 8,
    gap: 4,
  },
  /**
   * The specular highlight along the pill's top edge, inside its clip.
   * Inset from both ends and rounded: on a curved face the light catches the
   * middle of the edge and dies at the corners, so a rim running the full
   * width would read as a drawn line instead of a reflection.
   */
  rim: {
    position: 'absolute',
    top: 0,
    left: '9%',
    right: '9%',
    height: 1,
    borderRadius: 1,
  },
  /**
   * An equal, STATIC share of the row. Nothing here animates: the four tabs
   * always sum to exactly the row's width, so no tab can push a sibling out
   * past the pill's clip.
   */
  tabButton: {
    flex: 1,
    flexBasis: 0,
    minWidth: 0,
    height: 56,
  },
  /**
   * The active tab's ember background, inset inside that tab's own share.
   * The 4px inset is what leaves a sliver of glass between the lozenge and
   * the pill's rounded edge, so the two radii read as concentric.
   */
  lozenge: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    left: 4,
    right: 4,
  },
});
