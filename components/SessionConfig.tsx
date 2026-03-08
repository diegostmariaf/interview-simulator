"use client";

import { useState } from "react";
import { ChevronRight, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuestionCategory, Difficulty, SessionConfig } from "@/types";

interface Props {
  onSubmit: (config: SessionConfig) => void;
  isLoading: boolean;
}

// Step 1 of the simulation: the user picks category, difficulty, and optionally
// pastes a job description to tailor the questions to a specific role.
export default function SessionConfigForm({ onSubmit, isLoading }: Props) {
  const [category, setCategory] = useState<QuestionCategory>("behavioral");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [jobDescription, setJobDescription] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ category, difficulty, jobDescription });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-slide-up">
      {/* ── Question category ──────────────────────────────────── */}
      <fieldset>
        <legend className="text-sm font-semibold text-slate-300 mb-3">
          Question Type
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CATEGORIES.map(({ value, label, description }) => (
            <CategoryCard
              key={value}
              value={value}
              label={label}
              description={description}
              selected={category === value}
              onSelect={() => setCategory(value)}
            />
          ))}
        </div>
      </fieldset>

      {/* ── Difficulty ────────────────────────────────────────── */}
      <fieldset>
        <legend className="text-sm font-semibold text-slate-300 mb-3">
          Difficulty
        </legend>
        <div className="flex gap-3">
          {DIFFICULTIES.map(({ value, label, sublabel }) => (
            <button
              key={value}
              type="button"
              onClick={() => setDifficulty(value)}
              className={cn(
                "flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-all",
                difficulty === value
                  ? "border-brand-500 bg-brand-900/40 text-brand-300"
                  : "border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600 hover:text-slate-300"
              )}
            >
              <div>{label}</div>
              <div className={cn("text-xs mt-0.5", difficulty === value ? "text-brand-400/70" : "text-slate-500")}>
                {sublabel}
              </div>
            </button>
          ))}
        </div>
      </fieldset>

      {/* ── Job description (optional) ────────────────────────── */}
      <fieldset>
        <label
          htmlFor="jd"
          className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-3"
        >
          <Briefcase className="w-4 h-4 text-slate-400" />
          Job Description
          <span className="text-xs font-normal text-slate-500 ml-1">(optional)</span>
        </label>
        <textarea
          id="jd"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={5}
          placeholder="Paste the job description or role details here. The AI will tailor questions to this specific role..."
          className="w-full px-4 py-3 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-200 placeholder:text-slate-500 text-sm resize-none focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
        />
      </fieldset>

      {/* ── Submit ────────────────────────────────────────────── */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
      >
        {isLoading ? (
          <>
            <LoadingSpinner />
            Generating question...
          </>
        ) : (
          <>
            Generate Question
            <ChevronRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}

// ── Category card ─────────────────────────────────────────────────────────────
function CategoryCard({
  value,
  label,
  description,
  selected,
  onSelect,
}: {
  value: QuestionCategory;
  label: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "text-left p-4 rounded-xl border transition-all",
        selected
          ? "border-brand-500 bg-brand-900/30 ring-1 ring-brand-500"
          : "border-slate-700 bg-slate-800/40 hover:border-slate-600"
      )}
    >
      <div className={cn("font-semibold text-sm mb-1", selected ? "text-brand-300" : "text-slate-200")}>
        {label}
      </div>
      <div className="text-xs text-slate-400 leading-relaxed">{description}</div>
    </button>
  );
}

// ── Small spinner for loading state ──────────────────────────────────────────
function LoadingSpinner() {
  return (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── Static data ───────────────────────────────────────────────────────────────
const CATEGORIES: Array<{ value: QuestionCategory; label: string; description: string }> = [
  {
    value: "behavioral",
    label: "Behavioral (STAR)",
    description: "Past experience questions. Evaluated on Situation, Task, Action, Result.",
  },
  {
    value: "case",
    label: "Product Case",
    description: "Open-ended product problems. Evaluated on structure and business judgment.",
  },
  {
    value: "situational",
    label: "Situational",
    description: '"What would you do if..." scenarios testing your judgment under pressure.',
  },
];

const DIFFICULTIES: Array<{ value: Difficulty; label: string; sublabel: string }> = [
  { value: "easy", label: "Easy", sublabel: "Associate PM" },
  { value: "medium", label: "Medium", sublabel: "PM / Sr. PM" },
  { value: "hard", label: "Hard", sublabel: "Staff / IC5" },
];
