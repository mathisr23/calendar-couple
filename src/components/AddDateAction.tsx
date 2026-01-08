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
    { id: 'event', icon: CalendarIcon, label: 'Événement', color: 'var(--palette-blue)' },
    { id: 'food', icon: Utensils, label: 'Restau', color: 'var(--palette-orange)' },
    { id: 'surprise', icon: Sparkles, label: 'Surprise', color: 'var(--palette-yellow)' },
    { id: 'custom', icon: Heart, label: 'Autre', color: 'var(--palette-pink)' },
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
    <div className="add-action-card glass">
      {!isOpen ? (
        <button className="expand-btn" onClick={() => setIsOpen(true)}>
          <Plus size={24} />
          <span>Prévoir une sortie pour le {format(selectedDate, 'do MMMM', { locale: fr })}</span>
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
                style={category === cat.id ? { color: cat.color, borderColor: cat.color } : {}}
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
              placeholder="Nom de la catégorie (ex: Bowling)"
              value={customCategoryName}
              onChange={(e) => setCustomCategoryName(e.target.value)}
              className="custom-cat-input"
            />
          )}

          <input
            type="text"
            autoFocus
            placeholder="Titre de la sortie..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="form-footer">
            <button type="button" className="cancel-btn" onClick={() => setIsOpen(false)}>Annuler</button>
            <button type="submit" className="submit-btn" disabled={!title.trim()}>
              Ajouter au {format(selectedDate, 'do MMMM', { locale: fr })}
            </button>
          </div>
        </motion.form>
      )}

      <style>{`
        .add-action-card {
          padding: 1.5rem;
          border-radius: 24px;
          background: white;
          box-shadow: 0 12px 32px rgba(32, 63, 154, 0.1);
        }
        .expand-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 1rem;
          color: var(--palette-green);
          font-weight: 700;
          font-size: 1.125rem;
        }
        .expand-btn:hover {
          color: var(--color-primary-pink);
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
          padding: 1rem 0.5rem;
          border-radius: 12px;
          background: var(--color-beige);
          color: var(--color-grey-blue);
          transition: var(--transition-smooth);
          border: 1px solid transparent;
        }
        .cat-btn:hover:not(.active) {
          background: rgba(32, 63, 154, 0.05);
          color: var(--color-primary-blue);
        }
        .cat-btn.active {
          background: white;
          box-shadow: 0 4px 12px rgba(32, 63, 154, 0.1);
        }
        .cat-label {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          margin: 0;
        }
        .form-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }
        .cancel-btn {
          color: var(--color-grey-blue);
          font-size: 0.875rem;
        }
        .submit-btn {
          background: var(--palette-pink);
          color: white;
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .submit-btn:hover {
          filter: brightness(1.1);
        }
        .custom-cat-input {
          border-bottom: 2px dashed var(--palette-pink) !important;
          margin-bottom: -0.5rem;
          color: var(--palette-pink) !important;
        }
      `}</style>
    </div>
  );
};
