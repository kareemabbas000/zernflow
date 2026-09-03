"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Building2, User, Megaphone, Globe } from "lucide-react";
import Link from "next/link";

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [goal, setGoal] = useState("");

  const handleNext = () => setStep(step + 1);

  return (
    <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[500px] pointer-events-none -z-10 opacity-40">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-[100px] mix-blend-screen" />
      </div>

      <div className="w-full max-w-xl">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl"
            >
              <div className="h-12 w-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-6">
                <Sparkles className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold mb-3">Welcome to FlowStage</h1>
              <p className="text-slate-400 mb-8">Let's set up your workspace. What best describes your role?</p>
              
              <div className="grid gap-4 mb-8">
                {[
                  { id: "founder", label: "Founder / CEO", icon: Building2 },
                  { id: "marketing", label: "Marketing / Sales", icon: Megaphone },
                  { id: "support", label: "Customer Support", icon: User },
                  { id: "dev", label: "Developer / IT", icon: Globe }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setRole(item.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      role === item.id 
                        ? "border-purple-500 bg-purple-500/10" 
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${role === item.id ? "text-purple-400" : "text-slate-400"}`} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
              
              <button
                onClick={handleNext}
                disabled={!role}
                className="w-full py-4 rounded-xl bg-white text-black font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="h-5 w-5" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl"
            >
              <h1 className="text-3xl font-bold mb-3">What is your main goal?</h1>
              <p className="text-slate-400 mb-8">This helps us personalize your FlowStage experience.</p>
              
              <div className="grid gap-4 mb-8">
                {[
                  { id: "automate", label: "Automate Customer Support" },
                  { id: "sales", label: "Increase Sales & Lead Gen" },
                  { id: "unified", label: "Unify all messaging channels" },
                  { id: "other", label: "Just exploring" }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setGoal(item.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      goal === item.id 
                        ? "border-blue-500 bg-blue-500/10" 
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
              
              <button
                onClick={handleNext}
                disabled={!goal}
                className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                Complete Setup
                <ArrowRight className="h-5 w-5" />
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/5 border border-white/10 rounded-3xl p-10 backdrop-blur-xl text-center"
            >
              <div className="h-20 w-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-10 w-10" />
              </div>
              <h1 className="text-4xl font-bold mb-4">You're all set!</h1>
              <p className="text-slate-400 mb-10 text-lg">
                Your workspace is ready. Let's create your first automated flow.
              </p>
              
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold shadow-xl shadow-purple-500/25 hover:scale-105 transition-all w-full"
              >
                Go to Dashboard
                <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
