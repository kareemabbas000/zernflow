"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

export interface Step {
  title: string
  description?: string
}

export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: Step[]
  currentStep: number
}

export function Stepper({
  steps,
  currentStep,
  className,
  ...props
}: StepperProps) {
  return (
    <div className={cn("flex w-full items-center", className)} {...props}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep

        return (
          <React.Fragment key={index}>
            <div className="relative flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                  isCompleted
                    ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                    : isCurrent
                    ? "border-[var(--brand)] text-[var(--brand)] bg-[var(--brand-soft)]"
                    : "border-[var(--border-strong)] text-[var(--ink-3)] bg-[var(--surface)]"
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <div className="absolute top-10 mt-1 flex flex-col items-center justify-center text-center w-24">
                <span
                  className={cn(
                    "text-sm font-medium",
                    isCurrent || isCompleted
                      ? "text-[var(--ink)]"
                      : "text-[var(--ink-3)]"
                  )}
                >
                  {step.title}
                </span>
                {step.description && (
                  <span className="text-xs text-[var(--ink-3)] mt-0.5 line-clamp-1">
                    {step.description}
                  </span>
                )}
              </div>
            </div>

            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-[2px] flex-1 mx-4 transition-colors mb-6",
                  index < currentStep
                    ? "bg-[var(--brand)]"
                    : "bg-[var(--border)]"
                )}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
