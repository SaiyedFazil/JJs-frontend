import type {
  CompositeNavigationProp,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

/**
 * Every navigator's param list, in one place. Screens import their types
 * from here — never from a navigator file — so the routing layer (src/app/)
 * stays the only thing that knows how screens are wired together.
 */

/** Signed-out flow: Splash → Login → OtpVerification. */
export type AuthStackParamList = {
  Splash: undefined;
  /** Initial route, so it may arrive with no params at all. */
  Login: { prefillPhone?: string } | undefined;
  OtpVerification: { phone: string; authToken: string };
};

/**
 * The Profile tab's own stack.
 *
 * `ProfileMain` takes an optional `toast` param: Edit Profile navigates back
 * with it after a successful save, so the confirmation appears on the screen
 * the change is visible on rather than on the one being dismissed.
 */
export type ProfileStackParamList = {
  ProfileMain: { toast?: string } | undefined;
  EditProfile: undefined;
};

/** Signed-in bottom tabs. */
export type MainTabParamList = {
  Home: undefined;
  Menu: undefined;
  Favourites: undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList> | undefined;
};

/**
 * The app's root stack (RootNavigator). Exactly one of these is mounted at a
 * time, chosen by the session — never more than one, so nothing navigates
 * between them; auth state does.
 */
export type AppStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList> | undefined;
  CompleteProfile: undefined;
  Main: NavigatorScreenParams<MainStackParamList> | undefined;
};

/**
 * The signed-in app: the tabs, plus the screens that open over them and so
 * cover the tab bar.
 */
export type MainStackParamList = {
  Tabs: NavigatorScreenParams<MainTabParamList> | undefined;
  /** A dish's full page, opened from any list that shows dishes. */
  ProductDetail: { dishId: string };
};

/**
 * What a tab screen's `useNavigation` returns: its own tab routes, plus the
 * root stack's, which `navigate` reaches by bubbling up.
 */
export type MainTabNavigationProp<T extends keyof MainTabParamList> =
  CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, T>,
    NativeStackNavigationProp<MainStackParamList>
  >;
