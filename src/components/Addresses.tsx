import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, Coffee, Star, Map, Plus, Trash2, CheckCircle, Circle } from 'lucide-react';
import type { Address, AddressCategory } from '../types';

interface AddressesProps {
  addresses: Address[];
  currentUser: string;
  onAdd: (name: string, category: AddressCategory) => void;
  onUpdate: (id: string, updates: Partial<Address>) => void;
  onDelete: (id: string) => void;
  partnerName: string;
  userName: string;
}

export const Addresses: React.FC<AddressesProps> = ({ addresses, currentUser, onAdd, onUpdate, onDelete, partnerName, userName }) => {
  const [activeCategory, setActiveCategory] = useState<AddressCategory>(() => {
    return (localStorage.getItem('activeAddressCategory') as any) || 'restaurants';
  });
  const [newName, setNewName] = useState('');

  React.useEffect(() => {
    localStorage.setItem('activeAddressCategory', activeCategory);
  }, [activeCategory]);

  const categories: { id: AddressCategory; icon: any; label: string }[] = [
    { id: 'restaurants', icon: Utensils, label: 'Restaurants' },
    { id: 'pastries', icon: Coffee, label: 'Pâtisseries' },
  ];

  const filteredAddresses = addresses.filter(a => a.category === activeCategory);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAdd(newName, activeCategory);
    setNewName('');
  };

  const calculateTotal = (r1: number | null, r2: number | null) => {
    if (r1 === null || r2 === null) return null;
    return r1 + r2;
  };

  return (
    <div className="addresses-container">
      <div className="address-header">
        <h2 className="title-handwritten">Bonnes Adresses</h2>
        <p className="subtitle">Nos endroits favoris ✨</p>
      </div>

      <div className="tabs-container glass">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`tab-btn ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            <cat.icon size={18} />
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="content-card glass">
        <form className="add-place-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={`Ajouter un(e) ${activeCategory === 'pastries' ? 'Pâtisserie' : activeCategory === 'restaurants' ? 'Restaurant' : activeCategory === 'events' ? 'Événement' : 'Voyage'}...`}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button type="submit" className="add-btn">
            <Plus size={20} />
          </button>
        </form>

        <div className="address-list">
          <AnimatePresence mode="popLayout">
            {filteredAddresses.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="empty-msg"
              >
                Aucun(e) {activeCategory === 'pastries' ? 'pâtisserie' : activeCategory === 'restaurants' ? 'restaurant' : activeCategory === 'events' ? 'événement' : 'voyage'} encore. Ajoutez-en un(e) !
              </motion.p>
            ) : (
              filteredAddresses.map((addr) => (
                <motion.div
                  key={addr.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`address-item ${addr.completed ? 'completed' : ''}`}
                >
                  <button
                    className="check-btn"
                    onClick={() => onUpdate(addr.id, { completed: !addr.completed })}
                  >
                    {addr.completed ? <CheckCircle size={20} color="var(--color-primary-green)" /> : <Circle size={20} />}
                  </button>

                  <div className="place-info">
                    <span className="place-name">{addr.name}</span>
                  </div>

                  <div className="ratings-section">
                    <div className="user-rating">
                      <span className="user-label">{userName}</span>
                      <RatingSelector
                        value={addr.rating1}
                        onChange={(val) => onUpdate(addr.id, { rating1: val })}
                        disabled={false} // Allow editing own rating. Logic complexity: rating1 vs rating2 assignment is tricky with dynamic users. 
                      // Simplified: Everyone edits rating1? No, we need to map users to rating slots.
                      // Ideally: Addresses table should have a separate 'ratings' table.
                      // FOR NOW: Let's assume User 1 (Creator/Older) is rating1, User 2 is rating2.
                      // OR: Just let anyone edit anything for MVP?
                      // Better MVP: Just let anyone edit these for now to avoid specific "rating1 refers to UUID X" logic without schema change.
                      />
                    </div>
                    <div className="user-rating">
                      <span className="user-label">{partnerName}</span>
                      <RatingSelector
                        value={addr.rating2}
                        onChange={(val) => onUpdate(addr.id, { rating2: val })}
                        disabled={false}
                      />
                    </div>

                    <div className="total-score">
                      <span className="score-label">Moyenne</span>
                      <div className="score-value">
                        {calculateTotal(addr.rating1, addr.rating2) !== null ? (
                          <span className="sum">{calculateTotal(addr.rating1, addr.rating2)}/10</span>
                        ) : (
                          <span className="waiting">n'a pas encore voté</span>
                        )}
                      </div>
                    </div>

                    <button className="delete-btn" onClick={() => onDelete(addr.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        .addresses-container {
          max-width: 1000px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .address-header {
          text-align: center;
        }
        .title-handwritten {
          font-family: 'Outfit', sans-serif;
          font-size: 3rem;
          color: var(--palette-yellow);
          margin-bottom: 0.5rem;
          position: relative;
        }
        .subtitle {
          color: var(--color-grey-blue);
          font-style: italic;
        }
        .tabs-container {
          display: flex;
          padding: 0.5rem;
          border-radius: 15px;
          gap: 0.5rem;
        }
        .tab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1rem;
          border-radius: 12px;
          color: var(--color-grey-blue);
          font-weight: 700;
          transition: all 0.3s ease;
        }
        .tab-btn.active {
          background: white;
          color: var(--palette-pink);
          box-shadow: 0 4px 12px rgba(32, 63, 154, 0.1);
        }
        .tab-btn:hover:not(.active) {
          background: rgba(32, 63, 154, 0.05);
        }
        .content-card {
          padding: 2.5rem;
          border-radius: 24px;
          min-height: 400px;
          background: rgba(32, 63, 154, 0.02);
          box-shadow: inset 0 2px 10px rgba(32, 63, 154, 0.03);
          border: 1px solid var(--border-glass);
        }
        .add-place-form {
          display: flex;
          gap: 1rem;
          margin-bottom: 2.5rem;
        }
        .add-place-form input {
          flex: 1;
          background: var(--color-beige);
          border: none;
        }
        .add-btn {
          background: var(--palette-pink);
          color: white;
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(32, 63, 154, 0.2);
        }
        .address-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .address-item {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.25rem;
          background: white;
          border-radius: 16px;
          border: 1px solid var(--border-glass);
          transition: all 0.3s ease;
        }
        .address-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(32, 63, 154, 0.08);
        }
        .address-item.completed {
          opacity: 0.5;
        }
        .address-item.completed .place-name {
          text-decoration: line-through;
        }
        .place-info {
          flex: 1;
        }
        .place-name {
          font-weight: 800;
          font-size: 1.125rem;
        }
        .address-item:nth-child(5n+1) .place-name { color: var(--palette-blue); }
        .address-item:nth-child(5n+2) .place-name { color: var(--palette-pink); }
        .address-item:nth-child(5n+3) .place-name { color: var(--palette-green); }
        .address-item:nth-child(5n+4) .place-name { color: var(--palette-orange); }
        .address-item:nth-child(5n+5) .place-name { color: var(--palette-yellow); }
        .ratings-section {
          display: flex;
          align-items: center;
          gap: 2.5rem;
        }
        .user-rating {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        .user-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--palette-blue);
          font-weight: 800;
        }
        .total-score {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          min-width: 100px;
          padding: 8px 12px;
          background: var(--color-pastel-pink);
          border-radius: 12px;
        }
        .score-label {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: white;
          font-weight: 800;
        }
        .sum {
          font-weight: 800;
          font-size: 1.25rem;
          color: white;
        }
        .waiting {
          font-size: 0.75rem;
          font-style: italic;
          color: var(--color-grey-blue);
        }
        .delete-btn {
          color: var(--color-grey-blue);
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .delete-btn:hover {
          color: var(--color-primary-pink);
          background: rgba(232, 71, 151, 0.1);
        }
        .empty-msg {
          text-align: center;
          margin-top: 4rem;
          color: var(--color-grey-blue);
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

const RatingSelector: React.FC<{
  value: number | null;
  onChange: (val: number) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled }) => {
  return (
    <div className={`rating-selector ${disabled ? 'disabled' : ''}`}>
      {[...Array(6)].map((_, i) => (
        <button
          key={i}
          className={`rate-circle ${value === i ? 'active' : ''}`}
          onClick={() => !disabled && onChange(i)}
          disabled={disabled}
        >
          {i}
        </button>
      ))}
      <style>{`
        .rating-selector {
          display: flex;
          gap: 3px;
        }
        .rating-selector.disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .rate-circle {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          color: var(--color-grey-blue);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.2s;
        }
        .rate-circle.active {
          background: var(--color-primary-blue);
          color: white;
          border-color: var(--color-primary-blue);
        }
        .rate-circle:hover:not(.active):not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
        }
        .rate-circle:disabled {
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};
