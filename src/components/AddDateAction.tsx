import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar as CalendarIcon, Heart, Utensils, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { PlannedDate } from '../types';

interface AddDateActionProps {
  selectedDate: Date;
  onAdd: (category: PlannedDate['category'], title: string, date: Date, endDate?: Date, color?: string, customCategoryName?: string) => void;
}

export const AddDateAction: React.FC<AddDateActionProps> = ({ selectedDate, onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<PlannedDate['category']>('event');
  const [title, setTitle] = useState('');
  const [customCategoryName, setCustomCategoryName] = useState('');

  const categories: { id: PlannedDate['category']; icon: any; label: string; color: string }[] = [
    { id: 'event', icon: CalendarIcon, label: 'Sortie', color: 'var(--retro-blue)' },
    { id: 'food', icon: Utensils, label: 'Miam', color: 'var(--retro-orange)' },
    { id: 'surprise', icon: Sparkles, label: 'Bonus', color: 'var(--retro-yellow)' },
    { id: 'custom', icon: Heart, label: 'Autre', color: 'var(--retro-pink)' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(
      category,
      title,
      selectedDate,
      undefined,
      undefined,
      category === 'custom' ? customCategoryName : undefined
    );
    setTitle('');
    setCustomCategoryName('');
    setIsOpen(false);
  };

  return (
    <div className="add-action-card retro-card">
      {!isOpen ? (
        <button className="expand-btn" onClick={() => setIsOpen(true)}>
          <Plus size={24} />
          <span>NOUVELLE_ENTREE_POUR_{format(selectedDate, 'dd_MM', { locale: fr }).toUpperCase()}</span>
        </button>
      ) : (
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="add-form"
        >
          <div className="category-picker">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`cat-btn ${category === cat.id ? 'active' : ''}`}
                onClick={() => setCategory(cat.id)}
                title={cat.label}
                style={category === cat.id ? { backgroundColor: cat.color } : {}}
              >
                <cat.icon size={20} />
                <p className="cat-label">{cat.label}</p>
              </button>
            ))}
          </div>

          {category === 'custom' && (
            <motion.input
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              type="text"
              placeholder="NOM_CATEGORIE..."
              value={customCategoryName}
              onChange={(e) => setCustomCategoryName(e.target.value)}
              className="custom-cat-input"
            />
          )}

          <input
            type="text"
            autoFocus
            placeholder="TITRE_ENTREE..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="form-footer">
            <button type="button" className="retro-btn cancel-btn" onClick={() => setIsOpen(false)}>ANNULER</button>
            <button type="submit" className="retro-btn submit-btn" disabled={!title.trim()}>
              CONFIRMER
            </button>
          </div>
        </motion.form>
      )}

      <style>{`
        .add-action-card {
          padding: 1.5rem;
          background: white;
          border: var(--retro-border);
          box-shadow: var(--retro-shadow);
        }
        .expand-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 1rem;
          color: var(--retro-dark);
          font-family: var(--font-display);
          font-size: 1.25rem;
          text-transform: uppercase;
        }
        .expand-btn:hover {
          color: var(--retro-pink);
        }
        .add-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .category-picker {
          display: flex;
          justify-content: space-between;
          gap: 0.5rem;
        }
        .cat-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 8px;
          border: var(--retro-border);
          background: #FFF;
          transition: var(--transition-smooth);
        }
        .cat-btn:hover:not(.active) {
          background: var(--retro-yellow);
        }
        .cat-btn.active {
          box-shadow: inset 2px 2px 0px rgba(0,0,0,0.2);
        }
        .cat-label {
          font-family: var(--font-display);
          font-size: 1rem;
          text-transform: uppercase;
          margin: 0;
        }
        .form-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }
        .submit-btn {
          background: var(--retro-green);
        }
        .cancel-btn {
             background: #eee;
        }
        .custom-cat-input {
          border-bottom: 2px dashed var(--retro-dark) !important;
          margin-bottom: -0.5rem;
        }
      `}</style>
    </div>
  );
};
