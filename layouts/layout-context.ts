"use client";

import { createContext, useContext } from "react";

interface SidebarContext {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  sidebarActiveItem: string;
  setSidebarActiveItem: (item: string) => void;
}

export const SidebarContext = createContext<SidebarContext>({
  isSidebarOpen: false,
  setIsSidebarOpen: () => { },
  sidebarActiveItem: "home",
  setSidebarActiveItem: () => { },
});

export const useSidebarContext = () => {
  return useContext(SidebarContext);
};