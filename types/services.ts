interface ServiceType {
    id: string;
    name: string;
    description?: string;
    created_at: string;
}

interface Service {
    id: string;
    team_id: string;
    store_id?: string;
    name: string;
    description?: string;
    type: string;
    price?: number;
    duration?: string;
    custom_attributes?: any;
    created_at: string;
    updated_at?: string;
    created_by?: string;
}

export type { Service, ServiceType };
