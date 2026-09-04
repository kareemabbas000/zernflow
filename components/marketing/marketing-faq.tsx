"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "Do I need to know how to code to build automations?",
    answer: "Not at all. If you can draw a flow chart on a whiteboard, you can build automations in FlowStage. We handle all the complex API connections under the hood."
  },
  {
    question: "How long does it take to get set up?",
    answer: "You can connect your first channel and publish a basic flow in under 5 minutes. But taking a coffee break first is highly recommended."
  },
  {
    question: "What if the AI hallucinates or gives the wrong answer?",
    answer: "You are always in control. You can set the AI to 'Draft only' mode, where a human agent approves every message, or restrict its knowledge base strictly to your help docs so it doesn't try to sell your customers a bridge."
  },
  {
    question: "Can I bring my whole support team?",
    answer: "Yes. Our Professional and Enterprise plans include team seats, collision detection (so two agents don't reply to the same message), and internal notes."
  },
  {
    question: "Is there a limit on how many flows I can build?",
    answer: "Nope. Build as many flows as you need. We only price based on team seats and message volume."
  }
]

export function MarketingFAQ() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0)

  return (
    <section className="py-24 bg-[var(--surface-2)]">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight text-[var(--ink)]">
            Frequently asked questions.
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx
            return (
              <div 
                key={idx} 
                className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden transition-colors"
              >
                <button
                  className="w-full px-6 py-6 text-left flex justify-between items-center focus:outline-none"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                >
                  <span className="font-bold text-lg text-[var(--ink)] pr-8">{faq.question}</span>
                  <ChevronDown 
                    className={`w-5 h-5 text-[var(--ink-3)] shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 text-[var(--ink-2)] font-medium leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
