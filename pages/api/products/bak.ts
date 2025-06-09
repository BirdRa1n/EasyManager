import { supabase } from "@/supabase/server";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { name, description, category_id, identifiers } = req.body;
    const token = req.cookies["sb-qxxwfynpyzgpknmzfkxl-auth-token"]?.replace("base64-", "");

    // Validação do token
    if (!token) {
        return res.status(401).json({ name: "Unauthorized", details: "Missing or invalid token" });
    }

    // Extrair e validar o token
    const { data, error: authError } = await supabase.auth.getUser(token);


    if (authError || !data.user) {
        return res.status(401).json({ name: "Unauthorized", details: authError?.message || "Invalid token" });
    }

    const user = data.user;

    // 🔍 Busca o time do usuário
    const { data: membership } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("user_id", user.id)
        .single();

    if (!membership?.team_id) {
        return res.status(403).json({
            name: "Forbidden",
            details: "Usuário não está vinculado a nenhum time.",
        });
    }

    const team_id = membership.team_id;

    // verificar se existe filtros 
    if (name || description || category_id || identifiers) {
        const query = supabase
            .from("products")
            .select("id, name, description, category_id, identifiers(*)")
            .eq("team_id", team_id);

        if (name) query.eq("name", name);
        if (description) query.eq("description", description);
        if (category_id) query.eq("category_id", category_id);

        if (identifiers) {
            // Fetch product IDs matching the identifiers
            const { data: identifierRows, error: identifierError } = await supabase
                .from("product_identifiers")
                .select("product_id")
                .eq("code", identifiers);

            if (identifierError) {
                return res.status(500).json({
                    name: "Internal Server Error",
                    details: identifierError.message,
                });
            }

            const productIds = identifierRows?.map((row) => row.product_id) ?? [];
            if (productIds.length === 0) {
                // No products match, return empty result
                return res.status(200).json([]);
            }
            query.in("id", productIds);
        }

        const { data: products, error } = await query;

        return res.status(error ? 500 : 200).json(error ? error.message : products);
    }

    // se nao houver filtros, retorna todos os produtos do time
    const { data: products, error } = await supabase
        .from("products")
        .select("*, product_identifiers(*), categories(*), store_products(*), stores(*)")
        .eq("team_id", team_id);

    return res.status(error ? 500 : 200).json(error ? error.message : products);
}
