import './src/global.css';
import React, { useMemo } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { HeroUINativeProvider } from 'heroui-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useThemeStore } from './src/store/theme.store';

function App() {
  const systemColorScheme = useColorScheme();
  const { themeMode } = useThemeStore();

  const activeTheme = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme ?? 'light';
    }
    return themeMode;
  }, [themeMode, systemColorScheme]);

  const isDarkMode = activeTheme === 'dark';

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container} className={isDarkMode ? 'dark' : ''}>
        <HeroUINativeProvider 
          config={{ devInfo: { stylingPrinciples: false } }}
        >
          <SafeAreaProvider>
            <StatusBar 
              barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
              backgroundColor="transparent"
              translucent
            />
            <RootNavigator />
          </SafeAreaProvider>
        </HeroUINativeProvider>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;

