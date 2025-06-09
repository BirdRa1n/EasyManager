import React from "react";
import { useSidebarContext } from "@/contexts/sidebar";
import { StyledBurgerButton } from "./navbar.styles";

export const BurguerButton = () => {
  const { collapsed, setCollapsed } = useSidebarContext();

  return (
    <div
      className={StyledBurgerButton()}
      onClick={() => setCollapsed(!collapsed)}
    >
      <div />
      <div />
    </div>
  );
};
