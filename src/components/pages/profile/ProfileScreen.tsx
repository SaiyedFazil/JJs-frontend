import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Bell,
  ClipboardList,
  CreditCard,
  Heart,
  HelpCircle,
  LogOut,
  MapPin,
  Settings,
  User as UserIcon,
  type LucideIcon,
} from 'lucide-react-native';
import { Icon, Text, Toast } from '@/components/ui';
import { TAB_BAR_HEIGHT } from '@/constants/layout';
import { useAuthStore } from '@/store/auth.store';
import { useProfileStore } from '@/store/profile.store';
import type { ProfileStackParamList } from '@/types/navigation.types';
import { useProfileCounts } from './hooks/use-profile-counts';
import { ProfileHeader } from './components/ProfileHeader';
import { StatsCard } from './components/StatsCard';
import { SectionCard } from './components/SectionCard';
import { ProfileRow } from './components/ProfileRow';
import { AvatarSheet } from './components/AvatarSheet';
import { LogoutDialog } from './components/LogoutDialog';

const TOAST_MS = 1900;
/** Room for the toast itself, above the tab bar's footprint. */
const TOAST_ALLOWANCE = 12;

/**
 * A row's icon. `Icon` rather than a bare lucide glyph, because a className
 * never reaches one of those — see src/components/ui/Icon.tsx. The design's
 * geometry (19px at a 1.9 stroke) is that component's default.
 *
 * Each class is spelled out at the call site below rather than built here:
 * Tailwind emits only the classes it finds in the source text.
 */
const tileIcon = (glyph: LucideIcon, className: string) => (
  <Icon icon={glyph} className={className} />
);

