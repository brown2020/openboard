import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, errorResponse } from "@/lib/api-utils";
import {
  getBoardAccessCookieName,
  verifyBoardAccessToken,
} from "@/lib/board-access-cookie";
import {
  buildWebhookPayload,
  sanitizeFormSubmitPayload,
  validateFormSubmission,
} from "@/lib/form-submit";
import { getAdminDb } from "@/lib/firebase-admin";
import {
  isPrivateBoard,
  requiresPasswordUnlock,
} from "@/lib/public-board-access";
import type { Block, FormBlock } from "@/types";

const FormSubmitSchema = z.object({
  boardId: z.string().min(1),
  blockId: z.string().min(1),
  data: z.record(z.string(), z.string()),
  _gotcha: z.string().optional(),
});

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

function isFormBlock(block: Block): block is FormBlock {
  return block.type === "form";
}

export async function POST(req: NextRequest) {
  try {
    const parsed = FormSubmitSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return errorResponse("Invalid request body", 400);
    }

    const { boardId, blockId, data, _gotcha } = parsed.data;

    if (_gotcha?.trim()) {
      return NextResponse.json({ ok: true });
    }

    const clientIp = getClientIp(req);
    if (!rateLimit(`form:board:${boardId}`, 10, 60_000)) {
      return errorResponse("Too many submissions. Please try again later.", 429);
    }
    if (!rateLimit(`form:ip:${clientIp}`, 20, 60_000)) {
      return errorResponse("Too many submissions. Please try again later.", 429);
    }

    const adminDb = getAdminDb();
    const snap = await adminDb.collection("boards").doc(boardId).get();
    if (!snap.exists) {
      return errorResponse("Board not found", 404);
    }

    const board = snap.data() as {
      privacy?: string;
      blocks?: Block[];
    };

    const privacy = board.privacy ?? "public";
    if (isPrivateBoard(privacy as "private")) {
      return errorResponse("Board not found", 404);
    }

    if (requiresPasswordUnlock(privacy as "password")) {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get(getBoardAccessCookieName())?.value;
      const access = accessToken
        ? verifyBoardAccessToken(accessToken, boardId)
        : { ok: false as const };

      if (!access.ok) {
        return errorResponse("Board access required", 403);
      }
    }

    const block = board.blocks?.find((item) => item.id === blockId);
    if (!block || !isFormBlock(block) || !block.visible) {
      return errorResponse("Form not found", 404);
    }

    const sanitizedData = sanitizeFormSubmitPayload(data);
    if (!sanitizedData) {
      return errorResponse("Invalid form data", 400);
    }

    const validation = validateFormSubmission({ block, data: sanitizedData });
    if (!validation.ok) {
      return errorResponse(validation.error, validation.status);
    }

    const webhookPayload = buildWebhookPayload({
      boardId,
      blockId,
      block,
      data: validation.data,
    });

    const webhookResponse = await fetch(validation.submitUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "OpenBoard-Form-Relay/1.0",
      },
      body: JSON.stringify(webhookPayload),
      signal: AbortSignal.timeout(10_000),
    });

    if (!webhookResponse.ok) {
      return errorResponse(
        "Unable to deliver form submission. Please try again later.",
        502
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }

    if (error instanceof Error && error.name === "TimeoutError") {
      return errorResponse(
        "Form submission timed out. Please try again later.",
        504
      );
    }

    console.error("Form submit relay error:", error);
    return errorResponse("Internal Server Error", 500);
  }
}
