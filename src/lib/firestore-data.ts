/**
 * Firestore rejects `undefined` anywhere in an update payload.
 * Drop those keys so optional block fields can be saved.
 */
export function omitUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => omitUndefinedDeep(item)) as T;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, entry]) => entry !== undefined)
      .map(([key, entry]) => [key, omitUndefinedDeep(entry)]);
    return Object.fromEntries(entries) as T;
  }

  return value;
}

export function isFirestorePermissionDenied(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code ?? "";
  return code === "permission-denied" || code.endsWith("/permission-denied");
}

/**
 * Rules that read `resource.data` deny `get` when the document does not exist.
 * For an id this user would own, that denial means the board has not been created.
 */
export function isUnreadableMissingDocument(error: unknown): boolean {
  return isFirestorePermissionDenied(error);
}
