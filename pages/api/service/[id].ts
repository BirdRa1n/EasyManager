import { supabase } from "@/supabase/server";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function Handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "GET") {
        res.status(405).json({ name: "Method not allowed", details: "Only GET requests are allowed" });
    }

    const { id } = req.query;

    const { data, error } = await supabase.from("services").select("*,teams(name,location,logo),service_types(name),service_client(*),stores(*)").eq("id", id).maybeSingle();

    if (error) {
        res.status(500).json({ name: "Internal server error", details: error.message });
    }

    const { data: store_address } = await supabase.from("store_address").select("address,zip_code,state,city").eq("store_id", data?.stores?.id).maybeSingle();

    const serviceData = {
        name: data?.name,
        description: data?.description,
        price: data?.price,
        duration: data?.duration,
        custom_attributes: data?.custom_attributes,
        created_at: data?.created_at,
        updated_at: data?.updated_at,
        attachments: data?.attachments,
        status: data?.status,
        service_type: data?.service_types?.name,
        store: {
            name: data?.stores?.name,
            adderess: store_address
        },
        team: data?.teams,
        client: {
            name: data?.service_client[0]?.name ? `${data?.service_client[0]?.name.slice(0, 2)}******` : null,
            email: data?.service_client[0]?.email ? `${data?.service_client[0]?.email.slice(0, 3)}*****${data?.service_client[0]?.email.slice(data?.service_client[0]?.email.indexOf('@') - 1)}` : null,
            phone: data?.service_client[0]?.phone ? `(${data?.service_client[0]?.phone.slice(0, 2)}) *****-${data?.service_client[0]?.phone.slice(8)}` : null,
            address: data?.service_client[0]?.address ? `${data?.service_client[0]?.address.slice(0, 5)}***` : null
        }
    }

    res.status(200).json(serviceData);
}
