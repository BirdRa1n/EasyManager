import Home from "@/constants/dashboard/home";
import Products from "@/constants/dashboard/products";
import Settings from "@/constants/dashboard/settings";
import { useSidebarContext } from "@/contexts/sidebar";
import { Layout } from "@/layouts/layout-sidebar";

export default function DashboardPage() {
    const { sidebarActiveItem } = useSidebarContext();

    const renderer = () => {
        return (
            <section className="flex flex-col gap-4 p-6 mt-5 py-0 md:py-0">
                <div style={{ display: sidebarActiveItem === "home" ? "block" : "none" }}>
                    <Home />
                </div>
                <div style={{ display: sidebarActiveItem === "products" ? "block" : "none" }}>
                    {<Products />}
                </div>
                <div style={{ display: sidebarActiveItem === "settings" ? "block" : "none" }}>
                    {<Settings />}
                </div>
            </section>
        )
    };

    return (
        <Layout>
            {renderer()}
        </Layout>
    );
}