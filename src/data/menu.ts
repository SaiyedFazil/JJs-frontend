import type { MenuCategory, MenuItem, MenuTag } from '@/types/menu';

export const CATEGORIES: MenuCategory[] = [
  { id: 'popular', name: 'Popular', short: 'Popular' },
  { id: 'chicken-tandoor', name: 'Chicken Tandoor', short: 'Tandoor' },
  { id: 'mutton-tandoor', name: 'Mutton Tandoor', short: 'Mutton' },
  { id: 'seafood', name: 'Sea Food', short: 'Seafood' },
  { id: 'tawa', name: "JJ's Tawa Junction", short: 'Tawa' },
  { id: 'chicken-main', name: 'Main Course · Chicken', short: 'Chicken' },
  { id: 'mutton-main', name: 'Main Course · Mutton', short: 'Mutton MC' },
  { id: 'sizzlers', name: 'Special Sizzlers', short: 'Sizzlers' },
  { id: 'veg-main', name: 'Veg Main Course', short: 'Veg MC' },
  { id: 'nonveg-chinese', name: 'Non-Veg Chinese', short: 'Chinese' },
  { id: 'veg-chinese', name: 'Veg Chinese', short: 'Veg Chinese' },
  { id: 'soups', name: 'Soups', short: 'Soups' },
  { id: 'salad', name: 'Salad & Papad', short: 'Salad' },
  { id: 'bread', name: 'Roti / Bread', short: 'Breads' },
  { id: 'beverages', name: 'Beverages', short: 'Drinks' },
  { id: 'desserts', name: 'Desserts', short: 'Desserts' },
];

/** The shape of a `raw` row before `id`, `tags` and `base` are derived. */
type RawItem = Omit<MenuItem, 'id' | 'base' | 'tags'> & { tags?: MenuTag[] };

