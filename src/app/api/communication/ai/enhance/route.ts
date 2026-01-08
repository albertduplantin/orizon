import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { content, prompt } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Contenu requis" },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "API Claude non configurée" },
        { status: 500 }
      );
    }

    // Call Claude API to enhance the message
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `${prompt}\n\n${content}\n\nRéponds uniquement avec la version améliorée, sans explication.`,
        },
      ],
    });

    const enhanced = message.content[0].type === "text" ? message.content[0].text : content;

    return NextResponse.json({ enhanced: enhanced.trim() });
  } catch (error) {
    console.error("Erreur AI enhancement:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'amélioration du message" },
      { status: 500 }
    );
  }
}
