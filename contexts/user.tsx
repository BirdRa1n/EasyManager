"use client";

import { supabase } from "@/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface UserContextType {
    user?: User;
    error?: string;
    setUser: (user: User) => void;
    signOut: () => Promise<void>;
    fetchUser: () => Promise<void>;
    syncLocalData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User>();
    const [error, setError] = useState<string>("");
    const router = useRouter();

    const fetchUser = useCallback(async () => {
        try {
            const { data, error } = await supabase.auth.getUser();
            if (error) throw error;
            setUser(data.user || undefined);
            localStorage.setItem("user", JSON.stringify(data.user));
        } catch (error: any) {
            console.error("Error fetching user:", error.message);
            setError(error.message);
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
        try {
            const storedUser = localStorage.getItem("user");

            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
            // Sempre buscar dados atualizados do servidor para garantir consistência
            await fetchUser();
        } catch (error: any) {
            console.error("Error syncing local data:", error.message);
            setError(error.message);
        }
    }, [fetchUser]);

    useEffect(() => {
        syncLocalData();
    }, []); // Executa apenas uma vez no carregamento inicial

    const contextValue = useMemo(
        () => ({
            user,
            setUser,
            error,
            signOut,
            fetchUser,
            syncLocalData,
        }),
        [user, error, signOut, fetchUser, syncLocalData],
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