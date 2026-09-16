import React, { memo, useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
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
import { Text, Tag, type TextTone } from '@/components/ui';

/**
 * Types for Profile Menu
 */
interface ProfileMenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  badge?: string;
  tone?: TextTone;
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
        icon: <ShoppingBag size={20} className="text-ember" />,
        badge: '5 Items',
      },
      {
        id: '2',
        title: 'Favorites',
        subtitle: 'Saved food items',
        icon: <Heart size={20} className="text-ember" />,
      },
      {
        id: '3',
        title: 'Notifications',
        subtitle: 'Alerts & updates',
        icon: <Bell size={20} className="text-ember" />,
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
        icon: <UserIcon size={20} className="text-ember" />,
      },
      {
        id: '5',
        title: 'Saved Addresses',
        subtitle: 'Home, Office & others',
        icon: <MapPin size={20} className="text-ember" />,
        badge: '3 Saved',
      },
      {
        id: '6',
        title: 'Payment Methods',
        subtitle: 'Cards & UPI',
        icon: <CreditCard size={20} className="text-ember" />,
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
        icon: <Settings size={20} className="text-ember" />,
      },
      {
        id: '8',
        title: 'Help & Support',
        subtitle: 'Get instant assistance',
        icon: <HelpCircle size={20} className="text-ember" />,
      },
      {
        id: '9',
        title: 'Logout',
        subtitle: 'End your session',
        icon: <LogOut size={20} className="text-chili" />,
        tone: 'chili',
      },
    ],
  },
];

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  tone?: TextTone;
  delay?: number;
  badge?: string;
}

const MenuItem = memo(
  ({
    icon,
    title,
    subtitle,
    onPress,
    tone = 'ink',
    delay = 0,
    badge,
  }: MenuItemProps) => (
    <Animated.View entering={FadeInDown.delay(delay).duration(500).springify()}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.6}
        accessibilityRole="button"
        className="flex-row items-center py-md px-xl"
      >
        <View className="w-11 h-11 rounded-lg items-center justify-center bg-ember-tint">
          {icon}
        </View>
        <View className="flex-1 ml-md">
          <Text variant="item" tone={tone}>
            {title}
          </Text>
          {subtitle ? (
            <Text variant="caption" tone="muted" className="mt-xs">
              {subtitle}
            </Text>
          ) : null}
        </View>
        {badge ? <Tag label={badge} /> : null}
        <ChevronRight size={16} className="text-muted ml-sm" strokeWidth={3} />
      </TouchableOpacity>
    </Animated.View>
  ),
);

MenuItem.displayName = 'MenuItem';

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
    return 'JJ';
  };

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={scrollContentStyle}
      >
        {/* Header */}
        <Animated.View
          entering={FadeInUp.duration(800).springify()}
          className="items-center px-lg mb-xl gap-lg"
        >
          <View className="w-24 h-24 rounded-pill bg-ember items-center justify-center shadow-ember-glow">
            <Text variant="h1" tone="on-ember">
              {getInitials()}
            </Text>
          </View>

          <View className="items-center gap-sm">
            <Text variant="h2">
              {user?.firstName
                ? `${user.firstName} ${user.lastName || ''}`
                : 'User Name'}
            </Text>
            <View className="bg-sunken px-md py-sm rounded-pill">
              <Text variant="caption" tone="muted">
                {user?.email || 'Email'}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Sectioned menu */}
        {MENU_SECTIONS.map((section, sIndex) => (
          <View key={section.title} className="mb-lg">
            <Animated.View
              entering={FadeInRight.delay(sIndex * 100).duration(500)}
            >
              <Text variant="caption" tone="muted" className="px-xl mb-sm">
                {section.title}
              </Text>
            </Animated.View>

            {section.items.map((item, iIndex) => (
              <MenuItem
                key={item.id}
                title={item.title}
                subtitle={item.subtitle}
                icon={item.icon}
                tone={item.tone}
                badge={item.badge}
                delay={(sIndex * 3 + iIndex) * 50}
                onPress={() => handleItemPress(item)}
              />
            ))}
          </View>
        ))}

        {/* Branding footer */}
        <View className="mt-xl items-center px-lg gap-lg">
          <View className="w-12 h-0.5 bg-hairline rounded-pill" />
          <Text variant="caption" tone="muted">
            JJ's Kitchen v1.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

/** Layout-only: clears the floating tab bar. */
const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 120,
  },
});
