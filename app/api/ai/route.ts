import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messages, context } = await req.json();
  if (!messages?.length) return NextResponse.json({ error: "No messages provided" }, { status: 400 });

  const systemPrompt = `You are a helpful financial assistant for BridgeLend, a peer-to-peer lending platform.
Help users understand loan terms, assess risk, and make informed decisions.
Be concise, accurate, and never provide specific investment advice.
${context ? `\nCurrent context: ${JSON.stringify(context)}` : ""}`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("\n");

    return NextResponse.json({ response: text, usage: response.usage });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "AI request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}