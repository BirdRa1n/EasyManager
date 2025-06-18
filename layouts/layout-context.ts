"use client";

import { createContext, useContext } from "react";

interface SidebarContext {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  sidebarActiveItem: string;
  setSidebarActiveItem: (item: string) => void;
}

export const SidebarContext = createContext<SidebarContext>({
  collapsed: false,
  setCollapsed: () => { },
  sidebarActiveItem: "home",
  setSidebarActiveItem: () => { },
});

export const useSidebarContext = () => {
  return useContext(SidebarContext);
};