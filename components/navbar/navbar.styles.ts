import { tv } from "@heroui/theme";

export const StyledBurgerButton = tv({
  base: "flex flex-col justify-around w-6 h-6 bg-transparent border-none cursor-pointer padding-0 z-[202] focus:outline-none [&_div]:w-6 [&_div]:h-[2px] [&_div]:bg-default-900 [&_div]:rounded-xl [&-div]:transition-all [&_div]:relative [&_div]:origin-[1px]",
  variants: {
    open: {
      true: [
        "[&_div:first-child]:rotate-45",
        "[&_div:nth-child(2)]:opacity-0",
        "[&_div:last-child]:-rotate-45",
      ],
    },
  },
});