import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import type { MainTabParamList } from '@/types/navigation.types';

/**
 * The tab bar's glyphs, each in an outline and a filled form.
 *
 * Drawn here rather than taken from lucide-react-native because the filled
 * form is not lucide's `fill` prop: that floods every path in one colour, so
 * the house's door and the clipboard's list lines vanish into the solid
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

const Bookmark: TabGlyph = props => {
  const { body, fill } = paint(props);
  return (
    <Frame size={props.size} strokeWidth={props.strokeWidth} stroke={body}>
      <Path
        d="M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z"
        fill={fill}
      />
    </Frame>
  );
};

/**
 * The board's path is open where the clip covers it; a fill closes it
 * implicitly across the top, so board and clip merge into one silhouette.
 */
const ClipboardList: TabGlyph = props => {
  const { body, fill, detail } = paint(props);
  return (
    <Frame size={props.size} strokeWidth={props.strokeWidth} stroke={body}>
      <Path
        d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
        fill={fill}
      />
      <Rect x="8" y="2" width="8" height="4" rx="1" ry="1" fill={fill} />
      <Path d="M12 11h4" stroke={detail} />
      <Path d="M12 16h4" stroke={detail} />
      <Path d="M8 11h.01" stroke={detail} />
      <Path d="M8 16h.01" stroke={detail} />
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
  Saved: Bookmark,
  Orders: ClipboardList,
  Profile: User,
};
