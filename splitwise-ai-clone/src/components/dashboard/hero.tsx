"use client";

import { motion } from "framer-motion";
import { ChevronRight, Shield, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-[3rem] border border-border/60 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 text-white sm:p-12">
      <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="relative z-10 grid gap-6 lg:grid-cols-2 lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-wide text-white/70 backdrop-blur">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            AI-first expense orchestration
          </div>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
            Splitwise AI Clone blends realtime finance, automation, and Gemini copilots in one glass UI.
          </h1>
          <p className="max-w-xl text-base text-white/70">
            Streamline shared expenses with Next.js 15, Convex realtime sync, Clerk auth, Inngest workflows, Resend alerts, and Gemini-generated insights that speak every team&apos;s language.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100">
              Launch dashboard <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10">
              Watch settlement demo
            </Button>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-white/70">
            <span className="inline-flex items-center gap-2"><Shield className="h-4 w-4 text-emerald-300" /> Clerk + RLS security</span>
            <span className="inline-flex items-center gap-2"><Zap className="h-4 w-4 text-cyan-300" /> Inngest automations</span>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="hidden lg:block"
        >
          <div className="relative h-full w-full rounded-[2.25rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="absolute inset-x-8 top-8 h-32 rounded-3xl bg-gradient-to-tr from-cyan-400/30 via-violet-500/40 to-amber-400/30 blur-2xl" />
            <div className="relative space-y-4 text-white/80">
              <p className="text-sm font-semibold uppercase tracking-wide text-white/60">
                Realtime telemetry
              </p>
              <div className="grid gap-3 text-sm">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span>Convex ops</span>
                  <span className="text-emerald-300">12ms</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span>Gemini completions</span>
                  <span className="text-cyan-300">OK</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span>Resend queue</span>
                  <span className="text-amber-300">Scheduled</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
