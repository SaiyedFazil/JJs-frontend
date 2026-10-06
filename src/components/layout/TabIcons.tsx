import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import type { MainTabParamList } from '@/types/navigation.types';

/**
 * The tab bar's glyphs, each in an outline and a filled form.
 *
 * Drawn here rather than taken from lucide-react-native because the filled
 * form is not lucide's `fill` prop: that floods every path in one colour, so
 * the house's door and the menu's text lines vanish into the solid
 * shape. The filled form paints the silhouette in ember and redraws those
 * inner details as on-ember strokes, which keeps it recognisable at 26px.
 *
 * The path data is lucide's own (ISC), on its 24-unit grid, so the two forms
 * line up exactly and the tab bar can crossfade between them without a shift.
 *
 * Colours arrive as resolved strings: SVG paints with values, not class names.
 */
export interface TabGlyphColors {
  /** The outline form's strokes. */
  ink: string | undefined;
  /** The filled form's silhouette. */
  ember: string | undefined;
  /** Inner details drawn over that silhouette. */
  onEmber: string | undefined;
}

export interface TabGlyphProps {
  filled: boolean;
  colors: TabGlyphColors;
  size: number;
  strokeWidth: number;
}

export type TabGlyph = (props: TabGlyphProps) => React.ReactElement;

/** lucide's grid and stroke style, shared by every glyph. */
const Frame = ({
  size,
  strokeWidth,
  stroke,
  children,
}: {
  size: number;
  strokeWidth: number;
  stroke: string | undefined;
  children: React.ReactNode;
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={stroke}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </Svg>
);

/**
 * The colours one glyph paints with: `body` for the silhouette's stroke and
 * fill, `detail` for strokes that sit inside it.
 */
const paint = ({ filled, colors }: TabGlyphProps) => ({
  body: filled ? colors.ember : colors.ink,
  fill: filled ? colors.ember : 'none',
  detail: filled ? colors.onEmber : colors.ink,
});

/**
 * The body is drawn before the door so that, when filled, the door's
 * on-ember stroke lands on top. Its round caps reach the outer edge of the
 * floor line, which cuts the doorway open at the bottom.
 */
const House: TabGlyph = props => {
  const { body, fill, detail } = paint(props);
  return (
    <Frame size={props.size} strokeWidth={props.strokeWidth} stroke={body}>
      <Path
        d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        fill={fill}
      />
      <Path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" stroke={detail} />
    </Frame>
  );
};

/**
 * An open menu card: lucide's book-open-text. The covers are drawn first so
 * that, when filled, the spine and the text lines land on top of them as
 * on-ember strokes.
 */
const MenuBook: TabGlyph = props => {
  const { body, fill, detail } = paint(props);
  return (
    <Frame size={props.size} strokeWidth={props.strokeWidth} stroke={body}>
      <Path
        d="M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z"
        fill={fill}
      />
      <Path d="M12 5v16" stroke={detail} />
      <Path d="M16 13h2" stroke={detail} />
      <Path d="M16 9h2" stroke={detail} />
      <Path d="M6 13h2" stroke={detail} />
      <Path d="M6 9h2" stroke={detail} />
    </Frame>
  );
};

const Heart: TabGlyph = props => {
  const { body, fill } = paint(props);
  return (
    <Frame size={props.size} strokeWidth={props.strokeWidth} stroke={body}>
      <Path
        d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"
        fill={fill}
      />
    </Frame>
  );
};

const User: TabGlyph = props => {
  const { body, fill } = paint(props);
  return (
    <Frame size={props.size} strokeWidth={props.strokeWidth} stroke={body}>
      <Path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" fill={fill} />
      <Circle cx="12" cy="7" r="4" fill={fill} />
    </Frame>
  );
};

/** One glyph per tab, keyed by route name. */
export const TAB_GLYPHS: Record<keyof MainTabParamList, TabGlyph> = {
  Home: House,
  Menu: MenuBook,
  Favourites: Heart,
  Profile: User,
};
