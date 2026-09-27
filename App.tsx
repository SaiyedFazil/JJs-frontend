import './src/global.css';
import React from 'react';
import { StatusBar } from 'react-native';
import { AppProviders } from './src/components/providers/AppProviders';
import { RootNavigator } from './src/navigation/RootNavigator';

/**
 * The app renders one palette — JJ's Kitchen Design System v1.0 — in both
 * light and dark device color schemes. There is deliberately no theme store
 * and no `dark` class: every token lives in src/global.css with a single
 * value. See docs/superpowers/specs/2026-09-06-design-system-v1-design.md.
 */
function App() {
  return (
    <AppProviders>
      {/* Dark glyphs: the canvas is Cream 50 everywhere except the
          splash, which sets its own bar style. */}
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <RootNavigator />
    </AppProviders>
  );
}

export default App;
