import { NextRequest, NextResponse } from "next/server";
import anthropic from "@/lib/anthropic";
import { USER_PROFILE } from "@/lib/profile";
import type { QuestionCategory } from "@/types";

// This route analyzes the user's answer and returns structured feedback.
// For behavioral questions it evaluates the STAR framework.
// For case and situational questions it evaluates structured thinking.
export async function POST(req: NextRequest) {
  const { question, category, answer } = await req.json() as {
    question: string;
    category: QuestionCategory;
    answer: string;
  };

  // Build category-specific evaluation instructions
  const evaluationInstructions =
    category === "behavioral"
      ? `Evaluate the answer against the STAR framework:
- Situation: Did they clearly set the context?
- Task: Did they explain their specific responsibility?
- Action: Did they describe what THEY personally did (not "we")?
- Result: Did they quantify or clearly describe the outcome?

Also provide a starBreakdown object with a one-sentence assessment of each component.`
      : category === "case"
      ? `Evaluate whether the answer demonstrates:
- Structured, logical problem decomposition
- Business judgment and trade-off awareness
- Data-driven thinking
- Clear recommendation with rationale`
      : `Evaluate whether the answer demonstrates:
- Sound judgment under uncertainty
- Stakeholder awareness
- Clear reasoning about priorities and trade-offs
- Awareness of regulatory or compliance implications when relevant`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1200,
    system: USER_PROFILE,
    messages: [
      {
        role: "user",
        content: `Evaluate this interview answer.

Question: "${question}"
Category: ${category}
Answer: "${answer}"

${evaluationInstructions}

Score the answer 0–100 where:
- 90–100: Outstanding, would impress at a top fintech
- 70–89: Good, above average with minor gaps
- 50–69: Adequate but missing key elements
- Below 50: Needs significant improvement

Respond ONLY with valid JSON in this exact format (no markdown, no extra text):
{
  "score": <number 0-100>,
  "strengths": ["<specific strength 1>", "<specific strength 2>"],
  "improvements": ["<specific thing they missed 1>", "<specific thing they missed 2>"],
  ${category === "behavioral" ? `"starBreakdown": {
    "situation": "<one sentence: how well did they set the context?>",
    "task": "<one sentence: how well did they describe their responsibility?>",
    "action": "<one sentence: how specific and personal was their action?>",
    "result": "<one sentence: how concrete and quantified was the result?>"
  },` : ""}
  "suggestedAnswer": "<A 3-5 sentence model answer that demonstrates what an excellent response looks like, tailored to their background as a senior fintech PM>"
}`,
      },
    ],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";

  try {
    const parsed = JSON.parse(raw);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(
      { error: "Failed to analyze answer. Please try again." },
      { status: 500 }
    );
  }
}
