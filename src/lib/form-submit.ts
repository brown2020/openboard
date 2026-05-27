import type { FormBlock } from "@/types";
import { isAllowedWebhookUrl } from "@/lib/form-webhook-url";

export type FormSubmitPayload = Record<string, string>;

export type FormSubmitValidationResult =
  | { ok: true; submitUrl: string; data: FormSubmitPayload }
  | { ok: false; error: string; status: number };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function sanitizeFormSubmitPayload(
  raw: unknown
): FormSubmitPayload | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }

  const data: FormSubmitPayload = {};

  for (const [key, value] of Object.entries(raw)) {
    if (key.startsWith("_")) continue;
    if (typeof value !== "string") continue;
    data[key] = value.trim();
  }

  return data;
}

export function validateFormSubmission(input: {
  block: FormBlock;
  data: FormSubmitPayload;
}): FormSubmitValidationResult {
  const submitUrl = input.block.settings.submitUrl?.trim();

  if (!submitUrl) {
    return {
      ok: false,
      error: "This form is not configured to receive submissions.",
      status: 400,
    };
  }

  if (!isAllowedWebhookUrl(submitUrl)) {
    return {
      ok: false,
      error: "Form webhook URL is not allowed.",
      status: 400,
    };
  }

  for (const field of input.block.settings.fields) {
    const value = input.data[field.id];

    if (field.required && !isNonEmptyString(value)) {
      return {
        ok: false,
        error: `${field.label} is required.`,
        status: 400,
      };
    }

    if (
      field.type === "email" &&
      isNonEmptyString(value) &&
      !EMAIL_PATTERN.test(value)
    ) {
      return {
        ok: false,
        error: `${field.label} must be a valid email address.`,
        status: 400,
      };
    }
  }

  const allowedFieldIds = new Set(
    input.block.settings.fields.map((field) => field.id)
  );
  const sanitizedData: FormSubmitPayload = {};

  for (const field of input.block.settings.fields) {
    const value = input.data[field.id];
    if (typeof value === "string") {
      sanitizedData[field.id] = value;
    }
  }

  for (const key of Object.keys(input.data)) {
    if (!allowedFieldIds.has(key)) {
      return {
        ok: false,
        error: "Unexpected form field submitted.",
        status: 400,
      };
    }
  }

  return { ok: true, submitUrl, data: sanitizedData };
}

export function buildWebhookPayload(input: {
  boardId: string;
  blockId: string;
  block: FormBlock;
  data: FormSubmitPayload;
}) {
  const labeledData = Object.fromEntries(
    input.block.settings.fields
      .map((field) => [field.label, input.data[field.id] ?? ""])
      .filter(([, value]) => value !== "")
  );

  return {
    boardId: input.boardId,
    blockId: input.blockId,
    submittedAt: new Date().toISOString(),
    data: input.data,
    labels: labeledData,
  };
}
