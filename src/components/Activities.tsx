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

      <div className="activity-list-container">
        {list.length === 0 ? (
          <p className="empty-msg">Aucune idée encore... 💡</p>
        ) : (
          <ul className="activity-list">
            {list.map(activity => (
              <li key={activity.id} className="activity-item glass">
                <div className="activity-info">
                  <span className="activity-title">{activity.title}</span>
                  <span className={`budget-pill ${activity.budget}`}>
                    <Coins size={12} />
                    {activity.budget === 'low' ? 'Petit' : 'Grand'}
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
      <div className="activity-creation glass">
        <form onSubmit={handleSubmit} className="creation-form">
          <div className="input-group">
            <Sparkles size={20} className="icon" />
            <input
              type="text"
              placeholder="Une nouvelle idée de sortie ?"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
          </div>

          <div className="creation-footer">
            <div className="budget-selector">
              <button
                type="button"
                className={`budget-btn ${budget === 'low' ? 'active' : ''}`}
                onClick={() => setBudget('low')}
              >
                € Petit Budget
              </button>
              <button
                type="button"
                className={`budget-btn ${budget === 'high' ? 'active' : ''}`}
                onClick={() => setBudget('high')}
              >
                €€€ Grand Budget
              </button>
            </div>

            <button type="submit" className="add-btn" disabled={!newTitle.trim()}>
              <Plus size={20} />
              Ajouter
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
          gap: 3rem;
          padding-bottom: 5rem;
        }

        .activity-creation {
          padding: 2rem;
          border-radius: 24px;
          background: white;
          box-shadow: 0 10px 40px rgba(32, 63, 154, 0.05);
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
          border-bottom: 2px solid var(--color-beige);
        }

        .input-group .icon {
          color: var(--palette-orange);
        }

        .input-group input {
          flex: 1;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--palette-blue);
        }

        .input-group input::placeholder {
          color: var(--color-pastel-blue);
        }

        .creation-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }

        .budget-selector {
          display: flex;
          gap: 1rem;
          background: var(--color-beige);
          padding: 4px;
          border-radius: 12px;
        }

        .budget-btn {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--color-grey-blue);
          transition: var(--transition-smooth);
        }

        .budget-btn.active {
          background: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        button.budget-btn:nth-of-type(1).active { color: var(--palette-green); }
        button.budget-btn:nth-of-type(2).active { color: var(--palette-orange); }

        .add-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--color-primary-blue);
          color: white;
          padding: 0.75rem 2rem;
          border-radius: 12px;
          font-weight: 800;
          transition: var(--transition-smooth);
        }

        .add-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(32, 63, 154, 0.2);
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
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .mathis .avatar { background: var(--palette-blue); }
        .partner .avatar { background: var(--palette-pink); }

        .column-header h3 {
          font-weight: 800;
          font-size: 1.5rem;
        }
        
        .mathis .column-header h3 { color: var(--palette-blue); }
        .partner .column-header h3 { color: var(--palette-pink); }

        .activity-list-container {
          max-height: 400px;
          overflow-y: auto;
          padding-right: 0.5rem;
        }

        /* Custom Scrollbar */
        .activity-list-container::-webkit-scrollbar {
          width: 6px;
        }
        .activity-list-container::-webkit-scrollbar-track {
          background: var(--color-beige);
          border-radius: 10px;
        }
        .activity-list-container::-webkit-scrollbar-thumb {
          background: var(--color-pastel-blue);
          border-radius: 10px;
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
          padding: 1rem 1.5rem;
          background: white;
          border-radius: 16px;
          border: 1px solid var(--border-glass);
          transition: var(--transition-smooth);
        }

        .activity-item:hover {
          transform: translateX(5px);
          border-color: var(--color-pastel-blue);
        }

        .activity-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .activity-title {
          font-weight: 800;
        }
        .activity-item:nth-child(5n+1) .activity-title { color: var(--palette-blue); }
        .activity-item:nth-child(5n+2) .activity-title { color: var(--palette-pink); }
        .activity-item:nth-child(5n+3) .activity-title { color: var(--palette-green); }
        .activity-item:nth-child(5n+4) .activity-title { color: var(--palette-orange); }
        .activity-item:nth-child(5n+5) .activity-title { color: var(--palette-yellow); }

        .budget-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 100px;
          text-transform: uppercase;
        }

        .budget-pill.low {
          background: rgba(45, 106, 79, 0.1);
          color: #2D6A4F;
        }

        .budget-pill.high {
          background: rgba(245, 121, 59, 0.1);
          color: var(--palette-orange);
        }

        .delete-btn {
          color: var(--color-grey-blue);
          opacity: 0.3;
          transition: var(--transition-smooth);
          padding: 0.5rem;
        }

        .activity-item:hover .delete-btn {
          opacity: 1;
        }

        .delete-btn:hover {
          color: var(--color-primary-pink);
          transform: scale(1.1);
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
