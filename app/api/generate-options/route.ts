import { NextRequest, NextResponse } from "next/server";
import anthropic from "@/lib/anthropic";
import { USER_PROFILE } from "@/lib/profile";
import type { QuestionCategory } from "@/types";

// This route generates 4 multiple-choice answer options for a given question.
// One option is strong, one is decent, and two are weak — but they are NOT labeled.
// This forces the user to think critically rather than just pick the obvious one.
export async function POST(req: NextRequest) {
  const { question, category } = await req.json() as {
    question: string;
    category: QuestionCategory;
  };

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: USER_PROFILE,
    messages: [
      {
        role: "user",
        content: `You are creating multiple-choice answer options for this interview question:
"${question}"

Question type: ${category}

Generate exactly 4 answer options. The options should be:
- Option A: A strong, senior-level answer with specifics and impact
- Option B: A decent answer that covers the basics but lacks depth
- Option C: A weak answer that is vague and misses key points
- Option D: A poor answer that avoids the question or shows poor judgment

IMPORTANT: Shuffle the options in your response so A is not always the strongest.
Present them as realistic, full-sentence answers a candidate might actually say.
Do NOT label which is strong or weak.

Respond ONLY with valid JSON in this exact format (no markdown):
{
  "options": [
    "First option text here",
    "Second option text here",
    "Third option text here",
    "Fourth option text here"
  ]
}`,
      },
    ],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";

  try {
    const parsed = JSON.parse(raw);
    return NextResponse.json({ options: parsed.options });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate answer options. Please try again." },
      { status: 500 }
    );
  }
}
