import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

export const LoginPage: React.FC = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <motion.div
                className="glass login-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="title-handwritten">CalendarCouple</h1>
                <p className="subtitle">L'espace partagé pour votre aventure amoureuse ✨</p>

                <div className="auth-tabs">
                    <button
                        className={`tab ${!isSignUp ? 'active' : ''}`}
                        onClick={() => setIsSignUp(false)}
                    >
                        Se connecter
                    </button>
                    <button
                        className={`tab ${isSignUp ? 'active' : ''}`}
                        onClick={() => setIsSignUp(true)}
                    >
                        S'inscrire
                    </button>
                </div>

                <form onSubmit={handleAuth} className="auth-form">
                    <div className="input-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <div className="error-msg">{error}</div>}

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Chargement...' : (isSignUp ? "Commencer l'aventure" : "Re-bonjour !")}
                    </button>
                </form>
            </motion.div>

            <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-beige);
          padding: 1rem;
        }
        .login-card {
          width: 100%;
          max-width: 400px;
          padding: 2.5rem;
          text-align: center;
          background: white;
        }
        .title-handwritten {
          color: var(--color-primary-blue);
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }
        .subtitle {
          color: var(--color-grey-blue);
          margin-bottom: 2rem;
        }
        .auth-tabs {
          display: flex;
          margin-bottom: 2rem;
          border-bottom: 2px solid var(--border-glass);
        }
        .tab {
          flex: 1;
          padding: 1rem;
          font-weight: 600;
          color: var(--color-grey-blue);
          border-bottom: 2px solid transparent;
          margin-bottom: -2px;
        }
        .tab.active {
          color: var(--color-primary-blue);
          border-bottom-color: var(--color-primary-blue);
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .input-group {
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .input-group label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-grey-blue);
        }
        .input-group input {
          width: 100%;
          background: var(--color-beige);
        }
        .submit-btn {
          background: var(--color-primary-blue);
          color: white;
          padding: 1rem;
          border-radius: 12px;
          font-weight: 700;
          margin-top: 1rem;
        }
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .error-msg {
          color: var(--color-primary-pink);
          background: rgba(232, 71, 151, 0.1);
          padding: 0.75rem;
          border-radius: 8px;
          font-size: 0.875rem;
        }
      `}</style>
        </div>
    );
};
