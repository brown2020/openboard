import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, errorResponse, rateLimit, canEditBoard } from "./api-utils";
import type { DecodedIdToken } from "firebase-admin/auth";

/**
 * API handler context passed to route handlers
 */
export interface ApiContext<T = unknown> {
  data: T;
  user: DecodedIdToken | null;
}

/**
 * Configuration options for withApiHandler
 */
interface ApiHandlerOptions<T extends z.ZodSchema> {
  /** Zod schema for request body validation */
  schema?: T;
  /** Rate limit configuration */
  rateLimit?: {
    /** Max requests in window (default: 10) */
    maxRequests?: number;
    /** Window duration in ms (default: 60000) */
    windowMs?: number;
    /** Key prefix for rate limiting (default: route path) */
    keyPrefix?: string;
  };
  /** Whether authentication is required (default: true) */
  requireAuth?: boolean;
}

/**
 * Higher-order function to wrap API route handlers with common functionality:
 * - Request body validation (with Zod)
 * - Authentication verification
 * - Rate limiting
 * - Standardized error handling
 *
 * @example
 * ```typescript
 * const MySchema = z.object({ name: z.string() });
 *
 * export const POST = withApiHandler({
 *   schema: MySchema,
 *   rateLimit: { maxRequests: 5 },
 * }, async ({ data, user }) => {
 *   // Handler logic here
 *   return NextResponse.json({ ok: true });
 * });
 * ```
 */
export function withApiHandler<T extends z.ZodSchema>(
  options: ApiHandlerOptions<T>,
  handler: (ctx: ApiContext<z.infer<T>>) => Promise<NextResponse>
) {
  return async (req: Request): Promise<NextResponse> => {
    try {
      // Authentication check (default: required)
      let user: DecodedIdToken | null = null;
      if (options.requireAuth !== false) {
        user = await requireAuth();
      }

      // Rate limiting
      if (options.rateLimit && user) {
        const { maxRequests = 10, windowMs = 60000, keyPrefix = "api" } = options.rateLimit;
        const rateLimitKey = `${keyPrefix}:${user.uid}`;

        if (!rateLimit(rateLimitKey, maxRequests, windowMs)) {
          return errorResponse("Rate limit exceeded. Please try again later.", 429);
        }
      }

      // Request body validation
      let data: z.infer<T> | undefined;
      if (options.schema) {
        const body = await req.json().catch(() => null);
        const parseResult = options.schema.safeParse(body);

        if (!parseResult.success) {
          return errorResponse("Invalid request body", 400);
        }
        data = parseResult.data;
      }

      // Call the handler
      return await handler({
        data: data as z.infer<T>,
        user,
      });
    } catch (error) {
      // Handle thrown NextResponse errors (e.g., from requireAuth)
      if (error instanceof NextResponse) {
        return error;
      }

      // Log unexpected errors
      console.error("API handler error:", error);
      return errorResponse("Internal Server Error", 500);
    }
  };
}

/**
 * Helper to verify board edit permissions within a handler
 */
export function verifyBoardAccess(
  userId: string,
  boardData: { ownerId?: string; collaborators?: string[] }
): boolean {
  return canEditBoard(userId, boardData);
}

/**
 * Type-safe success response helper
 */
export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status });
}
