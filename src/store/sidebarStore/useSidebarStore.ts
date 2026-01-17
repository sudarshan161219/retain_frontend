import { create } from "zustand";

const STORAGE_KEY = "sidebar-collapsed";

interface SidebarState {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  toggleSidebar: () => void;
  initializeSidebar: () => void;
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
  collapsed: true,

  setCollapsed: (value) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, String(value));
    }
    set({ collapsed: value });
  },

  toggleSidebar: () => {
    const newValue = !get().collapsed;
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, String(newValue));
    }
    set({ collapsed: newValue });
  },

  initializeSidebar: () => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);

    // 👉 if exists, use it; otherwise keep true
    if (stored !== null) {
      set({ collapsed: stored === "true" });
    }
  },
}));
