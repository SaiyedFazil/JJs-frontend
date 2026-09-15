/**
 * JJ's Kitchen component kit — PDF section 05.
 *
 * Every primitive here is token-only: no hex literal, no magic number. Colors,
 * type, spacing, radius and elevation all resolve from src/global.css, so a
 * change there moves the whole app. Enforced by __tests__/design-tokens.test.ts.
 */
export type { Surface } from './surface';

export { Text } from './Text';
export type { TextProps, TextVariant, TextTone } from './Text';

export { Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';

export { TextField } from './TextField';
export type { TextFieldProps } from './TextField';

export { OtpInput } from './OtpInput';
export type { OtpInputProps } from './OtpInput';

export { VegBadge, RatingBadge, Tag, SpiceBadge } from './Badges';
export { PriceTag, PortionPrice } from './PriceTag';

export { CategoryChip } from './CategoryChip';
export { Segmented } from './Segmented';
export { QuantityStepper } from './QuantityStepper';

export { FoodCard } from './FoodCard';
export type { FoodCardProps, FoodItem } from './FoodCard';

export { TopAppBar, LocationBar } from './AppBar';

export { EmptyState, ErrorState, SkeletonCard } from './States';
export { OrderTimeline } from './OrderTimeline';
export type { TimelineStep } from './OrderTimeline';

export { LinearFill, ScrimFill, RadialGlow } from './Gradient';

export { ImageTile, CATEGORY_TINT, CATEGORY_EMOJI } from './ImageTile';
export type { ImageTileProps } from './ImageTile';
