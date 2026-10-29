import { describe, expect, it } from "vitest";
import { getFirebaseErrorMessage } from "./use-error-handler";

describe("getFirebaseErrorMessage", () => {
  it("maps auth and rules failures to on-screen copy", () => {
    expect(
      getFirebaseErrorMessage({ code: "auth/invalid-credential" })
    ).toBe("Invalid email or password");
    expect(
      getFirebaseErrorMessage({ code: "auth/invalid-login-credentials" })
    ).toBe("Invalid email or password");
    expect(getFirebaseErrorMessage({ code: "permission-denied" })).toBe(
      "You don't have permission to perform this action"
    );
    expect(
      getFirebaseErrorMessage({ code: "firestore/permission-denied" })
    ).toBe("You don't have permission to perform this action");
  });

  it("falls back to the error message", () => {
    expect(getFirebaseErrorMessage({ message: "Failed to create session" })).toBe(
      "Failed to create session"
    );
    expect(getFirebaseErrorMessage(null)).toBe("An error occurred");
  });
});
