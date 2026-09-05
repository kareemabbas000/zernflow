import sys
with open('components/inbox/conversation-list.tsx', 'r') as f:
    text = f.read()

text = text.replace('<div className="flex flex-col h-full bg-transparent">', '<div className="flex flex-col h-full bg-[var(--surface-2)]">')

text = text.replace(
'''      {/* Search Header */}
      <div className="p-4 md:p-6 pb-2 shrink-0">
        <div className="relative group">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-[var(--ink-3)] group-focus-within:text-[var(--brand)] transition-colors" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--surface)] border border-[var(--border)] pl-12 pr-4 py-3 text-[15px] rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent transition-all placeholder:text-[var(--ink-3)] font-medium"
          />
        </div>
      </div>''',
'''      {/* Search Header */}
      <div className="p-3 pb-2 shrink-0">
        <div className="relative group">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--ink-3)] group-focus-within:text-[var(--brand)] transition-colors" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--surface)] border border-[var(--border)] pl-9 pr-3 py-2 text-[13px] rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-[var(--brand)] focus:border-[var(--brand)] transition-all placeholder:text-[var(--ink-3)]"
          />
        </div>
      </div>'''
)

text = text.replace(
'''      {/* Filters */}
      <div className="px-4 md:px-6 py-3 flex items-center justify-between shrink-0 border-b border-[var(--border)]/50">
        <div className="flex items-center gap-1 bg-[var(--surface)] p-1 rounded-xl border border-[var(--border)] w-full">''',
'''      {/* Filters */}
      <div className="px-3 py-2 flex items-center justify-between shrink-0 border-b border-[var(--border)]/50">
        <div className="flex items-center gap-1 bg-[var(--surface)] p-1 rounded-lg border border-[var(--border)]/50 w-full">'''
)

text = text.replace(
'''      {/* Channel Filters */}
      <div className="px-4 md:px-6 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 border-b border-[var(--border)]/50">
        <button
          onClick={() => setSelectedChannel("all")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 border",
            selectedChannel === "all"
              ? "bg-[var(--surface)] border-[var(--border)] text-[var(--ink)] shadow-sm"
              : "bg-transparent border-transparent text-[var(--ink-3)] hover:text-[var(--ink-2)] hover:bg-[var(--surface)]/50"
          )}
        >
          All Channels
        </button>
        {channels.map((channel) => {
          return (
            <button
              key={channel.id}
              onClick={() => setSelectedChannel(channel.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 border",
                selectedChannel === channel.id
                  ? "bg-[var(--surface)] border-[var(--border)] text-[var(--ink)] shadow-sm"
                  : "bg-transparent border-transparent text-[var(--ink-3)] hover:text-[var(--ink-2)] hover:bg-[var(--surface)]/50"
              )}
            >''',
'''      {/* Channel Filters */}
      <div className="px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 border-b border-[var(--border)]/50 bg-[var(--surface-2)]">
        <button
          onClick={() => setSelectedChannel("all")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium whitespace-nowrap transition-all duration-200 border",
            selectedChannel === "all"
              ? "bg-[var(--surface)] border-[var(--border)] text-[var(--ink)] shadow-sm"
              : "bg-transparent border-transparent text-[var(--ink-3)] hover:text-[var(--ink-2)] hover:bg-[var(--surface)]/50"
          )}
        >
          All Channels
        </button>
        {channels.map((channel) => {
          return (
            <button
              key={channel.id}
              onClick={() => setSelectedChannel(channel.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium whitespace-nowrap transition-all duration-200 border",
                selectedChannel === channel.id
                  ? "bg-[var(--surface)] border-[var(--border)] text-[var(--ink)] shadow-sm"
                  : "bg-transparent border-transparent text-[var(--ink-3)] hover:text-[var(--ink-2)] hover:bg-[var(--surface)]/50"
              )}
            >'''
)

text = text.replace(
'''      {/* List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 md:p-4 space-y-1">
        <AnimatePresence initial={false}>
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-[var(--surface)] flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-[var(--ink-3)]" />
              </div>
              <p className="text-[15px] font-medium text-[var(--ink-2)]">
                No conversations found.
              </p>
              <p className="text-sm text-[var(--ink-3)] mt-1">Try adjusting your filters.</p>
            </motion.div>
          ) : (
            filtered.map((conv) => (
              <motion.button
                layout="position"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={conv.id}
                onClick={() => onSelect(conv)}
                className={cn(
                  "w-full text-left p-4 rounded-2xl flex gap-4 transition-all duration-200 relative group items-start",
                  selectedId === conv.id
                    ? "bg-[var(--surface)] shadow-md border border-[var(--border)] ring-1 ring-[var(--brand)]/20 z-10"
                    : "hover:bg-[var(--surface)]/60 border border-transparent hover:border-[var(--border)]/50"
                )}
              >
                {/* Active Glow Indicator */}
                {selectedId === conv.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-[var(--brand)] rounded-r-full shadow-[0_0_8px_var(--brand)]" />
                )}

                <div className="relative shrink-0 mt-1">''',
'''      {/* List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-0.5">
        <AnimatePresence initial={false}>
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-[var(--surface)] flex items-center justify-center mb-3">
                <Search className="h-5 w-5 text-[var(--ink-3)]" />
              </div>
              <p className="text-[14px] font-medium text-[var(--ink-2)]">
                No conversations found.
              </p>
            </motion.div>
          ) : (
            filtered.map((conv) => (
              <motion.button
                layout="position"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={conv.id}
                onClick={() => onSelect(conv)}
                className={cn(
                  "w-full text-left p-3 rounded-lg flex gap-3 transition-all duration-200 relative group items-start border border-transparent",
                  selectedId === conv.id
                    ? "bg-[var(--paper)] shadow-sm border border-[var(--border)] ring-1 ring-[var(--brand)]/10 z-10"
                    : "hover:bg-[var(--surface)]/60 hover:border-[var(--border)]/50"
                )}
              >
                {/* Active Indicator */}
                {selectedId === conv.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[var(--brand)] rounded-r-full" />
                )}

                <div className="relative shrink-0 mt-0.5">'''
)

text = text.replace(
'''function FilterButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 py-1.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200 text-center",
        active
          ? "bg-[var(--paper)] text-[var(--ink)] shadow-sm"
          : "text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]"
      )}
    >
      {label}
    </button>
  );
}''',
'''function FilterButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 py-1 px-2 rounded-md text-[13px] font-medium transition-all duration-200 text-center",
        active
          ? "bg-[var(--paper)] text-[var(--ink)] shadow-sm border border-[var(--border)]/50"
          : "text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]"
      )}
    >
      {label}
    </button>
  );
}'''
)

with open('components/inbox/conversation-list.tsx', 'w') as f:
    f.write(text)
