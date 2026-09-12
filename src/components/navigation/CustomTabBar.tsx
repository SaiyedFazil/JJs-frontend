import React, { useMemo, memo } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import {
  Home,
  Bookmark,
  ShoppingBag,
  ClipboardList,
  User,
} from 'lucide-react-native';
import { useCartStore } from '@/store/cart.store';
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
  cartCount: number;
}

const TabIcon = memo(({ name, isFocused, cartCount }: TabIconProps) => {
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
    case 'Cart':
      return (
        <View className="bg-ember p-md rounded-pill -mt-10 shadow-ember-glow">
          <ShoppingBag size={28} className="text-on-ember" strokeWidth={2.5} />
          {cartCount > 0 ? (
            <View className="absolute -top-1 -right-1 w-5 h-5 rounded-pill bg-surface items-center justify-center border-2 border-ember">
              <Text variant="caption" tone="ember">
                {cartCount}
              </Text>
            </View>
          ) : null}
        </View>
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
    const cartItemsCount = useCartStore(s => s.totalItems());
    const hasItemsInCart = cartItemsCount > 0;

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

            if (route.name === 'Cart' && !hasItemsInCart) return null;

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
                <TabIcon
                  name={route.name}
                  isFocused={isFocused}
                  cartCount={cartItemsCount}
                />
                {route.name !== 'Cart' ? (
                  <Text
                    variant="caption"
                    tone={isFocused ? 'ember' : 'muted'}
                    className="mt-xs"
                  >
                    {route.name}
                  </Text>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  },
);

CustomTabBar.displayName = 'CustomTabBar';

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
