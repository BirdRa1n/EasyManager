type Store = {
    id: string;
    name: string;
    location: string;
    store_address: { city: string; state: string; address: string; zip_code: string }[];
    store_contacts: { type: string; value: string }[];
};

export default Store;