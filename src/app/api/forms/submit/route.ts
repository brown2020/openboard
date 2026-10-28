import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { consumeRateLimit, errorResponse } from "@/lib/api-utils";
import { getTrustedClientIp } from "@/lib/client-ip";
import {
  getBoardAccessCookieName,
  verifyBoardAccessToken,
} from "@/lib/board-access-cookie";
import {
  buildWebhookPayload,
  sanitizeFormSubmitPayload,
  validateFormSubmission,
} from "@/lib/form-submit";
import { deliverFormWebhook } from "@/lib/form-webhook-deliver";
import { getAdminDb } from "@/lib/firebase-admin";
import { mergeFormSubmitUrls } from "@/lib/form-webhooks";
import {
  isPrivateBoard,
  requiresPasswordUnlock,
} from "@/lib/public-board-access";
import type { Block, BoardPrivacy, FormBlock } from "@/types";

const FormSubmitSchema = z.object({
  boardId: z.string().min(1),
  blockId: z.string().min(1),
  data: z.record(z.string(), z.string()),
  _gotcha: z.string().optional(),
});

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

    const clientIp = getTrustedClientIp(req.headers);
    if (!(await consumeRateLimit(`form:board:${boardId}`, 10, 60_000))) {
      return errorResponse("Too many submissions. Please try again later.", 429);
    }
    if (!(await consumeRateLimit(`form:ip:${clientIp}`, 20, 60_000))) {
      return errorResponse("Too many submissions. Please try again later.", 429);
    }

    const adminDb = getAdminDb();
    const snap = await adminDb.collection("boards").doc(boardId).get();
    if (!snap.exists) {
      return errorResponse("Board not found", 404);
    }

    const board = snap.data() as {
      privacy?: BoardPrivacy;
      blocks?: Block[];
    };

    const privacy = board.privacy ?? "public";
    if (isPrivateBoard(privacy)) {
      return errorResponse("Board not found", 404);
    }

    if (requiresPasswordUnlock(privacy)) {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get(getBoardAccessCookieName())?.value;
      const access = accessToken
        ? verifyBoardAccessToken(accessToken, boardId)
        : { ok: false as const };

      if (!access.ok) {
        return errorResponse("Board access required", 403);
      }
    }

    const secretSnap = await adminDb.collection("boardFormWebhooks").doc(boardId).get();
    const secretUrls = secretSnap.data()?.urls as Record<string, string> | undefined;
    const blocks = mergeFormSubmitUrls(board.blocks ?? [], secretUrls);
    const block = blocks.find((item) => item.id === blockId);
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

    const delivery = await deliverFormWebhook({
      url: validation.submitUrl,
      body: JSON.stringify(webhookPayload),
    });

    if (!delivery.ok) {
      return errorResponse(delivery.error, delivery.status);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }

    console.error("Form submit relay error:", error);
    return errorResponse("Internal Server Error", 500);
  }
}
