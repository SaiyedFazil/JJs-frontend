import React from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

/**
 * The scroll container every form on a screen should sit in.
 *
 * WHY A COMPONENT AND NOT A ScrollView: this app draws edge-to-edge, and in
 * that mode Android does not resize the window for the keyboard — the
 * manifest's `adjustNothing` is not even the deciding factor, since
 * `adjustResize` behaves the same way once the window fits no system bars.
 * So a plain ScrollView leaves any field below the keyboard line covered,
 * which is exactly what happened to Edit Profile's email row, and RN's own
 * KeyboardAvoidingView cannot help: it shifts a container, it does not know
 * which input has focus.
 *
 * KeyboardAwareScrollView reads the keyboard's geometry from the native
 * window insets and scrolls the FOCUSED input into view, with the keyboard's
 * own timing curve, identically on both platforms.
 *
 * The three auth screens still carry their own workarounds — a
 * `keyboardDidShow` listener with a setTimeout in complete-profile, a
 * KeyboardAvoidingView that does nothing on Android in Login and OTP. They
 * can each be replaced by this component; none of them has been touched yet.
 */
export interface FormScreenProps {
  children: React.ReactNode;
  /**
   * Gap left between the focused field and the top of the keyboard. The
   * default clears a field's own error line, so a validation message is never
   * the thing hidden behind the keyboard.
   */
  bottomOffset?: number;
  /** Padding for the scrolled content, not the scroller itself. */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Layout only — horizontal padding usually belongs here. */
  className?: string;
}

/** One `body` line plus its margin: enough to keep an error message visible. */
const DEFAULT_BOTTOM_OFFSET = 24;

export const FormScreen = ({
  children,
  bottomOffset = DEFAULT_BOTTOM_OFFSET,
  contentContainerStyle,
  className = '',
}: FormScreenProps) => (
  <KeyboardAwareScrollView
    bottomOffset={bottomOffset}
    contentContainerStyle={contentContainerStyle}
    className={className}
    showsVerticalScrollIndicator={false}
    // A tap on a button while the keyboard is up should press the button,
    // not just dismiss the keyboard and make the user tap twice.
    keyboardShouldPersistTaps="handled"
    style={styles.scroller}
  >
    {children}
  </KeyboardAwareScrollView>
);

/** Layout-only: the scroller owns the space its screen gives it. */
const styles = StyleSheet.create({
  scroller: { flex: 1 },
});
