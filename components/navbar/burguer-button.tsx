import { useSidebarContext } from "@/layouts/layout-context";
import { StyledBurgerButton } from "./navbar.styles";

export const BurguerButton = () => {
  const { isSidebarOpen, setIsSidebarOpen } = useSidebarContext();

  return (
    <div
      className={StyledBurgerButton({ open: isSidebarOpen })}
      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
    >
      <div />
      <div />
    </div>
  );
};