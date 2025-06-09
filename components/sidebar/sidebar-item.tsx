import NextLink from "next/link";
import React from "react";
import { useSidebarContext } from "@/contexts/sidebar";
import clsx from "clsx";
import usePrimaryColor from "@/constants/Colors";

interface Props {
  title: string;
  icon: React.ReactNode;
  isActive?: boolean;
  href?: string;
  onClick?: () => void;
}

export const SidebarItem = ({ icon, title, isActive, href = "", onClick }: Props) => {
  const { collapsed, setCollapsed } = useSidebarContext();

  const primaryColor = usePrimaryColor();

  const handleClick = () => {
    if (window.innerWidth < 768) {
      setCollapsed(!collapsed);
    }
  };

  return (
    <NextLink
      href={href}
      onClick={onClick}
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
