import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { LogOut } from 'lucide-react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { Icon, Text } from '@/components/ui';
import { PillButton } from './PillButton';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * The logout confirmation.
 *
 * Replaces the platform `Alert` this screen used to raise: an Alert renders in
 * the OS's own typeface and colours, which is exactly the seam the design
 * system exists to remove. It also gives the destructive choice a red button
 * and the safe one the default weight, which the design reverses.
 */
export const LogoutDialog = ({
  isBusy = false,
  onCancel,
  onConfirm,
}: {
  isBusy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) => (
  <Modal
    visible
    transparent
    statusBarTranslucent
    // The dialog is centred, so this is not about its position — it is the
    // scrim, which would otherwise stop short of the navigation bar and leave
    // a lit strip of the screen below a supposedly full-screen dim.
    navigationBarTranslucent
    animationType="none"
    onRequestClose={onCancel}
  >
    <View className="flex-1 justify-center px-lg">
      <AnimatedPressable
        entering={FadeIn.duration(180)}
        style={StyleSheet.absoluteFill}
        className="bg-scrim-strong"
        accessibilityRole="button"
        accessibilityLabel="Dismiss"
        onPress={onCancel}
      />

      <Animated.View
        entering={ZoomIn.duration(200)}
        accessibilityViewIsModal
        className="bg-surface rounded-xl p-lg"
      >
        <View className="w-14 h-14 rounded-pill bg-tile-chili items-center justify-center mb-md">
          <Icon
            icon={LogOut}
            className="text-chili"
            size={26}
            strokeWidth={2}
          />
        </View>

        <Text variant="h2" weight="700">
          Log out of your account?
        </Text>
        <Text variant="body" tone="ink-soft" className="mt-sm mb-lg">
          You'll need to sign in again with your phone number to place your next
          order.
        </Text>

        <View className="flex-row gap-3">
          <PillButton
            label="Stay logged in"
            variant="outline"
            className="flex-1"
            isDisabled={isBusy}
            onPress={onCancel}
          />
          <PillButton
            label="Log out"
            variant="danger"
            className="flex-1"
            isLoading={isBusy}
            onPress={onConfirm}
          />
        </View>
      </Animated.View>
    </View>
  </Modal>
);
