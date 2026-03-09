"use client";

import Link from "next/link";
import { Brain, Target, Sparkles, ChevronRight, BarChart3, MessageSquare } from "lucide-react";

// The landing page hero section and feature grid.
// This is a client component only because of the button hover state.
export default function LandingHero() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* ── Navigation bar ─────────────────────────────────────── */}
      <nav className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-100">InterviewCoach</span>
          </div>
          <Link
            href="/simulate"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Start practicing →
          </Link>
        </div>
      </nav>

      {/* ── Hero section ──────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-900/50 border border-brand-700 text-brand-300 text-xs font-medium mb-8">
          <Sparkles className="w-3 h-3" />
          Personalized to your background
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
          Ace your next
          <span className="text-brand-400"> PM interview</span>
        </h1>

        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          AI-powered interview simulation tailored to your experience in fintech and payments.
          Practice STAR behavioral questions, case questions, and get instant expert feedback.
        </p>

        {/* CTA */}
        <Link
          href="/simulate"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Start Practice Session
          <ChevronRight className="w-5 h-5" />
        </Link>

        <p className="mt-4 text-sm text-slate-500">
          Free. No signup required. Powered by Claude.
        </p>
      </main>

      {/* ── Feature cards ─────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1 */}
          <FeatureCard
            icon={<Target className="w-5 h-5 text-brand-400" />}
            title="3 Question Types"
            description="Behavioral (STAR), open-ended case questions, and situational judgment — pick what you need to practice."
          />
          {/* Card 2 */}
          <FeatureCard
            icon={<BarChart3 className="w-5 h-5 text-brand-400" />}
            title="AI Feedback"
            description="Get a score, strengths, improvement areas, and a model answer after every response. STAR breakdown for behavioral questions."
          />
          {/* Card 3 */}
          <FeatureCard
            icon={<MessageSquare className="w-5 h-5 text-brand-400" />}
            title="Personalized to You"
            description="Questions and feedback are calibrated to a senior PM in fintech. Paste a job description for role-specific practice."
          />
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────── */}
      <section className="border-t border-slate-800 max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-center text-2xl font-semibold text-slate-100 mb-10">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            { step: "1", label: "Configure", desc: "Choose question type, difficulty, and optionally paste a job description." },
            { step: "2", label: "Answer", desc: "Write a free-form answer or pick from multiple-choice options." },
            { step: "3", label: "Get feedback", desc: "See your score, what you nailed, what you missed, and a model answer." },
          ].map(({ step, label, desc }) => (
            <div key={step} className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-700 text-brand-100 flex items-center justify-center font-bold text-lg">
                {step}
              </div>
              <div className="font-semibold text-slate-100">{label}</div>
              <div className="text-sm text-slate-400">{desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ── Reusable feature card ─────────────────────────────────────────────────────
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="w-10 h-10 rounded-lg bg-brand-900/60 border border-brand-800 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-slate-100 mb-2">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}
