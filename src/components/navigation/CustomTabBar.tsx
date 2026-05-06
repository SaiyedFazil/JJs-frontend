import React, { useMemo, memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, Bookmark, ShoppingBag, ClipboardList, User } from 'lucide-react-native';
import { useCartStore } from '@/store/cart.store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Tab Icon Component
 */
interface TabIconProps {
  name: string;
  isFocused: boolean;
  cartCount: number;
}

const TabIcon = memo(({ name, isFocused, cartCount }: TabIconProps) => {
  const color = isFocused ? '#FF6B35' : '#94A3B8';
  const size = 24;
  const strokeWidth = isFocused ? 2.5 : 2;

  switch (name) {
    case 'Home':
      return <Home size={size} color={color} strokeWidth={strokeWidth} />;
    case 'Saved':
      return <Bookmark size={size} color={color} strokeWidth={strokeWidth} />;
    case 'Cart':
      return (
        <View className="bg-primary dark:bg-primary-dark p-3 rounded-full -mt-10 shadow-lg shadow-primary/50">
          <ShoppingBag size={28} color="white" strokeWidth={2.5} />
          {cartCount > 0 && (
            <View style={styles.badge} className="absolute -top-1 -right-1 bg-white items-center justify-center border-2 border-primary">
              <Text className="text-primary text-[10px] font-black">{cartCount}</Text>
            </View>
          )}
        </View>
      );
    case 'Orders':
      return <ClipboardList size={size} color={color} strokeWidth={strokeWidth} />;
    case 'Profile':
      return <User size={size} color={color} strokeWidth={strokeWidth} />;
    default:
      return null;
  }
});

/**
 * Custom Tab Bar Component
 * Using memo and props-based insets to avoid hook violations and unnecessary re-renders.
 */
export const CustomTabBar = memo(({ state, navigation, insets }: BottomTabBarProps) => {
  const cartItemsCount = useCartStore((s) => s.totalItems());
  const hasItemsInCart = cartItemsCount > 0;

  // Use insets from props instead of useSafeAreaInsets hook to be safe
  const containerStyle = useMemo(() => [
    styles.tabContainer,
    { paddingBottom: insets.bottom + 10 }
  ], [insets.bottom]);

  return (
    <View 
      style={containerStyle} 
      className="bg-surface dark:bg-surface-dark border-t border-border/10 dark:border-border-dark/10"
    >
      <View className="flex-row items-center justify-around px-4">
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
              className="items-center py-2"
              style={styles.tabButton}
              activeOpacity={0.7}
            >
              <TabIcon 
                name={route.name} 
                isFocused={isFocused} 
                cartCount={cartItemsCount} 
              />
              {route.name !== 'Cart' && (
                <Text 
                  className={`text-[10px] mt-1 font-bold ${isFocused ? 'text-primary dark:text-primary-dark' : 'text-muted dark:text-muted-dark'}`}
                >
                  {route.name}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  tabContainer: {
    position: 'absolute',
    bottom: 0,
    width: SCREEN_WIDTH,
    paddingTop: 12,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 20,
  },
  tabButton: {
    flex: 1,
  },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
