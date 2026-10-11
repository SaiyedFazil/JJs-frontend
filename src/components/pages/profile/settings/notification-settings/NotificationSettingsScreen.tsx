import React, { useCallback, useMemo } from 'react';
import { ScrollView, StatusBar, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, useClassColor } from '@/components/ui';
import type { MainStackParamList } from '@/types/navigation.types';
import { ScreenTopBar } from '../../components/ScreenTopBar';
import { SectionCard } from '../../components/SectionCard';
import {
  NotificationToggleRow,
  type TrackColors,
} from './components/NotificationToggleRow';
import { useNotificationSections } from './hooks/use-notification-sections';

type Navigation = NativeStackNavigationProp<
  MainStackParamList,
  'NotificationSettings'
>;

/** Breathing room below the footnote. */
const LIST_ALLOWANCE = 32;

/**
 * Which notifications the customer wants, one switch per topic. Each change
 * is saved the moment it is made — there is no Save button to forget.
 *
 * Device-local until the backend has a preferences endpoint; that is the
 * seam, in notification-settings.store.
 */
export const NotificationSettingsScreen = () => {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const { sections, setTopic } = useNotificationSections();

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('dark-content');
    }, []),
  );

  // The switch animates its track between two colour STRINGS, so these
  // resolve literal utilities. HeroUI's own off track is the pale `default`
  // sand, which all but vanishes on a white card; the Pure Veg switch's off
  // track is the app's established one. If either fails to resolve, the
  // switch keeps HeroUI's themed defaults rather than animating to nothing.
  const trackOff = useClassColor('text-switch-track-off');
  const trackOn = useClassColor('text-ember');
  const trackColors = useMemo<TrackColors>(
    () => (trackOff && trackOn ? [trackOff, trackOn] : undefined),
    [trackOff, trackOn],
  );

  const contentContainerStyle = useMemo(
    () => ({ paddingBottom: insets.bottom + LIST_ALLOWANCE }),
    [insets.bottom],
  );

  return (
    <View className="flex-1 bg-canvas">
      <ScreenTopBar title="Notifications" onBack={navigation.goBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={contentContainerStyle}
        contentContainerClassName="px-md pt-lg"
      >
        <Text variant="body" tone="ink-soft" className="mb-lg ml-1">
          Choose what we let you know about. Changes are saved as you make them.
        </Text>

        {sections.map((section, i) => (
          <SectionCard key={section.label} label={section.label} delay={i * 60}>
            {section.rows.map((row, j) => (
              <NotificationToggleRow
                key={row.topic}
                row={row}
                trackColors={trackColors}
                isLast={j === section.rows.length - 1}
                onChange={setTopic}
              />
            ))}
          </SectionCard>
        ))}

        <Text variant="fine" tone="label" className="mx-1">
          You'll still hear from us about your account and payments.
          Notifications also need to be allowed for JJ's Kitchen in your phone's
          settings.
        </Text>
      </ScrollView>
    </View>
  );
};
