import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { HeroUINativeProvider } from 'heroui-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';

/**
 * Every app-wide provider, outermost first. App.tsx renders the app inside
 * this and nothing else, so the order the app depends on lives in one place.
 */
export const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <GestureHandlerRootView style={styles.container}>
    {/* Keyboard geometry, read from the native window insets rather than
        from a window resize — which is what this app needs, because it
        draws edge-to-edge and `adjustResize` is a no-op in that mode.
        Every form uses it through components/ui/FormScreen.

        All three flags are ON to protect the edge-to-edge setup: without
        them the provider would take the translucent bars back, and the
        hero header and floating tab bar both depend on drawing under
        them. See AppTheme in android/app/src/main/res/values/styles.xml. */}
    <KeyboardProvider
      statusBarTranslucent
      navigationBarTranslucent
      preserveEdgeToEdge
    >
      <SafeAreaProvider>
        <HeroUINativeProvider
          config={{
            devInfo: { stylingPrinciples: false },
            toast: {
              defaultProps: {
                placement: 'top',
                isSwipeable: true,
              },
              insets: { bottom: 12, left: 16, right: 16 },
            },
          }}
        >
          <View style={styles.container}>{children}</View>
        </HeroUINativeProvider>
      </SafeAreaProvider>
    </KeyboardProvider>
  </GestureHandlerRootView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
