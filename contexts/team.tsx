"use client";

import { supabase } from "@/supabase/client";
import Store from "@/types/store";
import { Team } from "@/types/team";
import TeamMember from "@/types/team-member";
import { addToast, Avatar, Button, Form, Image, Input, Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from "@heroui/react";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { FaUsers } from "react-icons/fa6";
import { useUser } from "./user";

interface TeamContextType {
    team?: Team;
    members?: TeamMember[];
    stores: Store[];
    error?: string;
    loading: boolean;
    setTeam: (team: any) => void;
    fetchTeam: () => Promise<void>;
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

    const [imageUri, setImageUri] = useState<string>();
    const [imageBuffer, setImageBuffer] = useState<ArrayBuffer | null>(null);
    const [imageMeta, setImageMeta] = useState<{ name: string; type: string; size: number } | null>(null);

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
        }),
        [team, members, stores, error, loading, fetchTeam],
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
                                <Form
                                    onSubmit={async (e) => {
                                        e.preventDefault();

                                        const formData = Object.fromEntries(new FormData(e.currentTarget));
                                        const { location, name, document } = formData;

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
                                            const { data: team, error } = await supabase
                                                .from("teams")
                                                .insert({ name, document, location })
                                                .select("*")
                                                .single();

                                            if (error) throw error;

                                            let imagePath: string | null = null;

                                            const { data: member, error: memberError } = await supabase
                                                .from("team_members")
                                                .insert({
                                                    team_id: team?.id,
                                                    role: 'admin'
                                                });

                                            if (memberError) throw memberError;

                                            if (imageBuffer && imageMeta && imageMeta.size > 0) {
                                                if (!["image/jpeg", "image/png"].includes(imageMeta.type)) {
                                                    await supabase.from("teams").delete().eq("id", team.id);
                                                    addToast({
                                                        title: "Erro ao adicionar equipe",
                                                        description: "A imagem deve ser do tipo JPEG ou PNG.",
                                                        variant: "solid",
                                                        color: "danger",
                                                        timeout: 3000,
                                                    });
                                                    return;
                                                }

                                                if (imageMeta.size > 5 * 1024 * 1024) {
                                                    await supabase.from("teams").delete().eq("id", team.id);
                                                    addToast({
                                                        title: "Erro ao criar equipe",
                                                        description: "A imagem não pode exceder 5MB.",
                                                        variant: "solid",
                                                        color: "danger",
                                                        timeout: 3000,
                                                    });
                                                    return;
                                                }

                                                const fileExt = imageMeta.type.split("/")[1];
                                                const randomName = Math.random().toString(36).substring(2, 15);
                                                imagePath = `${team.id}/logos/${randomName}.${fileExt}`;

                                                const { error: imageError } = await supabase.storage
                                                    .from("team")
                                                    .upload(imagePath, imageBuffer, {
                                                        cacheControl: "3600",
                                                        upsert: false,
                                                        contentType: imageMeta.type,
                                                    })

                                                if (imageError) {
                                                    await supabase.from("teams").delete().eq("id", team.id);
                                                    addToast({
                                                        title: "Erro ao adicionar equipe",
                                                        description: imageError.message,
                                                        variant: "solid",
                                                        color: "danger",
                                                        timeout: 3000,
                                                    });
                                                    return;
                                                }

                                                // get image url
                                                const { data: imageData } = await supabase.storage.from("team").createSignedUrl(imagePath, 31536000);

                                                const { error: updateError } = await supabase
                                                    .from("teams")
                                                    .update({ logo: imageData?.signedUrl })
                                                    .eq("id", team.id);

                                                if (updateError) {
                                                    await supabase.from("teams").delete().eq("id", team.id);
                                                    addToast({
                                                        title: "Erro ao adicionar equipe",
                                                        description: updateError.message,
                                                        variant: "solid",
                                                        color: "danger",
                                                        timeout: 3000,
                                                    });
                                                    return;
                                                }

                                                team.image_path = imagePath;
                                            } else {
                                                console.log("Sem imagem");
                                            }

                                            setTeam(team);
                                            localStorage.setItem("team", JSON.stringify(team));
                                            onClose();
                                        } catch (error: any) {
                                            console.error("Erro ao criar equipe:", error.message);
                                            addToast({
                                                title: "Erro",
                                                description: "Falha ao criar a equipe. Tente novamente.",
                                                color: "danger",
                                                timeout: 3000,
                                            });
                                        }
                                    }}
                                    className="flex flex-col gap-0"
                                >
                                    <div className="w-full flex justify-center">
                                        {imageUri ? (
                                            <Image
                                                src={imageUri}
                                                alt="Logo da equipe"
                                                className="rounded-md max-w-[200px]"
                                                isZoomed
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center gap-2">
                                                <Avatar
                                                    className="rounded-md w-32 h-32"
                                                    showFallback
                                                    fallback={<FaUsers className="w-8 h-8 text-default-500" />}
                                                />
                                                <Input
                                                    name="image"
                                                    size="sm"
                                                    type="file"
                                                    accept="image/jpeg,image/png"
                                                    className="max-w-sm"
                                                    description="Selecione uma imagem JPEG ou PNG para a logo da equipe (máx. 5MB)."
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (
                                                            file &&
                                                            file.size > 0 &&
                                                            ["image/jpeg", "image/png"].includes(file.type) &&
                                                            file.size <= 5 * 1024 * 1024
                                                        ) {
                                                            const reader = new FileReader();
                                                            reader.onload = (event) => {
                                                                const result = event.target?.result;
                                                                if (result && typeof result !== "string") {
                                                                    setImageBuffer(result);
                                                                    setImageMeta({
                                                                        name: file.name,
                                                                        type: file.type,
                                                                        size: file.size,
                                                                    });
                                                                    setImageUri(URL.createObjectURL(file));
                                                                    console.log("Imagem carregada:", file.name);
                                                                } else {
                                                                    console.warn("Resultado inesperado do FileReader:", result);
                                                                }
                                                            };
                                                            reader.onerror = () => {
                                                                addToast({
                                                                    title: "Erro ao ler imagem",
                                                                    description: "Não foi possível ler o arquivo de imagem.",
                                                                    variant: "solid",
                                                                    color: "danger",
                                                                    timeout: 3000,
                                                                });
                                                                setImageUri(undefined);
                                                                setImageBuffer(null);
                                                                setImageMeta(null);
                                                            };
                                                            reader.readAsArrayBuffer(file);
                                                        } else {
                                                            setImageUri(undefined);
                                                            setImageBuffer(null);
                                                            setImageMeta(null);
                                                            if (file) {
                                                                addToast({
                                                                    title: "Erro ao selecionar imagem",
                                                                    description:
                                                                        "Selecione uma imagem válida (JPEG ou PNG, máx. 5MB).",
                                                                    variant: "solid",
                                                                    color: "danger",
                                                                    timeout: 3000,
                                                                });
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>

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