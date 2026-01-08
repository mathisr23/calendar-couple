import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export const OnboardingPage: React.FC = () => {
    const { user, profile, refreshProfile, signOut } = useAuth();
    const [step, setStep] = useState<'name' | 'couple'>('name');
    const [name, setName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // If profile name is missing, force name step
    React.useEffect(() => {
        if (profile?.full_name) {
            setStep('couple');
        }
    }, [profile]);

    const handleUpdateName = async () => {
        if (!user || !name.trim()) return;
        setLoading(true);
        setError(null);
        try {
            console.log("Updating profile name to:", name);
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    full_name: name,
                    updated_at: new Date().toISOString()
                })
                .select();

            if (error) throw error;

            console.log("Name updated successfully. Reloading...");

            // Reload profile
            await refreshProfile();

        } catch (err: any) {
            console.error("Update Name Error:", err);
            setError(err.message || "Erreur lors de la sauvegarde du prénom");
        } finally {
            setLoading(false);
        }
    };

    const handleJoinCouple = async () => {
        if (!user || !inviteCode.trim()) return;
        setLoading(true);
        setError(null);
        try {
            console.log("Searching for couple with code:", inviteCode.toUpperCase());

            // 1. Find the couple manually
            const { data: couples, error: searchError } = await supabase
                .from('couples')
                .select('id')
                .eq('invite_code', inviteCode.toUpperCase())
                .limit(1);

            if (searchError) throw searchError;

            if (!couples || couples.length === 0) {
                throw new Error("Code invalide ou introuvable");
            }

            const targetCoupleId = couples[0].id;
            console.log("Couple found!", targetCoupleId);

            // 2. Update my profile manually
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ couple_id: targetCoupleId })
                .eq('id', user.id);

            if (updateError) throw updateError;

            console.log("Profile updated with couple_id. Reloading...");

            // Success! Reload profile
            await refreshProfile();

        } catch (err: any) {
            console.error("Join Error:", err);
            setError(err.message || "Impossible de rejoindre ce couple");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCouple = async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            console.log("Creating new couple with code:", newCode);

            // 1. Create Couple manually
            const { data: newCouple, error: createError } = await supabase
                .from('couples')
                .insert([{ invite_code: newCode }])
                .select()
                .single();

            if (createError) throw createError;
            if (!newCouple) throw new Error("Erreur à la création du couple");

            const coupleId = newCouple.id;
            console.log("Couple created!", coupleId);

            // 2. Update my profile manually
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ couple_id: coupleId })
                .eq('id', user.id);

            if (updateError) throw updateError;

            console.log("Profile updated with new couple_id. Reloading...");

            await refreshProfile();

        } catch (err: any) {
            console.error("Create Error:", err);
            setError(err.message || "Erreur lors de la création");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="onboarding-container">
            <motion.div
                className="glass content-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                {step === 'name' ? (
                    <>
                        <h2 className="title">Comment t'appelles-tu ?</h2>
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Ton prénom..."
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                            <button
                                className="main-btn"
                                onClick={handleUpdateName}
                                disabled={loading}
                            >
                                {loading ? '...' : 'Continuer'}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="title">Rejoins ton partenaire 💑</h2>
                        <div className="options-grid">
                            <div className="option-card">
                                <h3>Créer un espace</h3>
                                <p>Commencer une nouvelle aventure à deux</p>
                                <button
                                    className="main-btn"
                                    onClick={handleCreateCouple}
                                    disabled={loading}
                                >
                                    {loading ? '...' : 'Créer'}
                                </button>
                            </div>

                            <div className="option-card">
                                <h3>Rejoindre</h3>
                                <p>J'ai déjà un code d'invitation</p>
                                <input
                                    type="text"
                                    placeholder="Code (ex: X8K2P1)"
                                    value={inviteCode}
                                    onChange={e => setInviteCode(e.target.value)}
                                    className="code-input"
                                />
                                <button
                                    className="secondary-btn"
                                    onClick={handleJoinCouple}
                                    disabled={loading}
                                >
                                    {loading ? '...' : 'Rejoindre'}
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {error && <div className="error-msg">{error}</div>}
            </motion.div>

            <style>{`
        .onboarding-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .content-card {
          width: 100%;
          max-width: 600px;
          padding: 3rem;
          text-align: center;
          background: white;
        }
        .title {
          color: var(--color-primary-blue);
          font-size: 2rem;
          margin-bottom: 2rem;
          font-family: 'Outfit', sans-serif;
        }
        .input-group {
          display: flex;
          gap: 1rem;
          max-width: 400px;
          margin: 0 auto;
        }
        .input-group input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 8px;
        }
        .options-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }
        .option-card {
          padding: 2rem;
          background: var(--color-beige);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .option-card h3 {
          color: var(--color-primary-blue);
        }
        .main-btn {
          background: var(--color-primary-blue);
          color: white;
          padding: 0.75rem;
          border-radius: 8px;
          font-weight: 700;
        }
        .secondary-btn {
          background: white;
          color: var(--color-primary-blue);
          border: 2px solid var(--color-primary-blue);
          padding: 0.75rem;
          border-radius: 8px;
          font-weight: 700;
        }
        .code-input {
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 2px;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 8px;
        }
        .error-msg {
          margin-top: 2rem;
          color: red;
        }
        @media (max-width: 600px) {
          .options-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
            <style>{`
        /* ... existing styles ... */
        .logout-btn-container {
            position: absolute;
            bottom: 2rem;
            width: 100%;
            text-align: center;
        }
        .logout-link {
            color: #999;
            text-decoration: underline;
            cursor: pointer;
            font-size: 0.9rem;
            background: none;
            border: none;
        }
        .logout-link:hover {
            color: var(--color-primary-blue);
        }
      `}</style>

            <div className="logout-btn-container">
                <button
                    className="logout-link"
                    onClick={async () => {
                        await signOut();
                    }}
                >
                    Se déconnecter (ou recommencer)
                </button>
            </div>
        </div>
    );
};
