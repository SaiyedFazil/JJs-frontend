import type { NavigatorScreenParams } from '@react-navigation/native';

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
  Saved: undefined;
  Orders: undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList> | undefined;
};
