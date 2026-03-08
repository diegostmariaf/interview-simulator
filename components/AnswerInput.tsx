"use client";

import { useState, useEffect } from "react";
import { PenLine, ListChecks, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnswerMode, Question } from "@/types";

interface Props {
  question: Question;
  onSubmit: (answer: string) => void;
  isLoading: boolean;
}

// Lets the user respond to the question in one of two modes:
// 1. Free-form text — they type a full answer
// 2. Multiple choice — they pick from 4 AI-generated options
export default function AnswerInput({ question, onSubmit, isLoading }: Props) {
  const [mode, setMode] = useState<AnswerMode>("freeform");
  const [freeformText, setFreeformText] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // When the user switches to MCQ mode, fetch options from the API
  useEffect(() => {
    if (mode === "multiple-choice" && options.length === 0) {
      fetchOptions();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  async function fetchOptions() {
    setLoadingOptions(true);
    try {
      const res = await fetch("/api/generate-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.text, category: question.category }),
      });
      const data = await res.json();
      if (data.options) setOptions(data.options);
    } catch {
      // If options fail to load, the user can fall back to free-form
    } finally {
      setLoadingOptions(false);
    }
  }

  function handleSubmit() {
    if (mode === "freeform") {
      if (freeformText.trim().length < 10) return; // Require at least some content
      onSubmit(freeformText.trim());
    } else {
      if (selectedOption === null) return;
      onSubmit(options[selectedOption]);
    }
  }

  const canSubmit =
    !isLoading &&
    (mode === "freeform" ? freeformText.trim().length >= 10 : selectedOption !== null);

  return (
    <div className="space-y-4 animate-slide-up">
      {/* ── Mode toggle ───────────────────────────────────────── */}
      <div className="flex gap-2 p-1 rounded-lg bg-slate-800/60 border border-slate-700 w-fit">
        <ModeButton
          icon={<PenLine className="w-3.5 h-3.5" />}
          label="Write answer"
          active={mode === "freeform"}
          onClick={() => setMode("freeform")}
        />
        <ModeButton
          icon={<ListChecks className="w-3.5 h-3.5" />}
          label="Multiple choice"
          active={mode === "multiple-choice"}
          onClick={() => setMode("multiple-choice")}
        />
      </div>

      {/* ── Free-form textarea ────────────────────────────────── */}
      {mode === "freeform" && (
        <div className="space-y-2">
          <textarea
            value={freeformText}
            onChange={(e) => setFreeformText(e.target.value)}
            rows={8}
            placeholder="Write your answer here. For behavioral questions, use the STAR method: describe the Situation, your Task, the Actions you took, and the Results you achieved..."
            className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-200 placeholder:text-slate-500 text-sm resize-none focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors leading-relaxed"
          />
          <div className="text-right text-xs text-slate-500">
            {freeformText.length} characters
          </div>
        </div>
      )}

      {/* ── Multiple choice ───────────────────────────────────── */}
      {mode === "multiple-choice" && (
        <div className="space-y-2">
          {loadingOptions ? (
            <div className="flex items-center gap-3 py-8 justify-center text-slate-400 text-sm">
              <LoadingSpinner />
              Generating answer options...
            </div>
          ) : (
            options.map((option, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedOption(i)}
                className={cn(
                  "w-full text-left px-4 py-4 rounded-xl border text-sm transition-all leading-relaxed",
                  selectedOption === i
                    ? "border-brand-500 bg-brand-900/30 text-slate-100 ring-1 ring-brand-500"
                    : "border-slate-700 bg-slate-800/40 text-slate-300 hover:border-slate-600 hover:bg-slate-800/70"
                )}
              >
                <span className={cn(
                  "inline-flex w-6 h-6 rounded-full border text-xs font-bold items-center justify-center mr-3 shrink-0",
                  selectedOption === i ? "border-brand-400 text-brand-300 bg-brand-900" : "border-slate-600 text-slate-500"
                )}>
                  {String.fromCharCode(65 + i)}
                </span>
                {option}
              </button>
            ))
          )}
        </div>
      )}

      {/* ── Submit button ─────────────────────────────────────── */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
      >
        {isLoading ? (
          <>
            <LoadingSpinner />
            Analyzing your answer...
          </>
        ) : (
          <>
            Submit & Get Feedback
            <ChevronRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}

// ── Mode toggle button ────────────────────────────────────────────────────────
function ModeButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
        active
          ? "bg-brand-600 text-white"
          : "text-slate-400 hover:text-slate-200"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
function LoadingSpinner() {
  return (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
