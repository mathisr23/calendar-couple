import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, PartyPopper, Trash2 } from 'lucide-react';
import type { BucketIdea } from '../types';

interface DateIdeasProps {
  ideas: BucketIdea[];
  onAdd: (text: string) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, completed: boolean) => void;
}

export const DateIdeas: React.FC<DateIdeasProps> = ({ ideas, onAdd, onDelete, onToggle }) => {
  const [newIdea, setNewIdea] = useState('');

  const addIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdea.trim()) return;
    onAdd(newIdea);
    setNewIdea('');
  };

  return (
    <div className="retro-card ideas-container">
      <div className="window-header">
        <div className="header-left">
          <PartyPopper size={20} color="var(--retro-yellow)" />
          <h3>LISTE_ENVIES.TXT</h3>
        </div>
      </div>

      <div className="ideas-content">
        <form onSubmit={addIdea} className="add-idea-form">
          <input
            type="text"
            value={newIdea}
            onChange={(e) => setNewIdea(e.target.value)}
            placeholder="Nouvel objectif..."
          />
          <button type="submit" className="retro-btn add-btn"><Plus size={20} /></button>
        </form>

        <div className="ideas-list">
          <AnimatePresence initial={false}>
            {ideas.map((idea) => (
              <motion.div
                key={idea.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`idea-item ${idea.completed ? 'completed' : ''}`}
              >
                <div className="idea-content" onClick={() => onToggle(idea.id, !idea.completed)}>
                  <div className={`checkbox ${idea.completed ? 'checked' : ''}`} />
                  <span>{idea.text}</span>
                </div>
                <button onClick={() => onDelete(idea.id)} className="delete-btn">
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        .ideas-container {
            height: 100%;
        }
        .header-left {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .ideas-content {
            padding: 1.5rem;
        }
        .add-idea-form {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }
        .add-idea-form input {
          flex: 1;
          font-size: 0.875rem;
        }
        .add-btn {
          background: var(--retro-yellow);
          color: var(--retro-dark);
          width: 42px;
          height: 42px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ideas-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .idea-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem;
          background: white;
          border: 1px solid var(--retro-dark);
          box-shadow: 2px 2px 0px rgba(0,0,0,0.1);
          cursor: pointer;
        }
        .idea-item:hover {
          transform: translateY(-1px);
        }
        .idea-content {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
        }
        .checkbox {
          width: 18px;
          height: 18px;
          border: 2px solid var(--retro-dark);
          transition: var(--transition-smooth);
        }
        .checkbox.checked {
          background: var(--retro-green);
          box-shadow: inset 2px 2px 0px rgba(0,0,0,0.2);
        }
        .idea-item span {
          font-family: var(--font-main);
          font-size: 0.875rem;
          font-weight: 700;
        }

        .idea-item.completed span {
          text-decoration: line-through;
          opacity: 0.5;
        }
        .delete-btn {
          color: var(--text-muted);
          opacity: 0.5;
        }
        .delete-btn:hover {
          color: var(--retro-pink);
          opacity: 1;
        }
      `}</style>
    </div>
  );
};
