"use client";

import { supabase } from "@/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface UserContextType {
    user?: User;
    team?: any;
    setUser: (user: User) => void;
    signOut: () => Promise<void>;
    fetchUser: () => Promise<void>;
    fetchTeam: () => Promise<void>;
    syncLocalData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User>();
    const [team, setTeam] = useState<any>();
    const router = useRouter();

    const fetchUser = useCallback(async () => {
        try {
            const { data, error } = await supabase.auth.getUser();
            if (error) throw error;
            setUser(data.user);
        } catch (error) {
            console.log('Error fetching user:', error);
        }
    }, []);

    const signOut = useCallback(async () => {
        try {
            await supabase.auth.signOut();
            localStorage.clear();
            router.push('/');
        } catch (error) {
            console.log('Error signing out:', error);
        }
    }, [router]);

    const fetchTeam = useCallback(async () => {
        try {
            if (user?.id) await fetchUser();

            const { data, error } = await supabase.from("teams").select("*").single();
            if (error) throw error;

            setTeam(data);
        } catch (error) {
            console.error('Error fetching teams:', error);
        }
    }, [user?.id]);

    const syncLocalData = useCallback(async () => {
        try {
            const storedUser = localStorage.getItem('user');
            const storedTeam = localStorage.getItem('team');

            if (storedUser) {
                setUser(JSON.parse(storedUser));
            } else {
                await fetchUser();
            }

            if (storedTeam) {
                setTeam(JSON.parse(storedTeam));
            } else if (team.length > 0) {
                setTeam(team);
            }
        } catch (error) {
            console.log('Error syncing local data:', error);
        }
    }
        , [fetchUser, fetchTeam, team]);


    useEffect(() => {
        syncLocalData();
    }, [syncLocalData]);

    const contextValue = useMemo(() => ({
        user,
        team,
        setUser,
        signOut,
        fetchUser,
        fetchTeam,
        syncLocalData
    }), [user, team, fetchUser, fetchTeam, signOut]);

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