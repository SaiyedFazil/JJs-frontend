import React from 'react';
import { useResolveClassNames } from 'uniwind';
import type { LucideIcon } from 'lucide-react-native';

/**
 * A lucide icon, coloured by a Tailwind class.
 *
 * WHY THIS EXISTS: a `className` never reaches a lucide icon. Nothing in this
 * project registers an interop for `lucide-react-native`, so `text-ember` on a
 * glyph is silently dropped and it falls back to near-black — which is why the
 * profile's tile icons and chevrons rendered black on their tints. The class
 * resolves perfectly; it just lands on a component that ignores it, which is
 * why the token guard cannot see the problem.
 *
 * lucide DOES take a `color` string, so this resolves the class through
 * uniwind's own pipeline — the same one that colours `Text` — and passes the
 * result there.
 *
 * `useResolveClassNames`, NOT `useCSSVariable`/`useToken`: the variable lookup
 * only sees names that survive into the runtime variable table, and a token
 * referenced solely from JS is not one of them. It returns undefined, `useToken`
 * turns that into 'transparent', and the icon disappears — which is exactly
 * what happened to every icon here that used a token the app never names in a
 * className. Resolving the class itself has no such gap.
 *
 * `className` is therefore a real, literal utility ("text-ember",
 * "text-chevron"), so Tailwind emits it and the design-token guard audits it
 * like any other colour in the app.
 */
export const Icon = ({
  icon: Glyph,
  className,
  size = 19,
  strokeWidth = 1.9,
  fill = 'none',
}: {
  icon: LucideIcon;
  /** A colour utility, e.g. "text-ember". Literal — never interpolated. */
  className: string;
  size?: number;
  strokeWidth?: number;
  /** "currentColor" for a solid glyph in the same colour. */
  fill?: string;
}) => {
  const style = useResolveClassNames(className);
  const color = typeof style.color === 'string' ? style.color : undefined;

  return (
    <Glyph size={size} color={color} strokeWidth={strokeWidth} fill={fill} />
  );
};
