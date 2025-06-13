"use client";

import { supabase } from "@/supabase/client";
import Store from "@/types/store";
import TeamMember from "@/types/team-member";
import { addToast, Button, Form, Input, Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from "@heroui/react";
import axios from "axios";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useUser } from "./user";

interface TeamContextType {
    team?: any;
    members?: TeamMember[];
    stores: Store[];
    error?: string;
    loading: boolean;
    setTeam: (team: any) => void;
    fetchTeam: () => Promise<void>;
    createTeam: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider = ({ children }: { children: ReactNode }) => {
    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
    const [team, setTeam] = useState<any>();
    const [members, setMembers] = useState<any[]>([]);
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

    const createTeam = useCallback(
        async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(e.currentTarget));
            const { location, name, document } = data;

            if (!location || !name || !document) {
                addToast({
                    title: "Erro",
                    description: "Por favor, preencha todos os campos.",
                    color: "danger",
                    timeout: 3000,
                });
                return;
            }

            try {
                const { data: sessionData } = await supabase.auth.getSession();
                if (!sessionData?.session?.access_token) {
                    throw new Error("No session token found");
                }

                const response = await axios.post(
                    "/api/team/new",
                    {
                        name,
                        location,
                        document,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${sessionData.session.access_token}`,
                        },
                    },
                );

                setTeam(response.data);
                localStorage.setItem("team", JSON.stringify(response.data));
                onClose();
            } catch (error: any) {
                console.error("Error creating team:", error.message);
                addToast({
                    title: "Erro",
                    description: "Falha ao criar a equipe. Tente novamente.",
                    color: "danger",
                    timeout: 3000,
                });
            }
        },
        [onClose],
    );

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
            createTeam,
        }),
        [team, members, stores, error, loading, fetchTeam, createTeam],
    );

    return (
        <TeamContext.Provider value={contextValue}>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader className="flex flex-col gap-0">
                                <p className="text-xl font-bold">
                                    Bem vindo, {team?.name || user?.email || "Usuário"}
                                </p>
                                <p className="text-sm font-medium text-default-500">
                                    Você ainda não possui uma equipe criada. Preencha o formulário abaixo para criar uma equipe.
                                </p>
                            </ModalHeader>
                            <ModalBody>
                                <Form onSubmit={createTeam} className="flex flex-col gap-0">
                                    <div className="flex flex-row gap-1 w-full">
                                        <Input
                                            isRequired
                                            errorMessage="Por favor, insira um nome válido"
                                            label="Nome"
                                            labelPlacement="outside"
                                            name="name"
                                            placeholder="Nome('.')Nome da equipe"
                                            description="Digite o nome válido para sua equipe."
                                            type="text"
                                        />
                                        <Input
                                            isRequired
                                            errorMessage="Por favor, insira um documento válido"
                                            label="Documento"
                                            labelPlacement="outside"
                                            name="document"
                                            placeholder="Ex: 12.345.678/0001-90"
                                            description="Digite o documento da sua equipe."
                                            type="text"
                                        />
                                    </div>
                                    <Input
                                        isRequired
                                        errorMessage="Por favor, insira uma localização válida"
                                        label="Localização"
                                        labelPlacement="outside"
                                        name="location"
                                        placeholder="Localização da equipe"
                                        description="Digite a localização da sua equipe. Ex: São Paulo, SP."
                                        type="text"
                                    />
                                    <Button type="submit" color="primary" radius="md" className="w-full mt- seksualitas">
                                        Criar Equipe
                                    </Button>
                                </Form>
                            </ModalBody>
                        </>
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