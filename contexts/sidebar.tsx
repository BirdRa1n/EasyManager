"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";

// Evita conflito de nomes com a constante
interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  sidebarActiveItem: string;
  setSidebarActiveItem: (item: string) => void;
  sidebarTitle: string;
  setSidebarTitle: (title: string) => void;
}

// Contexto com valor inicial undefined
const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// Provider do contexto
export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarActiveItem, setSidebarActiveItem] = useState("home");
  const [sidebarTitle, setSidebarTitle] = useState("Início");

  useEffect(() => {
    const storedSidebarActiveItem = localStorage.getItem("sidebarActiveItem");
    if (storedSidebarActiveItem) {
      setSidebarActiveItem(storedSidebarActiveItem);
    }
  }, []);

  useEffect(() => {
    if (sidebarActiveItem) {
      localStorage.setItem("sidebarActiveItem", sidebarActiveItem);
    }
  }, [sidebarActiveItem])

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        setCollapsed,
        sidebarActiveItem,
        setSidebarActiveItem,
        sidebarTitle,
        setSidebarTitle
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

// Hook customizado para acessar o contexto
export const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebarContext deve ser usado dentro de SidebarProvider");
  }
  return context;
};