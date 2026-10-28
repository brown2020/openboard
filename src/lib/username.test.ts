import { describe, expect, it } from "vitest";
import { isValidUsername, sanitizeUsername, usernameFromEmail } from "./username";

describe("username", () => {
  it("keeps a usable local-part and rejects reserved shapes", () => {
    expect(usernameFromEmail("Ada.Lovelace@example.com", "uid")).toBe("ada.lovelace");
    expect(isValidUsername(usernameFromEmail("a@example.com", "abc12345"))).toBe(true);
    expect(sanitizeUsername("..bad..")).toBe("bad");
    expect(isValidUsername("a")).toBe(false);
  });
});
