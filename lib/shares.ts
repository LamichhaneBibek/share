export interface ShareItem {
    id: string;
    slug: string;
    content: string;
    password: string | null;
    is_public: number;
    expires_at: string | null;
    created_at: string;
}

