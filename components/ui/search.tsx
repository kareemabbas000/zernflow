"use client"

import * as React from "react"
import { Search as SearchIcon } from "lucide-react"

import { Input, InputProps } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface SearchProps extends InputProps {}

const Search = React.forwardRef<HTMLInputElement, SearchProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className={cn("relative", className)}>
        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--ink-3)]" />
        <Input
          type="search"
          placeholder="Search..."
          className="pl-8"
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
Search.displayName = "Search"

export { Search }
