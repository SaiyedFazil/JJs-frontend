import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_BAR_HEIGHT, tabBarBottomOffset } from '@/constants/layout';

/**
 * The floating tab bar's full on-screen footprint: the pill plus the gap
 * beneath it, safe-area inset included. Everything at or below this line
 * from the screen bottom is covered by the bar.
 *
 * A screen inside the tabs pads its scroll content by this (plus its own
 * breathing room) so the last item can scroll clear of the pill, and floats
 * anything bottom-anchored above it.
 */
export const useTabBarHeight = (): number => {
  const { bottom } = useSafeAreaInsets();
  return TAB_BAR_HEIGHT + tabBarBottomOffset(bottom);
};
