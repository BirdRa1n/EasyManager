"use client";

import NewTeamForm from "@/components/forms/new-team";
import { supabase } from "@/supabase/client";
import Store from "@/types/store";
import { Team } from "@/types/team";
import TeamMember from "@/types/team-member";
import { addToast, Modal, ModalContent, useDisclosure } from "@heroui/react";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useUser } from "./user";

interface TeamContextType {
    team?: Team;
    members?: TeamMember[];
    stores: Store[];
    error?: string;
    loading: boolean;
    setTeam: (team: any) => void;
    fetchTeam: () => Promise<void>;
    fetchMembers: () => Promise<void>;
    fetchStores: () => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider = ({ children }: { children: ReactNode }) => {
    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
    const [team, setTeam] = useState<any>();
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [stores, setStores] = useState<Store[]>([]);
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const { user } = useUser();

    const fetchTeam = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("teams")
                .select("*")
                .maybeSingle();

            if (error) throw error;

            if (data) {
                setTeam(data);
                localStorage.setItem("team", JSON.stringify(data));
            } else {
                onOpen();
                setTeam(undefined);
                localStorage.removeItem("team");
            }
        } catch (error: any) {
            console.error("Error fetching team:", error.message);
            setError(error.message);
            addToast({
                title: "Erro",
                description: error.message,
                color: "danger",
                timeout: 3000,
            });
        } finally {
            setLoading(false);
        }
    }, [onOpen]);

    const fetchMembers = useCallback(async () => {
        try {
            if (!team?.id) return;
            const { data, error } = await supabase.from("team_members").select("*").eq("team_id", team.id);
            if (error) throw error;
            setMembers(data || []);
        } catch (error: any) {
            console.error("Error fetching members:", error.message);
            setError(error.message);
            addToast({
                title: "Erro",
                description: error.message,
                color: "danger",
                timeout: 3000,
            });
        }
    }, [team]);

    const fetchStores = useCallback(async () => {
        try {
            if (!team?.id) return;
            const { data, error } = await supabase
                .from("stores")
                .select("*, store_address!fk_store(*), store_contacts!fk_store(*)")
                .eq("team_id", team.id);

            if (error) throw error;
            setStores(data || []);
        } catch (error: any) {
            console.error("Error fetching stores:", error.message);
            setError(error.message);
            addToast({
                title: "Erro",
                description: error.message,
                color: "danger",
                timeout: 3000,
            });
        }
    }, [team]);

    useEffect(() => {
        if (user?.id) {
            fetchTeam();
        } else {
            setTeam(undefined);
            setMembers([]);
            setStores([]);
            localStorage.removeItem("team");
        }
    }, [user?.id, fetchTeam]);

    useEffect(() => {
        if (team?.id) {
            fetchMembers();
            fetchStores();
        } else {
            setMembers([]);
            setStores([]);
        }
    }, [team?.id, fetchMembers, fetchStores]);

    useEffect(() => {
        const storedTeam = localStorage.getItem("team");
        if (storedTeam) {
            setTeam(JSON.parse(storedTeam));
            fetchTeam();
        }
    }, [fetchTeam]);

    const contextValue = useMemo(
        () => ({
            team,
            members,
            stores,
            error,
            loading,
            setTeam,
            fetchTeam,
            fetchMembers,
            fetchStores,
        }),
        [team, members, stores, error, loading, fetchTeam, fetchMembers, fetchStores],
    );

    return (
        <TeamContext.Provider value={contextValue}>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="full">
                <ModalContent>
                    {() => (
                        <NewTeamForm onClose={onClose} />
                    )}
                </ModalContent>
            </Modal>
            {children}
        </TeamContext.Provider>
    );
};

export const useTeam = () => {
    const context = useContext(TeamContext);
    if (!context) {
        throw new Error("useTeam must be used within a TeamProvider");
    }
    return context;
};