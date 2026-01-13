import React from 'react';
import { LogOut, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  inviteCode: string | null;
}

export const Header: React.FC<HeaderProps> = ({ inviteCode }) => {
  const { signOut } = useAuth();

  return (
    <header className="header-container">
      <div className="title-block">
        <div className="retro-icon">
          <Heart size={32} fill="var(--retro-pink)" stroke="var(--retro-dark)" strokeWidth={3} className="heart-icon" />
        </div>
        <div>
          <span className="subtitle">RACINE_SYSTEME: PROTOCOLE_AMOUR</span>
          <h1 className="main-title">DATE_2026</h1>
        </div>
      </div>

      <div className="header-actions">
        {inviteCode && (
          <div className="retro-badge">
            <span className="label">CODE:</span>
            <code className="value" onClick={() => navigator.clipboard.writeText(inviteCode)}>
              {inviteCode}
            </code>
          </div>
        )}

        <button onClick={signOut} className="retro-btn logout-btn" aria-label="Se déconnecter">
          <LogOut size={18} /> QUITTER
        </button>
      </div>

      <style>{`
        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: end;
          padding: 2rem 0;
          border-bottom: 2px dashed var(--retro-dark);
          margin-bottom: 3rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .title-block {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .retro-icon {
            background: #FFF;
            border: var(--retro-border);
            box-shadow: var(--retro-shadow);
            padding: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .subtitle {
          font-family: var(--font-main);
          font-size: 0.75rem;
          color: var(--text-muted);
          letter-spacing: 0.1em;
          display: block;
          margin-bottom: 4px;
        }

        .main-title {
          font-family: var(--font-display);
          font-size: 4rem;
          line-height: 0.8;
          color: var(--retro-dark);
          text-shadow: 4px 4px 0px var(--retro-blue);
          margin: 0;
        }

        .header-actions {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .retro-badge {
            background: var(--retro-yellow);
            border: var(--retro-border);
            padding: 4px 8px;
            font-family: var(--font-main);
            font-size: 0.9rem;
            box-shadow: 2px 2px 0px var(--retro-dark);
            display: flex;
            gap: 8px;
            align-items: center;
        }
        
        .retro-badge .value {
            font-weight: 700;
            cursor: pointer;
        }

        .logout-btn {
            display: flex;
            align-items: center;
            gap: 6px;
            background: var(--retro-pink);
            color: #FFF;
            text-shadow: 1px 1px 0 #000;
        }
        
        @media (max-width: 768px) {
            .header-container {
                flex-direction: column;
                align-items: center; /* Center items */
                gap: 1.5rem;
            }
            .title-block {
                flex-direction: column;
                text-align: center;
            }
            .main-title {
                font-size: 2.5rem; /* Smaller title */
            }
            .header-actions {
                width: 100%;
                justify-content: center; /* Center actions */
                flex-wrap: wrap;
                gap: 1rem;
            }
        }
        
        @media (max-width: 400px) {
            .header-container {
                padding: 1rem 0;
                margin-bottom: 1.5rem;
            }
            .main-title {
                font-size: 2rem; /* Even smaller for very small screens */
                text-shadow: 2px 2px 0px var(--retro-blue);
            }
            .subtitle {
                font-size: 0.65rem;
            }
            .retro-icon {
                padding: 6px;
            }
            .heart-icon {
                width: 24px;
                height: 24px;
            }
            .retro-badge {
                font-size: 0.8rem;
                padding: 4px 6px;
            }
            .logout-btn {
                font-size: 0.9rem;
                padding: 8px 12px;
            }
        }
      `}</style>
    </header>
  );
};
