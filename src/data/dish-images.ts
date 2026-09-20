/**
 * Dish photography, keyed by the same slug() id the rest of the app addresses
 * dishes by. Bundled through require() so the photos ship inside the app and
 * render offline.
 *
 * Only a handful of dishes are shot. Everything absent here falls through to
 * ImageTile's tinted cuisine tile, so an unmapped dish is a complete screen
 * rather than a hole — adding a photo is a one-line change to this map.
 *
 * When the API phase lands, this map is the seam: replace the require() values
 * with the URLs the API returns and nothing downstream changes, because
 * MenuItem.image already accepts both.
 */
import type { ImageSourcePropType } from 'react-native';

export const DISH_IMAGES: Record<string, ImageSourcePropType> = {
  'tandoori-chicken': require('@/assets/images/tandoori-chicken.jpg'),
  'tandoori-murgh-malai': require('@/assets/images/tandoori-murgh-malai.jpg'),
  'chicken-burrah': require('@/assets/images/chicken-burrah.jpg'),
  'chicken-turkish-malai-tikka': require('@/assets/images/chicken-malai-tikka.jpg'),
  'mutton-burrah': require('@/assets/images/mutton-burrah.jpg'),
  'butter-chicken': require('@/assets/images/butter-chicken.jpg'),
  'chicken-chilli': require('@/assets/images/chicken-chilli.jpg'),
  'veg-sizzler': require('@/assets/images/veg-sizzler.webp'),
  'chicken-sizzler': require('@/assets/images/chicken-sizzler.jpg'),
  'chicken-pathani': require('@/assets/images/tandoori-whole-chicken.jpg'),
};
