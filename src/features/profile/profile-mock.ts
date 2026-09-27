/**
 * The counts the profile advertises — orders placed, dishes saved, addresses
 * on file, and unread notifications.
 *
 * MOCK, and the only mock left on this screen: everything else (name, phone,
 * email, avatar) is real. None of these has an endpoint yet — ENDPOINTS.ORDERS
 * is still commented out in src/lib/api/endpoints.ts.
 *
 * THE SEAM, for when they do: replace the body of `useProfileCounts` with the
 * query, keep its return shape. Every consumer reads the shape, not the
 * constant, and the screen already renders the zero state correctly — set all
 * four to 0 to see it — so wiring it up is one function body and no JSX.
 */
export interface ProfileCounts {
  /** The three the stats strip shows. */
  orders: number;
  favourites: number;
  addresses: number;
  /** Drives the only badge on the screen — see ProfileRow. */
  unreadNotifications: number;
}

const MOCK_COUNTS: ProfileCounts = {
  orders: 5,
  favourites: 8,
  addresses: 3,
  unreadNotifications: 2,
};

export const useProfileCounts = (): ProfileCounts => MOCK_COUNTS;
