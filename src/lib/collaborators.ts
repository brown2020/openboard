import type { Board } from "@/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeCollaboratorEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidCollaboratorEmail(email: string): boolean {
  return EMAIL_PATTERN.test(normalizeCollaboratorEmail(email));
}

/** Firebase Auth UIDs are stored in collaborators; legacy invites may still be emails. */
export function isCollaboratorUserId(value: string): boolean {
  return value.length > 0 && !value.includes("@");
}

export function mergeBoardLists(...lists: Board[][]): Board[] {
  const byId = new Map<string, Board>();

  for (const list of lists) {
    for (const board of list) {
      byId.set(board.id, board);
    }
  }

  return Array.from(byId.values()).sort(compareBoardsByUpdatedAt);
}

function compareBoardsByUpdatedAt(a: Board, b: Board): number {
  return getUpdatedAtMs(b) - getUpdatedAtMs(a);
}

function getUpdatedAtMs(board: Board): number {
  const updatedAt = board.updatedAt as
    | { toMillis?: () => number }
    | string
    | undefined;

  if (updatedAt && typeof updatedAt === "object" && "toMillis" in updatedAt) {
    return updatedAt.toMillis?.() ?? 0;
  }

  if (typeof updatedAt === "string") {
    const parsed = Date.parse(updatedAt);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

export function filterCollaboratorUserIds(collaborators: string[]): string[] {
  return collaborators.filter(isCollaboratorUserId);
}
