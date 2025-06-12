import type { AppProps } from "next/app";

import { fontMono, fontSans } from "@/config/fonts";
import { ProductProvider } from "@/contexts/products";
import { SidebarProvider } from "@/contexts/sidebar";
import { TeamProvider } from "@/contexts/team";
import { UserProvider } from "@/contexts/user";
import "@/styles/globals.css";
import { ToastProvider } from "@heroui/react";
import { HeroUIProvider } from "@heroui/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/router";


export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <SidebarProvider>
      <HeroUIProvider navigate={router.push}>
        <NextThemesProvider>
          <UserProvider>
            <TeamProvider>
              <ProductProvider>
                <ToastProvider />
                <Component {...pageProps} />
              </ProductProvider>
            </TeamProvider>
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
