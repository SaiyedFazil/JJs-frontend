/**
 * Email shape check. Deliberately permissive — the server is the authority on
 * deliverability; this only catches what is obviously not an address.
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
