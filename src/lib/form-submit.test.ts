import { describe, expect, it } from "vitest";
import {
  buildWebhookPayload,
  sanitizeFormSubmitPayload,
  validateFormSubmission,
} from "./form-submit";
import type { FormBlock } from "@/types";

const formBlock: FormBlock = {
  id: "form_1",
  type: "form",
  order: 0,
  visible: true,
  settings: {
    submitText: "Send",
    submitUrl: "https://hooks.example.com/submit",
    fields: [
      {
        id: "name",
        type: "text",
        label: "Name",
        required: true,
      },
      {
        id: "email",
        type: "email",
        label: "Email",
        required: true,
      },
    ],
  },
};

describe("sanitizeFormSubmitPayload", () => {
  it("drops honeypot and non-string values", () => {
    expect(
      sanitizeFormSubmitPayload({
        name: " Ada ",
        email: "ada@example.com",
        _gotcha: "spam",
        extra: 123,
      })
    ).toEqual({
      name: "Ada",
      email: "ada@example.com",
    });
  });
});

describe("validateFormSubmission", () => {
  it("requires configured webhook URL and required fields", () => {
    expect(
      validateFormSubmission({
        block: formBlock,
        data: { name: "Ada", email: "ada@example.com" },
      }).ok
    ).toBe(true);

    expect(
      validateFormSubmission({
        block: { ...formBlock, settings: { ...formBlock.settings, submitUrl: undefined } },
        data: { name: "Ada", email: "ada@example.com" },
      })
    ).toMatchObject({ ok: false, status: 400 });

    expect(
      validateFormSubmission({
        block: formBlock,
        data: { name: "Ada", email: "not-an-email" },
      })
    ).toMatchObject({ ok: false, status: 400 });
  });

  it("rejects unexpected fields", () => {
    expect(
      validateFormSubmission({
        block: formBlock,
        data: { name: "Ada", email: "ada@example.com", secret: "nope" },
      })
    ).toMatchObject({ ok: false, status: 400 });
  });
});

describe("buildWebhookPayload", () => {
  it("includes labeled field values for webhook consumers", () => {
    expect(
      buildWebhookPayload({
        boardId: "board_1",
        blockId: "form_1",
        block: formBlock,
        data: { name: "Ada", email: "ada@example.com" },
      })
    ).toMatchObject({
      boardId: "board_1",
      blockId: "form_1",
      data: { name: "Ada", email: "ada@example.com" },
      labels: { Name: "Ada", Email: "ada@example.com" },
    });
  });
});
