import { supabase } from "@/supabase/server";
import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Função para obter o usuário a partir do cookie de autenticação
export async function getUserFromCookie(): Promise<User | null> {
    // Obter o cookie de autenticação
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("sb-qxxwfynpyzgpknmzfkxl-auth-token")?.value;

    if (!authCookie) {
        console.error("Cookie de autenticação não encontrado");
        return null;
    }

    try {
        // Decodificar o cookie (JSON codificado em base64)
        const cleanedCookie = authCookie.startsWith("base64-") ? authCookie.replace("base64-", "") : authCookie;
        const decodedCookie = JSON.parse(atob(cleanedCookie));
        const accessToken = decodedCookie.access_token;

        if (!accessToken) {
            console.error("Nenhum access_token encontrado no cookie");
            return null;
        }

        // Consultar o usuário usando o access_token
        const { data: { user }, error } = await supabase.auth.getUser(accessToken);

        if (error || !user) {
            console.error("Erro ao consultar usuário:", error?.message || "Usuário não encontrado");
            return null;
        }

        return user;
    } catch (error) {
        console.error("Erro ao processar o cookie ou consultar o usuário:", error);
        return null;
    }
}