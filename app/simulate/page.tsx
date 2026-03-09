"use client";

// This is the main simulation page. It manages the full session lifecycle:
// Step 1 (config) → Step 2 (question + answer) → Step 3 (feedback)
// All state lives here; child components receive it as props.

import { useReducer } from "react";
import Link from "next/link";
import { Brain, ChevronLeft } from "lucide-react";
import SessionConfigForm from "@/components/SessionConfig";
import QuestionCard from "@/components/QuestionCard";
import AnswerInput from "@/components/AnswerInput";
import FeedbackView from "@/components/FeedbackView";
import type { SimState, SessionConfig, Question, Feedback } from "@/types";

// ── State & reducer ───────────────────────────────────────────────────────────
// Using useReducer instead of multiple useState calls keeps the state transitions
// explicit and predictable — easier to debug when things go wrong.

type Action =
  | { type: "START_LOADING" }
  | { type: "SET_ERROR"; error: string }
  | { type: "SET_QUESTION"; config: SessionConfig; question: Question }
  | { type: "SET_FEEDBACK"; feedback: Feedback }
  | { type: "TRY_ANOTHER" }
  | { type: "RESET" };

const initialState: SimState = {
  step: "config",
  config: null,
  question: null,
  answerMode: "freeform",
  userAnswer: "",
  feedback: null,
  isLoading: false,
  error: null,
};

function reducer(state: SimState, action: Action): SimState {
  switch (action.type) {
    case "START_LOADING":
      return { ...state, isLoading: true, error: null };
    case "SET_ERROR":
      return { ...state, isLoading: false, error: action.error };
    case "SET_QUESTION":
      return {
        ...state,
        isLoading: false,
        step: "question",
        config: action.config,
        question: action.question,
        userAnswer: "",
        feedback: null,
      };
    case "SET_FEEDBACK":
      return { ...state, isLoading: false, step: "feedback", feedback: action.feedback };
    case "TRY_ANOTHER":
      // Keep the same config, go back to question step but fetch a new question
      return { ...state, step: "config", question: null, feedback: null, userAnswer: "" };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SimulatePage() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Called when the user submits the config form (Step 1)
  async function handleConfigSubmit(config: SessionConfig) {
    dispatch({ type: "START_LOADING" });
    try {
      const res = await fetch("/api/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      // Check res.ok BEFORE calling res.json(). If the server returned an HTML
      // error page (e.g. Next.js crash page), calling .json() directly would
      // throw "Unexpected end of JSON input". Reading as text first lets us
      // extract a readable message regardless of what the server returned.
      if (!res.ok) {
        const body = await res.text();
        let msg = "Failed to generate question.";
        try { msg = JSON.parse(body).error ?? msg; } catch { /* body was HTML */ }
        throw new Error(msg);
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const question: Question = {
        text: data.question,
        category: data.category,
        difficulty: data.difficulty,
        tips: data.tips,
      };
      dispatch({ type: "SET_QUESTION", config, question });
    } catch (err) {
      dispatch({ type: "SET_ERROR", error: (err as Error).message || "Failed to generate question." });
    }
  }

  // Called when the user submits their answer (Step 2)
  async function handleAnswerSubmit(answer: string) {
    if (!state.question || !state.config) return;
    dispatch({ type: "START_LOADING" });
    try {
      const res = await fetch("/api/analyze-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: state.question.text,
          category: state.question.category,
          answer,
        }),
      });
      // Same defensive pattern: check ok before parsing JSON
      if (!res.ok) {
        const body = await res.text();
        let msg = "Failed to analyze answer.";
        try { msg = JSON.parse(body).error ?? msg; } catch { /* body was HTML */ }
        throw new Error(msg);
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const feedback: Feedback = {
        score: data.score,
        strengths: data.strengths,
        improvements: data.improvements,
        starBreakdown: data.starBreakdown,
        suggestedAnswer: data.suggestedAnswer,
      };
      dispatch({ type: "SET_FEEDBACK", feedback });
    } catch (err) {
      dispatch({ type: "SET_ERROR", error: (err as Error).message || "Failed to analyze answer." });
    }
  }

  // ── Step labels for the progress indicator ────────────────────────────────
  const steps = [
    { id: "config", label: "Configure" },
    { id: "question", label: "Answer" },
    { id: "feedback", label: "Feedback" },
  ];
  const stepIndex = steps.findIndex((s) => s.id === state.step);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* ── Top nav ─────────────────────────────────────────────── */}
      <nav className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-slate-100 transition-colors text-sm">
            <ChevronLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-brand-600 flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-300">InterviewCoach</span>
          </div>
          {/* Spacer to center the logo */}
          <div className="w-16" />
        </div>
      </nav>

      {/* ── Progress stepper ────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-6 pt-8 pb-2">
        <div className="flex items-center gap-2">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center gap-2">
              {i > 0 && <div className={`h-px flex-1 w-12 ${i <= stepIndex ? "bg-brand-500" : "bg-slate-700"}`} />}
              <div className="flex items-center gap-1.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  i < stepIndex
                    ? "bg-brand-600 text-white"
                    : i === stepIndex
                    ? "bg-brand-600 text-white ring-2 ring-brand-400/30"
                    : "bg-slate-800 text-slate-500 border border-slate-700"
                }`}>
                  {i < stepIndex ? "✓" : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${i === stepIndex ? "text-slate-200" : "text-slate-500"}`}>
                  {step.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-6 py-8">
        {/* Error banner */}
        {state.error && (
          <div className="mb-6 p-4 rounded-xl bg-red-900/20 border border-red-800 text-red-300 text-sm">
            {state.error}
            <button
              className="ml-3 underline text-red-400 hover:text-red-200"
              onClick={() => dispatch({ type: "RESET" })}
            >
              Start over
            </button>
          </div>
        )}

        {/* Step 1: Config */}
        {state.step === "config" && (
          <div>
            <h1 className="text-2xl font-bold text-slate-100 mb-2">Set up your session</h1>
            <p className="text-slate-400 text-sm mb-8">
              Choose a question type and difficulty. Paste a job description to practice for a specific role.
            </p>
            <SessionConfigForm onSubmit={handleConfigSubmit} isLoading={state.isLoading} />
          </div>
        )}

        {/* Step 2: Question + Answer */}
        {state.step === "question" && state.question && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-100 mb-2">Your question</h1>
              <p className="text-slate-400 text-sm">
                Take your time. Write your best answer, then submit for AI feedback.
              </p>
            </div>
            <QuestionCard question={state.question} />
            <AnswerInput
              question={state.question}
              onSubmit={handleAnswerSubmit}
              isLoading={state.isLoading}
            />
          </div>
        )}

        {/* Step 3: Feedback */}
        {state.step === "feedback" && state.feedback && state.question && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-100 mb-2">Your feedback</h1>
              <p className="text-slate-400 text-sm">
                Here&apos;s how your answer performed against a senior PM standard.
              </p>
            </div>
            {/* Show the question for reference */}
            <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800 text-sm text-slate-400 italic leading-relaxed">
              &ldquo;{state.question.text}&rdquo;
            </div>
            <FeedbackView
              feedback={state.feedback}
              question={state.question}
              onTryAnother={() => {
                // Re-use the same config to generate a new question immediately
                if (state.config) {
                  dispatch({ type: "TRY_ANOTHER" });
                  handleConfigSubmit(state.config);
                }
              }}
              onNewSession={() => dispatch({ type: "RESET" })}
            />
          </div>
        )}
      </main>
    </div>
  );
}
