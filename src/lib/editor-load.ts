/** Load a board into the editor once per id. Later renders must not refetch. */
export function shouldFetchEditorBoard(
  loadedBoardId: string | null,
  boardId: string
): boolean {
  return loadedBoardId !== boardId;
}
