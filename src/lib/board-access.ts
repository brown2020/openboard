/**
 * Shared board permission checks (client + server safe).
 */
export function isBoardOwner(
  userId: string,
  boardData: { ownerId?: string }
): boolean {
  return boardData.ownerId === userId;
}

export function canEditBoard(
  userId: string,
  boardData: { ownerId?: string; collaborators?: string[] }
): boolean {
  return (
    boardData.ownerId === userId ||
    (Array.isArray(boardData.collaborators) &&
      boardData.collaborators.includes(userId))
  );
}
