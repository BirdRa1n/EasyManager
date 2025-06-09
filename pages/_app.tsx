import type { AppProps } from "next/app";

import { HeroUIProvider } from "@heroui/system";
import { ToastProvider } from "@heroui/toast";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/router";

import { fontMono, fontSans } from "@/config/fonts";
import { SidebarProvider } from "@/contexts/sidebar";
import { UserProvider } from "@/contexts/user";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (

    <SidebarProvider>
      <HeroUIProvider navigate={router.push}>
        <NextThemesProvider>
          <UserProvider>
            <ToastProvider />
            <Component {...pageProps} />
          </UserProvider>
        </NextThemesProvider>
      </HeroUIProvider>
    </SidebarProvider>
  );
}

export const fonts = {
  sans: fontSans.style.fontFamily,
  mono: fontMono.style.fontFamily,
};
