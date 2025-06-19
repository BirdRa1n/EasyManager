interface Team {
    id: string;
    logo?: string;
    name: string;
    document: string;
    location: string;
    created_at: string;
    created_by?: string;
}

interface ImageMeta {
    name: string;
    type: string;
    size: number;
}

interface NewTeamFormData {
    name: string;
    document: string;
    location: string;
    service_types: string[];
    image_buffer: ArrayBuffer | null;
    image_meta: ImageMeta | null;
    image_uri: string | undefined;
}

export type { ImageMeta, NewTeamFormData, Team };
