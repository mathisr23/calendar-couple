import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

type Profile = {
    id: string;
    full_name: string | null;
    couple_id: string | null;
    avatar_url: string | null;
};

type AuthContextType = {
    user: User | null;
    session: Session | null;
    profile: Profile | null;
    loading: boolean;
    refreshProfile: () => Promise<void>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    refreshProfile: async () => { },
    signOut: async () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId: string) => {
        let attempts = 0;
        const maxAttempts = 1; // Optimize: Fail fast to switch to Raw Fetch

        // Try SDK first (with retries)
        while (attempts < maxAttempts) {
            attempts++;
            try {
                console.log(` AuthContext: Fetching profile (SDK Attempt ${attempts}/${maxAttempts})...`);

                // Create a promise that rejects after 800ms (Fail fast)
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Timeout")), 800)
                );

                const dbPromise = supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();

                const { data, error } = await Promise.race([dbPromise, timeoutPromise]) as any;

                if (error) {
                    if (error.code === 'PGRST116') {
                        console.warn("AuthContext: Profile missing (New User).");
                        setProfile(null);
                        return;
                    }
                    throw error;
                }

                console.log("AuthContext: Profile loaded via SDK!", data);
                setProfile(data);
                return;

            } catch (err: any) {
                console.error(`AuthContext: SDK Attempt ${attempts} failed:`, err.message);
                if (attempts === maxAttempts) {
                    console.warn("AuthContext: SDK failed completely. Switching to RAW FETCH fallback.");
                } else {
                    await new Promise(r => setTimeout(r, 500));
                }
            }
        }

        // FALLBACK: Raw Fetch
        try {
            console.log("AuthContext: Attempting RAW FETCH fallback (Using Anon Key)...");

            // @ts-ignore
            const url = supabase.supabaseUrl;
            // @ts-ignore
            const key = supabase.supabaseKey; // Use Anon Key like the working Test Button

            if (!url || !key) throw new Error("Missing Supabase URL/Key");

            // Added 'Accept' header to fix 406 error
            const res = await fetch(`${url}/rest/v1/profiles?id=eq.${userId}&select=*`, {
                headers: {
                    'apikey': key,
                    'Authorization': `Bearer ${key}`, // FORCE ANON KEY
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!res.ok) throw new Error(`Raw Fetch error: ${res.status}`);

            const rows = await res.json();

            if (rows && rows.length > 0) {
                console.log("AuthContext: Profile loaded via RAW FETCH (ANON)!", rows[0]);
                setProfile(rows[0]);
            } else {
                console.warn("AuthContext: Profile missing (Raw Fetch).");
                setProfile(null);
            }

        } catch (rawErr: any) {
            console.error("AuthContext: Raw Fetch Fallback crashed:", rawErr);
        }
    };

    useEffect(() => {
        let mounted = true;
        let lastFetchedId = "";

        // Debounce/Safety wrapper to avoid double-fetching
        const safeFetchProfile = async (userId: string) => {
            if (lastFetchedId === userId) return;
            lastFetchedId = userId;
            await fetchProfile(userId);
        };

        // Initialize session
        const initSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (mounted && session?.user) {
                    setSession(session);
                    setUser(session.user);
                    await safeFetchProfile(session.user.id);
                }
            } catch (error) {
                console.error("Session init error:", error);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        initSession();

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;
            console.log("Auth State Change:", event);

            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                await safeFetchProfile(session.user.id);
            } else if (event === 'SIGNED_OUT') {
                setProfile(null);
                lastFetchedId = "";
            }

            setLoading(false);
        });

        // SAFETY TIMEOUT GLOBAL (12s)
        // Must be longer than fetchProfile retries (3 * 2s + overhead)
        const safetyTimeout = setTimeout(() => {
            if (mounted && loading) {
                console.warn("AuthContext: Force loading false (Safety Timeout)");
                setLoading(false);
            }
        }, 12000);

        return () => {
            mounted = false;
            clearTimeout(safetyTimeout);
            subscription.unsubscribe();
        };
    }, []);

    const refreshProfile = async () => {
        if (user) await fetchProfile(user.id);
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setProfile(null);
        setUser(null);
        setSession(null);
    };

    return (
        <AuthContext.Provider value={{ user, session, profile, loading, refreshProfile, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
