import "server-only";

import {
  createBoardAccessToken as createToken,
  verifyBoardAccessToken as verifyToken,
} from "./board-access-token";

const COOKIE_NAME = "openboard_board_access";

function getSecret(): string {
  const secret = process.env.OPENBOARD_COOKIE_SECRET;
  if (!secret) {
    throw new Error(
      "Missing OPENBOARD_COOKIE_SECRET. Set it in .env.local to enable password-protected boards."
    );
  }
  return secret;
}

export function getBoardAccessCookieName() {
  return COOKIE_NAME;
}

export function createBoardAccessToken(
  boardId: string,
  expiresInSeconds: number,
  existingToken?: string
) {
  return createToken({
    secret: getSecret(),
    boardId,
    expiresInSeconds,
    existingToken,
  });
}

export function verifyBoardAccessToken(
  token: string,
  boardId: string
): { ok: true } | { ok: false } {
  return verifyToken({
    secret: getSecret(),
    token,
    boardId,
  });
}
