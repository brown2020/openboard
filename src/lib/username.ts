const USERNAME_PATTERN = /^[a-z0-9][a-z0-9._-]{1,29}$/;

export function sanitizeUsername(raw: string): string {
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "")
    .replace(/^[._-]+/, "")
    .replace(/[._-]+$/, "");
  return cleaned.slice(0, 30);
}

export function isValidUsername(username: string): boolean {
  return USERNAME_PATTERN.test(username);
}

export function usernameFromEmail(email: string | null | undefined, uid: string): string {
  const local = sanitizeUsername(email?.split("@")[0] ?? "");
  if (isValidUsername(local)) return local;
  const fallback = sanitizeUsername(uid.slice(0, 8));
  if (isValidUsername(fallback)) return fallback;
  return `user${uid.replace(/[^a-z0-9]/gi, "").slice(0, 8).toLowerCase() || "board"}`;
}
