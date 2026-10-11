import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ScrollView, StatusBar, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Trash2 } from 'lucide-react-native';
import { Icon, Toast } from '@/components/ui';
import { useNotificationSettingsStore } from '@/store/notification-settings.store';
import type { NotificationPreferences } from '@/types/notification.types';
import type { MainStackParamList } from '@/types/navigation.types';
import { ScreenTopBar } from '../components/ScreenTopBar';
import { SectionCard } from '../components/SectionCard';
import { ProfileRow } from '../components/ProfileRow';
import { ConfirmDialog } from '../components/ConfirmDialog';

type Navigation = NativeStackNavigationProp<MainStackParamList, 'Settings'>;

const TOAST_MS = 1900;
/** Clearance between the floating toast and the screen's bottom edge. */
const TOAST_GAP = 16;
/** Room below the last card so it clears the floating toast. */
const LIST_ALLOWANCE = 72;

/**
 * "All notifications on" or "3 of 5 on" — what the Notifications row says.
 * Never "0 of 5": order updates are locked on.
 */
const summarise = (prefs: NotificationPreferences): string => {
  const values = Object.values(prefs);
  const on = values.filter(Boolean).length;
  if (on === values.length) return 'All notifications on';
  return `${on} of ${values.length} on`;
};

/**
 * Settings, opened from the Profile tab's Settings row: notification
 * preferences, and account deletion.
 *
 * Deletion asks for confirmation and then only says it is coming soon —
 * there is no endpoint for it yet. That is the seam: the dialog's onConfirm.
 */
export const SettingsScreen = () => {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();

  const prefs = useNotificationSettingsStore(s => s.prefs);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // The top bar is white, so its status-bar glyphs stay dark — set on focus,
  // since the Profile header beneath leaves them light.
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('dark-content');
    }, []),
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

  const handleConfirmDelete = useCallback(() => {
    setDeleteOpen(false);
    showToast('Account deletion is coming soon');
  }, [showToast]);

  const contentContainerStyle = useMemo(
    () => ({ paddingBottom: insets.bottom + LIST_ALLOWANCE }),
    [insets.bottom],
  );

  return (
    <View className="flex-1 bg-canvas">
      <ScreenTopBar title="Settings" onBack={navigation.goBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={contentContainerStyle}
        contentContainerClassName="px-md pt-lg"
      >
        <SectionCard label="Notifications">
          <ProfileRow
            icon={<Icon icon={Bell} className="text-ember" />}
            tile="bg-ember-tint"
            title="Notification preferences"
            subtitle={summarise(prefs)}
            isLast
            onPress={() => navigation.navigate('NotificationSettings')}
          />
        </SectionCard>

        <SectionCard label="Account" delay={60}>
          <ProfileRow
            icon={<Icon icon={Trash2} className="text-chili" />}
            tile="bg-tile-chili"
            title="Delete account"
            subtitle="Permanently remove your account & data"
            tone="chili"
            isLast
            onPress={() => setDeleteOpen(true)}
          />
        </SectionCard>
      </ScrollView>

      {toast ? (
        <View
          pointerEvents="none"
          style={{ bottom: insets.bottom + TOAST_GAP }}
          className="absolute left-md right-md"
        >
          <Toast message={toast} accent="ember" />
        </View>
      ) : null}

      {isDeleteOpen ? (
        <ConfirmDialog
          icon={Trash2}
          title="Delete your account?"
          message="This permanently removes your profile, order history and saved addresses. It can't be undone."
          cancelLabel="Keep account"
          confirmLabel="Delete"
          onCancel={() => setDeleteOpen(false)}
          onConfirm={handleConfirmDelete}
        />
      ) : null}
    </View>
  );
};
