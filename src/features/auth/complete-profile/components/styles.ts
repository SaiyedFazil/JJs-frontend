import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#170C79',
  primaryDark: '#8E05C2',
  backgroundLight: '#EFE3CA',
  backgroundDark: '#000000',
  error: '#EF4444',
};

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1 },
  hiddenInput: { position: 'absolute', width: 1, height: 1, opacity: 0 },

  // ── OTP Section ───────────────────────────────────────────────────────────
  otpSection: {
    marginBottom: 16,
  },
  otpSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  otpShieldBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  otpSubtitleText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
  },
  otpSubtitleEmail: {
    fontWeight: '900',
  },
  otpSlotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  // Individual OTP slot
  otpSlot: {
    flex: 1,
    marginHorizontal: 4,
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  otpSlotIdle: {
    backgroundColor: '#F7F5FF', // light: soft lavender white
    borderColor: '#DDD8F5',
  },
  otpSlotIdleDark: {
    backgroundColor: '#1C1C28',
    borderColor: '#2E2A4A',
  },
  otpSlotActive: {
    backgroundColor: '#EDE8FF',
    borderColor: '#170C79',
  },
  otpSlotActiveDark: {
    backgroundColor: '#22203A',
    borderColor: '#FFFFFF',
  },
  otpSlotFilled: {
    backgroundColor: '#EAE7FD',
    borderColor: '#B8AEED',
  },
  otpSlotFilledDark: {
    backgroundColor: '#211E35',
    borderColor: '#4B3FA0',
  },
  otpCursor: {
    position: 'absolute',
    width: 2,
    height: 24,
    borderRadius: 1,
    backgroundColor: '#170C79',
  },
  otpDigit: {
    fontSize: 22,
    fontWeight: '900',
  },

  // ── Change Email chip ─────────────────────────────────────────────────────
  changeEmailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 14,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    gap: 5,
  },
  changeEmailText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  // ── Skip row ──────────────────────────────────────────────────────────────
  actionArea: {
    marginTop: 8,
  },
  skipRow: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 5,
  },
  skipText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
