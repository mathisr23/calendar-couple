import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Dice5 } from 'lucide-react';
import type { ActivityIdea, Budget } from '../types';

interface ActivitiesWheelProps {
  activities: ActivityIdea[];
}

export const ActivitiesWheel: React.FC<ActivitiesWheelProps> = ({ activities }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<ActivityIdea | null>(null);
  const [wheelBudget, setWheelBudget] = useState<Budget>('low');

  const spin = () => {
    if (isSpinning) return;

    setResult(null);
    setIsSpinning(true);

    const filtered = activities.filter(a => a.budget === wheelBudget);

    if (filtered.length === 0) {
      setTimeout(() => {
        setIsSpinning(false);
        setResult({ id: 'none', title: 'Aucune idée pour ce budget ! 😅', authorId: 'mathis', budget: wheelBudget });
      }, 1500);
      return;
    }

    // Animation delay
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * filtered.length);
      setResult(filtered[randomIndex]);
      setIsSpinning(false);
    }, 2000);
  };

  return (
    <div className="wheel-container glass">
      <div className="wheel-header">
        <h2 className="big-pate-title">LOTERIE!</h2>
        <p>Laisse le destin choisir ta prochaine sortie</p>
      </div>

      <div className="budget-toggle-wheel">
        <button
          className={`toggle-btn ${wheelBudget === 'low' ? 'active' : ''}`}
          onClick={() => setWheelBudget('low')}
        >
          Petit Budget
        </button>
        <button
          className={`toggle-btn ${wheelBudget === 'high' ? 'active' : ''}`}
          onClick={() => setWheelBudget('high')}
        >
          Grand Budget
        </button>
      </div>

      <div className="jar-display">
        <motion.div
          className="jar-wrapper"
          animate={isSpinning ? {
            rotate: [0, -5, 5, -5, 5, 0],
            x: [0, -2, 2, -2, 2, 0],
            scale: [1, 1.05, 0.95, 1.05, 1]
          } : {}}
          transition={{
            duration: 0.5,
            repeat: isSpinning ? Infinity : 0,
            ease: "easeInOut"
          }}
        >
          <div className="jar">
            <div className="jar-lid"></div>
            <div className="jar-body">
              <div className="jar-content">
                {activities.slice(0, 10).map((_, i) => (
                  <motion.div
                    key={i}
                    className="paper-strip"
                    animate={isSpinning ? {
                      y: [0, -20, 0],
                      rotate: [0, 360]
                    } : {}}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                  />
                ))}
              </div>
              <div className="jar-label">LOTERIE!</div>
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {result && (
            <motion.div
              className="result-card"
              initial={{ scale: 0, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0, y: 50, opacity: 0 }}
            >
              <div className="result-content">
                <Sparkles className="sparkle-icon" />
                <h3>{result.title}</h3>
                {result.id !== 'none' && (
                  <p>Suggéré par {result.authorId === 'mathis' ? 'Mathis' : 'Léa'}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        className={`spin-btn ${isSpinning ? 'spinning' : ''}`}
        onClick={spin}
        disabled={isSpinning}
      >
        {isSpinning ? 'On pioche...' : <><Dice5 size={24} /> Tirer au sort</>}
      </button>

      <style>{`
        .wheel-container {
          padding: 3rem;
          background: white;
          border-radius: 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
          text-align: center;
          box-shadow: 0 20px 60px rgba(32, 63, 154, 0.08);
        }

        .big-pate-title {
          font-family: 'Outfit', sans-serif;
          font-weight: 900;
          font-size: 3rem;
          color: var(--palette-orange);
          letter-spacing: -0.05em;
          margin-bottom: 0.5rem;
        }

        .wheel-header p {
          color: var(--color-grey-blue);
          font-weight: 500;
        }

        .budget-toggle-wheel {
          display: flex;
          gap: 1rem;
          background: var(--color-beige);
          padding: 6px;
          border-radius: 16px;
        }

        .budget-toggle-wheel .toggle-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 800;
          color: var(--color-grey-blue);
          transition: var(--transition-smooth);
        }

        .budget-toggle-wheel .toggle-btn.active {
          background: white;
          color: var(--palette-orange);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .jar-display {
          position: relative;
          height: 300px;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .jar-wrapper {
          position: relative;
          z-index: 10;
        }

        .jar {
          width: 140px;
          height: 180px;
          position: relative;
        }

        .jar-lid {
          width: 100px;
          height: 20px;
          background: var(--color-grey-blue);
          border-radius: 10px 10px 0 0;
          margin: 0 auto;
        }

        .jar-body {
          width: 140px;
          height: 160px;
          background: rgba(255, 255, 255, 0.4);
          border: 4px solid var(--color-primary-blue);
          border-radius: 20px 20px 40px 40px;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(4px);
        }

        .jar-content {
          position: absolute;
          bottom: 10px;
          left: 0;
          right: 0;
          height: 80%;
          display: flex;
          flex-wrap: wrap;
          padding: 10px;
          gap: 5px;
          justify-content: center;
        }

        .paper-strip {
          width: 30px;
          height: 15px;
          background: var(--color-beige);
          border: 1px solid var(--color-pastel-blue);
          border-radius: 4px;
        }

        .jar-label {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-5deg);
          background: white;
          padding: 4px 10px;
          border: 2px solid var(--color-primary-blue);
          font-weight: 900;
          font-size: 0.8rem;
          color: var(--color-primary-blue);
          white-space: nowrap;
        }

        .result-card {
          position: absolute;
          top: -20px;
          z-index: 20;
          background: white;
          padding: 2rem;
          border-radius: 24px;
          box-shadow: 0 15px 50px rgba(32, 63, 154, 0.15);
          border: 2px solid var(--color-primary-blue);
          max-width: 300px;
        }

        .result-content h3 {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--color-primary-blue);
          margin-bottom: 0.5rem;
        }

        .result-content p {
          font-size: 0.875rem;
          color: var(--color-grey-blue);
          font-weight: 600;
        }

        .sparkle-icon {
          color: #FFB703;
          margin-bottom: 1rem;
          width: 32px;
          height: 32px;
        }

        .spin-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--color-primary-pink);
          color: white;
          padding: 1.25rem 3rem;
          border-radius: 20px;
          font-weight: 900;
          font-size: 1.25rem;
          transition: var(--transition-smooth);
        }

        .spin-btn:hover:not(:disabled) {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 8px 25px rgba(232, 71, 151, 0.3);
        }

        .spin-btn.spinning {
          background: var(--color-grey-blue);
          cursor: wait;
        }
      `}</style>
    </div>
  );
};
