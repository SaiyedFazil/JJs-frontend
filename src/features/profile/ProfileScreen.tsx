import React, { memo, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  useColorScheme,
} from 'react-native';
import {
  User as UserIcon,
  ChevronRight,
  ShoppingBag,
  MapPin,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
  Bell,
  Heart,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeInUp,
} from 'react-native-reanimated';
import { useAuthStore } from '@/store/auth.store';

// ── Design-system color tokens (mirrors global.css :root values) ─────────────
const COLORS = {
  primary: '#170C79', // --primary
  primaryDark: '#8E05C2', // --primary-dark
  muted: '#6B7280', // --muted
  mutedDark: '#9CA3AF', // --muted-dark
} as const;

/**
 * Types for Profile Menu
 */
interface ProfileMenuItem {
  id: string;
  title: string;
  subtitle: string;
  /** Render function receives the resolved theme color so icons stay outside the component */
  icon: (color: string) => React.ReactNode;
  badge?: string;
  /** Optional text color override (e.g. red for Logout) */
  color?: string;
}

interface ProfileSection {
  title: string;
  items: ProfileMenuItem[];
}

/**
 * Static Menu Sections Configuration
 * Moved outside component to prevent Hook violation during re-renders
 */
const MENU_SECTIONS: ProfileSection[] = [
  {
    title: 'Activity',
    items: [
      {
        id: '1',
        title: 'My Orders',
        subtitle: 'View history & reorder',
        icon: (color: string) => <ShoppingBag size={20} color={color} />,
        badge: '5 Items',
      },
      {
        id: '2',
        title: 'Favorites',
        subtitle: 'Saved food items',
        icon: (color: string) => <Heart size={20} color={color} />,
      },
      {
        id: '3',
        title: 'Notifications',
        subtitle: 'Alerts & updates',
        icon: (color: string) => <Bell size={20} color={color} />,
        badge: 'New',
      },
    ],
  },
  {
    title: 'Account Settings',
    items: [
      {
        id: '4',
        title: 'Personal Info',
        subtitle: 'Manage profile data',
        icon: (color: string) => <UserIcon size={20} color={color} />,
      },
      {
        id: '5',
        title: 'Saved Addresses',
        subtitle: 'Home, Office & others',
        icon: (color: string) => <MapPin size={20} color={color} />,
        badge: '3 Saved',
      },
      {
        id: '6',
        title: 'Payment Methods',
        subtitle: 'Cards & UPI',
        icon: (color: string) => <CreditCard size={20} color={color} />,
      },
    ],
  },
  {
    title: 'Preferences',
    items: [
      {
        id: '7',
        title: 'Settings',
        subtitle: 'App preferences',
        icon: (color: string) => <Settings size={20} color={color} />,
      },
      {
        id: '8',
        title: 'Help & Support',
        subtitle: 'Get instant assistance',
        icon: (color: string) => <HelpCircle size={20} color={color} />,
      },
      {
        id: '9',
        title: 'Logout',
        subtitle: 'End your session',
        // Logout always uses destructive red — not part of primary theme
        icon: (_color: string) => <LogOut size={20} color="#EF4444" />,
        color: 'text-red-500',
      },
    ],
  },
];

/**
 * Premium Menu Item Component
 */
interface MenuItemProps {
  /** Render function receives the resolved theme color */
  icon: (color: string) => React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  color?: string;
  delay?: number;
  badge?: string;
}

