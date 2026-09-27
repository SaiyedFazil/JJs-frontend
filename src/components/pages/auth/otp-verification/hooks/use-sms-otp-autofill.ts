import { useEffect } from 'react';
import {
  Keyboard,
  NativeEventEmitter,
  NativeModules,
  Platform,
} from 'react-native';

const { SmsRetrieverModule } = NativeModules;

/**
 * Android SMS User Consent API — no hash needed, shows the native consent
 * dialog. When the user taps "Allow", the first 6-digit run in the message
 * is handed to `onCode` and the keyboard is dismissed. The listener window
 * is five minutes; it is torn down on unmount.
 *
 * Mount-only by contract: `onCode` is read once. Pass a stable function such
 * as a state setter.
 */
export const useSmsOtpAutofill = (onCode: (code: string) => void) => {
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    let smsEventEmitter: NativeEventEmitter | null = null;
    let smsReceivedSub: ReturnType<NativeEventEmitter['addListener']> | null =
      null;
    let smsTimeoutSub: ReturnType<NativeEventEmitter['addListener']> | null =
      null;

    const startSmsListener = async () => {
      try {
        // Start the User Consent listener (5-minute window)
        await SmsRetrieverModule.startSmsRetriever();
        console.log('📡 SMS User Consent listener started');

        smsEventEmitter = new NativeEventEmitter(SmsRetrieverModule);

        // Fired when user taps "Allow" on the native consent dialog
        smsReceivedSub = smsEventEmitter.addListener(
          'onSmsReceived',
          (event: { message?: string }) => {
            console.log('📲 SMS User Consent received:', event?.message);
            if (event?.message) {
              const otpMatch = event.message.match(/\d{6}/);
              if (otpMatch && otpMatch[0]) {
                console.log('✅ OTP auto-filled:', otpMatch[0]);
                onCode(otpMatch[0]);
                Keyboard.dismiss();
              }
            }
          },
        );

        smsTimeoutSub = smsEventEmitter.addListener('onSmsTimeout', () => {
          console.log('⏰ SMS User Consent timed out');
        });
      } catch (err) {
        console.log('SMS User Consent error:', err);
      }
    };

    startSmsListener();

    return () => {
      smsReceivedSub?.remove();
      smsTimeoutSub?.remove();
      SmsRetrieverModule.stopSmsRetriever?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