const raw: RawItem[] = [
  // SOUPS
  {
    name: 'Hot & Sour Soup',
    price: 200,
    veg: true,
    cat: 'soups',
    desc: 'Peppery, tangy broth with shredded veg.',
  },
  {
    name: 'Veg Manchow Soup',
    price: 220,
    veg: true,
    cat: 'soups',
    desc: 'Thick, spiced soup topped with crispy noodles.',
  },
  {
    name: 'Chicken Manchow Soup',
    price: 220,
    veg: false,
    cat: 'soups',
    desc: 'Classic Indo-Chinese soup with fried noodles.',
  },
  {
    name: 'Paya Shorba',
    price: 239,
    veg: false,
    cat: 'soups',
    desc: 'Slow-simmered trotter broth, rich and warming.',
    tags: ['chefs'],
  },

  // SALAD & PAPAD
  { name: 'Fried Papad', price: 40, veg: true, cat: 'salad' },
  { name: 'Roasted Papad', price: 30, veg: true, cat: 'salad' },
  {
    name: 'Masala Papad',
    price: 50,
    veg: true,
    cat: 'salad',
    desc: 'Crisp papad heaped with onion, tomato & chaat masala.',
  },
  { name: 'Karari Papad', price: 200, veg: true, cat: 'salad' },
  {
    name: 'Green Salad',
    price: 120,
    veg: true,
    cat: 'salad',
    desc: 'Cucumber, onion, tomato, carrot & lemon.',
  },

  // CHICKEN TANDOOR STARTERS
  {
    name: 'Tandoori Chicken',
    portion: { full: 499, half: 279 },
    veg: false,
    cat: 'chicken-tandoor',
    popular: true,
    tags: ['bestseller', 'spicy'],
    desc: 'Whole chicken marinated overnight in yogurt, saffron & red chilli, charred in the clay tandoor.',
  },
  {
    name: 'Tandoori Murgh Malai',
    portion: { full: 600, half: 310 },
    veg: false,
    cat: 'chicken-tandoor',
    popular: true,
    tags: ['bestseller'],
    desc: 'Creamy, mild malai marinade — cashew, cheese & cream over charcoal.',
  },
  {
    name: 'Tandoori Wings',
    price: 400,
    veg: false,
    cat: 'chicken-tandoor',
    desc: 'Smoky charred wings tossed in house masala.',
  },
  {
    name: 'Chicken Burrah',
    price: 419,
    veg: false,
    cat: 'chicken-tandoor',
    popular: true,
    tags: ['bestseller', 'spicy'],
    desc: 'Charcoal-grilled chicken chops in a smoky yogurt & chilli marinade.',
  },
  {
    name: 'Chicken Pathani',
    price: 469,
    veg: false,
    cat: 'chicken-tandoor',
    desc: 'North-west frontier style, rich and mildly spiced.',
  },
  {
    name: 'Chicken Turkish Malai Tikka',
    price: 449,
    veg: false,
    cat: 'chicken-tandoor',
    desc: 'Silky malai tikka with a Turkish herb twist.',
  },
  {
    name: 'Chicken Chaap Tikka',
    price: 449,
    veg: false,
    cat: 'chicken-tandoor',
  },
  {
    name: 'Chicken Lasooni Tikka',
    price: 449,
    veg: false,
    cat: 'chicken-tandoor',
    desc: 'Garlic-forward tikka, deeply savoury.',
  },
  {
    name: 'Chicken Kasuri Tikka',
    price: 449,
    veg: false,
    cat: 'chicken-tandoor',
    desc: 'Fenugreek-scented, tender & aromatic.',
  },
  {
    name: 'Chicken Peri-Peri Tikka',
    price: 449,
    veg: false,
    cat: 'chicken-tandoor',
    tags: ['spicy'],
    desc: 'Fiery African peri-peri rub.',
  },
  {
    name: 'Chicken Zafrani Tikka',
    price: 449,
    veg: false,
    cat: 'chicken-tandoor',
    desc: 'Saffron-kissed and delicately spiced.',
  },
  {
    name: 'Chicken Lemon Garlic Butter Tikka',
    price: 489,
    veg: false,
    cat: 'chicken-tandoor',
    desc: 'Bright lemon, garlic & butter glaze.',
  },
  {
    name: 'Chicken Malai Cheese Tikka',
    price: 489,
    veg: false,
    cat: 'chicken-tandoor',
    desc: 'Extra-creamy with molten cheese.',
  },
  {
    name: 'Chicken Seekh Kabab',
    price: 429,
    veg: false,
    cat: 'chicken-tandoor',
    desc: 'Hand-minced chicken skewers, char-grilled.',
  },
  {
    name: 'Chicken Gilafi Seekh',
    price: 469,
    veg: false,
    cat: 'chicken-tandoor',
    desc: 'Seekh wrapped in a bell-pepper & onion crust.',
  },
  {
    name: 'Chicken Domino',
    price: 550,
    veg: false,
    cat: 'chicken-tandoor',
    tags: ['chefs'],
  },

  // MUTTON TANDOOR STARTERS
  {
    name: 'Pan Honey Boti',
    price: 799,
    veg: false,
    cat: 'mutton-tandoor',
    desc: 'Pan-seared mutton boti glazed with honey.',
  },
  {
    name: 'Mutton Burrah',
    price: 799,
    veg: false,
    cat: 'mutton-tandoor',
    popular: true,
    tags: ['bestseller', 'spicy'],
    desc: 'Marinated mutton chops slow-charred to fall-apart tender.',
  },
  { name: 'Mutton Pathani', price: 899, veg: false, cat: 'mutton-tandoor' },
  {
    name: 'Mutton Ghee Roasted',
    price: 899,
    veg: false,
    cat: 'mutton-tandoor',
    desc: 'Roasted in aromatic ghee & whole spice.',
  },
  {
    name: 'Mutton Chaap Burrah',
    price: 799,
    veg: false,
    cat: 'mutton-tandoor',
  },
  {
    name: 'Mutton Turkish Seekh',
    price: 699,
    veg: false,
    cat: 'mutton-tandoor',
  },
  {
    name: 'Mutton Gilafi Seekh',
    price: 749,
    veg: false,
    cat: 'mutton-tandoor',
  },
  {
    name: 'Mutton Steak',
    price: 1499,
    veg: false,
    cat: 'mutton-tandoor',
    tags: ['chefs'],
    desc: 'A generous cut, seared and spiced.',
  },
  { name: 'Mutton Domino', price: 899, veg: false, cat: 'mutton-tandoor' },
  {
    name: 'Tandoori Raan',
    price: 1999,
    veg: false,
    cat: 'mutton-tandoor',
    tags: ['chefs'],
    desc: 'Whole marinated leg of mutton, slow-roasted — a feast to share.',
  },
  {
    name: 'Honey BBQ Raan',
    price: 2299,
    veg: false,
    cat: 'mutton-tandoor',
    tags: ['chefs'],
    desc: 'Signature leg of mutton lacquered in honey BBQ.',
  },

  // SEA FOOD
  {
    name: 'Fish and Chips',
    price: 699,
    veg: false,
    cat: 'seafood',
    desc: 'Golden battered fish with fries.',
  },
  {
    name: 'Zafrani Fish',
    price: 649,
    veg: false,
    cat: 'seafood',
    desc: 'Saffron-marinated tandoori fish tikka.',
  },
  {
    name: 'Lemon Garlic Butter Fish',
    price: 649,
    veg: false,
    cat: 'seafood',
    popular: true,
    desc: 'Flaky fish in a zesty lemon-garlic butter.',
  },
  { name: 'Fish Lasooni Tikka', price: 649, veg: false, cat: 'seafood' },
  {
    name: 'Butter Chilli Fish',
    price: 669,
    veg: false,
    cat: 'seafood',
    tags: ['spicy'],
  },
  {
    name: 'Tandoori Pomfret',
    price: 700,
    veg: false,
    cat: 'seafood',
    desc: 'Whole pomfret, tandoor-charred.',
  },
  { name: 'Golden Fish Fry', price: 749, veg: false, cat: 'seafood' },
  {
    name: 'Tandoori Prawns Tikka',
    price: 649,
    veg: false,
    cat: 'seafood',
    popular: true,
    desc: 'Jumbo prawns marinated and grilled.',
  },
  {
    name: 'White Pepper Garlic Prawns',
    price: 649,
    veg: false,
    cat: 'seafood',
  },
  {
    name: 'Prawns Chilli',
    price: 629,
    veg: false,
    cat: 'seafood',
    tags: ['spicy'],
  },
  { name: 'Golden Fried Prawns', price: 629, veg: false, cat: 'seafood' },

  // MAIN COURSE — CHICKEN
  {
    name: 'Chicken Rara',
    price: 499,
    veg: false,
    cat: 'chicken-main',
    tags: ['spicy'],
    desc: 'Rich minced-meat gravy with chicken.',
  },
  {
    name: 'Chicken Karahi',
    price: 449,
    veg: false,
    cat: 'chicken-main',
    popular: true,
    desc: 'Wok-tossed with tomato, ginger & green chilli.',
  },
  {
    name: 'Chicken Kolhapuri',
    price: 449,
    veg: false,
    cat: 'chicken-main',
    tags: ['spicy'],
    desc: 'Fiery Kolhapuri masala.',
  },
  { name: 'Rajasthani Chicken', price: 449, veg: false, cat: 'chicken-main' },
  {
    name: 'Butter Chicken',
    price: 499,
    veg: false,
    cat: 'chicken-main',
    popular: true,
    tags: ['bestseller'],
    desc: 'Tandoori chicken in a silky tomato-butter gravy.',
  },
  {
    name: 'Chicken Do Pyaza',
    price: 449,
    veg: false,
    cat: 'chicken-main',
    desc: 'Double onion, thick and savoury.',
  },
  { name: 'Chicken Patiala', price: 499, veg: false, cat: 'chicken-main' },
  {
    name: 'Chicken Tikka Lajawab',
    price: 449,
    veg: false,
    cat: 'chicken-main',
  },

  // MAIN COURSE — MUTTON
  {
    name: 'Mutton Rara',
    price: 649,
    veg: false,
    cat: 'mutton-main',
    tags: ['spicy'],
    desc: 'Mutton in a deep minced-meat gravy.',
  },
  {
    name: 'Mutton Rogan Josh',
    price: 589,
    veg: false,
    cat: 'mutton-main',
    popular: true,
    tags: ['bestseller'],
    desc: 'Kashmiri classic — aromatic red gravy.',
  },
  {
    name: 'Mutton Nihari',
    price: 549,
    veg: false,
    cat: 'mutton-main',
    desc: 'Overnight-simmered shank stew.',
  },
  { name: 'Mutton Rajputana', price: 599, veg: false, cat: 'mutton-main' },
  { name: 'Shinwari Karahi', price: 799, veg: false, cat: 'mutton-main' },
  {
    name: 'BBQ Karahi',
    price: 799,
    veg: false,
    cat: 'mutton-main',
    tags: ['chefs'],
  },
  {
    name: 'Mutton Karahi',
    price: 699,
    veg: false,
    cat: 'mutton-main',
    desc: 'Wok-tossed mutton, robust and spiced.',
  },
  {
    name: 'Mutton Kolhapuri',
    price: 699,
    veg: false,
    cat: 'mutton-main',
    tags: ['spicy'],
  },
  { name: 'Mutton Lahori Masala', price: 749, veg: false, cat: 'mutton-main' },
  { name: 'Mutton Khaliya', price: 649, veg: false, cat: 'mutton-main' },

  // JJ's SPECIAL TAWA JUNCTION
  {
    name: 'Bheja Green Masala',
    price: 379,
    veg: false,
    cat: 'tawa',
    tags: ['chefs'],
  },
  { name: 'Bheja Fry Masala', price: 349, veg: false, cat: 'tawa' },
  { name: 'Mutton Chaap Tabak', price: 549, veg: false, cat: 'tawa' },
  { name: 'Mutton Bombay Chaap', price: 499, veg: false, cat: 'tawa' },
  { name: 'Bheja Kali Mirch Butter', price: 349, veg: false, cat: 'tawa' },
  { name: 'Mutton Chaap Masala', price: 349, veg: false, cat: 'tawa' },
  { name: 'Mutton Darbari', price: 399, veg: false, cat: 'tawa' },
  { name: 'Mutton Gurda Masala', price: 349, veg: false, cat: 'tawa' },
  {
    name: 'Mutton Bhuna Masala',
    price: 349,
    veg: false,
    cat: 'tawa',
    desc: 'Dry-fried mutton, deeply caramelised.',
  },
  { name: 'Chicken Leg Masala', price: 299, veg: false, cat: 'tawa' },
  {
    name: 'Chicken Tikka Tawa Masala',
    price: 299,
    veg: false,
    cat: 'tawa',
    popular: true,
    desc: 'Griddled tikka in thick tawa masala.',
  },
  { name: 'Chicken Tawa Masala', price: 299, veg: false, cat: 'tawa' },
  { name: 'Bombay Chicken', price: 399, veg: false, cat: 'tawa' },
  { name: 'Tawa Wings Bhuna', price: 350, veg: false, cat: 'tawa' },
  { name: 'Darbari Khichdi', price: 379, veg: false, cat: 'tawa' },
  { name: 'Chaap Khichdi', price: 349, veg: false, cat: 'tawa' },
  { name: 'Bhuna Khichdi', price: 349, veg: false, cat: 'tawa' },
  {
    name: 'Masala Khichdi',
    price: 299,
    veg: true,
    cat: 'tawa',
    desc: 'Comforting spiced rice & lentils.',
  },
  { name: 'Chicken Tikka Khichdi', price: 299, veg: false, cat: 'tawa' },
  { name: 'Chicken Masala Khichdi', price: 299, veg: false, cat: 'tawa' },
  { name: 'Prawns Tawa Khichdi', price: 449, veg: false, cat: 'tawa' },

  // VEG MAIN COURSE
  {
    name: 'Mix Veg',
    price: 299,
    veg: true,
    cat: 'veg-main',
    desc: 'Seasonal vegetables in a home-style gravy.',
  },
  {
    name: 'Veg Kolhapuri',
    price: 349,
    veg: true,
    cat: 'veg-main',
    tags: ['spicy'],
  },
  { name: 'Paneer Chilli (Gravy)', price: 399, veg: true, cat: 'veg-main' },
  {
    name: 'Paneer Butter Masala',
    price: 349,
    veg: true,
    cat: 'veg-main',
    popular: true,
    tags: ['bestseller'],
    desc: 'Cottage cheese in a rich makhani gravy.',
  },
  {
    name: 'Paneer Tikka Masala',
    price: 349,
    veg: true,
    cat: 'veg-main',
    soldOut: true,
    desc: 'Char-grilled paneer in spiced onion-tomato masala.',
  },
  {
    name: 'Cheese Paneer Butter Masala',
    price: 449,
    veg: true,
    cat: 'veg-main',
  },

  // VEG CHINESE
  { name: 'Veg Fried Rice', price: 249, veg: true, cat: 'veg-chinese' },
  {
    name: 'Veg Schezwan Fried Rice',
    price: 249,
    veg: true,
    cat: 'veg-chinese',
    tags: ['spicy'],
  },
  {
    name: 'Veg Hakka Noodles',
    price: 249,
    veg: true,
    cat: 'veg-chinese',
    desc: 'Wok-tossed noodles with crunchy veg.',
  },
  {
    name: 'Veg Manchurian (Dry/Gravy)',
    price: 279,
    veg: true,
    cat: 'veg-chinese',
  },

  // NON VEG CHINESE
  {
    name: 'Chicken Fried Rice',
    price: 279,
    veg: false,
    cat: 'nonveg-chinese',
    popular: true,
  },
  {
    name: 'Chicken Schezwan Fried Rice',
    price: 269,
    veg: false,
    cat: 'nonveg-chinese',
    tags: ['spicy'],
  },
  { name: 'Chicken Begum Rice', price: 299, veg: false, cat: 'nonveg-chinese' },
  {
    name: 'Chicken Hakka Noodles',
    price: 289,
    veg: false,
    cat: 'nonveg-chinese',
  },
  {
    name: 'Chicken Schezwan Hakka Noodles',
    price: 299,
    veg: false,
    cat: 'nonveg-chinese',
    tags: ['spicy'],
  },
  {
    name: 'Chicken Spring Roll',
    price: 299,
    veg: false,
    cat: 'nonveg-chinese',
  },
  {
    name: 'Chicken Manchurian (Dry/Gravy)',
    price: 349,
    veg: false,
    cat: 'nonveg-chinese',
  },
  {
    name: 'Hong Kong Chicken Chilli',
    price: 349,
    veg: false,
    cat: 'nonveg-chinese',
    tags: ['spicy'],
  },
  {
    name: 'Chicken Lollipop',
    price: 329,
    veg: false,
    cat: 'nonveg-chinese',
    popular: true,
    desc: 'Frenched drumettes, fried & tossed.',
  },
  {
    name: 'Chicken Schezwan Lollipop',
    price: 359,
    veg: false,
    cat: 'nonveg-chinese',
    tags: ['spicy'],
  },
  {
    name: 'Chicken Chilli',
    price: 349,
    veg: false,
    cat: 'nonveg-chinese',
    tags: ['spicy'],
  },
  { name: 'Crispy Chicken', price: 399, veg: false, cat: 'nonveg-chinese' },

  // ROTI / BREAD
  { name: 'Tawa Roti', price: 25, veg: true, cat: 'bread' },
  { name: 'Tawa Butter Roti', price: 35, veg: true, cat: 'bread' },
  { name: 'Tandoori Roti', price: 35, veg: true, cat: 'bread' },
  { name: 'Butter Tandoori Roti', price: 40, veg: true, cat: 'bread' },
  { name: 'Naan', price: 60, veg: true, cat: 'bread' },
  { name: 'Butter Naan', price: 80, veg: true, cat: 'bread', popular: true },
  { name: 'Cheese Naan', price: 130, veg: true, cat: 'bread' },
  {
    name: 'Butter Garlic Naan',
    price: 90,
    veg: true,
    cat: 'bread',
    desc: 'Blistered naan brushed with garlic butter.',
  },
  { name: 'Tawa Lachha Paratha', price: 80, veg: true, cat: 'bread' },

  // BEVERAGES
  { name: 'Mineral Water', price: 20, veg: true, cat: 'beverages', mrp: true },
  { name: 'Campa', price: 40, veg: true, cat: 'beverages', mrp: true },
  { name: 'Sosyo', price: 40, veg: true, cat: 'beverages', mrp: true },

  // DESSERTS
  {
    name: 'Tender Coconut Rabdi',
    price: 399,
    veg: true,
    cat: 'desserts',
    tags: ['chefs'],
    desc: 'Chilled rabdi set in tender coconut.',
  },
  {
    name: 'Gulab Jamun',
    price: 99,
    veg: true,
    cat: 'desserts',
    popular: true,
    desc: 'Warm milk dumplings in rose syrup.',
  },

  // SPECIAL SIZZLERS
  {
    name: 'Veg Sizzler',
    price: 599,
    veg: true,
    cat: 'sizzlers',
    desc: 'Grilled veg & paneer on a sizzling platter.',
  },
  {
    name: 'Chicken Sizzler',
    price: 799,
    veg: false,
    cat: 'sizzlers',
    popular: true,
    tags: ['bestseller'],
    desc: 'Chicken, veg & fries served spitting hot.',
  },
  {
    name: 'Mutton BBQ Sizzler',
    price: 1299,
    veg: false,
    cat: 'sizzlers',
    tags: ['chefs'],
    desc: 'Smoky BBQ mutton on a cast-iron sizzler.',
  },
];

/** Identical to the design bundle's slug(). Ids must not drift. */
const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const MENU: MenuItem[] = raw.map(it => ({
  tags: [],
  ...it,
  id: slug(it.name),
  base: it.portion ? it.portion.full : (it.price as number),
}));

export const byId: Record<string, MenuItem> = Object.fromEntries(
  MENU.map(m => [m.id, m]),
);

export const POPULAR = MENU.filter(m => m.popular);

export const priceOf = (item: MenuItem, portion?: 'full' | 'half'): number =>
  item.portion
    ? portion === 'half'
      ? item.portion.half
      : item.portion.full
    : (item.price as number);

/**
 * The bestseller rail, driven by data rather than a hardcoded id list, so the
 * restaurant controls it by editing this file. Spec decision D5.
 */
export const bestsellers = (): MenuItem[] =>
  MENU.filter(m => m.tags.includes('bestseller'));

export const byCategory = (cat: string): MenuItem[] =>
  MENU.filter(m => m.cat === cat);