const MenuItem = memo(
  ({
    icon,
    title,
    subtitle,
    onPress,
    color,
    delay = 0,
    badge,
  }: MenuItemProps) => {
    // Resolve theme-aware colors from global.css tokens
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const iconColor = isDark ? COLORS.primaryDark : COLORS.primary;
    const chevronColor = isDark
      ? 'rgba(156, 163, 175, 0.3)' // --muted-dark / 30%
      : 'rgba(107, 114, 128, 0.35)'; // --muted / 35%

    return (
      <Animated.View
        entering={FadeInDown.delay(delay).duration(500).springify()}
      >
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.6}
          className="flex-row items-center py-5 px-8"
        >
          <View className="w-11 h-11 rounded-2xl items-center justify-center bg-primary/5 dark:bg-primary-dark/10 border border-primary/5 dark:border-primary-dark/5">
            {icon(iconColor)}
          </View>
          <View className="flex-1 ml-4">
            <Text
              className={`text-[16px] font-black tracking-tight ${color || 'text-foreground dark:text-foreground-dark'}`}
            >
              {title}
            </Text>
            {subtitle && (
              <Text className="text-muted dark:text-muted-dark text-[11px] font-bold uppercase tracking-wider mt-0.5">
                {subtitle}
              </Text>
            )}
          </View>
          {badge && (
            <View className="bg-primary/10 dark:bg-primary-dark/20 px-2 py-1 rounded-lg mr-2">
              <Text className="text-primary dark:text-primary-dark text-[10px] font-black uppercase">
                {badge}
              </Text>
            </View>
          )}
          <ChevronRight size={14} color={chevronColor} strokeWidth={4} />
        </TouchableOpacity>
      </Animated.View>
    );
  },
);

export const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => logout(),
        },
      ],
      { cancelable: true },
    );
  };

  const handleItemPress = (item: ProfileMenuItem) => {
    if (item.title === 'Logout') {
      handleLogout();
    } else {
      console.log('Pressed:', item.title);
    }
  };

  // Memoize scroll content style to avoid inline style warnings
  const scrollContentStyle = useMemo(
    () => [styles.scrollContent, { paddingTop: insets.top + 40 }],
    [insets.top],
  );

  // Helper to get initials
  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.firstName) return user.firstName.substring(0, 2).toUpperCase();
    return 'SW';
  };

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={scrollContentStyle}
      >
        {/* Modern Header Section */}
        <Animated.View
          entering={FadeInUp.duration(800).springify()}
          className="items-center px-6 mb-12"
        >
          {/* Branded Avatar with Double Ring */}
          <View className="w-24 h-24 rounded-full border-2 border-primary/10 dark:border-primary-dark/10 p-1.5 mb-6">
            <View className="flex-1 rounded-full bg-primary dark:bg-primary-dark items-center justify-center shadow-2xl shadow-primary/40">
              <Text className="text-primary-foreground text-3xl font-black tracking-tighter">
                {getInitials()}
              </Text>
            </View>
          </View>

          <View className="items-center">
            <Text className="text-3xl font-black text-foreground dark:text-foreground-dark tracking-tight leading-tight mb-1">
              {user?.firstName
                ? `${user.firstName} ${user.lastName || ''}`
                : 'User Name'}
            </Text>
            <View className="bg-primary/5 dark:bg-primary-dark/10 px-4 py-1.5 rounded-full border border-primary/5">
              <Text className="text-primary dark:text-primary-dark font-black text-[12px] uppercase tracking-[2px]">
                <Text>+91 </Text>
                {user?.phoneNumber || 'Mobile'}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Sectioned Menu - Direct on Screen */}
        {MENU_SECTIONS.map((section, sIndex) => (
          <View key={section.title} className="mb-6">
            <Animated.View
              entering={FadeInRight.delay(sIndex * 100).duration(500)}
            >
              <Text className="px-8 text-muted dark:text-muted-dark text-[11px] font-black uppercase tracking-[3px] mb-2 opacity-50">
                {section.title}
              </Text>
            </Animated.View>

            {section.items.map((item, iIndex) => (
              <MenuItem
                key={item.id}
                title={item.title}
                subtitle={item.subtitle}
                icon={item.icon}
                color={item.color}
                badge={item.badge}
                delay={(sIndex * 3 + iIndex) * 50}
                onPress={() => handleItemPress(item)}
              />
            ))}
          </View>
        ))}

        {/* Branding Footer */}
        <View className="mt-10 items-center px-6">
          <View className="w-12 h-0.5 bg-primary/10 dark:bg-primary-dark/10 rounded-full mb-6" />
          <Text className="text-muted/30 dark:text-muted-dark/20 text-[9px] font-black uppercase tracking-[6px]">
            JJ's Kitchen v1.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 120,
  },
});
