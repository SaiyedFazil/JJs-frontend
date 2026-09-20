/**
 * Cuisine photography for the category rail, keyed by MenuCategory id.
 * Bundled through require() so the tiles ship inside the app and render
 * offline, exactly as dish-images.ts does for dishes.
 *
 * A category absent here falls through to CategoryTile's tinted glyph tile,
 * so an unphotographed cuisine is still a complete tile rather than a hole.
 *
 * When the API phase lands, this map is the seam: replace the require()
 * values with the URLs the API returns and nothing downstream changes,
 * because CategoryTile already accepts an ImageSourcePropType.
 */
import type { ImageSourcePropType } from 'react-native';

export const CATEGORY_IMAGES: Record<string, ImageSourcePropType> = {
  'chicken-tandoor': require('@/assets/images/category-chicken-tandoor.png'),
  'mutton-tandoor': require('@/assets/images/category-mutton-tandoor.png'),
  seafood: require('@/assets/images/category-seafood.png'),
  tawa: require('@/assets/images/category-tawa.png'),
  sizzlers: require('@/assets/images/category-sizzlers.png'),
  'nonveg-chinese': require('@/assets/images/category-nonveg-chinese.png'),
  'veg-main': require('@/assets/images/category-veg-main.png'),
  bread: require('@/assets/images/category-bread.png'),
  desserts: require('@/assets/images/category-desserts.png'),
  beverages: require('@/assets/images/category-beverages.png'),
};
