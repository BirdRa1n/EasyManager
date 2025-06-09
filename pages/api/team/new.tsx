import { supabase } from "@/supabase/server";
import type { NextApiRequest, NextApiResponse } from "next";

interface Team {
    id: string;
    name: string;
    document: string;
    location: string;
    created_at: string;
    created_by?: string;
}

export default async function Handler(req: NextApiRequest, res: NextApiResponse) {
    const { name, location, document } = req.body;
    const authorization = req.headers["authorization"];

    // Validação do cabeçalho de autorização
    if (!authorization || !authorization.startsWith("Bearer ")) {
        return res.status(401).json({ name: "Unauthorized", details: "Missing or invalid authorization header" });
    }

    // Validação do método
    if (req.method !== "POST") {
        return res.status(405).json({ name: "Method not allowed", details: "Only POST requests are allowed" });
    }

    // Validação dos campos de entrada
    if (typeof name !== "string" || name.trim().length === 0 || name.length > 100) {
        return res.status(400).json({ name: "Invalid name", details: "Name must be a non-empty string with up to 100 characters" });
    }
    if (typeof location !== "string" || location.trim().length === 0 || location.length > 100) {
        return res.status(400).json({ name: "Invalid location", details: "Location must be a non-empty string with up to 100 characters" });
    }
    // Extrair e validar o token
    const token = authorization.substring(7);
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
        return res.status(401).json({ name: "Unauthorized", details: error?.message || "Invalid token" });
    }

    const user = data.user;

    // Inserir time com created_by
    const { data: team, error: teamError } = await supabase
        .from("teams")
        .insert({
            name: name.trim(),
            document,
            location: location.trim(),
            created_at: new Date().toISOString(),
            created_by: user.id,
        })
        .select()
        .single() as { data: Team | null; error: any };

    if (teamError || !team) {
        return res.status(500).json({ name: "Internal server error", details: teamError?.message || "Failed to create team" });
    }

    // Inserir membro do time
    const { error: memberError } = await supabase.from("team_members").insert({
        team_id: team.id,
        user_id: user.id,
        role: "admin",
        joined_at: new Date().toISOString(),
    });

    if (memberError) {
        // Reverter a inserção do time para manter consistência
        await supabase.from("teams").delete().eq("id", team.id);
        return res.status(500).json({ name: "Internal server error", details: memberError.message || "Failed to add team member" });
    }

    // Re-selecionar o time para garantir que a RLS permita o acesso
    const { data: finalTeam, error: finalError } = await supabase
        .from("teams")
        .select()
        .eq("id", team.id)
        .single() as { data: Team | null; error: any };

    if (finalError || !finalTeam) {
        // Reverter a inserção do time e do membro em caso de falha na re-seleção
        await supabase.from("team_members").delete().eq("team_id", team.id);
        await supabase.from("teams").delete().eq("id", team.id);
        return res.status(500).json({ name: "Internal server error", details: finalError?.message || "Failed to retrieve team" });
    }

    return res.status(200).json(finalTeam);
}