import type { BoardPrivacy } from "@/types";

export type PublicBoardRobots = {
  index: boolean;
  follow: boolean;
};

/**
 * Search-engine indexing policy for public board routes.
 * Unlisted boards are viewable via direct URL but must not appear in search results.
 */
export function getPublicBoardRobots(privacy: BoardPrivacy): PublicBoardRobots {
  if (privacy === "public") {
    return { index: true, follow: true };
  }

  return { index: false, follow: false };
}

/** Boards reachable at `/u/{username}/{slug}` when no extra gate applies. */
export function isDirectLinkAccessible(privacy: BoardPrivacy): boolean {
  return privacy === "public" || privacy === "unlisted";
}

/** Boards that require an unlock step before rendering content. */
export function requiresPasswordUnlock(privacy: BoardPrivacy): boolean {
  return privacy === "password";
}

/** Boards that must never render on the public route. */
export function isPrivateBoard(privacy: BoardPrivacy): boolean {
  return privacy === "private";
}
