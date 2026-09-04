"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "Can the AI seamlessly hand off to a human agent?",
    answer: "Absolutely. You can add 'Human Handoff' nodes anywhere in your flow. If the AI detects frustration, complex intent, or an explicit request for a human, it immediately routes the conversation to your inbox and notifies the assigned agent."
  },
  {
    question: "Which AI models do you support?",
    answer: "We support industry-leading models including OpenAI's GPT-4o, Anthropic's Claude 3.5 Sonnet, and Gemini 1.5 Pro. You can select the best model for your specific node based on speed, reasoning requirements, and cost."
  },
  {
    question: "How do I connect my existing Shopify or CRM?",
    answer: "FlowStage includes native, one-click integrations for Shopify, Salesforce, HubSpot, and Stripe. You can pull real-time order data, update lead statuses, or trigger refund flows directly from the visual canvas without writing any code."
  },
  {
    question: "Is there a limit on conversations per month?",
    answer: "Our starter plans include a generous allowance of monthly active conversations (MACs). Once you exceed that limit, we charge a low, flat rate per additional conversation. You'll never be hard-capped or cut off."
  },
  {
    question: "How does collision detection work?",
    answer: "When multiple agents are working in the live inbox, FlowStage shows real-time typing indicators and locks conversations that are actively being handled. This ensures two agents never reply to the same customer simultaneously."
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
