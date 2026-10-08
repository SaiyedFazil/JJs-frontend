import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Download } from 'lucide-react-native';
import { Icon, Text } from '@/components/ui';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * The invoice-downloaded confirmation, as a bottom sheet. The receipt has no
 * real file system behind it yet, so "download" resolves to this reassurance —
 * a green success mark, what was saved, and a Done button — matching the
 * design's success sheet. Built on the same Modal + slide + scrim pattern as
 * the avatar picker.
 */
export const InvoiceSheet = ({
  invoiceName,
  onClose,
}: {
  /** The filename shown as saved — "Invoice_JJ2481.pdf". */
  invoiceName: string;
  onClose: () => void;
}) => {
  const insets = useSafeAreaInsets();

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
          accessibilityLabel="Close"
          onPress={onClose}
        />

        <Animated.View
          className="items-center rounded-t-sheet bg-surface px-lg pt-md"
          style={{ paddingBottom: insets.bottom + 22 }}
        >
          <View className="mb-md h-1 w-10 self-center rounded-sm bg-border-strong" />

          <View className="mb-md w-16 h-16 items-center justify-center rounded-pill bg-paid-tint">
            <Icon
              icon={Download}
              className="text-veg"
              size={30}
              strokeWidth={2.2}
            />
          </View>

          <Text variant="h2" weight="700" className="text-center">
            Invoice downloaded
          </Text>
          <Text
            variant="fine"
            tone="muted"
            weight="500"
            className="mb-lg mt-sm text-center leading-5"
          >
            {`${invoiceName} has been saved. We've also emailed a copy to your registered address.`}
          </Text>

          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel="Done"
            className="h-14 w-full items-center justify-center rounded-lg bg-hero"
          >
            <Text variant="body" tone="on-hero" weight="800">
              Done
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};
