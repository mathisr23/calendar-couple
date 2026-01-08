import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, isSameDay, isSameMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { StickyNote, Trash2, Heart, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PlannedDate } from '../types';

interface MonthlyEventsProps {
  currentMonth: Date;
  plannedDates: PlannedDate[];
  onAdd: (category: PlannedDate['category'], title: string, date: Date, endDate?: Date, color?: string) => void;
  onDelete: (id: string) => void;
}

const COLORS = [
  '#4A90E2', // Blue
  '#E84797', // Pink
  '#267F53', // Green
  '#F5793B', // Orange
  '#FCCA59'  // Yellow
];

export const MonthlyEvents: React.FC<MonthlyEventsProps> = ({ currentMonth, plannedDates, onAdd, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(format(currentMonth, 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  const monthEvents = plannedDates
    .filter(pd => {
      const mStart = startOfMonth(currentMonth);
      const mEnd = endOfMonth(currentMonth);
      const eventStart = new Date(pd.date);
      const eventEnd = pd.endDate ? new Date(pd.endDate) : eventStart;
      return (eventStart <= mEnd && eventEnd >= mStart);
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAdd(
      'event',
      title,
      new Date(startDate),
      endDate ? new Date(endDate) : undefined,
      color
    );

    setTitle('');
    setEndDate('');
    setIsAdding(false);
  };

  const formatEventDate = (event: PlannedDate) => {
    const start = new Date(event.date);
    if (!event.endDate || isSameDay(start, new Date(event.endDate))) {
      return format(start, 'do', { locale: fr });
    }
    const end = new Date(event.endDate);
    if (isSameMonth(start, end)) {
      return `${format(start, 'do', { locale: fr })} - ${format(end, 'do', { locale: fr })}`;
    }
    return `${format(start, 'do MMM', { locale: fr })} - ${format(end, 'do MMM', { locale: fr })}`;
  };

  return (
    <div className="events-sticky glass">
      <div className="sticky-header">
        <div className="header-left">
          <StickyNote size={20} color="var(--palette-orange)" />
          <h3>Événements du Mois</h3>
        </div>
        <button
          className={`add-event-toggle ${isAdding ? 'active' : ''}`}
          onClick={() => setIsAdding(!isAdding)}
        >
          {isAdding ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="add-event-form"
            onSubmit={handleSubmit}
          >
            <div className="form-group">
              <input
                type="text"
                placeholder="Titre de l'événement..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Début</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Fin (optionnel)</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                />
              </div>
            </div>

            <div className="color-picker-mini">
              <label>Couleur</label>
              <div className="colors-row">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    className={`color-dot ${color === c ? 'active' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </div>

            <button type="submit" className="submit-event-btn" disabled={!title.trim()}>
              Ajouter l'événement
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="sticky-content">
        {monthEvents.length === 0 ? (
          <p className="empty-msg">Aucune sortie prévue pour {format(currentMonth, 'MMMM', { locale: fr })}. On y remédie ? ✨</p>
        ) : (
          <ul className="event-list">
            {monthEvents.map(event => (
              <li key={event.id} className="event-item">
                <span className="event-date">{formatEventDate(event)}</span>
                <div className="owner-indicator">
                  <Heart
                    size={10}
                    fill={event.authorId === 'partner' ? 'var(--color-primary-pink)' : 'var(--color-primary-blue)'}
                    color={event.authorId === 'partner' ? 'var(--color-primary-pink)' : 'var(--color-primary-blue)'}
                  />
                </div>
                <span
                  className="event-category"
                  style={event.color ? { backgroundColor: `${event.color}15`, color: event.color } : {}}
                >
                  {event.customCategoryName ? event.customCategoryName.toUpperCase() : event.category.toUpperCase()}
                </span>
                <span className="event-title">{event.title}</span>
                <button
                  className="delete-event-btn"
                  onClick={() => onDelete(event.id)}
                  title="Delete event"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <style>{`
        .events-sticky {
          padding: 2.5rem;
          border-radius: 24px;
          position: relative;
          min-height: 300px;
          background: #FFFFFF;
          box-shadow: 0 12px 48px rgba(32, 63, 154, 0.06);
        }
        .events-sticky::before {
          content: '';
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          width: 50px;
          height: 12px;
          background: var(--color-pastel-blue);
          border-radius: 4px;
        }
        .sticky-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
          padding-top: 1rem;
          border-bottom: 1px dashed var(--color-grey-blue);
          padding-bottom: 1rem;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .sticky-header h3 {
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          font-size: 1.125rem;
          color: var(--palette-orange);
          margin: 0;
        }
        .add-event-toggle {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: var(--color-beige);
          color: var(--color-primary-blue);
          transition: all 0.3s;
        }
        .add-event-toggle:hover {
          background: var(--color-pastel-blue);
          color: white;
        }
        .add-event-toggle.active {
          background: var(--color-primary-pink);
          color: white;
          transform: rotate(0deg);
        }
        
        .add-event-form {
          margin-bottom: 2rem;
          background: var(--color-beige);
          padding: 1.5rem;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          overflow: hidden;
        }
        .form-row {
          display: flex;
          gap: 1rem;
        }
        .form-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .form-group label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--color-primary-blue);
          text-transform: uppercase;
        }
        .form-group input {
          width: 100%;
          padding: 0.6rem;
          border-radius: 8px;
          border: 1px solid var(--border-glass);
          background: white;
        }
        .color-picker-mini {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .color-picker-mini label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--palette-blue);
          text-transform: uppercase;
        }
        .colors-row {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .color-dot {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
        }
        .color-dot.active {
          border-color: var(--color-primary-blue);
          transform: scale(1.2);
        }
        .submit-event-btn {
          margin-top: 0.5rem;
          background: var(--palette-blue);
          color: white;
          padding: 0.75rem;
          border-radius: 8px;
          font-weight: 700;
          transition: all 0.2s;
        }
        .submit-event-btn:hover:not(:disabled) {
          background: var(--color-primary-pink);
          transform: translateY(-2px);
        }
        .submit-event-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .empty-msg {
          font-style: italic;
          color: var(--color-grey-blue);
          text-align: center;
          margin-top: 3rem;
          line-height: 1.6;
        }
        .event-list {
          list-style: none;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .event-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }
        .event-date {
          font-weight: 700;
          color: var(--palette-blue);
          min-width: 35px;
        }
        .owner-indicator {
          display: flex;
          align-items: center;
        }
        .event-category {
          font-size: 0.65rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 100px;
          background: var(--bg-glass);
        }
        
        .event-title {
          flex: 1;
          font-weight: 500;
        }
        .event-item:nth-child(5n+1) .event-title { color: var(--palette-blue); }
        .event-item:nth-child(5n+2) .event-title { color: var(--palette-pink); }
        .event-item:nth-child(5n+3) .event-title { color: var(--palette-green); }
        .event-item:nth-child(5n+4) .event-title { color: var(--palette-orange); }
        .event-item:nth-child(5n+5) .event-title { color: var(--palette-yellow); }

        .delete-event-btn {
          color: var(--color-grey-blue);
          opacity: 0;
          transition: all 0.2s;
          padding: 4px;
          border-radius: 4px;
        }
        .event-item:hover .delete-event-btn {
          opacity: 1;
        }
        .delete-event-btn:hover {
          color: var(--color-primary-pink);
          background: rgba(232, 71, 151, 0.1);
        }
      `}</style>
    </div>
  );
};
