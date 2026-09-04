"use client"

import * as React from "react"
import { motion, useAnimationControls } from "framer-motion"
import Image from "next/image"

const testimonials = [
  {
    id: 1,
    name: "Sarah Jenkins",
    role: "Head of Growth, Acme Corp",
    quote: "We connected WhatsApp and saw a 40% lift in booked demos within week one.",
    metric: "+40% Demos",
    image: "https://i.pravatar.cc/150?u=sarah",
    accent: "bg-[var(--brand)]",
  },
  {
    id: 2,
    name: "Marcus Thorne",
    role: "Founder, Zenith",
    quote: "FlowStage completely replaced our chaotic support inbox. It's just calm now.",
    metric: "-2h First Response",
    image: "https://i.pravatar.cc/150?u=marcus",
    accent: "bg-[var(--lilac)]",
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    role: "Marketing Dir, Bloom",
    quote: "Building logic with visual nodes instead of raw code has empowered my whole team.",
    metric: "10x Deployment",
    image: "https://i.pravatar.cc/150?u=elena",
    accent: "bg-[var(--lime)]",
  },
  {
    id: 4,
    name: "David Chen",
    role: "VP Sales, Pipeline",
    quote: "The AI reply suggestions are shockingly good. Our reps are closing deals faster.",
    metric: "+25% Win Rate",
    image: "https://i.pravatar.cc/150?u=david",
    accent: "bg-[var(--coral)]",
  },
  {
    id: 5,
    name: "Aisha Patel",
    role: "CEO, Nexa",
    quote: "We don't need five different tabs open anymore. It's all in FlowStage.",
    metric: "$20k Saved",
    image: "https://i.pravatar.cc/150?u=aisha",
    accent: "bg-[var(--butter)]",
  },
]

export function MarketingSocialProof({ customContent }: { customContent?: any[] }) {
  const [isHovered, setIsHovered] = React.useState(false)
  const activeTestimonials = customContent?.length ? customContent : testimonials
  const duplicatedTestimonials = [...activeTestimonials, ...activeTestimonials]
  
  return (
    <section className="bg-[var(--bg)] overflow-hidden py-12 border-b border-[var(--border)]">
      <div 
        className="flex gap-6 w-max"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          animate={{ x: isHovered ? 0 : "-50%" }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "linear",
            // If hovered, we want it to pause, but framer motion `animate` with `x: "-50%"` requires a continuous tween.
            // Using a simple CSS marquee is often better, but since we are using framer-motion, we'll let it slide slowly.
          }}
          className="flex gap-6 pl-6"
        >
          {duplicatedTestimonials.map((testimonial, idx) => (
            <div 
              key={`${testimonial.id}-${idx}`} 
              className="w-[380px] shrink-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing flex flex-col justify-between h-[200px]"
            >
              <div className="flex items-start gap-4">
                <div className="relative">
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className={`absolute -inset-1 rounded-full opacity-30 ${testimonial.accent}`} 
                  />
                  <img src={testimonial.image} alt={testimonial.name} className="relative w-12 h-12 rounded-full object-cover border-2 border-[var(--surface)] shadow-sm" />
                </div>
                <div>
                  <h4 className="font-bold text-[var(--text-primary)] text-sm">{testimonial.name}</h4>
                  <p className="text-xs font-medium text-[var(--text-muted)]">{testimonial.role}</p>
                </div>
                <div className="ml-auto">
                  <span className="inline-block bg-[var(--surface-2)] text-[var(--text-secondary)] font-mono text-[11px] px-2 py-1 rounded-md font-bold">
                    {testimonial.metric}
                  </span>
                </div>
              </div>
              <p className="text-[var(--text-secondary)] font-medium text-sm leading-relaxed mt-4">
                &quot;{testimonial.quote}&quot;
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
