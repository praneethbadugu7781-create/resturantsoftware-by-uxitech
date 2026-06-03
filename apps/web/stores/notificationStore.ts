"use client";

import { create } from "zustand";

export const useNotificationStore = create<{
  unread: number;
  bump: () => void;
  clear: () => void;
}>((set) => ({
  unread: 0,
  bump: () => set((state) => ({ unread: state.unread + 1 })),
  clear: () => set({ unread: 0 })
}));
