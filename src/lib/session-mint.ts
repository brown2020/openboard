const FRESH_AUTH_SECONDS = 5 * 60;

/** New session posts that do not already carry this user's cookie. */
export const SESSION_POST_PER_MINUTE = 30;
/** Repeat calls from a user who already has a valid cookie. */
export const SESSION_REFRESH_PER_MINUTE = 120;
/** New cookie mints for one verified user. */
export const SESSION_CREATE_PER_MINUTE = 30;
/** Reuse a matching cookie until it is inside this window of expiry. */
export const SESSION_REUSE_MIN_TTL_SECONDS = 24 * 60 * 60;

/**
 * A matching cookie that is not near expiry is already the session.
 * Callers should get success without minting another cookie.
 */
export function sessionRequestPlan(input: {
  hasMatchingSession: boolean;
  sessionExpiresAtSeconds: number | null;
  nowSeconds: number;
}): "reuse" | "mint" {
  if (!input.hasMatchingSession || input.sessionExpiresAtSeconds == null) {
    return "mint";
  }
  if (
    input.sessionExpiresAtSeconds - input.nowSeconds >
    SESSION_REUSE_MIN_TTL_SECONDS
  ) {
    return "reuse";
  }
  return "mint";
}

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
