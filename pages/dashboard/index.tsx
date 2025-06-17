"use client";
import Home from "@/components/dashboard/home";
import Products from "@/components/dashboard/products";
import Services from "@/components/dashboard/services/ServiceForm";
import Settings from "@/components/dashboard/settings";
import Stores from "@/components/dashboard/stores";
import { useSidebarContext } from "@/contexts/sidebar";
import { useUser } from "@/contexts/user";
import { Layout } from "@/layouts/layout-sidebar";
import { supabase } from "@/supabase/client";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function DashboardPage() {
    const { sidebarActiveItem } = useSidebarContext();
    const { fetchUser } = useUser();

    const router = useRouter();

    // ⚡️ Troca o código por uma sessão válida
    useEffect(() => {
        const exchangeCode = async () => {
            const url = new URL(window.location.href);
            const code = url.searchParams.get("code");

            if (code) {
                const { data, error } = await supabase.auth.exchangeCodeForSession(code);

                if (error) {
                    router.push("/");
                } else {
                    fetchUser();
                }
            }
        };

        exchangeCode();
    }, []);

    const renderer = () => {
        return (
            <section className="flex flex-col gap-4 p-2 mt-5 py-0 md:py-0">
                <div style={{ display: sidebarActiveItem === "home" ? "block" : "none" }}>
                    <Home />
                </div>
                <div style={{ display: sidebarActiveItem === "products" ? "block" : "none" }}>
                    <Products />
                </div>
                <div style={{ display: sidebarActiveItem === "stores" ? "block" : "none" }}>
                    <Stores />
                </div>
                <div style={{ display: sidebarActiveItem === "services" ? "block" : "none" }}>
                    <Services />
                </div>
                <div style={{ display: sidebarActiveItem === "settings" ? "block" : "none" }}>
                    <Settings />
                </div>
            </section>
        );
    };

    return <Layout>{renderer()}</Layout>;
}
