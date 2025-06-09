"use client";

import usePrimaryColor from "@/constants/Colors";
import { Switch } from "@heroui/switch";
import { useTheme as useNextTheme } from "next-themes";
import { useEffect, useState } from "react";
import { IoMdMoon } from "react-icons/io";
import { MdOutlineWbSunny } from "react-icons/md";

export const DarkModeSwitch = () => {
  const { setTheme, resolvedTheme } = useNextTheme();
  const primaryColor = usePrimaryColor();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Evita renderizar até estar no cliente

  return (
    <Switch
      size="sm"
      color={primaryColor}
      thumbIcon={({ isSelected, className }) =>
        isSelected ? <IoMdMoon className={className} /> : <MdOutlineWbSunny className={className} />
      }
      isSelected={resolvedTheme === "dark"}
      onValueChange={(e) => setTheme(e ? "dark" : "light")}
    />
  );
};
