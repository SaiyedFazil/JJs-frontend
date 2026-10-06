import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text as RNText,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { X } from 'lucide-react-native';
import { CATEGORY_EMOJI, CATEGORY_TINT, Icon, Text } from '@/components/ui';
import type { MenuSection } from '../hooks/use-menu-catalog';
import { CountBadge } from './CountBadge';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** The sheet never covers more than this share of the screen. */
const MAX_HEIGHT_RATIO = 0.82;

/**
 * The category index behind the floating "Menu" pill. Picking a row closes
 * the sheet and jumps the list; the caller does both.
 *
 * Modal set-up as in the profile's AvatarSheet, for the same reasons: the
 * platform slide rather than a reanimated `entering`, and a window that runs
 * under the navigation bar with the sheet padding itself clear of it.
 */
export const CategorySheet = ({
  sections,
  activeId,
  onSelect,
  onClose,
}: {
  sections: MenuSection[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}) => {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  return (
    <Modal
      visible
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <AnimatedPressable
          entering={FadeIn.duration(180)}
          style={StyleSheet.absoluteFill}
          className="bg-scrim"
          accessibilityRole="button"
          accessibilityLabel="Close section list"
          onPress={onClose}
        />

        <View
          className="bg-surface rounded-t-sheet"
          // Runtime values: a share of the real screen height, and the
          // gesture-bar inset the last row has to clear.
          style={{
            maxHeight: height * MAX_HEIGHT_RATIO,
            paddingBottom: insets.bottom + 12,
          }}
        >
          <View className="px-lg pt-md pb-sm">
            <View className="w-10 h-1 rounded-sm bg-border-strong self-center mb-md" />
            <View className="flex-row items-center justify-between">
              <Text variant="h2">Jump to a section</Text>
              <TouchableOpacity
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close"
                className="w-8 h-8 rounded-pill bg-sunken items-center justify-center"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon
                  icon={X}
                  className="text-ink-strong"
                  size={16}
                  strokeWidth={2.4}
                />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="px-sm pb-sm"
          >
            {sections.map(section => {
              const isActive = section.id === activeId;
              return (
                <TouchableOpacity
                  key={section.id}
                  onPress={() => onSelect(section.id)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  accessibilityLabel={`${section.name}, ${section.items.length} dishes`}
                  className={`flex-row items-center gap-3 rounded-md px-3.5 py-3 ${
                    isActive ? 'bg-ember-wash' : ''
                  }`}
                >
                  <View
                    className={`w-10 h-10 rounded-md items-center justify-center ${
                      CATEGORY_TINT[section.id] ?? 'bg-sunken'
                    }`}
                  >
                    <RNText style={styles.emoji}>
                      {CATEGORY_EMOJI[section.id] ?? '\u{1F37D}'}
                    </RNText>
                  </View>
                  <Text
                    variant="body"
                    weight="700"
                    tone={isActive ? 'ember-pressed' : 'ink'}
                    numberOfLines={1}
                    className="flex-1"
                  >
                    {section.name}
                  </Text>
                  <CountBadge count={section.items.length} />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

/** Layout-only: the emoji is a glyph, not type. */
const styles = StyleSheet.create({
  emoji: { fontSize: 19, lineHeight: 24 },
});
