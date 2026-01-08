import React from 'react';
import {
  format,
  isSameMonth,
  isSameDay,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  subMonths,
  addMonths
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import type { PlannedDate } from '../types';

interface CalendarProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  plannedDates: PlannedDate[];
}

export const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  setSelectedDate,
  currentMonth,
  setCurrentMonth,
  plannedDates
}) => {
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  return (
    <div className="calendar-container glass">
      <div className="calendar-header">
        <button onClick={prevMonth} className="nav-btn"><ChevronLeft size={24} /></button>
        <div className="month-display">
          <h2>{format(currentMonth, 'MMMM yyyy', { locale: fr })}</h2>
        </div>
        <button onClick={nextMonth} className="nav-btn"><ChevronRight size={24} /></button>
      </div>

      <div className="calendar-grid">
        <div className="weekdays-container">
          {days.map(day => (
            <div key={day} className="weekday-label">{day}</div>
          ))}
        </div>

        {calendarDays.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, monthStart);

          const normalize = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
          const target = normalize(day);

          const dayEvents = plannedDates.filter(pd => {
            const start = normalize(new Date(pd.date));
            const end = pd.endDate ? normalize(new Date(pd.endDate)) : start;
            return target >= start && target <= end;
          });

          const hearts = dayEvents.filter(e => !e.endDate || isSameDay(e.date, e.endDate));
          const ranges = dayEvents.filter(e => e.endDate && !isSameDay(e.date, e.endDate));

          return (
            <motion.div
              key={day.toString()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedDate(day)}
              className={`calendar-day ${!isCurrentMonth ? 'outside-month' : ''} ${isSelected ? 'selected' : ''}`}
            >
              <span className="day-number">{format(day, 'd')}</span>

              <div className="day-indicators">
                {ranges.length > 0 && (
                  <div className="ranges-stack">
                    {ranges.map((r, index) => (
                      <div
                        key={r.id}
                        className="range-bar"
                        style={{ backgroundColor: r.color || `var(--palette-${['blue', 'pink', 'green', 'orange', 'yellow'][index % 5]})` }}
                      />
                    ))}
                  </div>
                )}

                <div className="hearts-stack">
                  {hearts.map((pd) => (
                    <motion.div
                      key={pd.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="heart-indicator"
                    >
                      <Heart
                        size={8}
                        fill={pd.authorId === 'partner' ? 'var(--color-primary-pink)' : 'var(--color-primary-blue)'}
                        color={pd.authorId === 'partner' ? 'var(--color-primary-pink)' : 'var(--color-primary-blue)'}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <style>{`
        .calendar-container {
          padding: 2rem;
          border-radius: 24px;
          width: 100%;
          max-width: 600px; /* Centered and controlled width */
        }
        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .month-display h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--color-beige);
        }
        .nav-btn {
          color: var(--color-grey-blue);
          padding: 0.5rem;
          border-radius: 50%;
        }
        .nav-btn:hover {
          color: var(--color-primary-blue);
          background: var(--bg-glass);
        }
        .calendar-header h2 {
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          color: var(--palette-pink);
          text-transform: capitalize;
        }
        .weekdays-container {
          grid-column: 1 / span 7;
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          background: var(--palette-green);
          padding: 8px 0;
          border-radius: 12px;
          margin-bottom: 4px;
        }
        .weekday-label {
          text-align: center;
          color: white;
          font-weight: 800;
          font-size: 0.75rem;
          text-transform: uppercase;
        }
        .calendar-day {
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 8px 4px;
          border-radius: 12px;
          cursor: pointer;
          transition: var(--transition-smooth);
          background: white;
          border: 1px solid var(--border-glass);
          position: relative;
        }
        .calendar-day:hover {
          background: rgba(32, 63, 154, 0.05);
          border-color: var(--color-pastel-blue);
        }
        .calendar-day.selected {
          background: var(--palette-blue);
          color: white;
          border-color: var(--palette-blue);
          box-shadow: 0 4px 12px rgba(32, 63, 154, 0.2);
        }
        .calendar-day.selected .day-number {
          color: white;
        }
        .day-number {
          font-weight: 700;
          font-size: 1rem;
          margin-bottom: 4px;
          color: var(--palette-blue);
        }
        .day-indicators {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 0 4px;
        }
        .ranges-stack {
          display: flex;
          flex-direction: column;
          gap: 2px;
          width: 100%;
        }
        .range-bar {
          height: 3px;
          width: 100%;
          border-radius: 2px;
        }
        .hearts-stack {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 2px;
          margin-top: 2px;
        }
        .outside-month {
          opacity: 0.3;
          background: transparent;
          border: 1px dashed var(--border-glass);
        }
        .heart-indicator {
          display: flex;
          align-items: center;
        }
      `}</style>
    </div>
  );
};
