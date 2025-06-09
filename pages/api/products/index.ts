import { supabase } from "@/supabase/server";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Método não permitido" });
    }

    const authCookie = req.cookies["sb-qxxwfynpyzgpknmzfkxl-auth-token"];

    if (!authCookie) {
        return res.status(401).json({ error: "Cookie de autenticação não encontrado" });
    }

    try {
        const cleanedCookie = authCookie.startsWith("base64-") ? authCookie.replace("base64-", "") : authCookie;
        const decodedCookie = JSON.parse(atob(cleanedCookie));
        const accessToken = decodedCookie.access_token;

        if (!accessToken) {
            return res.status(401).json({ error: "Nenhum access_token encontrado no cookie" });
        }

        const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);

        if (userError || !user) {
            return res.status(401).json({ error: userError?.message || "Usuário não encontrado" });
        }

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

        const { data: products, error } = await supabase
            .from("products")
            .select(`
    *,
    product_identifiers(*),
    categories(*),
    store_products (
      *,
      stores (*)
    )
  `)
            .eq("team_id", team_id);

        return res.status(error ? 500 : 200).json(error ? error.message : products);
    } catch (error) {
        console.error("Erro ao processar o cookie ou consultar o usuário:", error);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
}