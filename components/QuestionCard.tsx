"use client";

import { Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Question } from "@/types";

interface Props {
  question: Question;
}

// Displays the generated interview question with its category badge,
// difficulty badge, and an optional coaching tip.
export default function QuestionCard({ question }: Props) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-6 animate-slide-up">
      {/* Badges */}
      <div className="flex items-center gap-2 mb-4">
        <CategoryBadge category={question.category} />
        <DifficultyBadge difficulty={question.difficulty} />
      </div>

      {/* Question text */}
      <p className="text-lg text-slate-100 font-medium leading-relaxed mb-4">
        {question.text}
      </p>

      {/* Coaching tip */}
      {question.tips && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-900/20 border border-amber-800/40">
          <Lightbulb className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-300/80 leading-relaxed">{question.tips}</p>
        </div>
      )}
    </div>
  );
}

// ── Category badge ────────────────────────────────────────────────────────────
function CategoryBadge({ category }: { category: Question["category"] }) {
  const styles = {
    behavioral: "bg-purple-900/50 text-purple-300 border-purple-700",
    case: "bg-blue-900/50 text-blue-300 border-blue-700",
    situational: "bg-teal-900/50 text-teal-300 border-teal-700",
  };
  const labels = {
    behavioral: "Behavioral · STAR",
    case: "Product Case",
    situational: "Situational",
  };
  return (
    <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full border", styles[category])}>
      {labels[category]}
    </span>
  );
}

// ── Difficulty badge ──────────────────────────────────────────────────────────
function DifficultyBadge({ difficulty }: { difficulty: Question["difficulty"] }) {
  const styles = {
    easy: "bg-green-900/40 text-green-400 border-green-800",
    medium: "bg-yellow-900/40 text-yellow-400 border-yellow-800",
    hard: "bg-red-900/40 text-red-400 border-red-800",
  };
  return (
    <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full border capitalize", styles[difficulty])}>
      {difficulty}
    </span>
  );
}
