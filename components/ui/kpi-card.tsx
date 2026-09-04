import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface KpiCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  description?: string
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  icon?: React.ReactNode
}

export function KpiCard({
  title,
  value,
  description,
  trend,
  trendValue,
  icon,
  className,
  ...props
}: KpiCardProps) {
  return (
    <Card className={cn("", className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-[var(--ink-3)]">
          {title}
        </CardTitle>
        {icon && <div className="text-[var(--ink-3)]">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-[var(--ink)]">{value}</div>
        {(description || trendValue) && (
          <p className="text-xs text-[var(--ink-3)] mt-1 flex items-center gap-1">
            {trendValue && (
              <span
                className={cn(
                  "font-medium",
                  trend === "up" && "text-[var(--success)]",
                  trend === "down" && "text-[var(--danger)]",
                  trend === "neutral" && "text-[var(--ink-3)]"
                )}
              >
                {trend === "up" ? "↑ " : trend === "down" ? "↓ " : ""}
                {trendValue}
              </span>
            )}
            {description && <span>{description}</span>}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
