/** Identity for share-modal drafts. Block edits must not change it. */
export function shareSettingsSyncKey(board: {
  id: string;
  privacy: string;
  collaborators?: string[];
}): string {
  return `${board.id}:${board.privacy}:${(board.collaborators ?? []).join(",")}`;
}
