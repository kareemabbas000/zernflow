/**
 * UI Store — Responsive layout state and UI preferences.
 *
 * Manages sidebar visibility, mobile detection, contact panel,
 * theme, and other cross-cutting UI concerns.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  // ── Sidebar ─────────────────────────────────────────────────────
  sidebarOpen: boolean;
  sidebarCollapsed: boolean; // Icon-only mode on tablet

  // ── Panels ──────────────────────────────────────────────────────
  contactPanelOpen: boolean;

  // ── Responsive ──────────────────────────────────────────────────
  /** Current breakpoint: 'mobile' | 'tablet' | 'desktop' */
  breakpoint: "mobile" | "tablet" | "desktop";

  // ── Notifications ───────────────────────────────────────────────
  soundEnabled: boolean;

  // ── Actions ─────────────────────────────────────────────────────
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setContactPanelOpen: (open: boolean) => void;
  toggleContactPanel: () => void;
  setBreakpoint: (bp: "mobile" | "tablet" | "desktop") => void;
  setSoundEnabled: (enabled: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebarOpen: false,
      sidebarCollapsed: false,
      contactPanelOpen: true,
      breakpoint: "desktop",
      soundEnabled: true,

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setContactPanelOpen: (open) => set({ contactPanelOpen: open }),
      toggleContactPanel: () =>
        set((s) => ({ contactPanelOpen: !s.contactPanelOpen })),
      setBreakpoint: (bp) => {
        set({
          breakpoint: bp,
          // Auto-close sidebar on mobile, auto-open on desktop
          sidebarOpen: bp === "desktop",
          // Auto-collapse sidebar on tablet
          sidebarCollapsed: bp === "tablet",
          // Auto-close contact panel on mobile
          contactPanelOpen: bp !== "mobile",
        });
      },
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
    }),
    {
      name: "ka-comm-ui",
      // Only persist user preferences, not layout state
      partialize: (state) => ({
        soundEnabled: state.soundEnabled,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);

// ── Selectors ────────────────────────────────────────────────────────────────
export const selectIsMobile = (state: UIState) => state.breakpoint === "mobile";
export const selectIsTablet = (state: UIState) => state.breakpoint === "tablet";
export const selectIsDesktop = (state: UIState) => state.breakpoint === "desktop";
