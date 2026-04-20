"use client";

import { createContext, useContext } from "react";
import type { ApiStore } from "@/lib/types";

const StoreContext = createContext<ApiStore | null>(null);

export function StoreProvider({ store, children }: { store: ApiStore | null; children: React.ReactNode }) {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): ApiStore | null {
  return useContext(StoreContext);
}
