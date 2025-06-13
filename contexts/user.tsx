"use client";

import { supabase } from "@/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface UserContextType {
    user?: User;
    error?: string;
    loading: boolean;
    setUser: (user: User | undefined) => void;
    signOut: () => Promise<void>;
    fetchUser: () => Promise<void>;
    syncLocalData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | undefined>();
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();

    const fetchUser = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.getUser();
            if (error) throw error;
            setUser(data.user || undefined);
            localStorage.setItem("user", JSON.stringify(data.user));
        } catch (error: any) {
            console.error("Error fetching user:", error.message);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const signOut = useCallback(async () => {
        try {
            await supabase.auth.signOut();
            localStorage.clear();
            setUser(undefined);
            setError("");
            router.push("/");
        } catch (error: any) {
            console.error("Error signing out:", error.message);
            setError(error.message);
        }
    }, [router]);

    const syncLocalData = useCallback(async () => {
        setLoading(true);
        try {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
            await fetchUser();
        } catch (error: any) {
            console.error("Error syncing local data:", error.message);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [fetchUser]);

    useEffect(() => {
        syncLocalData();

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_IN" || event === "USER_UPDATED") {
                setUser(session?.user || undefined);
                localStorage.setItem("user", JSON.stringify(session?.user));
            } else if (event === "SIGNED_OUT") {
                setUser(undefined);
                localStorage.removeItem("user");
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [syncLocalData]);

    const contextValue = useMemo(
        () => ({
            user,
            error,
            loading,
            setUser,
            signOut,
            fetchUser,
            syncLocalData,
        }),
        [user, error, loading, signOut, fetchUser, syncLocalData],
    );

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};