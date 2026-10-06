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

/** Which of a portioned dish's two sizes. */
export type PortionSize = keyof Portion;

export type SpiceLevel = 'mild' | 'medium' | 'spicy';

/** An optional extra on a dish — a naan, extra gravy — priced on top of it. */
export interface AddOn {
  id: string;
  name: string;
  price: number;
  veg: boolean;
}

export interface DishRating {
  score: number;
  count: number;
  /** Percent of ratings at 5, 4, 3, 2 and 1 stars, in that order. */
  breakdown: [number, number, number, number, number];
}

export interface DishReview {
  id: string;
  author: string;
  /** Display-ready ("2 days ago"). The API will send a timestamp. */
  postedAgo: string;
  stars: number;
  text: string;
  photos?: ImageSourcePropType[];
}

/** Everything the product detail screen shows beyond the MenuItem itself. */
export interface DishDetail {
  /** Long-form copy. Absent when the kitchen has written none. */
  description?: string;
  ingredients: string[];
  prepMinutes: number;
  /** For an unportioned dish; a portioned one shows its portion's own. */
  serves: string;
  /** Swipeable header photos. Empty → ImageTile's tinted cuisine tile. */
  gallery: ImageSourcePropType[];
  /** Absent until the dish has been rated. */
  rating?: DishRating;
  reviews: DishReview[];
  /** Whether the kitchen takes a spice level for this dish. */
  hasSpiceLevel: boolean;
  /** Empty when the dish takes none, and the section is not drawn. */
  addOns: AddOn[];
  /** Whether the kitchen takes cooking instructions for this dish. */
  takesNotes: boolean;
  pairings: MenuItem[];
}
