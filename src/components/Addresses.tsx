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
  partnerId?: string;
  userName: string;
}

export const Addresses: React.FC<AddressesProps> = ({ addresses, currentUser, onAdd, onUpdate, onDelete, partnerName, partnerId, userName }) => {
  const [activeCategory, setActiveCategory] = useState<AddressCategory>(() => {
    return (localStorage.getItem('activeAddressCategory') as any) || 'restaurants';
  });
  const [newName, setNewName] = useState('');

  // Determine which rating slot belongs to the current user
  // If currentUser ID is alphabetically smaller than partnerId, they are "Rating 1".
  // Otherwise, they are "Rating 2".
  const isUser1 = partnerId ? currentUser < partnerId : true;

  React.useEffect(() => {
    localStorage.setItem('activeAddressCategory', activeCategory);
  }, [activeCategory]);

  const categories: { id: AddressCategory; icon: any; label: string }[] = [
    { id: 'restaurants', icon: Utensils, label: 'RESTAURANTS' },
    { id: 'pastries', icon: Coffee, label: 'DOUCEURS' },
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
            placeholder={activeCategory === 'restaurants' ? 'Nouveau restaurant...' : 'Nouvelle douceur...'}
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
              filteredAddresses.map((addr) => {
                const myRating = isUser1 ? addr.rating1 : addr.rating2;
                const partnerRating = isUser1 ? addr.rating2 : addr.rating1;

                return (
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
                          value={myRating}
                          onChange={(val) => onUpdate(addr.id, { [isUser1 ? 'rating1' : 'rating2']: val })}
                          disabled={false}
                        />
                      </div>
                      <div className="user-rating">
                        <span className="user-label">{partnerName}</span>
                        <RatingSelector
                          value={partnerRating}
                          onChange={() => { }}
                          disabled={true}
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
                );
              })
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
            .title-retro { font-size: 2rem; }
            .content-card { padding: 0.75rem; }

            /* Ligne 1 : [check] [nom] / Ligne 2 : [ratings inline] — tout compact */
            .address-item {
                flex-direction: row;
                flex-wrap: wrap;
                align-items: center;
                gap: 0.4rem;
                padding: 0.6rem 2.75rem 0.6rem 0.6rem; /* right = espace pour delete */
            }
            .check-btn {
                width: 34px;
                height: 34px;
                flex-shrink: 0;
            }
            .place-info {
                flex: 1;
                min-width: 0;
                margin: 0;
                padding-right: 0;
            }
            .place-name { font-size: 0.95rem; }

            /* Force les ratings sur la 2e ligne */
            .ratings-section {
                width: 100%;
                flex-direction: row;
                flex-wrap: wrap;
                align-items: center;
                gap: 0.4rem 0.75rem;
                margin-left: 0;
            }
            /* Label + cases côte à côte */
            .user-rating {
                flex-direction: row;
                align-items: center;
                gap: 0.3rem;
                min-width: 0;
                flex: 0 0 auto;
            }
            .user-label { font-size: 0.85rem; }

            /* Cases plus petites */
            .rate-box {
                width: 18px !important;
                height: 18px !important;
                font-size: 0.8rem !important;
            }

            .total-score {
                min-width: 44px;
                padding: 3px 5px;
            }
            .delete-btn {
                top: 0.5rem;
                right: 0.5rem;
                width: 28px;
                height: 28px;
            }
            .add-place-form { flex-direction: column; }
            .add-btn { width: 100%; }
        }
        @media (max-width: 400px) {
            .content-card { padding: 0.5rem; }
            .place-name { font-size: 0.85rem; }
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
          flex-wrap: wrap; /* Allow wrapping */
          align-items: flex-start; /* Top align when wrapped */
          justify-content: space-between; /* Spread content */
          gap: 1rem;
          padding: 1rem 5rem 1rem 1rem;
          position: relative;
          background: white;
          border: 1px solid var(--retro-dark);
          border-radius: 4px;
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
        .check-btn {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 2px 2px 0px var(--retro-dark);
        }
        .place-info {
          flex: 1 1 200px;
          min-width: 0;
          margin-top: 2px;
          margin-right: 1rem;
        }
        .place-name {
          font-family: var(--font-main);
          font-weight: 700;
          font-size: 1.125rem;
          text-transform: uppercase;
          word-break: break-word;
          line-height: 1.4;
        }
        .ratings-section {
          display: flex;
          align-items: flex-start;
          gap: 1.5rem;
          flex-shrink: 0;
          margin-left: auto;
        }
        .user-rating {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
          min-width: 130px;
          flex-shrink: 0;
        }
        .user-label {
          font-family: var(--font-display);
          font-size: 1rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }
        .total-score {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.15rem;
          min-width: 56px;
          flex-shrink: 0;
          padding: 4px 6px;
          border: 2px solid var(--retro-dark);
          border-radius: 4px;
          background: var(--retro-yellow);
        }
        .score-label {
          font-size: 0.6rem;
          font-weight: 800;
          letter-spacing: 0.05em;
        }
        .sum {
          font-family: var(--font-display);
          font-size: 1.5rem;
          line-height: 1;
        }
        .waiting {
          font-family: var(--font-display);
          font-size: 1rem;
          line-height: 1.5;
        }
        .delete-btn {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          color: var(--text-muted);
          width: 36px;
          height: 36px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
          box-shadow: none;
        }
        .delete-btn:hover {
          color: var(--retro-pink);
          background: none;
          transform: none;
          box-shadow: none;
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
  onChange: (val: number | null) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled }) => {
  return (
    <div className={`rating-selector ${disabled ? 'disabled' : ''}`}>
      {[...Array(6)].map((_, i) => (
        <button
          key={i}
          className={`rate-box ${value === i ? 'active' : ''}`}
          onClick={() => !disabled && onChange(value === i ? null : i)}
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
          border-radius: 4px;
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
