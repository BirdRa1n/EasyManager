"use client";

import { NavbarWrapper } from "@/components/navbar/navbar";
import { SidebarWrapper } from "@/components/sidebar/sidebar";
import { useSidebarContext } from "@/contexts/sidebar";
import { useLockedBody } from "@/hooks/useBodyLock";
import React from "react";
import { SidebarContext } from "./layout-context";

interface Props {
  children: React.ReactNode;
}

export const Layout = ({ children }: Props) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const { sidebarActiveItem, setSidebarActiveItem } = useSidebarContext();
  const [, setLocked] = useLockedBody(false);

  const handleToggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    setLocked(newState);
  };

  return (
    <SidebarContext.Provider
      value={{
        isSidebarOpen,
        setIsSidebarOpen: handleToggleSidebar,
        sidebarActiveItem,
        setSidebarActiveItem,
      }}
    >
      <section className="flex h-screen">
        <SidebarWrapper />
        <div className="flex flex-col max-h-[100vh] flex-grow overflow-hidden">
          <NavbarWrapper>{children}</NavbarWrapper>
        </div>
      </section>
    </SidebarContext.Provider>
  );
};