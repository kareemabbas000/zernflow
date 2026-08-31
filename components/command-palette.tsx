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
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

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
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
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
        
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => runCommand(() => toggleTheme())}>
            <Moon className="mr-2 h-4 w-4 dark:hidden" />
            <Sun className="mr-2 h-4 w-4 hidden dark:block" />
            <span>Toggle Theme</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
