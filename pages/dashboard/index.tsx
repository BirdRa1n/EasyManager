import { useUser } from "@/contexts/user";
import { Layout } from "@/layouts/layout-sidebar";
import { useEffect } from "react";

export default function DashboardPage() {
    const { user, fetchTeam } = useUser();

    useEffect(() => {
        if (user) {
            fetchTeam();
        }
    }, [user]);
    return (
        <Layout>
            <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
                <div className="inline-block max-w-lg text-center justify-center">
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Welcome to your dashboard! Here you can manage your account settings,
                        view analytics, and more.
                    </p>
                </div>
            </section>
        </Layout>
    );
}