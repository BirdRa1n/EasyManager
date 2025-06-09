"use client";

import { supabase } from "@/supabase/client";
import { addToast, Button, Form, Input, Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from "@heroui/react";
import { User } from "@supabase/supabase-js";
import axios from "axios";
import { useRouter } from "next/router";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface UserContextType {
    user?: User;
    team?: any;
    error?: string;
    setUser: (user: User) => void;
    signOut: () => Promise<void>;
    fetchUser: () => Promise<void>;
    fetchTeam: () => Promise<void>;
    syncLocalData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
    const [user, setUser] = useState<User>();
    const [team, setTeam] = useState<any>();
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

    const fetchTeam = useCallback(async () => {
        try {
            if (!user?.id) return;

            const { data, error } = await supabase
                .from("teams")
                .select("*")
                .eq("created_by", user.id) // Filtra por times criados pelo usuário
                .maybeSingle(); // Usa maybeSingle para lidar com zero resultados

            if (error) throw error;

            if (data) {
                setTeam(data);
                localStorage.setItem("team", JSON.stringify(data));
            } else {
                setTeam(undefined);
                localStorage.removeItem("team");
                onOpen(); // Abre o modal se nenhum time for encontrado
            }
        } catch (error: any) {
            console.error("Error fetching team:", error.message);
            setError(error.message);
            if (error.code === "PGRST116" || error.code === "42P17") {
                onOpen(); // Abre o modal para criar um time
            }
        }
    }, [user?.id, onOpen]);

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
                onClose(); // Fecha o modal após criar o time
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

    const signOut = useCallback(async () => {
        try {
            await supabase.auth.signOut();
            localStorage.clear();
            setUser(undefined);
            setTeam(undefined);
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
            const storedTeam = localStorage.getItem("team");

            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }

            if (storedTeam) {
                setTeam(JSON.parse(storedTeam));
            }

            // Sempre buscar dados atualizados do servidor para garantir consistência
            await fetchUser();
            if (!storedTeam) {
                await fetchTeam();
            }
        } catch (error: any) {
            console.error("Error syncing local data:", error.message);
            setError(error.message);
        }
    }, [fetchUser, fetchTeam]);

    useEffect(() => {
        syncLocalData();
    }, []); // Executa apenas uma vez no carregamento inicial

    const contextValue = useMemo(
        () => ({
            user,
            team,
            setUser,
            error,
            signOut,
            fetchUser,
            fetchTeam,
            syncLocalData,
        }),
        [user, team, error, signOut, fetchUser, fetchTeam, syncLocalData],
    );

    return (
        <UserContext.Provider value={contextValue}>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader className="flex flex-col gap-0">
                                <p className="text-xl font-bold">
                                    Bem vindo, {user?.user_metadata?.first_name || ""} {user?.user_metadata?.last_name || ""}
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
                                            placeholder="Nome da equipe"
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
                                    <Button type="submit" color="primary" radius="md" className="w-full mt-4">
                                        Criar Equipe
                                    </Button>
                                </Form>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
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