export const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const route = useRoute<RouteProp<ProfileStackParamList, 'ProfileMain'>>();

  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const avatarId = useProfileStore(state => state.avatarId);
  const setAvatar = useProfileStore(state => state.setAvatar);

  const counts = useProfileCounts();

  const [isSheetOpen, setSheetOpen] = useState(false);
  const [isLogoutOpen, setLogoutOpen] = useState(false);
  const [isLoggingOut, setLoggingOut] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Same arithmetic as HomeScreen: CustomTabBar pins itself to the screen
  // bottom with its own `insets.bottom` padding on top of TAB_BAR_HEIGHT, so
  // its true footprint is the sum — and both the scroll content and the
  // floating toast have to clear all of it.
  const tabBarFootprint = TAB_BAR_HEIGHT + insets.bottom;
  const contentContainerStyle = useMemo(
    () => ({ paddingBottom: tabBarFootprint + TOAST_ALLOWANCE }),
    [tabBarFootprint],
  );

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  // Edit Profile navigates back with a message rather than showing it on the
  // screen it is leaving. Clearing the param immediately is what stops the
  // same toast firing again when this screen is next focused.
  const pendingToast = route.params?.toast;
  useEffect(() => {
    if (!pendingToast) return;
    showToast(pendingToast);
    navigation.setParams({ toast: undefined });
  }, [navigation, pendingToast, showToast]);

  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
    'Your profile';
  const phone = user
    ? `${user.countryCode} ${user.phoneNumber}`
    : 'Not signed in';

  /**
   * The tabs are siblings of this stack, not children of it, so switching to
   * one goes through the parent navigator.
   */
  const goToTab = useCallback(
    (tab: string) => navigation.getParent()?.navigate(tab),
    [navigation],
  );

  const handleSaveAvatar = useCallback(
    (id: number) => {
      setAvatar(id);
      setSheetOpen(false);
      showToast('Avatar updated');
    },
    [setAvatar, showToast],
  );

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      // logout() is best-effort on the server and always clears locally, so
      // there is no failure branch to handle — RootNavigator swaps to the
      // auth flow the moment isAuthenticated flips.
      await logout();
    } finally {
      setLoggingOut(false);
      setLogoutOpen(false);
    }
  }, [logout]);

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={contentContainerStyle}
      >
        <ProfileHeader
          name={name}
          phone={phone}
          email={user?.email ?? null}
          avatarId={avatarId}
          isEmailVerified={Boolean(user?.email)}
          onEditAvatar={() => setSheetOpen(true)}
          onEditProfile={() => navigation.navigate('EditProfile')}
        />

        <StatsCard counts={counts} />

        <View className="px-md pt-lg">
          <SectionCard label="Activity">
            <ProfileRow
              icon={tileIcon(ClipboardList, 'text-ember')}
              tile="bg-ember-tint"
              title="My Orders"
              subtitle="View history & reorder"
              onPress={() => goToTab('Orders')}
            />
            <ProfileRow
              icon={tileIcon(Heart, 'text-ember')}
              tile="bg-ember-tint"
              title="Favourites"
              subtitle="Your go-to dishes"
              onPress={() => goToTab('Saved')}
            />
            <ProfileRow
              icon={tileIcon(Bell, 'text-ember')}
              tile="bg-ember-tint"
              title="Notifications"
              subtitle="Order updates & offers"
              // The one badge left on this screen. A row badge now means
              // "there is something new in here", not "here is a count" —
              // the counts live in the stats strip above, and repeating them
              // per row said the same thing twice.
              badge={
                counts.unreadNotifications > 0
                  ? `${counts.unreadNotifications} new`
                  : undefined
              }
              isLast
              onPress={() => showToast('Notifications are coming soon')}
            />
          </SectionCard>

          <SectionCard label="Account Settings" delay={60}>
            <ProfileRow
              icon={tileIcon(UserIcon, 'text-tile-gold')}
              tile="bg-tile-sand"
              title="Personal Info"
              subtitle="Name, phone & email"
              onPress={() => navigation.navigate('EditProfile')}
            />
            <ProfileRow
              icon={tileIcon(MapPin, 'text-tile-gold')}
              tile="bg-tile-sand"
              title="Saved Addresses"
              subtitle="Home, Office & more"
              onPress={() => showToast('Saved addresses are coming soon')}
            />
            <ProfileRow
              icon={tileIcon(CreditCard, 'text-tile-gold')}
              tile="bg-tile-sand"
              title="Payment Methods"
              subtitle="Cards & UPI"
              isLast
              onPress={() => showToast('Payment methods are coming soon')}
            />
          </SectionCard>

          <SectionCard label="Preferences" delay={120}>
            <ProfileRow
              icon={tileIcon(Settings, 'text-tile-gold')}
              tile="bg-tile-sand"
              title="Settings"
              subtitle="Notifications, language"
              onPress={() => showToast('Settings are coming soon')}
            />
            <ProfileRow
              icon={tileIcon(HelpCircle, 'text-tile-gold')}
              tile="bg-tile-sand"
              title="Help & Support"
              subtitle="FAQs, chat with us"
              onPress={() => showToast('Help & support is coming soon')}
            />
            <ProfileRow
              icon={tileIcon(LogOut, 'text-chili')}
              tile="bg-tile-chili"
              title="Logout"
              subtitle="Sign out of this device"
              tone="chili"
              isLast
              onPress={() => setLogoutOpen(true)}
            />
          </SectionCard>

          <View className="items-center pt-xs pb-md">
            <Text variant="fine" weight="600" tone="label">
              JJ's Kitchen v1.0
            </Text>
            <Text variant="micro" weight="500" tone="footnote" className="mt-1">
              Made with 🔥 in Ahmedabad
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating clear of the tab bar's full footprint, as on Home. */}
      <View
        style={{ bottom: tabBarFootprint }}
        className="absolute left-md right-md"
        pointerEvents="box-none"
      >
        {toast ? <Toast message={toast} accent="ember" /> : null}
      </View>

      {isSheetOpen ? (
        <AvatarSheet
          currentId={avatarId}
          onClose={() => setSheetOpen(false)}
          onSave={handleSaveAvatar}
        />
      ) : null}

      {isLogoutOpen ? (
        <LogoutDialog
          isBusy={isLoggingOut}
          onCancel={() => setLogoutOpen(false)}
          onConfirm={handleLogout}
        />
      ) : null}
    </View>
  );
};
