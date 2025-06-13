export interface StoreAddress {
    id: string;
    city: string;
    state: string;
    address: string;
    country: string;
    team_id: string;
    store_id: string;
    zip_code: string;
}

export interface StoreContact {
    id: string;
    type: string;
    value: string;
    team_id: string;
    store_id: string;
}

export default interface Store {
    id: string;
    team_id: string;
    name: string;
    location: string;
    created_at: string;
    store_address: StoreAddress[];
    store_contacts: StoreContact[];
}