import OpenAI from "openai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, rateLimit, errorResponse } from "@/lib/api-utils";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

const SuggestSchema = z.object({
  prompt: z.string().min(1).max(5000),
  type: z.enum(["board-description", "link-title", "content-suggestions", "seo-optimization"]),
});

export async function POST(req: Request) {
  try {
    // Check if OpenAI is configured
    if (!openai || !process.env.OPENAI_API_KEY) {
      return errorResponse("AI features are not configured", 503);
    }

    // Verify authentication
    const user = await requireAuth();

    // Rate limit: 10 requests per minute per user
    if (!rateLimit(`ai:${user.uid}`, 10, 60000)) {
      return errorResponse("Too many requests. Please try again later.", 429);
    }

    // Validate request body
    const body = await req.json().catch(() => null);
    const validation = SuggestSchema.safeParse(body);
    
    if (!validation.success) {
      return errorResponse("Invalid request body", 400);
    }

    const { prompt, type } = validation.data;

    let systemPrompt = "";
    const userPrompt = prompt;

    switch (type) {
      case "board-description":
        systemPrompt =
          "You are a helpful assistant that creates engaging, concise descriptions for personal/professional boards. Keep it under 100 characters and make it compelling.";
        break;
      case "link-title":
        systemPrompt =
          "You are a helpful assistant that creates catchy, clear titles for links. Keep it under 50 characters.";
        break;
      case "content-suggestions":
        systemPrompt =
          "You are a creative assistant that suggests content blocks for a personal board. Suggest 3-5 specific, actionable content ideas.";
        break;
      case "seo-optimization":
        systemPrompt =
          "You are an SEO expert that optimizes titles and descriptions for search engines. Provide SEO-friendly suggestions.";
        break;
      default:
        systemPrompt = "You are a helpful assistant for OpenBoard.";
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    // Create a ReadableStream from the OpenAI response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const text = chunk.choices[0]?.delta?.content || "";
            controller.enqueue(new TextEncoder().encode(text));
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    console.error("AI API Error:", error);
    return errorResponse("Internal Server Error", 500);
  }
}
