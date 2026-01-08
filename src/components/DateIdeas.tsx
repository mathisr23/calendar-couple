import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, PartyPopper, Trash2 } from 'lucide-react';
import type { BucketIdea } from '../types';

interface DateIdeasProps {
  ideas: BucketIdea[];
  setIdeas: React.Dispatch<React.SetStateAction<BucketIdea[]>>;
}

export const DateIdeas: React.FC<DateIdeasProps> = ({ ideas, setIdeas }) => {
  const [newIdea, setNewIdea] = useState('');

  const addIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdea.trim()) return;
    setIdeas([{ id: Date.now().toString(), text: newIdea, completed: false }, ...ideas]);
    setNewIdea('');
  };

  const removeIdea = (id: string) => {
    setIdeas(ideas.filter(i => i.id !== id));
  };

  const toggleIdea = (id: string) => {
    setIdeas(ideas.map(i => i.id === id ? { ...i, completed: !i.completed } : i));
  };

  return (
    <div className="ideas-container glass">
      <div className="ideas-header">
        <div className="header-top">
          <PartyPopper size={20} color="var(--palette-yellow)" />
          <h3>À Faire / Objectifs</h3>
        </div>
        <p className="ideas-subtitle">Notre liste d'envies ✨</p>
      </div>

      <form onSubmit={addIdea} className="add-idea-form">
        <input
          type="text"
          value={newIdea}
          onChange={(e) => setNewIdea(e.target.value)}
          placeholder="Ajouter une idée de sortie..."
        />
        <button type="submit" className="add-btn"><Plus size={20} /></button>
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
              <div className="idea-content" onClick={() => toggleIdea(idea.id)}>
                <div className={`checkbox ${idea.completed ? 'checked' : ''}`} />
                <span>{idea.text}</span>
              </div>
              <button onClick={() => removeIdea(idea.id)} className="delete-btn">
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <style>{`
        .ideas-container {
          padding: 1.5rem;
          border-radius: 24px;
          height: 100%;
        }
        .ideas-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .ideas-header h3 {
          font-size: 1.125rem;
          font-weight: 800;
          color: var(--palette-yellow);
          text-transform: uppercase;
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
          background: var(--palette-yellow);
          color: white;
          width: 42px;
          height: 42px;
          border-radius: 8px;
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
          padding: 1rem;
          background: white;
          border-radius: 16px;
          border: 1px solid var(--border-glass);
          transition: var(--transition-smooth);
        }
        .idea-item:hover {
          transform: translateX(4px);
          box-shadow: 4px 4px 12px rgba(32, 63, 154, 0.05);
        }
        .idea-content {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
          cursor: pointer;
        }
        .checkbox {
          width: 18px;
          height: 18px;
          border: 2px solid var(--color-grey-blue);
          border-radius: 4px;
          transition: var(--transition-smooth);
        }
        .checkbox.checked {
          background: var(--palette-pink);
          border-color: var(--palette-pink);
        }
        .idea-item span {
          font-size: 0.875rem;
          transition: var(--transition-smooth);
          font-weight: 600;
        }
        /* Random colors for idea items */
        .idea-item:nth-child(5n+1) span { color: var(--palette-blue); }
        .idea-item:nth-child(5n+2) span { color: var(--palette-pink); }
        .idea-item:nth-child(5n+3) span { color: var(--palette-green); }
        .idea-item:nth-child(5n+4) span { color: var(--palette-orange); }
        .idea-item:nth-child(5n+5) span { color: var(--palette-yellow); }

        .idea-item.completed span {
          text-decoration: line-through;
          opacity: 0.5;
        }
        .delete-btn {
          color: var(--color-grey-blue);
          opacity: 0;
          transition: var(--transition-smooth);
        }
        .idea-item:hover .delete-btn {
          opacity: 1;
        }
        .delete-btn:hover {
          color: var(--palette-pink);
        }
      `}</style>
    </div>
  );
};
