"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Users,
  Settings,
  GitBranch,
  Radio,
  Plug,
  BarChart3,
  Moon,
  Sun,
  User,
  Workflow,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { searchGlobal } from "@/lib/actions/search";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ contacts: any[], flows: any[] }>({ contacts: [], flows: [] });
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  // Listen for open event from Topbar
  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("open-command-palette", handleOpen);
    return () => window.removeEventListener("open-command-palette", handleOpen);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2) {
        setIsSearching(true);
        const data = await searchGlobal(query);
        setResults(data);
        setIsSearching(false);
      } else {
        setResults({ contacts: [], flows: [] });
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", !isDark);
    localStorage.setItem("theme", !isDark ? "dark" : "light");
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput 
        placeholder="Search contacts, flows, or type a command..." 
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>{isSearching ? "Searching..." : "No results found."}</CommandEmpty>
        
        {results.contacts.length > 0 && (
          <CommandGroup heading="Contacts">
            {results.contacts.map((contact) => (
              <CommandItem 
                key={contact.id} 
                onSelect={() => runCommand(() => router.push(`/dashboard/contacts/${contact.id}`))}
              >
                <User className="mr-2 h-4 w-4 text-[var(--success)]" />
                <div className="flex flex-col">
                  <span>{contact.name || "Unknown"}</span>
                  {contact.email && <span className="text-xs text-[var(--ink-3)]">{contact.email}</span>}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results.flows.length > 0 && (
          <CommandGroup heading="Flows">
            {results.flows.map((flow) => (
              <CommandItem 
                key={flow.id} 
                onSelect={() => runCommand(() => router.push(`/dashboard/flows/${flow.id}`))}
              >
                <Workflow className="mr-2 h-4 w-4 text-[var(--lilac)]" />
                <div className="flex flex-col">
                  <span>{flow.name}</span>
                  <span className="text-xs text-[var(--ink-3)] capitalize">{flow.status}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {(!query || query.length < 2) && (
          <>
            <CommandGroup heading="Navigation">
              <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/inbox"))}>
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>Live Inbox</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/contacts"))}>
                <Users className="mr-2 h-4 w-4" />
                <span>Contacts CRM</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/flows"))}>
                <GitBranch className="mr-2 h-4 w-4" />
                <span>Automations</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/broadcasts"))}>
                <Radio className="mr-2 h-4 w-4" />
                <span>Broadcasts</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/analytics"))}>
                <BarChart3 className="mr-2 h-4 w-4" />
                <span>Analytics</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/channels"))}>
                <Plug className="mr-2 h-4 w-4" />
                <span>Channels</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/settings"))}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </CommandItem>
            </CommandGroup>
            
            
            <div className="h-px bg-[var(--border)] my-1 mx-2" />
            
            
            <CommandGroup heading="Actions">
              <CommandItem onSelect={() => runCommand(() => toggleTheme())}>
                <Moon className="mr-2 h-4 w-4 dark:hidden" />
                <Sun className="mr-2 h-4 w-4 hidden dark:block" />
                <span>Toggle Theme</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
