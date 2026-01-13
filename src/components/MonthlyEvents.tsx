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
  '#A9DEF9', // Blue
  '#FF99C8', // Pink
  '#E4F988', // Green
  '#FFBC42', // Orange
  '#FCF6BD'  // Yellow
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
      return format(start, 'dd/MM', { locale: fr });
    }
    const end = new Date(event.endDate);
    if (isSameMonth(start, end)) {
      return `${format(start, 'dd/MM', { locale: fr })} - ${format(end, 'dd/MM', { locale: fr })}`;
    }
    return `${format(start, 'dd/MM', { locale: fr })} - ${format(end, 'dd/MM', { locale: fr })}`;
  };

  return (
    <div className="retro-box events-container">
      <div className="window-header">
        <div className="header-left">
          <StickyNote size={20} color="var(--retro-green)" />
          <h3>EVENEMENTS.LOG</h3>
        </div>
        <button
          className={`retro-btn icon-btn ${isAdding ? 'active' : ''}`}
          onClick={() => setIsAdding(!isAdding)}
        >
          {isAdding ? <X size={16} /> : <Plus size={16} />}
        </button>
      </div>

      <div className="content-area">
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
                  placeholder="Titre événement..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>DEBUT</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>FIN (OPT)</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                  />
                </div>
              </div>

              <div className="color-picker-mini">
                <label>CODE_COULEUR</label>
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

              <button type="submit" className="retro-btn submit-event-btn" disabled={!title.trim()}>
                SAUVER_EVENT.EXE
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="list-container">
          {monthEvents.length === 0 ? (
            <p className="empty-msg">Aucun événement dans ce secteur.</p>
          ) : (
            <ul className="event-list">
              {monthEvents.map(event => (
                <li key={event.id} className="event-item">
                  <span className="event-date">{formatEventDate(event)}</span>
                  <div className="owner-indicator">
                    <Heart
                      size={10}
                      fill={event.authorId === 'partner' ? 'var(--retro-pink)' : 'var(--retro-blue)'}
                      stroke="black"
                      strokeWidth={2}
                    />
                  </div>
                  <span
                    className="event-category"
                    style={{ backgroundColor: event.color || 'var(--retro-blue)' }}
                  >
                    {event.customCategoryName ? event.customCategoryName.slice(0, 3).toUpperCase() : 'EVT'}
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
      </div>

      <style>{`
        .events-container {
          background: #FFF;
          border: var(--retro-border);
          box-shadow: var(--retro-shadow);
          min-height: 300px;
        }
        .header-left {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .icon-btn {
            padding: 4px;
            min-width: 32px;
            display: flex;
            justify-content: center;
        }
        .content-area {
            padding: 1.5rem;
        }
        
        .add-event-form {
          margin-bottom: 2rem;
          background: #eee;
          padding: 1rem;
          border: 1px dashed var(--retro-dark);
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .form-row {
          display: flex;
          gap: 1rem;
        }
        .form-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .form-group label {
          font-family: var(--font-display);
          font-size: 1rem;
        }
        .color-picker-mini label {
            font-family: var(--font-display);
        }
        .colors-row {
          display: flex;
          gap: 0.5rem;
          padding: 4px;
          border: 1px solid #ccc;
          border-radius: 4px;
          background: #fff;
        }
        .color-dot {
          width: 20px;
          height: 20px;
          border: 1px solid #000;
          border-radius: 4px;
          cursor: pointer;
        }
        .color-dot.active {
          box-shadow: 0 0 0 2px #000;
        }
        
        .empty-msg {
          font-family: var(--font-main);
          color: var(--text-muted);
          text-align: center;
          margin-top: 2rem;
        }
        .event-list {
          list-style: none;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .event-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: #f9f9f9;
        }
        .event-item:hover {
            border-color: #000;
            background: #fff;
        }
        .event-date {
          font-family: var(--font-display);
          font-size: 1.1rem;
          min-width: 40px;
        }
        .event-category {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 4px;
          border: 1px solid #000;
          border-radius: 4px;
          color: #000;
        }
        .event-title {
          flex: 1;
          font-family: var(--font-main);
          text-transform: uppercase;
        }
        .delete-event-btn {
          border: none;
          background: none;
          cursor: pointer;
          opacity: 0.5;
        }
        .delete-event-btn:hover {
            opacity: 1;
            color: var(--retro-pink);
        }
        
        @media (max-width: 768px) {
          .content-area {
            padding: 1rem;
          }
          .add-event-form {
            padding: 0.75rem;
          }
          .form-row {
            flex-direction: column;
            gap: 0.75rem;
          }
          .form-group label {
            font-size: 0.9rem;
          }
          .colors-row {
            flex-wrap: wrap;
          }
          .color-dot {
            width: 28px;
            height: 28px;
          }
          .event-item {
            flex-wrap: wrap;
            gap: 0.5rem;
          }
          .event-date {
            font-size: 0.95rem;
          }
          .event-title {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
};
