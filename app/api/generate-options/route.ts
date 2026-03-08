import { NextRequest, NextResponse } from "next/server";
import anthropic from "@/lib/anthropic";
import { USER_PROFILE } from "@/lib/profile";
import type { QuestionCategory } from "@/types";

// This route generates 4 multiple-choice answer options for a given question.
// One option is strong, one is decent, and two are weak — but they are NOT labeled.
// This forces the user to think critically rather than just pick the obvious one.
export async function POST(req: NextRequest) {
  // Entire handler wrapped in try/catch so Anthropic SDK errors (bad key, rate
  // limit, network failure) return clean JSON instead of an HTML crash page.
  try {
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

Output ONLY a JSON object — no code blocks, no markdown, no additional text before or after.
Use this exact format:
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

    // Strip any markdown fences Claude might add despite the instruction
    const raw = (message.content[0].type === "text" ? message.content[0].text : "")
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();

    const parsed = JSON.parse(raw);
    return NextResponse.json({ options: parsed.options });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to generate answer options: ${msg}` },
      { status: 500 }
    );
  }
}
