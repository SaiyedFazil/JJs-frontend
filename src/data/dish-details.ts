/**
 * Mock long-form dish content for the product detail screen — copy,
 * ingredients, ratings, reviews, add-ons and pairings — standing in for the API.
 *
 * dishDetailOf(), DEFAULT_SPICE and PORTION_SERVES are the contract for API
 * integration — preserve them when you swap the body.
 */
import type {
  AddOn,
  DishDetail,
  DishRating,
  DishReview,
  MenuItem,
  PortionSize,
  SpiceLevel,
} from '@/types/menu.types';
import { byId } from './menu';
import { DISH_IMAGES } from './dish-images';

/** The spice level the kitchen cooks to when nobody asks otherwise. */
export const DEFAULT_SPICE: SpiceLevel = 'medium';

export const PORTION_SERVES: Record<PortionSize, string> = {
  full: 'Serves 2–3',
  half: 'Serves 1–2',
};

/** The extras the kitchen offers on any cooked dish. */
const ADD_ONS: AddOn[] = [
  { id: 'butter-naan', name: 'Extra Butter Naan', price: 80, veg: true },
  { id: 'extra-gravy', name: 'Extra Gravy', price: 60, veg: true },
  { id: 'add-cheese', name: 'Add Cheese', price: 40, veg: true },
  { id: 'green-salad', name: 'Green Salad', price: 120, veg: true },
];

/** Served as they come: no spice level, no add-ons, no cooking notes. */
const PLAIN_CATEGORIES = new Set(['salad', 'bread', 'beverages', 'desserts']);

/** The same cross-sell under every dish, minus the dish itself. */
const PAIRING_IDS = [
  'butter-naan',
  'butter-garlic-naan',
  'green-salad',
  'gulab-jamun',
  'sosyo',
];

type Service = Pick<DishDetail, 'prepMinutes' | 'serves'>;

const SERVICE_BY_CATEGORY: Record<string, Service> = {
  soups: { prepMinutes: 15, serves: 'Serves 1' },
  salad: { prepMinutes: 10, serves: 'Serves 1–2' },
  bread: { prepMinutes: 10, serves: 'Serves 1' },
  beverages: { prepMinutes: 5, serves: 'Serves 1' },
  desserts: { prepMinutes: 10, serves: 'Serves 1' },
};

const DEFAULT_SERVICE: Service = { prepMinutes: 25, serves: 'Serves 1–2' };

const BREAKDOWN: DishRating['breakdown'] = [78, 16, 4, 1, 1];

interface Featured extends Service {
  description: string;
  ingredients: string[];
  rating: DishRating;
  reviews: DishReview[];
}

/**
 * The dishes the kitchen has written up in full. Everything else falls back to
 * its menu one-liner, its category's service defaults, and no reviews.
 */
