const FRESH_AUTH_SECONDS = 5 * 60;

/**
 * A new session cookie may be minted from a recent sign-in.
 * Refreshing an existing cookie for the same user does not require a new auth_time.
 */
export function canMintSessionCookie(input: {
  authTime: number;
  nowSeconds: number;
  hasMatchingSession: boolean;
}): boolean {
  if (input.hasMatchingSession) return true;
  if (!Number.isFinite(input.authTime)) return false;
  return input.nowSeconds - input.authTime < FRESH_AUTH_SECONDS;
}
