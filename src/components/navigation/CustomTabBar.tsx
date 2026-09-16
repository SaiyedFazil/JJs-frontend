import React, { useMemo, memo } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, Bookmark, ClipboardList, User } from 'lucide-react-native';
import { Text } from '@/components/ui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  const className = isFocused ? 'text-ember' : 'text-muted';
  const size = 24;
  const strokeWidth = isFocused ? 2.5 : 1.9;
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
 * Custom Tab Bar Component
 * Using memo and props-based insets to avoid hook violations and unnecessary re-renders.
 */
export const CustomTabBar = memo(
  ({ state, navigation, insets }: BottomTabBarProps) => {
    // Use insets from props instead of useSafeAreaInsets hook to be safe
    const containerStyle = useMemo(
      () => [styles.tabContainer, { paddingBottom: insets.bottom + 10 }],
      [insets.bottom],
    );

    return (
      <View
        style={containerStyle}
        className="bg-surface border-t border-hairline rounded-t-sheet shadow-e3"
      >
        <View className="flex-row items-center justify-around px-md">
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
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                className="items-center py-sm"
                style={styles.tabButton}
                activeOpacity={0.7}
              >
                <TabIcon name={route.name} isFocused={isFocused} />
                <Text
                  variant="caption"
                  tone={isFocused ? 'ember' : 'muted'}
                  className="mt-xs"
                >
                  {route.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  },
);

CustomTabBar.displayName = 'CustomTabBar';

/**
 * The bar's own height, excluding the safe-area inset the navigator adds
 * on top via `paddingBottom: insets.bottom + 10` below. Composed of:
 *
 *   border-t (border-hairline)               1
 *   paddingTop (styles.tabContainer)        12
 *   py-sm on the tab button (8 + 8)         16
 *   icon (TabIcon size)                     24
 *   mt-xs before the caption                 4
 *   caption line-height                     16
 *   paddingBottom (the "+ 10" in containerStyle,
 *     insets.bottom is the other half)      10
 *                                           ---
 *                                            83
 *
 * Check this arithmetic against the JSX above before changing either the
 * constant or the bar's layout.
 */
export const TAB_BAR_HEIGHT = 83;

/** Layout-only: the bar floats above content at the screen's full width. */
const styles = StyleSheet.create({
  tabContainer: {
    position: 'absolute',
    bottom: 0,
    width: SCREEN_WIDTH,
    paddingTop: 12,
  },
  tabButton: {
    flex: 1,
  },
});
