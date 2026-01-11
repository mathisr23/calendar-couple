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
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={prevMonth} className="retro-btn nav-btn"><ChevronLeft size={24} /></button>
        <div className="month-display">
          <h2>{format(currentMonth, 'MMMM yyyy', { locale: fr })}</h2>
        </div>
        <button onClick={nextMonth} className="retro-btn nav-btn"><ChevronRight size={24} /></button>
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
              whileHover={{ scale: 1.05, zIndex: 10 }}
              whileTap={{ scale: 0.95 }}
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
                        style={{ backgroundColor: r.color || `var(--retro-${['blue', 'pink', 'green', 'orange', 'yellow'][index % 5]})`, border: '1px solid black' }}
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
                        size={10}
                        fill={pd.authorId === 'partner' ? 'var(--retro-pink)' : 'var(--retro-blue)'}
                        color="black"
                        strokeWidth={2}
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
          background: #FFF;
          border: var(--retro-border);
          box-shadow: var(--retro-shadow);
          width: 100%;
          max-width: 600px;
        }
        @media (max-width: 640px) {
            .calendar-container {
                padding: 1rem;
            }
        }
        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          border-bottom: 2px solid var(--retro-dark);
          padding-bottom: 1rem;
        }
        .month-display {
          flex: 1;
          text-align: center;
        }
        .month-display h2 {
          font-size: 2rem;
          font-family: var(--font-display);
          color: var(--retro-dark);
          text-transform: uppercase;
          margin: 0;
        }
        .nav-btn {
          padding: 4px;
        }
        .weekdays-container {
          grid-column: 1 / span 7;
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          background: var(--retro-dark);
          padding: 4px 0;
          margin-bottom: 4px;
          border: var(--retro-border);
        }
        .weekday-label {
          text-align: center;
          color: var(--retro-green);
          font-family: var(--font-display);
          font-size: 1.2rem;
          text-transform: uppercase;
        }
        .calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 4px;
            background: var(--retro-dark);
            border: var(--retro-border);
            padding: 4px;
        }
        .calendar-day {
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 4px;
          cursor: pointer;
          background: white;
          border: 1px solid var(--retro-dark);
          position: relative;
        }
        .calendar-day:hover {
          background: var(--retro-yellow);
        }
        .calendar-day.selected {
          background: var(--retro-blue);
          box-shadow: inset 4px 4px 0px rgba(0,0,0,0.2);
        }
        .calendar-day.selected .day-number {
          color: var(--retro-dark);
          text-decoration: underline;
        }
        .day-number {
          font-family: var(--font-display);
          font-size: 1.25rem;
          color: var(--retro-dark);
        }
        .day-indicators {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 2px;
        }
        .ranges-stack {
          display: flex;
          flex-direction: column;
          gap: 2px;
          width: 100%;
        }
        .range-bar {
          height: 6px;
          width: 100%;
        }
        .hearts-stack {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 2px;
          margin-top: 2px;
        }
        .outside-month {
          background: #EEE;
          opacity: 0.6;
          background-image: radial-gradient(#ccc 15%, transparent 16%);
          background-size: 4px 4px;
        }
        .heart-indicator {
          display: flex;
          align-items: center;
        }
      `}</style>
    </div>
  );
};
