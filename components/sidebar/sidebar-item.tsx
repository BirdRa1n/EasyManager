import usePrimaryColor from "@/constants/Colors";
import { useSidebarContext } from "@/layouts/layout-context";
import clsx from "clsx";
import NextLink from "next/link";
import { ReactNode, useEffect } from "react";

interface Props {
  title: string;
  icon: ReactNode;
  isActive?: boolean;
  href?: string;
  onClick?: () => void;
}

export const SidebarItem = ({ icon, title, isActive, href = "", onClick }: Props) => {
  const { setIsSidebarOpen, sidebarActiveItem, setSidebarTitle } = useSidebarContext();
  const primaryColor = usePrimaryColor();

  useEffect(() => {
    if (isActive) {
      setSidebarTitle(title);
    }
  }, [sidebarActiveItem]);

  const handleClick = () => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false); // Fecha a sidebar em mobile após clicar
    }
    onClick?.();
  };

  return (
    <NextLink
      href={href}
      className="text-default-900 active:bg-none max-w-full"
    >
      <div
        className={clsx(
          "flex gap-2 w-full min-h-[44px] h-full items-center px-3.5 rounded-xl cursor-pointer transition-all duration-150 active:scale-[0.98]",
          isActive
            ? `bg-${primaryColor} [&_svg_path]:fill-white dark:bg-${primaryColor} dark:[&_svg_path]:fill-white`
            : "hover:bg-default-100"
        )}
        onClick={handleClick}
      >
        {icon}
        <span className={clsx(
          isActive ? "text-white" : "text-default-900",
        )}>{title}</span>
      </div>
    </NextLink>
  );
};