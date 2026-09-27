/**
 * The custom tab bar's full on-screen footprint, excluding the safe-area
 * inset the dock adds on top via `paddingBottom: insets.bottom + DOCK_GAP`:
 *
 *   dock paddingTop (styles.dock)            10
 *   pill height (PILL_HEIGHT)                72
 *   DOCK_GAP below the pill                  12
 *                                            ---
 *                                            94
 *
 * Screens add insets.bottom to this to clear the pill entirely. The three
 * terms are private to src/components/layout/CustomTabBar.tsx — check this
 * arithmetic against that file before changing either side.
 */
export const TAB_BAR_HEIGHT = 94;
