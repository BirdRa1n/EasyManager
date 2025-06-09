import { supabase } from "@/supabase/server";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { name, location } = req.body;
    const authorization = req.headers["authorization"];

    if (req.method !== "POST") {
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

    if (!name || typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({ error: "Nome da loja é obrigatório" });
    }

    const { data: membership } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("user_id", user.id)
        .single();

    if (!membership?.team_id) {
        return res.status(403).json({ error: "Usuário sem time vinculado" });
    }

    const { data: store, error: storeError } = await supabase
        .from("stores")
        .insert({
            team_id: membership.team_id,
            name: name.trim(),
            location: location?.trim() || null,
            created_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (storeError || !store) {
        return res.status(500).json({ error: storeError?.message || "Erro ao criar loja" });
    }

    return res.status(201).json(store);
}
