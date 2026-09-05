const fs = require('fs');
let content = fs.readFileSync('components/inbox/conversation-list.tsx', 'utf8');

// Replace the layout styling for the container and filters
const newHeader = `    <div className="flex flex-col h-full bg-[var(--surface-2)]">
      {/* Search Header */}
      <div className="p-3 pb-2 shrink-0">
        <div className="relative group">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--ink-3)] group-focus-within:text-[var(--brand)] transition-colors" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--surface)] border border-[var(--border)] pl-9 pr-3 py-2 text-[13px] rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-[var(--brand)] focus:border-[var(--brand)] transition-all placeholder:text-[var(--ink-3)]"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="px-3 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1 bg-[var(--surface)] p-1 rounded-lg border border-[var(--border)]/50 w-full">
          <FilterButton active={filter === "all"} onClick={() => setFilter("all")} label="All" />
          <FilterButton active={filter === "open"} onClick={() => setFilter("open")} label="Open" />
          <FilterButton active={filter === "closed"} onClick={() => setFilter("closed")} label="Closed" />
          <FilterButton active={filter === "snoozed"} onClick={() => setFilter("snoozed")} label="Snoozed" />
          <FilterButton active={filter === "archived"} onClick={() => setFilter("archived")} label="Archived" />
        </div>
      </div>

      {/* Channel Filters */}
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
        {channels.map((channel) => (
          <button
            key={channel.id}
            onClick={() => setSelectedChannel(channel.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium whitespace-nowrap transition-all duration-200 border",
              selectedChannel === channel.id
                ? "bg-[var(--surface)] border-[var(--border)] text-[var(--ink)] shadow-sm"
                : "bg-transparent border-transparent text-[var(--ink-3)] hover:text-[var(--ink-2)] hover:bg-[var(--surface)]/50"
            )}
          >
            {channel.display_name || channel.platform}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-0.5">
        <AnimatePresence initial={false}>
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-[var(--surface)] flex items-center justify-center mb-4">
                <Search className="h-5 w-5 text-[var(--ink-3)]" />
              </div>
              <p className="text-[13px] font-medium text-[var(--ink-2)]">
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
                    ? "bg-[var(--paper)] shadow-sm border border-[var(--border)] ring-1 ring-black/5 z-10"
                    : "hover:bg-[var(--surface)]/60 hover:border-[var(--border)]/50"
                )}
              >
                {/* Active Indicator */}
                {selectedId === conv.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[var(--brand)] rounded-r-full" />
                )}`;

const listStart = content.indexOf('    <div className="flex flex-col h-full bg-transparent">');
const listEnd = content.indexOf('                {/* Active Glow Indicator */}');
const activeGlowIndicatorEnd = content.indexOf('                <div className="relative shrink-0 mt-1">');

const replaced = content.substring(0, listStart) + newHeader + '\n\n                <div className="relative shrink-0 mt-0.5">' + content.substring(activeGlowIndicatorEnd + 72);

// Fix FilterButton
const newFilterButton = `function FilterButton({
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
}`;
const buttonStart = replaced.indexOf('function FilterButton({');
const buttonEnd = replaced.indexOf('}', replaced.indexOf('</button>')) + 1;
const finalContent = replaced.substring(0, buttonStart) + newFilterButton + replaced.substring(buttonEnd);

fs.writeFileSync('components/inbox/conversation-list.tsx', finalContent);
