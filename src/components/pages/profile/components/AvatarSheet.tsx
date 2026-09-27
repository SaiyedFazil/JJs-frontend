import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text as RNText,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Icon, Text } from '@/components/ui';
import { AVATARS, avatarAt } from '@/constants/avatars';
import { PillButton } from './PillButton';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const COLUMNS = 4;
const GAP = 12;
/** The sheet's own horizontal padding, which the tiles have to live inside. */
const SHEET_PADDING = 24;

/**
 * The avatar picker.
 *
 * Selection is draft state: tapping a tile moves the ring, and only "Save
 * avatar" commits. That is what lets the sheet be dismissed without changing
 * anything — a picker that wrote through on tap would have no way back.
 */
export const AvatarSheet = ({
  currentId,
  onClose,
  onSave,
}: {
  currentId: number;
  onClose: () => void;
  onSave: (id: number) => void;
}) => {
  const [draftId, setDraftId] = useState(currentId);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // A runtime value: the grid has to divide the actual screen width, which no
  // utility can express.
  const tile = (width - SHEET_PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS;

  return (
    <Modal
      visible
      transparent
      statusBarTranslucent
      // Without this the modal's window stops at the top of the navigation
      // bar, so a sheet pinned to the bottom of that window still floats a
      // gesture-bar's height above the screen edge — with the app visible in
      // the gap. It extends the window the whole way down; the sheet's own
      // paddingBottom below is what then keeps its content clear of the bar.
      // (RN warns if this is set without statusBarTranslucent.)
      navigationBarTranslucent
      // The platform's own slide, not a reanimated `entering` on the sheet.
      // SlideInDown measures against the window and settled ~15dp short here,
      // leaving the sheet hovering above the bottom edge — the very bug this
      // component is supposed to not have.
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <AnimatedPressable
          entering={FadeIn.duration(180)}
          style={StyleSheet.absoluteFill}
          className="bg-scrim"
          accessibilityRole="button"
          accessibilityLabel="Close avatar picker"
          onPress={onClose}
        />

        <Animated.View
          className="bg-surface rounded-t-sheet px-lg pt-md"
          // The sheet sits flush on the window's bottom edge; this padding is
          // what keeps its content — the Save button — above the gesture bar.
          style={{ paddingBottom: insets.bottom + 22 }}
        >
          <View className="w-10 h-1 rounded-sm bg-border-strong self-center mb-md" />

          <Text variant="h2" weight="700">
            Choose your avatar
          </Text>
          <Text variant="fine" tone="label" className="mt-1 mb-4.5">
            Pick one from JJ's preset set.
          </Text>

          {/* Twelve tiles, three rows — a fixed grid, so it wraps rather than
              scrolls. Anything that scrolls inside a sheet fights the sheet's
              own dismiss gesture for the same drag. */}
          <View className="flex-row flex-wrap gap-3 mb-5">
            {AVATARS.map((preset, id) => {
              const isSelected = draftId === id;

              return (
                <Pressable
                  key={preset.emoji}
                  onPress={() => setDraftId(id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={preset.label}
                  style={{ width: tile, height: tile }}
                  className={`rounded-lg items-center justify-center border-2 ${
                    preset.tint
                  } ${isSelected ? 'border-ember' : 'border-transparent'}`}
                >
                  <RNText style={styles.emoji}>{preset.emoji}</RNText>

                  {isSelected ? (
                    <View
                      className="absolute w-5.5 h-5.5 rounded-pill bg-ember border-2 border-surface items-center justify-center"
                      style={styles.check}
                    >
                      <Icon
                        icon={Check}
                        className="text-on-ember"
                        size={11}
                        strokeWidth={3.4}
                      />
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          <PillButton
            label="Save avatar"
            size="lg"
            className="w-full"
            onPress={() => onSave(draftId)}
          />
        </Animated.View>
      </View>
    </Modal>
  );
};

/** Re-exported for the caller's toast copy, so the two cannot drift. */
export const avatarLabel = (id: number) => avatarAt(id).label;

/**
 * Layout-only: the tick straddles the tile's top-right corner, and the emoji
 * is a glyph rather than type (see Avatar.tsx).
 */
const styles = StyleSheet.create({
  check: { top: -6, right: -6 },
  emoji: { fontSize: 30, lineHeight: 36 },
});
