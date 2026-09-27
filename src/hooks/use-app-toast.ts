import { useToast } from 'heroui-native';
import type { ToastVariant, ToastPlacement } from 'heroui-native/toast';

/**
 * Toast options for the useAppToast hook
 */
export interface AppToastOptions {
  /** Primary label text for the toast */
  label: string;
  /** Optional description text below the label */
  description?: string;
  /** Visual variant */
  variant?: ToastVariant;
  /** Placement position */
  placement?: ToastPlacement;
  /** Duration in ms (default: 3000). Pass 'persistent' to keep until dismissed. */
  duration?: number | 'persistent';
  /** Optional action button label */
  actionLabel?: string;
  /** Optional callback for action button press */
  onActionPress?: (helpers: {
    show: (opts: string | object) => string;
    hide: (ids?: string | string[] | 'all') => void;
  }) => void;
}

/**
 * useAppToast
 * ──────────────────────────────────────────────────────────────────────────────
 * A professional, reusable wrapper around heroui-native's useToast.
 * Uses Pattern 2 (Config Object) — HeroUI's fully-designed built-in toast.
 *
 * Usage:
 * ```tsx
 * const toast = useAppToast();
 *
 * toast.success('OTP sent successfully');
 * toast.error('Failed to send OTP', 'Check your number and try again.');
 * toast.show({ label: 'Done', variant: 'success', duration: 3000 });
 * ```
 */
export const useAppToast = () => {
  const { toast } = useToast();

  /**
   * Show a fully-configurable toast using HeroUI's native default design.
   */
  const showToast = (options: AppToastOptions) => {
    return toast.show({
      label: options.label,
      description: options.description,
      variant: options.variant ?? 'default',
      placement: options.placement ?? 'top',
      duration: options.duration ?? 3000,
      isSwipeable: true,
      ...(options.actionLabel
        ? {
            actionLabel: options.actionLabel,
            onActionPress: options.onActionPress,
          }
        : {}),
    });
  };

  /** ✅ Shorthand: success toast */
  const success = (
    label: string,
    description?: string,
    placement: ToastPlacement = 'top',
  ) =>
    showToast({
      label,
      description,
      variant: 'success',
      placement,
      duration: 3000,
    });

  /** ❌ Shorthand: error/danger toast */
  const error = (
    label: string,
    description?: string,
    placement: ToastPlacement = 'top',
  ) =>
    showToast({
      label,
      description,
      variant: 'danger',
      placement,
      duration: 4000,
    });

  /** ⚠️ Shorthand: warning toast */
  const warning = (
    label: string,
    description?: string,
    placement: ToastPlacement = 'top',
  ) =>
    showToast({
      label,
      description,
      variant: 'warning',
      placement,
      duration: 3500,
    });

  /** ℹ️ Shorthand: informational accent toast */
  const info = (
    label: string,
    description?: string,
    placement: ToastPlacement = 'top',
  ) =>
    showToast({
      label,
      description,
      variant: 'accent',
      placement,
      duration: 3000,
    });

  return {
    show: showToast,
    success,
    error,
    warning,
    info,
    hide: toast.hide,
  };
};
