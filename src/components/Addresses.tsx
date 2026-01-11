import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, Coffee, Plus, Trash2, CheckCircle, Circle } from 'lucide-react';
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

export const Addresses: React.FC<AddressesProps> = ({ addresses, onAdd, onUpdate, onDelete, partnerName, userName }) => {
  const [activeCategory, setActiveCategory] = useState<AddressCategory>(() => {
    return (localStorage.getItem('activeAddressCategory') as any) || 'restaurants';
  });
  const [newName, setNewName] = useState('');

  React.useEffect(() => {
    localStorage.setItem('activeAddressCategory', activeCategory);
  }, [activeCategory]);

  const categories: { id: AddressCategory; icon: any; label: string }[] = [
    { id: 'restaurants', icon: Utensils, label: 'RESTAURANTS' },
    { id: 'douceurs', icon: Coffee, label: 'DOUCEURS' },
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
        <h2 className="title-retro">MEILLEURES_ADRESSES.EXE</h2>
      </div>

      <div className="tabs-container">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`retro-tab-btn ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            <cat.icon size={18} />
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="content-card retro-card">
        <form className="add-place-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={`Nouveau ${categories.find(c => c.id === activeCategory)?.label}...`}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button type="submit" className="retro-btn add-btn">
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
                Aucune donnée dans le répertoire /{activeCategory}.
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
                    {addr.completed ? <CheckCircle size={24} color="var(--retro-green)" /> : <Circle size={24} />}
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
                      />
                    </div>
                    <div className="user-rating">
                      <span className="user-label">{partnerName}</span>
                      <RatingSelector
                        value={addr.rating2}
                        onChange={(val) => onUpdate(addr.id, { rating2: val })}
                      />
                    </div>

                    <div className="total-score">
                      <span className="score-label">TOTAL</span>
                      <div className="score-value">
                        {calculateTotal(addr.rating1, addr.rating2) !== null ? (
                          <span className="sum">{calculateTotal(addr.rating1, addr.rating2)}</span>
                        ) : (
                          <span className="waiting">--</span>
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
          gap: 1rem;
        }
        .address-header {
          text-align: center;
          margin-bottom: 1rem;
        }
        .title-retro {
          font-family: var(--font-display);
          font-size: 3rem;
          color: var(--retro-dark);
          text-shadow: 4px 4px 0px var(--retro-pink);
          margin-bottom: 0.5rem;
        }

        @media (max-width: 768px) {
            .title-retro {
                font-size: 2rem;
            }
            .content-card {
                padding: 1.5rem;
            }
            .address-item {
                flex-direction: column;
                align-items: flex-start;
                gap: 1rem;
            }
            .ratings-section {
                width: 100%;
                flex-direction: column;
                align-items: flex-start;
                gap: 1.5rem;
            }
            .place-info {
                width: 100%;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .check-btn {
                order: -1; 
            }
            .delete-btn {
                position: absolute;
                top: 0.5rem;
                right: 0.5rem;
            }
            .address-item {
                position: relative;
            }
            .add-place-form {
                flex-direction: column;
            }
            .add-btn {
                width: 100%;
            }
        }
        .tabs-container {
          display: flex;
          gap: 0.5rem;
          margin-left: 1rem;
        }
        .retro-tab-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 8px 16px;
          border: var(--retro-border);
          border-bottom: none;
          background: #eee;
          font-family: var(--font-display);
          font-size: 1.25rem;
          color: var(--text-muted);
          position: relative;
          top: 2px;
        }
        .retro-tab-btn.active {
          background: #FFF;
          color: var(--retro-dark);
          z-index: 2;
          padding-bottom: 10px;
        }
        
        .content-card {
          padding: 2.5rem;
          min-height: 400px;
          background: #FFF;
          z-index: 1;
        }
        .add-place-form {
          display: flex;
          gap: 1rem;
          margin-bottom: 2.5rem;
        }
        .add-place-form input {
          flex: 1;
        }
        .add-btn {
          background: var(--retro-green);
          color: var(--retro-dark);
          width: 48px;
          height: 48px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .address-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .address-item {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1rem;
          background: white;
          border: 1px solid var(--retro-dark);
          box-shadow: 4px 4px 0px rgba(0,0,0,0.1);
        }
        .address-item:hover {
          transform: translateY(-2px);
          box-shadow: 6px 6px 0px var(--retro-pink);
        }
        .address-item.completed {
          opacity: 0.6;
          box-shadow: none;
          background: #f0f0f0;
        }
        .address-item.completed .place-name {
          text-decoration: line-through;
        }
        .place-info {
          flex: 1;
        }
        .place-name {
          font-family: var(--font-main);
          font-weight: 700;
          font-size: 1.125rem;
          text-transform: uppercase;
        }
        .ratings-section {
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        .user-rating {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }
        .user-label {
          font-family: var(--font-display);
          font-size: 1rem;
        }
        .total-score {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          min-width: 60px;
          padding: 4px;
          border: 2px solid var(--retro-dark);
          background: var(--retro-yellow);
        }
        .score-label {
          font-size: 0.65rem;
          font-weight: 800;
        }
        .sum {
          font-family: var(--font-display);
          font-weight: 400;
          font-size: 1.5rem;
        }
        .waiting {
          font-family: var(--font-display);
          font-size: 1rem;
        }
        .delete-btn {
          color: var(--text-muted);
          padding: 0.5rem;
          transition: all 0.2s;
        }
        .delete-btn:hover {
          color: var(--retro-pink);
        }
        .empty-msg {
          text-align: center;
          margin-top: 4rem;
          font-family: var(--font-main);
          color: var(--text-muted);
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
          className={`rate-box ${value === i ? 'active' : ''}`}
          onClick={() => !disabled && onChange(i)}
          disabled={disabled}
        >
          {i}
        </button>
      ))}
      <style>{`
        .rating-selector {
          display: flex;
          gap: 2px;
        }
        .rate-box {
          width: 20px;
          height: 20px;
          font-family: var(--font-display);
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #FFF;
          border: 1px solid var(--retro-dark);
          cursor: pointer;
        }
        .rate-box:hover:not(:disabled) {
            background: var(--retro-blue);
        }
        .rate-box.active {
          background: var(--retro-dark);
          color: #FFF;
        }
        .rate-box:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
};
