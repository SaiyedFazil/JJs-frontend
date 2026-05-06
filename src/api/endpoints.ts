/**
 * API Endpoints Registry
 * Centralized location for all API routes to avoid hardcoded strings throughout the app.
 */
export const ENDPOINTS = {
  AUTH: {
    SEND_OTP: '/user/create',
    VERIFY_OTP: '/user/verify-otp',
    // LOGOUT: '/auth/logout',
    // REFRESH_TOKEN: '/auth/refresh-token',
  },
  USER: {
    // PROFILE: '/user/profile',
    // UPDATE_PROFILE: '/user/profile/update',
    // ADDRESSES: '/user/addresses',
  },
  MENU: {
    // CATEGORIES: '/menu/categories',
    // ITEMS: '/menu/items',
    // ITEM_DETAILS: (id: string) => `/menu/items/${id}`,
  },
  ORDERS: {
    // LIST: '/orders',
    // CREATE: '/orders/create',
    // DETAILS: (id: string) => `/orders/${id}`,
    // TRACKING: (id: string) => `/orders/track/${id}`,
  },
  CART: {
    // SYNC: '/cart/sync',
  },
} as const;
