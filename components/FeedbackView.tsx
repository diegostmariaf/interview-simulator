"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, ChevronDown, ChevronUp, RotateCcw, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Feedback, Question } from "@/types";

interface Props {
  feedback: Feedback;
  question: Question;
  onTryAnother: () => void;   // Keep same config, get a new question
  onNewSession: () => void;   // Go back to the config step
}

// The results view shown after the user submits their answer.
// Shows score, strengths, areas for improvement, optional STAR breakdown,
// and a suggested model answer.
export default function FeedbackView({ feedback, question, onTryAnother, onNewSession }: Props) {
  const [showSuggested, setShowSuggested] = useState(false);

  return (
    <div className="space-y-5 animate-slide-up">
      {/* ── Score banner ──────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-6 flex items-center gap-6">
        <ScoreRing score={feedback.score} />
        <div>
          <div className="text-lg font-semibold text-slate-100">
            {scoreLabel(feedback.score)}
          </div>
          <div className="text-sm text-slate-400 mt-0.5">
            {scoreSubtext(feedback.score)}
          </div>
        </div>
      </div>

      {/* ── Strengths ─────────────────────────────────────────── */}
      {feedback.strengths.length > 0 && (
        <FeedbackSection
          title="What you did well"
          items={feedback.strengths}
          variant="success"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
        />
      )}

      {/* ── Areas for improvement ─────────────────────────────── */}
      {feedback.improvements.length > 0 && (
        <FeedbackSection
          title="Areas to improve"
          items={feedback.improvements}
          variant="warning"
          icon={<AlertCircle className="w-4 h-4 text-amber-400" />}
        />
      )}

      {/* ── STAR breakdown (behavioral only) ─────────────────── */}
      {question.category === "behavioral" && feedback.starBreakdown && (
        <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">STAR Framework Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(feedback.starBreakdown).map(([key, value]) => (
              <StarComponent key={key} label={key} assessment={value} />
            ))}
          </div>
        </div>
      )}

      {/* ── Suggested answer (collapsible) ───────────────────── */}
      <div className="rounded-xl border border-slate-700 bg-slate-900/60 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowSuggested((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-slate-300 hover:text-slate-100 hover:bg-slate-800/40 transition-colors"
        >
          <span>View a strong example answer</span>
          {showSuggested ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>
        {showSuggested && (
          <div className="px-5 pb-5 border-t border-slate-800">
            <p className="text-sm text-slate-300 leading-relaxed pt-4">
              {feedback.suggestedAnswer}
            </p>
          </div>
        )}
      </div>

      {/* ── Action buttons ────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onTryAnother}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all hover:scale-[1.01]"
        >
          <RotateCcw className="w-4 h-4" />
          Next Question
        </button>
        <button
          type="button"
          onClick={onNewSession}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-700 bg-slate-800/40 hover:bg-slate-800 text-slate-300 hover:text-slate-100 font-semibold text-sm transition-all"
        >
          <Settings className="w-4 h-4" />
          Change Settings
        </button>
      </div>
    </div>
  );
}

// ── Score ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = score >= 80 ? "#34d399" : score >= 60 ? "#fbbf24" : "#f87171";

  return (
    <div className="relative w-20 h-20 shrink-0">
      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={radius} fill="none" stroke="#1e293b" strokeWidth="6" />
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-slate-100">
        {score}
      </span>
    </div>
  );
}

// ── Feedback list section (strengths / improvements) ─────────────────────────
function FeedbackSection({
  title,
  items,
  variant,
  icon,
}: {
  title: string;
  items: string[];
  variant: "success" | "warning";
  icon: React.ReactNode;
}) {
  const borderColor = variant === "success" ? "border-emerald-800/50" : "border-amber-800/40";
  const bgColor = variant === "success" ? "bg-emerald-900/10" : "bg-amber-900/10";
  const titleColor = variant === "success" ? "text-emerald-300" : "text-amber-300";
  const dotColor = variant === "success" ? "bg-emerald-400" : "bg-amber-400";

  return (
    <div className={cn("rounded-xl border p-5", borderColor, bgColor)}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className={cn("text-sm font-semibold", titleColor)}>{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300 leading-relaxed">
            <span className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", dotColor)} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── STAR component card ───────────────────────────────────────────────────────
function StarComponent({ label, assessment }: { label: string; assessment: string }) {
  const labels: Record<string, string> = {
    situation: "S — Situation",
    task: "T — Task",
    action: "A — Action",
    result: "R — Result",
  };
  return (
    <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
      <div className="text-xs font-semibold text-brand-400 mb-1 uppercase tracking-wide">
        {labels[label] ?? label}
      </div>
      <div className="text-xs text-slate-400 leading-relaxed">{assessment}</div>
    </div>
  );
}

// ── Score label and subtext helpers ──────────────────────────────────────────
function scoreLabel(score: number): string {
  if (score >= 90) return "Outstanding";
  if (score >= 75) return "Strong answer";
  if (score >= 60) return "Good start";
  if (score >= 45) return "Needs work";
  return "Significant gaps";
}

function scoreSubtext(score: number): string {
  if (score >= 90) return "Would impress at a top fintech.";
  if (score >= 75) return "Above average with minor gaps.";
  if (score >= 60) return "Covers the basics, missing key depth.";
  if (score >= 45) return "Missing several important elements.";
  return "Review the feedback and try again.";
}
