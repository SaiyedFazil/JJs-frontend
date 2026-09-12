/* eslint-env jest */
/**
 * Native-module stubs for Jest.
 *
 * App.tsx pulls in gesture-handler, reanimated and MMKV, none of which have a
 * native binary under the Node test runner. These are the libraries' own
 * documented test shims.
 */
require('react-native-gesture-handler/jestSetup');

// Reanimated 4's own mock file loads react-native-worklets, which requires a
// native binary, so it cannot be used here. Stub the surface the app touches.
jest.mock('react-native-worklets', () => ({}));

jest.mock('react-native-reanimated', () => {
  const { View, Text, ScrollView } = require('react-native');
  const passthrough = new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (prop === 'duration' || prop === 'delay' || prop === 'springify') {
          return () => passthrough;
        }
        return passthrough;
      },
      apply: () => passthrough,
    },
  );
  const entering = new Proxy(function () {}, {
    get: () => entering,
    apply: () => entering,
  });

  return {
    __esModule: true,
    default: { View, Text, ScrollView, createAnimatedComponent: c => c },
    View,
    Text,
    ScrollView,
    useSharedValue: jest.fn(initial => ({ value: initial })),
    useAnimatedStyle: jest.fn(fn => fn()),
    withTiming: jest.fn(v => v),
    withDelay: jest.fn((_d, v) => v),
    withRepeat: jest.fn(v => v),
    withSequence: jest.fn(v => v),
    interpolate: jest.fn(() => 0),
    interpolateColor: jest.fn(() => 'transparent'),
    Easing: new Proxy({}, { get: () => () => 0 }),
    FadeIn: entering,
    FadeOut: entering,
    FadeInUp: entering,
    FadeInDown: entering,
    FadeInRight: entering,
    SlideInDown: entering,
    ZoomIn: entering,
  };
});

jest.mock('react-native-mmkv', () => {
  const store = new Map();
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      set: (k, v) => store.set(k, v),
      getString: k => store.get(k),
      getBoolean: k => store.get(k),
      getNumber: k => store.get(k),
      contains: k => store.has(k),
      delete: k => store.delete(k),
      clearAll: () => store.clear(),
    })),
  };
});
