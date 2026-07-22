"use client";

import { create } from "zustand";

type User = { id: string; name?: string; email: string; role: string };

const getInitialState = () => {
  if (typeof window !== "undefined") {
    try {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("accessToken");
      if (storedUser && token) {
        return { user: JSON.parse(storedUser), token };
      }
    } catch (_e) {
      // Ignore parsing errors
    }
  }
  return { user: undefined, token: undefined };
};

export const useAuthStore = create<{
  user?: User;
  token?: string;
  setSession: (user: User, token: string) => void;
  logout: () => void;
}>((set) => ({
  ...getInitialState(),
  setSession: (user, token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", token);
      localStorage.setItem("user", JSON.stringify(user));
    }
    set({ user, token });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    }
    set({ user: undefined, token: undefined });
  }
}));
