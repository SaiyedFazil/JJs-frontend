import type { ImageSourcePropType } from 'react-native';

/** A dish sold in two sizes. Full is the representative price. */
export interface Portion {
  full: number;
  half: number;
}

export interface MenuCategory {
  id: string;
  /** Full name, for a category screen header. */
  name: string;
  /** Rail label — "Tandoor" rather than "Chicken Tandoor". */
  short: string;
}

export type MenuTag = 'bestseller' | 'spicy' | 'chefs';

export interface MenuItem {
  /** slug(name) — stable, and how every surface addresses a dish. */
  id: string;
  name: string;
  desc?: string;
  /** Absent when `portion` is present. */
  price?: number;
  portion?: Portion;
  /** Representative price: portion.full when portioned, else price. */
  base: number;
  veg: boolean;
  cat: MenuCategory['id'];
  popular?: boolean;
  tags: MenuTag[];
  soldOut?: boolean;
  /** Priced at MRP — renders as "MRP ₹20". */
  mrp?: boolean;
  /**
   * A bundled photo (`require(...)`) or a remote URL. Only a handful of dishes
   * carry one; the rest fall back to ImageTile's tinted cuisine tile.
   */
  image?: ImageSourcePropType;
  /** Reserved. Nothing sets this yet; the rating pill only renders when present. */
  rating?: number;
}
