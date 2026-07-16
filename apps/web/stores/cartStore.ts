"use client";

import { create } from "zustand";

export type CartItem = {
  id: string; // unique cart item key (e.g. menuItemId + serialized options)
  menuItemId: string;
  name: string;
  price: number; // unit price including option additions
  quantity: number;
  selectedOptions?: {
    groupName: string;
    optionName: string;
    price: number;
  }[];
};

export const useCartStore = create<{
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">) => void;
  remove: (id: string) => void;
  clear: () => void;
}>((set) => ({
  items: [],
  add: (item) =>
    set((state) => {
      const existing = state.items.find((candidate) => candidate.id === item.id);
      if (existing) return { items: state.items.map((candidate) => candidate.id === item.id ? { ...candidate, quantity: candidate.quantity + 1 } : candidate) };
      return { items: [...state.items, { ...item, quantity: 1 }] };
    }),
  remove: (id) => set((state) => ({ items: state.items.flatMap((item) => item.id !== id ? [item] : item.quantity > 1 ? [{ ...item, quantity: item.quantity - 1 }] : []) })),
  clear: () => set({ items: [] })
}));
