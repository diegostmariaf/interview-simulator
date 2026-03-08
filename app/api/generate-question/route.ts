import { NextRequest, NextResponse } from "next/server";
import anthropic from "@/lib/anthropic";
import { USER_PROFILE } from "@/lib/profile";
import type { QuestionCategory, Difficulty } from "@/types";

// This route generates a single interview question based on the user's config.
// It runs server-side only, so the API key is never exposed to the browser.
export async function POST(req: NextRequest) {
  const { category, difficulty, jobDescription } = await req.json() as {
    category: QuestionCategory;
    difficulty: Difficulty;
    jobDescription: string;
  };

  // Map category to a human-readable name for the prompt
  const categoryLabel: Record<QuestionCategory, string> = {
    behavioral: "behavioral (STAR method — Situation, Task, Action, Result)",
    case: "open-ended product/case",
    situational: "situational judgment ('What would you do if...')",
  };

  // Describe what difficulty means for this type of question
  const difficultyLabel: Record<Difficulty, string> = {
    easy: "straightforward, suitable for an Associate PM or early-career PM",
    medium: "moderately challenging, suitable for a PM with 3–5 years of experience",
    hard: "senior-level, expected from an IC5/Staff PM with deep domain expertise",
  };

  const jobContext = jobDescription
    ? `The user is preparing for this specific role:\n${jobDescription}\n\nTailor the question to this job description.`
    : "Generate a question relevant to a senior PM role at a fintech company in Latin America.";

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    system: USER_PROFILE,
    messages: [
      {
        role: "user",
        content: `Generate ONE ${categoryLabel[category]} interview question.
Difficulty: ${difficultyLabel[difficulty]}.
${jobContext}

Respond ONLY with valid JSON in this exact format (no markdown, no extra text):
{
  "question": "The full interview question text",
  "tips": "A one-sentence coaching tip for how to approach this question (e.g., 'Think about a specific launch you owned and quantify the impact.')"
}`,
      },
    ],
  });

  // Extract the text content from the response
  const raw = message.content[0].type === "text" ? message.content[0].text : "";

  try {
    const parsed = JSON.parse(raw);
    return NextResponse.json({ question: parsed.question, tips: parsed.tips, category, difficulty });
  } catch {
    // If Claude returned something unexpected, return a safe error
    return NextResponse.json(
      { error: "Failed to parse question from AI response. Please try again." },
      { status: 500 }
    );
  }
}
