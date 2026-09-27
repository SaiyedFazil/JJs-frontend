import { useCallback, useEffect, useRef, useState } from 'react';

/** Seconds before "Resend code" becomes available again. */
const RESEND_SECONDS = 60;

/**
 * The OTP screen's resend countdown. Starts on mount, ticks once a second,
 * flips `canResend` at zero, and is cleared on unmount.
 */
export const useResendTimer = () => {
  const [resendTimer, setResendTimer] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /** Resets and starts the 60-second countdown. */
  const startResendTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setResendTimer(RESEND_SECONDS);
    setCanResend(false);
    timerRef.current = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Start timer on mount; clean up on unmount.
  useEffect(() => {
    startResendTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startResendTimer]);

  return { resendTimer, canResend, startResendTimer };
};
