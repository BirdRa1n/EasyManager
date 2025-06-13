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
}

export type { Service, ServiceType, Store };
