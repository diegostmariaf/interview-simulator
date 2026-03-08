// ─── Question categories the user can practice ───────────────────────────────
export type QuestionCategory =
  | "behavioral"    // Uses the STAR method (Situation, Task, Action, Result)
  | "case"          // Open-ended case/product questions
  | "situational";  // "What would you do if..." scenarios

// ─── Difficulty levels ────────────────────────────────────────────────────────
export type Difficulty = "easy" | "medium" | "hard";

// ─── Answer mode the user picks ───────────────────────────────────────────────
export type AnswerMode = "freeform" | "multiple-choice";

// ─── The config the user sets before starting a session ───────────────────────
export interface SessionConfig {
  category: QuestionCategory;
  difficulty: Difficulty;
  jobDescription: string; // Optional job description pasted by the user
}

// ─── A generated interview question ──────────────────────────────────────────
export interface Question {
  text: string;
  category: QuestionCategory;
  difficulty: Difficulty;
  tips?: string; // Optional tip shown to the user (e.g., "Think about a time you...")
}

// ─── STAR framework breakdown returned in feedback ────────────────────────────
export interface StarBreakdown {
  situation: string;  // Did the user set the context?
  task: string;       // Did they explain their responsibility?
  action: string;     // Did they describe what they specifically did?
  result: string;     // Did they quantify or describe the outcome?
}

// ─── Feedback returned by the analyze-answer API route ────────────────────────
export interface Feedback {
  score: number;               // 0–100 overall rating
  strengths: string[];         // What the user did well
  improvements: string[];      // What they missed or could improve
  starBreakdown?: StarBreakdown; // Only present for behavioral questions
  suggestedAnswer: string;     // A model answer for comparison
}

// ─── The full simulation state managed in simulate/page.tsx ───────────────────
export type SimStep = "config" | "question" | "feedback";

export interface SimState {
  step: SimStep;
  config: SessionConfig | null;
  question: Question | null;
  answerMode: AnswerMode;
  userAnswer: string;          // The text the user typed or the MCQ option they selected
  feedback: Feedback | null;
  isLoading: boolean;
  error: string | null;
}
