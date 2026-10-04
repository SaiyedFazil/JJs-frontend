/**
 * The floating tab bar's geometry. src/components/layout/CustomTabBar.tsx
 * positions itself from these, and src/hooks/use-tab-bar-height.ts sums them
 * into the bar's on-screen footprint — so screens never redo the arithmetic.
 */

/** Height of the pill itself. */
export const TAB_BAR_HEIGHT = 72;

/** The pill's inset from the screen's left and right edges. */
export const TAB_BAR_SIDE_INSET = 16;

/**
 * Distance from the screen's bottom edge to the pill's bottom edge.
 *
 * Above a home indicator or gesture bar the inset already gives clearance,
 * so 8 more is enough. A device with no inset gets a flat 16, or the pill
 * would sit visibly closer to the bottom edge than to the sides.
 */
export const tabBarBottomOffset = (safeAreaBottom: number): number =>
  safeAreaBottom > 0 ? safeAreaBottom + 8 : 16;
