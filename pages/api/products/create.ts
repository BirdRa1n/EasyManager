import { supabase } from "@/supabase/server";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { name, description, category_id, identifiers } = req.body;
    const authorization = req.headers["authorization"];

    if (req.method !== "POST") {
        return res.status(405).json({
            name: "Method Not Allowed",
            details: "Apenas requisições POST são permitidas.",
        });
    }

    if (!authorization || !authorization.startsWith("Bearer ")) {
        return res.status(401).json({
            name: "Unauthorized",
            details: "Token de autenticação ausente ou inválido.",
        });
    }

    const token = authorization.substring(7);
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData?.user) {
        return res.status(401).json({
            name: "Unauthorized",
            details: authError?.message || "Token inválido.",
        });
    }

    const user = authData.user;

    if (typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({
            name: "Invalid name",
            details: "O campo 'name' é obrigatório.",
        });
    }

    if (description && typeof description !== "string") {
        return res.status(400).json({
            name: "Invalid description",
            details: "A descrição deve ser uma string.",
        });
    }

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

    // ✅ Inserir produto
    const { data: product, error: productError } = await supabase
        .from("products")
        .insert({
            team_id,
            name: name.trim(),
            description: description?.trim() || null,
            category_id: category_id || null,
            created_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (productError || !product) {
        return res.status(500).json({
            name: "Erro ao criar produto",
            details: productError?.message,
        });
    }

    // ✅ Inserir identificadores opcionais
    if (Array.isArray(identifiers)) {
        const validTypes = ['EAN', 'SKU', 'INTERNAL'];

        const rows = identifiers
            .filter((item: any) => validTypes.includes(item?.type) && typeof item?.code === 'string')
            .map((item: any) => ({
                product_id: product.id,
                type: item.type,
                code: item.code.trim(),
            }));

        if (rows.length > 0) {
            const { error: idError } = await supabase.from("product_identifiers").insert(rows);
            if (idError) {
                console.warn("❗Erro ao adicionar identificadores:", idError.message);
            }
        }
    }

    return res.status(201).json(product);
}
