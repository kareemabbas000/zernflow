"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export default function StyleGuide() {
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] font-sans p-8 md:p-16 selection:bg-[var(--brand-soft)] selection:text-[var(--brand-hover)]">
      <div className="max-w-6xl mx-auto space-y-16">
        <header className="flex items-center justify-between border-b border-[var(--border)] pb-8">
          <div>
            <h1 className="text-5xl font-display font-bold tracking-tight">Style Guide</h1>
            <p className="text-xl text-[var(--ink-3)] mt-2 font-medium">FlowStage Phase 1: Tokens & Typography</p>
          </div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-10 w-10 flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </header>

        {/* ── Colors ────────────────────────────────────────────── */}
        <section className="space-y-6">
          <h2 className="text-3xl font-display font-bold border-b border-[var(--border-strong)] pb-2">Colors</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Core (Ink & Surfaces)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <ColorBox name="--ink" />
                <ColorBox name="--ink-2" />
                <ColorBox name="--ink-3" />
                <ColorBox name="--paper" />
                <ColorBox name="--surface" />
                <ColorBox name="--surface-2" />
                <ColorBox name="--border" />
                <ColorBox name="--border-strong" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Brand</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ColorBox name="--brand" />
                <ColorBox name="--brand-hover" />
                <ColorBox name="--brand-soft" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Accents</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <ColorBox name="--lime" />
                <ColorBox name="--coral" />
                <ColorBox name="--lilac" />
                <ColorBox name="--butter" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Status & Feedback</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                <ColorBox name="--success" />
                <ColorBox name="--success-soft" />
                <ColorBox name="--warning" />
                <ColorBox name="--warning-soft" />
                <ColorBox name="--danger" />
                <ColorBox name="--danger-soft" />
                <ColorBox name="--info" />
                <ColorBox name="--info-soft" />
              </div>
            </div>
          </div>
        </section>

        {/* ── Typography ──────────────────────────────────────────── */}
        <section className="space-y-6">
          <h2 className="text-3xl font-display font-bold border-b border-[var(--border-strong)] pb-2">Typography</h2>
          
          <div className="space-y-8">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[var(--ink-3)] uppercase tracking-wider">Display (Gabarito)</h3>
              <div className="font-display font-bold text-6xl">The quick brown fox jumps.</div>
              <div className="font-display font-bold text-4xl">The quick brown fox jumps.</div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[var(--ink-3)] uppercase tracking-wider">UI / Body (Plus Jakarta Sans)</h3>
              <div className="font-sans font-normal text-base">The quick brown fox jumps over the lazy dog.</div>
              <div className="font-sans font-medium text-lg">The quick brown fox jumps over the lazy dog.</div>
              <div className="font-sans font-semibold text-xl">The quick brown fox jumps over the lazy dog.</div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[var(--ink-3)] uppercase tracking-wider">Numbers & Code (JetBrains Mono)</h3>
              <div className="font-mono font-medium text-sm">const status = "ONLINE"; // 1,234,567 users</div>
              <div className="font-mono font-medium text-2xl">49,591</div>
            </div>
          </div>
        </section>

        {/* ── Radii & Shadows ─────────────────────────────────────── */}
        <section className="space-y-6">
          <h2 className="text-3xl font-display font-bold border-b border-[var(--border-strong)] pb-2">Radii & Shadows</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[var(--surface)] border border-[var(--border)] p-6 shadow-sm rounded-sm">
              <div className="text-sm font-mono font-medium">--radius-sm (8px)</div>
              <div className="text-sm text-[var(--ink-3)] mt-1">--shadow-sm (Cards)</div>
            </div>
            
            <div className="bg-[var(--surface)] border border-[var(--border)] p-6 shadow-md rounded-md">
              <div className="text-sm font-mono font-medium">--radius-md (12px)</div>
              <div className="text-sm text-[var(--ink-3)] mt-1">--shadow-md (Dropdowns)</div>
            </div>
            
            <div className="bg-[var(--surface)] border border-[var(--border)] p-6 shadow-lg rounded-lg">
              <div className="text-sm font-mono font-medium">--radius-lg (16px)</div>
              <div className="text-sm text-[var(--ink-3)] mt-1">--shadow-lg (Modals)</div>
            </div>
            
            <div className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-xl">
              <div className="text-sm font-mono font-medium">--radius-xl (20px)</div>
            </div>
            
            <div className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-2xl">
              <div className="text-sm font-mono font-medium">--radius-2xl (28px)</div>
            </div>
          </div>
        </section>

        {/* ── Motion ─────────────────────────────────────────────── */}
        <section className="space-y-6">
          <h2 className="text-3xl font-display font-bold border-b border-[var(--border-strong)] pb-2">Motion</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-lg animate-fade-up">
              <div className="text-sm font-mono font-medium">animate-fade-up</div>
              <div className="text-sm text-[var(--ink-3)] mt-1">Marketing fade (400-500ms)</div>
            </div>

            <div className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-lg animate-float">
              <div className="text-sm font-mono font-medium">animate-float</div>
              <div className="text-sm text-[var(--ink-3)] mt-1">Hovering floating state</div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

function ColorBox({ name }: { name: string }) {
  return (
    <div className="space-y-2">
      <div 
        className="h-20 w-full rounded-md border border-[var(--border)] shadow-sm"
        style={{ backgroundColor: `var(${name})` }}
      />
      <div className="text-xs font-mono font-medium text-[var(--ink)]">{name}</div>
    </div>
  );
}
