"use client";

import { create } from "zustand";

type User = { id: string; name?: string; email: string; role: string };

export const useAuthStore = create<{
  user?: User;
  token?: string;
  setSession: (user: User, token: string) => void;
  logout: () => void;
}>((set) => ({
  user: undefined,
  token: undefined,
  setSession: (user, token) => {
    localStorage.setItem("accessToken", token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem("accessToken");
    set({ user: undefined, token: undefined });
  }
}));
