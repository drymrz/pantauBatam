import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and Publishable Key harus diisi di environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types untuk TypeScript
export interface Database {
    public: {
        Tables: {
            cameras: {
                Row: {
                    id: string;
                    name: string;
                    streamUrl: string;
                    thumbnail: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    streamUrl: string;
                    thumbnail?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    streamUrl?: string;
                    thumbnail?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
        };
    };
}
