"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Building2, User, Megaphone, Globe, MessageSquare, Zap, CheckCircle2, ChevronRight, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [goal, setGoal] = useState("");
  const [channels, setChannels] = useState<string[]>([]);
  
  const handleNext = () => setStep(step + 1);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[600px] pointer-events-none -z-10 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: ROLE */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                <div className="h-full bg-purple-500 w-1/4" />
              </div>
              
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-500 p-[1px] mb-8 shadow-lg shadow-purple-500/20">
                <div className="w-full h-full bg-[#050505] rounded-2xl flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Welcome to FlowStage</h1>
              <p className="text-slate-400 text-lg mb-10 leading-relaxed">Let's personalize your workspace. To start, what best describes your role in the company?</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                {[
                  { id: "founder", label: "Founder / CEO", desc: "Setting up for the team", icon: Building2 },
                  { id: "marketing", label: "Marketing / Sales", desc: "Running ad campaigns", icon: Megaphone },
                  { id: "support", label: "Customer Support", desc: "Managing conversations", icon: User },
                  { id: "dev", label: "Developer / IT", desc: "Building integrations", icon: Globe }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setRole(item.id)}
                    className={`flex flex-col items-start p-5 rounded-2xl border transition-all text-left ${
                      role === item.id 
                        ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10" 
                        : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    <item.icon className={`h-6 w-6 mb-3 ${role === item.id ? "text-purple-400" : "text-slate-400"}`} />
                    <span className="font-bold text-lg">{item.label}</span>
                    <span className="text-sm text-slate-500 mt-1">{item.desc}</span>
                  </button>
                ))}
              </div>
              
              <div className="flex justify-end">
                <Button
                  onClick={handleNext}
                  disabled={!role}
                  className="bg-white text-black font-semibold h-12 px-8 rounded-full shadow-lg shadow-white/10"
                >
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: GOAL */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                <div className="h-full bg-blue-500 w-2/4 transition-all duration-500" />
              </div>

              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">What's your primary goal?</h1>
              <p className="text-slate-400 text-lg mb-10 leading-relaxed">This helps us recommend the right templates and configure your AI Copilot.</p>
              
              <div className="grid gap-4 mb-10">
                {[
                  { id: "automate", label: "Automate Customer Support", desc: "Deflect tickets and answer FAQs 24/7 with AI." },
                  { id: "sales", label: "Increase Sales & Lead Gen", desc: "Capture leads and qualify them automatically." },
                  { id: "unified", label: "Unify all messaging channels", desc: "Bring WhatsApp, IG, and Messenger into one inbox." },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setGoal(item.id)}
                    className={`flex items-center p-5 rounded-2xl border transition-all text-left ${
                      goal === item.id 
                        ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10" 
                        : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center mr-4 shrink-0 transition-colors ${
                      goal === item.id ? "border-blue-500 bg-blue-500" : "border-slate-600"
                    }`}>
                      {goal === item.id && <Check className="h-3.5 w-3.5 text-white" />}
                    </div>
                    <div>
                      <span className="font-bold text-lg block">{item.label}</span>
                      <span className="text-sm text-slate-400 mt-1 block">{item.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="flex justify-between items-center">
                <button onClick={() => setStep(1)} className="text-slate-400 hover:text-white font-medium px-4 py-2">Back</button>
                <Button
                  onClick={handleNext}
                  disabled={!goal}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-12 px-8 rounded-full shadow-lg shadow-blue-600/20"
                >
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: CHANNELS */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                <div className="h-full bg-emerald-500 w-3/4 transition-all duration-500" />
              </div>

              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Connect your channels</h1>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">Select the platforms you want to automate. You can always connect more later.</p>
              
              <div className="grid grid-cols-2 gap-4 mb-10">
                {[
                  { id: "whatsapp", label: "WhatsApp", icon: MessageSquare, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                  { id: "instagram", label: "Instagram", icon: Globe, color: "text-pink-400", bg: "bg-pink-500/10" },
                  { id: "messenger", label: "Messenger", icon: MessageSquare, color: "text-blue-400", bg: "bg-blue-500/10" },
                  { id: "telegram", label: "Telegram", icon: Zap, color: "text-sky-400", bg: "bg-sky-500/10" }
                ].map((item) => {
                  const isSelected = channels.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (isSelected) setChannels(channels.filter(c => c !== item.id));
                        else setChannels([...channels, item.id]);
                      }}
                      className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all text-center ${
                        isSelected 
                          ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10" 
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div className={`p-3 rounded-xl mb-3 ${isSelected ? item.bg : "bg-white/5"}`}>
                        <item.icon className={`h-8 w-8 ${isSelected ? item.color : "text-slate-400"}`} />
                      </div>
                      <span className="font-bold">{item.label}</span>
                    </button>
                  );
                })}
              </div>
              
              <div className="flex justify-between items-center">
                <button onClick={() => setStep(2)} className="text-slate-400 hover:text-white font-medium px-4 py-2">Back</button>
                <Button
                  onClick={handleNext}
                  className="bg-white text-black font-semibold h-12 px-8 rounded-full shadow-lg shadow-white/10"
                >
                  {channels.length > 0 ? "Continue" : "Skip for now"} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-10 md:p-16 shadow-2xl relative overflow-hidden text-center"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                <div className="h-full bg-emerald-500 w-full transition-all duration-500" />
              </div>

              <div className="h-24 w-24 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/20">
                <CheckCircle2 className="h-12 w-12 text-emerald-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">You're all set!</h1>
              <p className="text-slate-400 text-lg mb-10 max-w-md mx-auto leading-relaxed">
                Your FlowStage workspace is ready. Let's dive in and create your first AI-powered automation.
              </p>
              
              <Button
                asChild
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 text-white font-bold h-14 px-10 rounded-full shadow-xl shadow-purple-500/25 transition-all text-lg"
              >
                <Link href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
