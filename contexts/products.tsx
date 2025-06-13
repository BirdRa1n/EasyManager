"use client";
import { supabase } from "@/supabase/client";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTeam } from "./team";

interface ProductsContextType {
    products?: any;
    error?: string;
    setProducts: (team: any) => void;
    fetchProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
    const [products, setProducts] = useState<any>([]);
    const [error, setError] = useState<string>("");
    const { team } = useTeam();

    const fetchProducts = useCallback(async () => {
        try {
            if (!team?.id) return;

            const { data, error } = await supabase.from("products").select(`*,product_identifiers(*),categories(*),store_products (*,stores (*))`).eq("team_id", team.id);
            if (error) throw error;
            setProducts(data);
        } catch (error: any) {
            setError(error.message);
        }
    }, [team]);

    useEffect(() => {
        if (team?.id) {
            fetchProducts();
        }
    }, [team?.id, fetchProducts]);

    useEffect(() => {
        const handleInsertsRequests = async (payload: any) => {
            const newRequest = payload?.new;
            if (!newRequest) return;

            console.log("New request:", newRequest);
        };

        const subscription = supabase
            .channel(`products-${team?.id}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'products',
                filter: `team_id=eq.${team?.id}`
            }, handleInsertsRequests)
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [team?.id]);

    const contextValue = useMemo(
        () => ({
            products,
            error,
            setProducts,
            fetchProducts,
        }),
        [products, error, setProducts, fetchProducts],
    );

    return (
        <ProductContext.Provider value={contextValue}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = () => {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error("useProduct must be used within a ProductProvider");
    }
    return context;
};
