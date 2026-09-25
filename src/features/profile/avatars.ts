/**
 * The preset avatar set (spec: Profile.dc.html).
 *
 * Presets only — there is no upload path, by design. A food app's avatar is
 * decoration, and shipping an image picker would buy a permissions prompt, a
 * crop UI and an upload endpoint to replace one emoji.
 *
 * The grounds are LITERAL class names, never interpolated: Tailwind extracts
 * classes by scanning source text, so one built from the index at runtime
 * would emit no rule at all — and the token guard reads the source the same
 * way, which is how it caught that comment when it spelled the class out.
 */
export interface AvatarPreset {
  emoji: string;
  /** Its ground — one of the twelve --color-avatar-* tokens. */
  tint: string;
  /** Read out in place of the emoji, which screen readers announce badly. */
  label: string;
}

export const AVATARS: AvatarPreset[] = [
  { emoji: '🔥', tint: 'bg-avatar-1', label: 'Flame' },
  { emoji: '🧑‍🍳', tint: 'bg-avatar-2', label: 'Chef' },
  { emoji: '🍗', tint: 'bg-avatar-3', label: 'Roast chicken' },
  { emoji: '🌶️', tint: 'bg-avatar-4', label: 'Chilli' },
  { emoji: '🍛', tint: 'bg-avatar-5', label: 'Curry and rice' },
  { emoji: '🥘', tint: 'bg-avatar-6', label: 'Handi' },
  { emoji: '🫕', tint: 'bg-avatar-7', label: 'Hotpot' },
  { emoji: '🍢', tint: 'bg-avatar-8', label: 'Skewer' },
  { emoji: '🧆', tint: 'bg-avatar-9', label: 'Falafel' },
  { emoji: '🥟', tint: 'bg-avatar-10', label: 'Dumpling' },
  { emoji: '🍤', tint: 'bg-avatar-11', label: 'Prawn' },
  { emoji: '🐔', tint: 'bg-avatar-12', label: 'Chicken' },
];

/** The flame, on ember — the brand mark, and what a new account starts with. */
export const DEFAULT_AVATAR_ID = 0;

/**
 * Never throws and never renders a hole: an id from an older build, or one
 * stored before a preset was removed, falls back to the default.
 */
export const avatarAt = (id: number): AvatarPreset =>
  AVATARS[id] ?? AVATARS[DEFAULT_AVATAR_ID];
