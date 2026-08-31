/**
 * Contacts Store — Zustand-based centralized state for CRM contacts.
 *
 * Manages the current active contact details (for the contact panel),
 * contact tags, notes, and custom fields. Provides optimistic updates
 * for all mutations (adding notes, tagging, etc).
 */

import { create } from "zustand";
import type { Database, Platform } from "@/lib/types/database";

type Contact = Database["public"]["Tables"]["contacts"]["Row"];
type TagRow = Database["public"]["Tables"]["tags"]["Row"];
type CustomFieldDef = Database["public"]["Tables"]["custom_field_definitions"]["Row"];

export interface NoteRow {
  id: string;
  author_name: string | null;
  content: string;
  created_at: string;
}

export interface ContactDetails {
  contact: Contact;
  tags: TagRow[];
  customFields: { definition: CustomFieldDef; value: string }[];
  channels: {
    platform: Platform;
    platform_username: string | null;
    platform_sender_id?: string;
  }[];
  conversationId?: string;
  isAutomationPaused?: boolean;
}

interface ContactsState {
  // ── Active Contact Details ──────────────────────────────────────
  activeContactId: string | null;
  activeContactDetails: ContactDetails | null;
  activeContactNotes: NoteRow[];
  isLoadingDetails: boolean;

  // ── Actions ─────────────────────────────────────────────────────
  setActiveContactId: (id: string | null) => void;
  setDetails: (details: ContactDetails | null) => void;
  setNotes: (notes: NoteRow[]) => void;
  setIsLoadingDetails: (loading: boolean) => void;

  // ── Optimistic Mutations ────────────────────────────────────────
  addOptimisticTag: (tag: TagRow) => void;
  removeOptimisticTag: (tagId: string) => void;
  addOptimisticNote: (note: NoteRow) => void;
  removeOptimisticNote: (noteId: string) => void;
  addOptimisticCustomField: (definition: CustomFieldDef, value: string) => void;
  setAutomationPaused: (paused: boolean) => void;
}

export const useContactsStore = create<ContactsState>((set, get) => ({
  activeContactId: null,
  activeContactDetails: null,
  activeContactNotes: [],
  isLoadingDetails: false,

  setActiveContactId: (id) => set({ activeContactId: id }),
  setDetails: (details) => set({ activeContactDetails: details }),
  setNotes: (notes) => set({ activeContactNotes: notes }),
  setIsLoadingDetails: (loading) => set({ isLoadingDetails: loading }),

  addOptimisticTag: (tag) =>
    set((state) => {
      if (!state.activeContactDetails) return state;
      return {
        activeContactDetails: {
          ...state.activeContactDetails,
          tags: [...state.activeContactDetails.tags, tag],
        },
      };
    }),

  removeOptimisticTag: (tagId) =>
    set((state) => {
      if (!state.activeContactDetails) return state;
      return {
        activeContactDetails: {
          ...state.activeContactDetails,
          tags: state.activeContactDetails.tags.filter((t) => t.id !== tagId),
        },
      };
    }),

  addOptimisticNote: (note) =>
    set((state) => ({
      activeContactNotes: [note, ...state.activeContactNotes],
    })),

  removeOptimisticNote: (noteId) =>
    set((state) => ({
      activeContactNotes: state.activeContactNotes.filter((n) => n.id !== noteId),
    })),

  addOptimisticCustomField: (definition, value) =>
    set((state) => {
      if (!state.activeContactDetails) return state;
      const existingIdx = state.activeContactDetails.customFields.findIndex(
        (cf) => cf.definition.id === definition.id
      );
      
      const newCustomFields = [...state.activeContactDetails.customFields];
      if (existingIdx >= 0) {
        newCustomFields[existingIdx] = { definition, value };
      } else {
        newCustomFields.push({ definition, value });
      }

      return {
        activeContactDetails: {
          ...state.activeContactDetails,
          customFields: newCustomFields,
        },
      };
    }),

  setAutomationPaused: (paused) =>
    set((state) => {
      if (!state.activeContactDetails) return state;
      return {
        activeContactDetails: {
          ...state.activeContactDetails,
          isAutomationPaused: paused,
        },
      };
    }),
}));
