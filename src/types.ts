
export type User = string; // UUID from Supabase

export interface PlannedDate {
    id: string;
    date: Date;
    endDate?: Date;
    category: 'event' | 'food' | 'surprise' | 'custom';
    title: string;
    customCategoryName?: string;
    authorId: User;
    color?: string;
}

export interface BucketIdea {
    id: string;
    text: string;
    completed: boolean;
}

export type AddressCategory = 'restaurants' | 'pastries' | 'events' | 'travel';

export interface Address {
    id: string;
    name: string;
    category: AddressCategory;
    rating1: number | null;
    rating2: number | null;
    completed: boolean;
}

export type Budget = 'low' | 'high';

export interface ActivityIdea {
    id: string;
    title: string;
    authorId: User;
    budget: Budget;
}
