import OpenAI from "openai";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, getApps, cert } from "firebase-admin/app";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

// Initialize Firebase Admin
if (getApps().length === 0) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  } catch (error) {
    console.log("Firebase admin initialization error", error);
  }
}

// Note: Using Node.js runtime (not edge) because Firebase Admin SDK requires it
// export const runtime = "edge";

export async function POST(req: Request) {
  try {
    // Check if OpenAI is configured
    if (!openai || !process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI features are not configured" }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get the Firebase token from the cookie
    const cookieHeader = req.headers.get("cookie");
    const firebaseAuthCookie = cookieHeader
      ?.split(";")
      .find((c) => c.trim().startsWith("firebaseAuth="))
      ?.split("=")[1];

    if (!firebaseAuthCookie) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Verify the Firebase token
    try {
      await getAuth().verifyIdToken(firebaseAuthCookie);
    } catch (error) {
      console.error("Token verification error:", error);
      return new Response("Unauthorized", { status: 401 });
    }

    const { prompt, type } = await req.json();

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
        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content || "";
          controller.enqueue(new TextEncoder().encode(text));
        }
        controller.close();
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
    console.error("AI API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
