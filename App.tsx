import './src/global.css';
import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { HeroUINativeProvider } from 'heroui-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { RootNavigator } from './src/navigation/RootNavigator';

/**
 * The app renders one palette — JJ's Kitchen Design System v1.0 — in both
 * light and dark device color schemes. There is deliberately no theme store
 * and no `dark` class: every token lives in src/global.css with a single
 * value. See docs/superpowers/specs/2026-09-06-design-system-v1-design.md.
 */
function App() {
  return (
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
            <View style={styles.container}>
              {/* Dark glyphs: the canvas is Cream 50 everywhere except the
                splash, which sets its own bar style. */}
              <StatusBar
                barStyle="dark-content"
                backgroundColor="transparent"
                translucent
              />
              <RootNavigator />
            </View>
          </HeroUINativeProvider>
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
