import { v4 as uuidv4 } from 'uuid';

export interface ShareItem {
    id: string;
    slug: string;
    content: string;
    password: string | null;
    created_at: string;
}

const STORAGE_KEY = 'share-paste-items';

function generateSlug(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let slug = '';
    for (let i = 0; i < 7; i++) {
        slug += chars[Math.floor(Math.random() * chars.length)];
    }
    return slug;
}

export function getShares(): ShareItem[] {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

function saveShares(items: ShareItem[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function createShare(content: string, password?: string): ShareItem {
    const item: ShareItem = {
        id: uuidv4(),
        slug: generateSlug(),
        content,
        password: password || null,
        created_at: new Date().toISOString(),
    };
    const items = getShares();
    items.unshift(item);
    saveShares(items);
    return item;
}

export function deleteShare(id: string) {
    const items = getShares().filter((i) => i.id !== id);
    saveShares(items);
}

export function getShareBySlug(slug: string): ShareItem | undefined {
    return getShares().find((i) => i.slug === slug);
}
