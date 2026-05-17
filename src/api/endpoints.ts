/**
 * API Endpoints Registry
 * Centralized location for all API routes to avoid hardcoded strings throughout the app.
 */
export const ENDPOINTS = {
  AUTH: {
    SEND_OTP: '/user/auth/create',
    VERIFY_OTP: '/user/auth/verify-otp',
    LOGOUT: '/user/auth/logout',
    RESEND_OTP: '/user/auth/resend-otp',
    // REFRESH_TOKEN: '/auth/refresh-token',
  },
  USER: {
    UPDATE_PROFILE: '/user/profile',
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
