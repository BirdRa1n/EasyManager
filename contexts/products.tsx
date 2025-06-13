
"use client";

import { supabase } from "@/supabase/client";
import { default as Product, default as StoreProduct } from "@/types/products";
import { addToast } from "@heroui/react";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTeam } from "./team";

interface ProductsContextType {
    products: Product[];
    selectedProduct: Product | null;
    error?: string;
    loading: boolean;
    setProducts: (products: Product[]) => void;
    setSelectedProduct: (product: Product | null) => void;
    fetchProducts: () => Promise<void>;
    updateProduct: (id: string, updates: { name: string; description: string; store_products: { store_id: string; price: number; stock: number }[] }) => Promise<void>;
    fetchProduct: (id: string) => Promise<void>;
}

const ProductContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const { team } = useTeam();

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            if (!team?.id) return;

            const { data, error } = await supabase
                .from("products")
                .select("*, product_identifiers(*), categories(*), store_products(*, stores(*))")
                .eq("team_id", team.id);
            if (error) throw error;
            setProducts(data || []);
        } catch (error: any) {
            console.error("Error fetching products:", error.message);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [team]);

    const fetchProduct = useCallback(
        async (id: string) => {
            setLoading(true);
            try {
                if (!team?.id) {
                    throw new Error("Team ID is not available");
                }

                const { data, error } = await supabase
                    .from("products")
                    .select("*, product_identifiers(*), categories(*), store_products(*, stores(*))")
                    .eq("id", id)
                    .eq("team_id", team.id)
                    .single();

                if (error) throw error;

                if (data) {
                    setProducts((prev: Product[]) => {
                        const updatedProducts = prev.filter((p) => p.id !== data.id);
                        return [...updatedProducts, data];
                    });
                } else {
                    addToast({
                        title: "Erro",
                        description: "Produto não encontrado.",
                        color: "danger",
                        timeout: 3000,
                    });
                }
            } catch (error: any) {
                console.error("Error fetching product:", error.message);
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
        [team, setProducts, setError, setLoading],
    );

    const updateProduct = useCallback(
        async (id: string, updates: { name: string; description: string; store_products: { store_id: string; price: number; stock: number }[] }) => {
            setLoading(true);
            try {
                if (!team?.id) {
                    throw new Error("Team ID is not available");
                }

                // Atualizar tabela products
                const { data: productData, error: productError } = await supabase
                    .from("products")
                    .update({ name: updates.name, description: updates.description })
                    .eq("id", id)
                    .eq("team_id", team.id)
                    .select("*, product_identifiers(*), categories(*), store_products(*, stores(*))")
                    .single();

                if (productError) throw productError;

                // Atualizar ou inserir store_products
                for (const sp of updates.store_products) {
                    const existing: StoreProduct | undefined = (productData?.store_products as StoreProduct[] | undefined)?.find(
                        (existingSp: StoreProduct) => existingSp.store_id === sp.store_id
                    );
                    if (existing) {
                        // Atualizar store_product existente
                        const { error: spError } = await supabase
                            .from("store_products")
                            .update({ price: sp.price, stock: sp.stock })
                            .eq("id", existing.id)
                            .eq("store_id", sp.store_id);
                        if (spError) throw spError;
                    } else {
                        // Inserir novo store_product
                        const { error: spError } = await supabase
                            .from("store_products")
                            .insert({
                                store_id: sp.store_id,
                                product_id: id,
                                price: sp.price,
                                stock: sp.stock,
                            });
                        if (spError) throw spError;
                    }
                }

                if (productData) {
                    setProducts((prev) => {
                        const updatedProducts = prev.filter((p) => p.id !== productData.id);
                        return [...updatedProducts, productData];
                    });
                    setSelectedProduct(productData);
                    addToast({
                        title: "Sucesso",
                        description: "Produto atualizado com sucesso.",
                        color: "primary",
                        variant: "solid",
                        timeout: 3000,
                    });

                    fetchProduct(id);
                }
            } catch (error: any) {
                console.error("Error updating product:", error.message);
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
        [team, setProducts, setSelectedProduct, setError, setLoading],
    );

    useEffect(() => {
        if (!team?.id) {
            setProducts([]);
            return;
        }

        fetchProducts();

        const subscription = supabase
            .channel(`products-${team.id}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "products",
                    filter: `team_id=eq.${team.id}`,
                },
                (payload) => {
                    if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
                        setProducts((prev) => {
                            const updatedProducts = prev.filter((p) => p.id !== payload.new.id);
                            return [...updatedProducts, payload.new as Product];
                        });
                    } else if (payload.eventType === "DELETE") {
                        setProducts((prev) => prev.filter((p) => p.id !== payload.old.id));
                    }
                },
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [team?.id, fetchProducts]);

    const contextValue = useMemo(
        () => ({
            products,
            selectedProduct,
            error,
            loading,
            setSelectedProduct,
            setProducts,
            fetchProducts,
            fetchProduct,
            updateProduct
        }),
        [products, selectedProduct, error, loading, setSelectedProduct, setProducts, fetchProducts, fetchProduct],
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
        throw new Error("useProducts must be used within a ProductProvider");
    }
    return context;
};
