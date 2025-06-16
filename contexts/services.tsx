"use client";

import { supabase } from "@/supabase/client";
import { Service, ServiceType } from "@/types/services";
import { addToast } from "@heroui/react";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTeam } from "./team";

interface ServicesContextType {
    services: Service[];
    serviceTypes: ServiceType[];
    selectedService: Service | null;
    error?: string;
    loading: boolean;
    setServices: (services: Service[]) => void;
    setServiceTypes: (serviceTypes: ServiceType[]) => void;
    setSelectedService: (service: Service | null) => void;
    fetchServices: () => Promise<void>;
    fetchServiceTypes: () => Promise<void>;
    fetchService: (id: string) => Promise<void>;
    updateService: (id: string, updates: {
        name: string;
        description?: string;
        type: string;
        price?: number;
        duration?: string;
        store_id?: string;
        custom_attributes?: any;
        attachments?: { file: string; type: string }[];
        status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    }) => Promise<void>
}

const ServicesContext = createContext<ServicesContextType | undefined>(undefined);

export const ServicesProvider = ({ children }: { children: ReactNode }) => {
    const [services, setServices] = useState<Service[]>([]);
    const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const { team } = useTeam();

    const fetchServiceTypes = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("service_types")
                .select("*")
                .eq("team_id", team?.id);

            if (error) throw error;
            setServiceTypes(data || []);
        } catch (error: any) {
            console.error("Error fetching service types:", error.message);
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
    }, [team]);

    const fetchServices = useCallback(async () => {
        setLoading(true);
        try {
            if (!team?.id) return;

            const { data, error } = await supabase
                .from("services")
                .select("*, stores(id, name), service_client(*)")
                .eq("team_id", team.id)
                .order("created_at", { ascending: false })

            if (error) throw error;
            setServices(data || []);
        } catch (error: any) {
            console.error("Error fetching services:", error.message);
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
    }, [team]);

    const fetchService = useCallback(
        async (id: string) => {
            setLoading(true);
            try {
                if (!team?.id) {
                    throw new Error("Team ID is not available");
                }

                const { data, error } = await supabase
                    .from("services")
                    .select("*, stores(id, name), service_client(*)")
                    .eq("id", id)
                    .eq("team_id", team.id)
                    .single();

                if (error) throw error;

                if (data) {
                    setServices((prev: Service[]) => {
                        const updatedServices = prev.filter((s) => s.id !== data.id);
                        return [...updatedServices, data];
                    });
                    setSelectedService(data);
                } else {
                    addToast({
                        title: "Erro",
                        description: "Serviço não encontrado.",
                        color: "danger",
                        timeout: 3000,
                    });
                }
            } catch (error: any) {
                console.error("Error fetching service:", error.message);
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
        },
        [team],
    );

    const updateService = useCallback(
        async (id: string, updates: {
            name: string;
            description?: string;
            type: string;
            price?: number;
            duration?: string;
            store_id?: string;
            custom_attributes?: any;
            attachments?: { file: string; type: string }[];
            status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
        }) => {
            setLoading(true);
            try {
                if (!team?.id) {
                    throw new Error("Team ID is not available");
                }

                // Fetch current service to compare attachments
                const { data: current, error: fetchError } = await supabase
                    .from("services")
                    .select("attachments")
                    .eq("id", id)
                    .eq("team_id", team.id)
                    .single();

                if (fetchError) throw fetchError;

                const currentAttachments = current?.attachments || [];
                const newAttachments = updates.attachments || [];

                // Identify which files were removed
                const removedAttachments = currentAttachments.filter(
                    (old: { file: string }) => !newAttachments.some((n) => n.file === old.file)
                );

                // Delete removed files from storage
                for (const file of removedAttachments) {
                    const filePath = decodeURIComponent(new URL(file.file).pathname.replace(/^\/storage\/v1\/object\/public\/services\//, ""));
                    const { error: deleteError } = await supabase.storage
                        .from("services")
                        .remove([filePath]);

                    if (deleteError) {
                        console.warn("Erro ao remover arquivo do storage:", deleteError.message);
                        // Continue despite storage deletion errors
                    }
                }

                // Update the service in the database
                const { data, error } = await supabase
                    .from("services")
                    .update({
                        name: updates.name,
                        description: updates.description,
                        type: updates.type,
                        price: updates.price,
                        duration: updates.duration,
                        store_id: updates.store_id,
                        custom_attributes: updates.custom_attributes,
                        attachments: updates.attachments,
                        status: updates.status,
                    })
                    .eq("id", id)
                    .eq("team_id", team.id)
                    .select("*, stores(id, name), service_client(*)")
                    .single();

                if (error) throw error;

                if (data) {
                    setServices((prev) => {
                        const updatedServices = prev.filter((s) => s.id !== data.id);
                        return [...updatedServices, data];
                    });
                    setSelectedService(data);
                    addToast({
                        title: "Sucesso",
                        description: "Serviço atualizado com sucesso.",
                        color: "primary",
                        variant: "solid",
                        timeout: 3000,
                    });
                }
            } catch (error: any) {
                console.error("Error updating service:", error.message);
                setError(error.message);
                addToast({
                    title: "Erro",
                    description: error.message,
                    color: "danger",
                    timeout: 3000,
                });
                throw error;
            } finally {
                setLoading(false);
            }
        },
        [team],
    );

    useEffect(() => {
        if (!team?.id) {
            setServices([]);
            return;
        }
        fetchServiceTypes();
        fetchServices();

        const subscription = supabase
            .channel(`services-${team.id}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "services",
                    filter: `team_id=eq.${team.id}`,
                },
                (payload) => {
                    if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
                        setServices((prev) => {
                            const updatedServices = prev.filter((s) => s.id !== payload.new.id);
                            return [...updatedServices, payload.new as Service];
                        });
                    } else if (payload.eventType === "DELETE") {
                        setServices((prev) => prev.filter((s) => s.id !== payload.old.id));
                    }
                },
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [team?.id, fetchServices, fetchServiceTypes]);

    const contextValue = useMemo(
        () => ({
            services,
            serviceTypes,
            selectedService,
            error,
            loading,
            setServices,
            setServiceTypes,
            setSelectedService,
            fetchServices,
            fetchServiceTypes,
            fetchService,
            updateService,
        }),
        [services, serviceTypes, selectedService, error, loading],
    );

    return (
        <ServicesContext.Provider value={contextValue}>
            {children}
        </ServicesContext.Provider>
    );
};

export const useServices = () => {
    const context = useContext(ServicesContext);
    if (!context) {
        throw new Error("useServices must be used within a ServicesProvider");
    }
    return context;
};