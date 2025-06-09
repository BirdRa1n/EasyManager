import { supabase } from "@/supabase/server";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { store_id, product_id, price, stock, min_stock } = req.body;
    const authorization = req.headers["authorization"];

    if (req.method !== "PATCH") {
        return res.status(405).json({ error: "Método não permitido" });
    }

    if (!authorization || !authorization.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Token ausente ou inválido" });
    }

    const token = authorization.substring(7);
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData?.user) {
        return res.status(401).json({ error: authError?.message || "Token inválido" });
    }

    const user = authData.user;

    if (!store_id || !product_id || typeof price !== "number") {
        return res.status(400).json({ error: "Campos obrigatórios: store_id, product_id, price" });
    }

    const { data: membership } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("user_id", user.id)
        .single();

    if (!membership?.team_id) {
        return res.status(403).json({ error: "Usuário sem time vinculado" });
    }

    const { data: store } = await supabase
        .from("stores")
        .select("id, team_id")
        .eq("id", store_id)
        .single();

    if (!store || store.team_id !== membership.team_id) {
        return res.status(403).json({ error: "Loja não pertence ao time do usuário" });
    }

    const { data: record, error: updateError } = await supabase
        .from("store_products")
        .upsert({
            store_id,
            product_id,
            price,
            stock: stock ?? 0,
            min_stock: min_stock ?? 0,
            updated_at: new Date().toISOString(),
        }, { onConflict: "store_id,product_id" })
        .select()
        .single();

    if (updateError || !record) {
        return res.status(500).json({ error: updateError?.message || "Erro ao atualizar produto na loja" });
    }

    return res.status(200).json(record);
}
