with open("components/inbox/conversation-list.tsx", "r") as f:
    text = f.read()

text = text.replace(
'''      {/* Search */}
      <div className="p-4 shrink-0 relative z-10">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-3)] group-focus-within:text-[var(--brand)] transition-colors" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md py-3 pl-11 pr-10 text-[13px] font-medium placeholder:text-[var(--ink-3)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent transition-all shadow-sm"
          />
          {filters.search && (
            <button
              onClick={() => setFilters({ search: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] p-1.5 rounded-full transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 px-4 pb-4 shrink-0 relative z-10 border-b border-[var(--border)]/40">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden min-w-0 pb-1">
          {["all", "open", "closed", "snoozed", "archived"].map((status) => (
            <button
              key={status}
              onClick={() => setFilters({ status: status as any })}
              className={cn(
                "rounded-full px-4 py-1.5 text-[11px] font-bold capitalize transition-all shrink-0 border",
                filters.status === status
                  ? "bg-[var(--surface)] text-[var(--ink)] shadow-md border-[var(--border)]"
                  : "bg-transparent border-transparent text-[var(--ink-2)] hover:bg-[var(--surface)] hover:text-[var(--ink)]",
              )}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Channel Dropdown */}
        <div className="flex items-center gap-2 shrink-0 bg-[var(--surface)]/50 backdrop-blur-sm rounded-xl p-1.5 border border-[var(--border)]/50 w-max">
          <select
            value={filters.channelId}
            onChange={(e) => setFilters({ channelId: e.target.value })}
            className="text-[11px] font-bold bg-transparent px-3 py-1 focus:outline-none text-[var(--ink)] max-w-[140px] truncate shrink-0 cursor-pointer appearance-none"
            title="Filter by connected page or account"
          >
            <option value="all">
              {filters.platform !== "all"
                ? `All ${filters.platform.toUpperCase()}`
                : "All Channels"}
            </option>
            {channelsForActivePlatform.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.name}
              </option>
            ))}
          </select>
          {filters.channelId !== "all" && (
            <button
              onClick={() => setFilters({ channelId: "all" })}
              className="p-1 rounded-full text-[var(--ink-2)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors"
              title="Reset channel filter"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>''',
'''      {/* Search & Status Filters */}
      <div className="flex flex-col gap-2 p-3 shrink-0 relative z-10 border-b border-[var(--border)]/40 bg-[var(--surface-2)]/30">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--ink-3)] group-focus-within:text-[var(--brand)] transition-colors" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-8 text-xs font-medium placeholder:text-[var(--ink-3)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)] focus:border-transparent transition-all shadow-sm"
          />
          {filters.search && (
            <button
              onClick={() => setFilters({ search: "" })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] p-1 rounded-full transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden min-w-0">
          {["all", "open", "closed", "snoozed", "archived"].map((status) => (
            <button
              key={status}
              onClick={() => setFilters({ status: status as any })}
              className={cn(
                "rounded-lg px-3 py-1.5 text-[10.5px] font-bold capitalize transition-all shrink-0 border",
                filters.status === status
                  ? "bg-[var(--surface)] text-[var(--ink)] shadow-sm border-[var(--border)]"
                  : "bg-transparent border-transparent text-[var(--ink-2)] hover:bg-[var(--surface)] hover:text-[var(--ink)]",
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>'''
)

text = text.replace(
'''      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/60 flex flex-col">''',
'''      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto divide-y divide-[var(--border)]/30 flex flex-col pb-[72px] md:pb-0">'''
)

with open("components/inbox/conversation-list.tsx", "w") as f:
    f.write(text)
