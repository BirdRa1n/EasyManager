import { Client } from "./client";

interface ServiceType {
    id: string;
    name: string;
    description?: string | null;
    created_at: string;
}

interface Store {
    id: string;
    name: string;
}

interface Service {
    id: string;
    team_id: string;
    store_id?: string | null;
    name: string;
    description?: string | null;
    type_id: string;
    type?: string | null;
    price?: number | null;
    duration?: string | null;
    custom_attributes?: Record<string, unknown> | null;
    created_at: string;
    updated_at?: string | null;
    created_by?: string | null;
    attachments?: { file: string; type: string }[] | null;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    service_types?: ServiceType;
    stores?: Store;
    service_client?: Client[];
}

interface FormDataType {
    name: string;
    description: string;
    type_id: string;
    price: number | null;
    duration: string | null;
    store_id: string | null;
    custom_attributes: { key: string; value: string }[];
    attachments: { file: string | File; type: string }[];
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_address: string;
}

interface NewFormDataType {
    name: string;
    description: string;
    type_id: string;
    price: string;
    duration: string;
    store_id: string;
    custom_attributes: { key: string; value: string }[];
    attachments: { file: File; type: string }[];
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_address: string;
}

interface CustomAttribute {
    key: string;
    value: string;
}

export type { CustomAttribute, FormDataType, NewFormDataType, Service, ServiceType, Store };
