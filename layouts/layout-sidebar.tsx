"use client";

import React, { useEffect } from "react";
import { useLockedBody } from "@/hooks/useBodyLock";
import { NavbarWrapper } from "@/components/navbar/navbar";
import { SidebarContext } from "./layout-context";
import { SidebarWrapper } from "@/components/sidebar/sidebar";
import { Head } from "@/layouts/head";
import { useSidebarContext } from "@/contexts/sidebar";

interface Props {
  children: React.ReactNode;
}

export const Layout = ({ children }: Props) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { sidebarActiveItem, setSidebarActiveItem } = useSidebarContext();
  const [_, setLocked] = useLockedBody(false);
  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    setLocked(!sidebarOpen);
  };

  return (
    <SidebarContext.Provider
      value={{
        collapsed: sidebarOpen,
        setCollapsed: handleToggleSidebar,
        sidebarActiveItem,
        setSidebarActiveItem,
      }}>
      <section className="flex h-screen">
        <Head />
        <SidebarWrapper />
        <div className="flex flex-col max-h-[100vh] flex-grow">
          <NavbarWrapper>{children}</NavbarWrapper>
        </div>
      </section>
    </SidebarContext.Provider>
  );
};
