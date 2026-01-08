import React from 'react';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  inviteCode: string | null;
}

export const Header: React.FC<HeaderProps> = ({ inviteCode }) => {
  const { signOut } = useAuth();

  return (
    <header className="header-container">
      <button onClick={signOut} className="logout-btn" aria-label="Se déconnecter">
        <LogOut size={20} />
      </button>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="header-content"
      >
        <span className="subtitle">NOTRE AVENTURE AMOUREUSE</span>
        <h1 className="main-title">DATE 2026</h1>

        {inviteCode && (
          <div className="invite-code-container">
            <span className="invite-label">Code Partenaire:</span>
            <code className="invite-code" onClick={() => navigator.clipboard.writeText(inviteCode)}>
              {inviteCode}
            </code>
          </div>
        )}
      </motion.div>
      <style>{`
        .header-container {
          position: relative;
          padding: 4rem 2rem 2rem;
          text-align: center;
        }
        .logout-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--color-grey-blue);
          padding: 8px;
          border-radius: 50%;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .logout-btn:hover {
          background: rgba(32, 63, 154, 0.05);
          color: var(--color-primary-blue);
        }
        .subtitle {
          font-size: 0.875rem;
          font-weight: 500;
          letter-spacing: 0.2em;
          color: var(--color-grey-blue);
          text-transform: uppercase;
          margin-bottom: 0.5rem;
          display: block;
        }
        .main-title {
          font-size:clamp(3rem, 10vw, 6rem);
          font-weight: 800;
          margin: 0;
          color: var(--palette-pink);
          letter-spacing: -0.02em;
        }
        .invite-code-container {
          margin-top: 1rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.5);
          padding: 0.5rem 1rem;
          border-radius: 12px;
          font-size: 0.875rem;
        }
        .invite-label {
          color: var(--color-grey-blue);
        }
        .invite-code {
          font-weight: 700;
          color: var(--color-primary-blue);
          letter-spacing: 1px;
          cursor: pointer;
        }
        .invite-code:active {
          transform: scale(0.95);
        }
      `}</style>
    </header>
  );
};