const FEATURED: Record<string, Featured> = {
  'tandoori-chicken': {
    description:
      'Our signature — a whole spring chicken marinated overnight in hung yogurt, saffron, Kashmiri chilli and hand-pounded garam masala, then slow char-grilled in the clay tandoor until smoky and blistered.',
    ingredients: [
      'Chicken',
      'yogurt',
      'saffron',
      'Kashmiri chilli',
      'ginger-garlic',
      'garam masala',
      'lemon',
    ],
    prepMinutes: 25,
    serves: 'Serves 1–2',
    rating: { score: 4.8, count: 120, breakdown: BREAKDOWN },
    reviews: [
      {
        id: 'tandoori-chicken-1',
        author: 'Aditya R.',
        postedAgo: '2 days ago',
        stars: 5,
        text: 'Absolutely the best tandoori in Bandra. Smoky, juicy, and the char is perfect. Portion easily fed two.',
        photos: [
          DISH_IMAGES['tandoori-chicken'],
          DISH_IMAGES['chicken-pathani'],
        ],
      },
      {
        id: 'tandoori-chicken-2',
        author: 'Meera K.',
        postedAgo: '5 days ago',
        stars: 5,
        text: 'Ordered for a family dinner — arrived hot and the marinade was spot on. Will reorder.',
      },
      {
        id: 'tandoori-chicken-3',
        author: 'Faizan S.',
        postedAgo: '1 week ago',
        stars: 4,
        text: 'Great flavour, though I’d ask for medium spice next time. Packaging was neat and leak-proof.',
      },
    ],
  },
  'chicken-malai-cheese-tikka': {
    description:
      'Boneless chicken thigh in a mild, luxurious marinade of cream, cheddar, cashew paste and white pepper — grilled to a delicate golden char that stays juicy inside.',
    ingredients: [
      'Chicken thigh',
      'cream',
      'cheese',
      'cashew',
      'white pepper',
      'cardamom',
    ],
    prepMinutes: 22,
    serves: 'Serves 1–2',
    rating: { score: 4.7, count: 86, breakdown: BREAKDOWN },
    reviews: [
      {
        id: 'chicken-malai-cheese-tikka-1',
        author: 'Riya P.',
        postedAgo: '3 days ago',
        stars: 5,
        text: 'So creamy and mild — the kids finished it before the curries arrived.',
      },
      {
        id: 'chicken-malai-cheese-tikka-2',
        author: 'Kunal M.',
        postedAgo: '1 week ago',
        stars: 4,
        text: 'Melt-in-the-mouth tikka. I’d like a little more char on top, but the marinade is excellent.',
      },
    ],
  },
  'butter-chicken': {
    description:
      'Tandoor-grilled chicken simmered in a silky tomato-and-butter gravy finished with a swirl of cream and a whisper of fenugreek. A timeless crowd-pleaser, best mopped up with naan.',
    ingredients: [
      'Chicken',
      'tomato',
      'butter',
      'cream',
      'cashew',
      'kasuri methi',
    ],
    prepMinutes: 20,
    serves: 'Serves 2',
    rating: { score: 4.8, count: 204, breakdown: BREAKDOWN },
    reviews: [
      {
        id: 'butter-chicken-1',
        author: 'Sana Q.',
        postedAgo: '1 day ago',
        stars: 5,
        text: 'Silky gravy, generous chicken, and that smoky tandoor note underneath. Ordered extra naan just to finish it.',
      },
      {
        id: 'butter-chicken-2',
        author: 'Rohan D.',
        postedAgo: '4 days ago',
        stars: 5,
        text: 'The benchmark butter chicken around here. Rich without being too sweet.',
      },
      {
        id: 'butter-chicken-3',
        author: 'Neha G.',
        postedAgo: '2 weeks ago',
        stars: 4,
        text: 'Lovely and buttery. A bit mild for me — I’ll pick Spicy next time.',
      },
    ],
  },
  'mutton-burrah': {
    description:
      'Meaty mutton chops marinated in raw papaya, malt vinegar and a robust spice rub, then grilled low and slow over charcoal till fork-tender with a deep smoky crust.',
    ingredients: [
      'Mutton chops',
      'raw papaya',
      'malt vinegar',
      'red chilli',
      'garam masala',
    ],
    prepMinutes: 35,
    serves: 'Serves 2–3',
    rating: { score: 4.6, count: 64, breakdown: BREAKDOWN },
    reviews: [
      {
        id: 'mutton-burrah-1',
        author: 'Imran K.',
        postedAgo: '6 days ago',
        stars: 5,
        text: 'Fork-tender chops with a proper smoky crust. Worth the wait.',
      },
      {
        id: 'mutton-burrah-2',
        author: 'Vikram S.',
        postedAgo: '2 weeks ago',
        stars: 4,
        text: 'Big flavours and a generous portion. Bring an appetite.',
      },
    ],
  },
  'chicken-sizzler': {
    description:
      'A restaurant classic served spitting-hot on a cast-iron platter — grilled chicken, sautéed vegetables, fries and a choice of sauce, arriving with a dramatic sizzle.',
    ingredients: [
      'Chicken',
      'bell pepper',
      'onion',
      'fries',
      'house sizzler sauce',
    ],
    prepMinutes: 28,
    serves: 'Serves 1–2',
    rating: { score: 4.7, count: 98, breakdown: BREAKDOWN },
    reviews: [
      {
        id: 'chicken-sizzler-1',
        author: 'Tanya F.',
        postedAgo: '2 days ago',
        stars: 5,
        text: 'Still sizzling when it reached us! Juicy chicken, and the sauce had a nice pepper kick.',
      },
      {
        id: 'chicken-sizzler-2',
        author: 'Arjun L.',
        postedAgo: '9 days ago',
        stars: 4,
        text: 'A full meal on one plate. The fries could be crispier.',
      },
    ],
  },
  'paneer-butter-masala': {
    description:
      'Soft cubes of cottage cheese in a rich, mildly sweet tomato-butter gravy with cashew and a touch of honey. A vegetarian favourite that never disappoints.',
    ingredients: ['Paneer', 'tomato', 'butter', 'cashew', 'cream', 'honey'],
    prepMinutes: 18,
    serves: 'Serves 2',
    rating: { score: 4.6, count: 142, breakdown: BREAKDOWN },
    reviews: [
      {
        id: 'paneer-butter-masala-1',
        author: 'Pooja V.',
        postedAgo: '3 days ago',
        stars: 5,
        text: 'Soft paneer, velvety gravy — easily the best veg dish on the menu.',
      },
      {
        id: 'paneer-butter-masala-2',
        author: 'Harsh B.',
        postedAgo: '1 week ago',
        stars: 4,
        text: 'Rich and comforting. Pairs perfectly with butter garlic naan.',
      },
    ],
  },
};

export const dishDetailOf = (item: MenuItem): DishDetail => {
  const featured = FEATURED[item.id];
  const service = featured ?? SERVICE_BY_CATEGORY[item.cat] ?? DEFAULT_SERVICE;
  const isPlain = PLAIN_CATEGORIES.has(item.cat);

  return {
    description: featured?.description ?? item.desc,
    ingredients: featured?.ingredients ?? [],
    prepMinutes: service.prepMinutes,
    serves: service.serves,
    // One photo per dish today. The API can send several; the gallery pages
    // through however many arrive.
    gallery: item.image ? [item.image] : [],
    rating: featured?.rating,
    reviews: featured?.reviews ?? [],
    hasSpiceLevel: !isPlain,
    addOns: isPlain ? [] : ADD_ONS,
    takesNotes: !isPlain,
    pairings: PAIRING_IDS.filter(id => id !== item.id)
      .map(id => byId[id])
      .filter((m): m is MenuItem => m != null),
  };
};
