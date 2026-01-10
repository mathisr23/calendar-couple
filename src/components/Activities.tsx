import { useState } from 'react';
import { Plus, Trash2, Coins, Sparkles, User, UserPlus } from 'lucide-react';
import type { ActivityIdea, Budget, User as UserType } from '../types';
import { ActivitiesWheel } from './ActivitiesWheel';

interface ActivitiesProps {
  activities: ActivityIdea[];
  onAdd: (title: string, budget: Budget) => void;
  onDelete: (id: string) => void;
  currentUserId: string;
  partnerName: string;
  userName: string;
}

export const Activities: React.FC<ActivitiesProps> = ({ activities, onAdd, onDelete, currentUserId, partnerName, userName }) => {
  const [newTitle, setNewTitle] = useState('');
  const [budget, setBudget] = useState<Budget>('low');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAdd(newTitle.trim(), budget);
    setNewTitle('');
  };

  const myActivities = activities.filter(a => a.authorId === currentUserId);
  const partnerActivities = activities.filter(a => a.authorId !== currentUserId);

  const ActivityList = ({ title, list, authorId }: { title: string, list: ActivityIdea[], authorId: UserType }) => (
    <div className={`activity-column ${authorId}`}>
      <div className="column-header">
        <div className="avatar">
          {authorId === 'mathis' ? <User size={20} /> : <UserPlus size={20} />}
        </div>
        <h3>{title}</h3>
      </div>

      <div className="activity-list-container retro-box">
        {list.length === 0 ? (
          <p className="empty-msg">Aucune donnée.</p>
        ) : (
          <ul className="activity-list">
            {list.map(activity => (
              <li key={activity.id} className="activity-item">
                <div className="activity-info">
                  <span className="activity-title">{activity.title}</span>
                  <span className={`budget-pill ${activity.budget}`}>
                    <Coins size={12} />
                    {activity.budget === 'low' ? '€' : '€€€'}
                  </span>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => onDelete(activity.id)}
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  return (
    <div className="activities-page">
      <div className="activity-creation retro-card">
        <form onSubmit={handleSubmit} className="creation-form">
          <div className="input-group">
            <Sparkles size={20} className="icon" />
            <input
              type="text"
              placeholder="NOUVELLE_ACTIVITE..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
          </div>

          <div className="creation-footer">
            <div className="budget-selector">
              <button
                type="button"
                className={`retro-btn budget-btn ${budget === 'low' ? 'active' : ''}`}
                onClick={() => setBudget('low')}
              >
                PETIT_BUDGET
              </button>
              <button
                type="button"
                className={`retro-btn budget-btn ${budget === 'high' ? 'active' : ''}`}
                onClick={() => setBudget('high')}
              >
                GRAND_BUDGET
              </button>
            </div>

            <button type="submit" className="retro-btn add-btn" disabled={!newTitle.trim()}>
              <Plus size={20} />
              AJOUTER
            </button>
          </div>
        </form>
      </div>

      <div className="activities-grid">
        <ActivityList title={userName} list={myActivities} authorId="mathis" />
        <ActivityList title={partnerName} list={partnerActivities} authorId="partner" />
      </div>

      <div className="wheel-section">
        <ActivitiesWheel activities={activities} />
      </div>

      <style>{`
        .activities-page {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          padding-bottom: 5rem;
        }

        .activity-creation {
          padding: 2rem;
          background: #FFF;
          border: var(--retro-border);
          box-shadow: var(--retro-shadow);
        }

        .creation-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .input-group {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.5rem 0;
          border-bottom: 2px dashed var(--retro-dark);
        }

        .input-group .icon {
          color: var(--retro-orange);
        }

        .input-group input {
          flex: 1;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--retro-dark);
          background: transparent;
          border: none;
          box-shadow: none;
          padding: 0;
        }
        .input-group input:focus {
            transform: none;
        }

        .creation-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }

        @media (max-width: 768px) {
            .creation-footer {
                flex-direction: column;
                gap: 1rem;
                align-items: stretch;
            }
            .budget-selector {
                width: 100%;
            }
            .budget-btn {
                flex: 1;
                display: flex;
                justify-content: center;
            }
            .add-btn {
                justify-content: center;
                width: 100%;
            }
            .activity-creation {
                padding: 1rem;
            }
        }

        .budget-selector {
          display: flex;
          gap: 1rem;
        }

        .budget-btn {
            background: #eee;
            padding: 8px 16px;
        }

        .budget-btn.active {
          background: var(--retro-green);
          color: var(--retro-dark);
          box-shadow: inset 2px 2px 0 rgba(0,0,0,0.2);
          transform: translate(2px, 2px);
        }

        .add-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--retro-pink);
          color: white;
        }

        .activities-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2.5rem;
        }

        .activity-column {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .column-header {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border: var(--retro-border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--retro-dark);
          background: #FFF;
        }

        .activity-list-container {
          max-height: 400px;
          overflow-y: auto;
          background: #FFF;
          border: var(--retro-border);
          box-shadow: var(--retro-shadow);
          padding: 1rem;
        }

        .activity-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .activity-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: var(--retro-bg);
          border: 1px solid var(--retro-dark);
        }

        .activity-item:hover {
          background: #FFF;
        }

        .activity-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .activity-title {
          font-family: var(--font-main);
          font-weight: 700;
          text-transform: uppercase;
        }

        .budget-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.85rem;
          font-family: var(--font-display);
          padding: 4px 8px;
          border: 1px solid var(--retro-dark);
          box-shadow: 2px 2px 0px rgba(0,0,0,0.1);
          font-weight: 400; /* VT323 is display font, usually bold enough */
        }

        .budget-pill.low {
          background: var(--retro-green);
          color: var(--retro-dark);
        }

        .budget-pill.high {
          background: var(--retro-orange);
          color: var(--retro-dark);
        }

        .delete-btn {
          color: var(--text-muted);
          opacity: 0.5;
        }

        .activity-item:hover .delete-btn {
          opacity: 1;
        }
        
        .empty-msg {
            font-family: var(--font-display);
            text-align: center;
            opacity: 0.5;
        }

        .wheel-section {
          margin-top: 2rem;
        }

        @media (max-width: 768px) {
          .activities-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
