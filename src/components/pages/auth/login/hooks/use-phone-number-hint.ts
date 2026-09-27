import { useEffect } from 'react';
import { NativeModules, Platform } from 'react-native';

const { PhoneNumberHintModule } = NativeModules;

interface PhoneNumberHintOptions {
  /** True when a number is already on screen — e.g. coming back from OTP. */
  skip: boolean;
  /** Receives the last 10 digits of the number the user picked. */
  onNumber: (phone: string) => void;
}

/**
 * Auto-detect phone number on mount (Android only).
 *
 * Shows the Google Phone Number Hint picker automatically when the login
 * screen loads — same UX as WhatsApp, PhonePe, Cred, etc. Skipped if the
 * user already has a phone (e.g. coming back from the OTP screen).
 *
 * Mount-only by contract: `skip` and `onNumber` are read once, so a later
 * prefill or a new callback identity never re-opens the picker. Pass a
 * stable function such as a state setter.
 */
export const usePhoneNumberHint = ({
  skip,
  onNumber,
}: PhoneNumberHintOptions) => {
  useEffect(() => {
    if (Platform.OS !== 'android' || !PhoneNumberHintModule) return;
    if (skip) return; // already have a number

    // Small delay so the Activity is fully mounted and idle (no animations)
    const timer = setTimeout(async () => {
      try {
        const phoneNumber: string =
          await PhoneNumberHintModule.requestPhoneNumberHint();
        if (phoneNumber) {
          const cleaned = phoneNumber.replace(/[^0-9]/g, '');
          if (cleaned.length >= 10) {
            onNumber(cleaned.slice(-10));
          }
        }
      } catch (err: any) {
        // User dismissed or no SIM numbers — perfectly fine, they'll type manually
        console.log('[PhoneHint] auto-detect:', err?.message);
      }
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
