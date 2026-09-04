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

        {/* ── Components (Phase 2 Preview) ───────────────────────── */}
        <section className="space-y-6 pb-24">
          <h2 className="text-3xl font-display font-bold border-b border-[var(--border-strong)] pb-2">Components (Phase 2)</h2>
          
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            
            {/* Buttons */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <button className="h-10 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)]">Primary</button>
                <button className="h-10 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-[var(--surface-2)] text-[var(--ink)] hover:bg-[var(--border)]">Secondary</button>
                <button className="h-10 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-[var(--border-strong)] hover:bg-[var(--surface-2)]">Outline</button>
                <button className="h-10 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-[var(--danger)] text-white hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]">Destructive</button>
                <button className="h-10 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-[var(--surface-2)]">Ghost</button>
              </div>
            </div>

            {/* Inputs & Controls */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Inputs & Forms</h3>
              <div className="space-y-4 max-w-sm">
                <input placeholder="Default Input" className="flex h-10 w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)] transition-colors placeholder:text-[var(--ink-3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:border-[var(--brand)]" />
                
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 rounded-sm border border-[var(--brand)] bg-[var(--brand)] flex items-center justify-center text-white"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></div>
                  <label className="text-sm font-medium">Checked Checkbox</label>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors bg-[var(--brand)]">
                    <div className="block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform translate-x-5" />
                  </div>
                  <label className="text-sm font-medium">Active Switch</label>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Badges</h3>
              <div className="flex flex-wrap gap-4">
                <span className="inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors bg-[var(--brand)] text-white">Default</span>
                <span className="inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors bg-[var(--success-soft)] text-[var(--success)]">Success</span>
                <span className="inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors bg-[var(--warning-soft)] text-[var(--warning)]">Warning</span>
                <span className="inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors bg-[var(--danger-soft)] text-[var(--danger)]">Error</span>
                <span className="inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors bg-[var(--lilac)] text-[var(--ink)] shadow-[0_0_8px_rgba(200,182,255,0.4)]">AI Agent</span>
              </div>
            </div>

            {/* Cards */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Cards & Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] shadow-sm p-6">
                  <h3 className="font-semibold leading-none tracking-tight mb-2">Default Card</h3>
                  <p className="text-sm text-[var(--ink-3)]">Card content goes here.</p>
                </div>
                
                <div className="rounded-xl border border-[var(--lilac)] bg-gradient-to-br from-[var(--surface)] to-[var(--surface-2)] text-[var(--ink)] shadow-[0_4px_12px_rgba(200,182,255,0.15)] p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="relative flex items-center justify-center h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 bg-[var(--lilac)]"/><span className="inline-block rounded-full h-3 w-3 bg-[var(--lilac)] shadow-[0_0_8px_rgba(200,182,255,0.6)] animate-pulse" /></span>
                    <h3 className="font-semibold leading-none tracking-tight">AI Agent Card</h3>
                  </div>
                  <p className="text-sm text-[var(--ink-3)]">Processing workflow...</p>
                </div>
              </div>
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
