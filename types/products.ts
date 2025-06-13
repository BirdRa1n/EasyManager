export interface ProductIdentifier {
    id: string;
    code: string;
    type: string;
    product_id: string;
}

export interface Category {
    id?: string;
    name?: string;
}

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

export interface Store {
    id: string;
    team_id: string;
    name: string;
    location: string;
    created_at: string;
    store_address: StoreAddress[];
    store_contacts: StoreContact[];
}

export default interface StoreProduct {
    id: string;
    price: number;
    stock: number;
    stores: Store;
    store_id: string;
    created_at: string;
    product_id: string;
}

export default interface Product {
    id: string;
    team_id: string;
    name: string;
    description: string;
    sku: string | null;
    created_at: string;
    category_id: string | null;
    image: string;
    product_identifiers: ProductIdentifier[];
    categories: Category | null;
    store_products: StoreProduct[];
}