import React, { useState, useEffect, useMemo } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Zap, Trophy, Play } from 'lucide-react';
import type { ActivityIdea, Budget } from '../types';

interface ActivitiesWheelProps {
  activities: ActivityIdea[];
}

export const ActivitiesWheel: React.FC<ActivitiesWheelProps> = ({ activities }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<ActivityIdea | null>(null);
  const [wheelBudget, setWheelBudget] = useState<Budget>('low');
  const controls = useAnimation();

  // Create a "reel" of items
  const filteredActivities = activities.filter(a => a.budget === wheelBudget);

  // Create a long list of items for the spinning effect
  const slots = useMemo(() => {
    if (filteredActivities.length === 0) return [];
    let items = [...filteredActivities];
    // Repeat to ensure long scroll (at least 50 items)
    while (items.length < 50) {
      items = [...items, ...filteredActivities];
    }
    return items;
  }, [filteredActivities]);

  const ITEM_HEIGHT = 60; // Height of each item in the slot machine

  const spin = async () => {
    if (isSpinning) return;
    if (filteredActivities.length === 0) {
      // Handle empty state animation or feedback
      return;
    }

    setIsSpinning(true);
    setResult(null);

    // Reset to top to start fresh
    await controls.set({ y: 0 });

    const totalItems = slots.length;
    // Pick a random winner from the second half to ensure good spin duration
    const minScroll = 30;
    const maxScroll = totalItems - 10;
    const targetIndex = Math.floor(Math.random() * (maxScroll - minScroll + 1)) + minScroll;
    const winner = slots[targetIndex];

    const targetY = -1 * (targetIndex * ITEM_HEIGHT);

    // The spin animation
    await controls.start({
      y: targetY,
      transition: {
        duration: 2.5,
        ease: [0.15, 0.85, 0.35, 1], // Custom bezier for "mechanical" feel
        type: "tween"
      }
    });

    setResult(winner);
    setIsSpinning(false);
  };

  return (
    <div className="slot-machine-container">
      <div className="machine-header">
        <h2 className="machine-title">LE_DESTIN.EXE</h2>
      </div>

      <div className="machine-body">
        <div className="budget-toggles">
          <button
            className={`toggle-btn ${wheelBudget === 'low' ? 'active' : ''}`}
            onClick={() => !isSpinning && setWheelBudget('low')}
            disabled={isSpinning}
          >
            €
          </button>
          <button
            className={`toggle-btn ${wheelBudget === 'high' ? 'active' : ''}`}
            onClick={() => !isSpinning && setWheelBudget('high')}
            disabled={isSpinning}
          >
            €€€
          </button>
        </div>

        <div className="reel-window">
          {filteredActivities.length === 0 ? (
            <div className="empty-message-reel">PAS DE DONNEES...</div>
          ) : (
            <div className="reel-overlay"></div>
          )}

          <motion.div
            className="reel-strip"
            animate={controls}
            initial={{ y: 0 }}
          >
            {slots.map((activity, index) => (
              <div key={`${activity.id}-${index}`} className="reel-item" style={{ height: ITEM_HEIGHT }}>
                <span className="item-text">{activity.title}</span>
              </div>
            ))}
          </motion.div>

          {/* Center Line Indicator */}
          <div className="center-line"></div>
        </div>

        <button
          className={`lever-btn ${isSpinning ? 'spinning' : ''}`}
          onClick={spin}
          disabled={isSpinning || filteredActivities.length === 0}
        >
          {isSpinning ? '...' : 'LANCER'}
        </button>
      </div>

      <div className="result-display">
        {result && !isSpinning && (
          <motion.div
            className="winner-card"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <Trophy size={24} color="var(--retro-yellow)" />
            <div className="winner-info">
              <h3>{result.title}</h3>
              <span>Proposé par {result.authorId === 'partner' ? 'Léa' : 'Mathis'}</span>
            </div>
          </motion.div>
        )}
      </div>

      <style>{`
        .slot-machine-container {
          background: var(--retro-dark);
          padding: 2rem;
          border-radius: 8px;
          border: 4px solid var(--retro-dark);
          box-shadow: 10px 10px 0px rgba(0,0,0,0.2);
          max-width: 500px;
          margin: 0 auto;
          color: white;
          font-family: var(--font-display);
        }

        .machine-header {
            text-align: center;
            margin-bottom: 1.5rem;
            border-bottom: 2px dashed #444;
            padding-bottom: 0.5rem;
        }

        .machine-title {
            color: var(--retro-green);
            font-size: 2.5rem;
            margin: 0;
            text-shadow: 0 0 10px rgba(228, 249, 136, 0.4);
        }

        .machine-body {
            background: #333;
            padding: 1.5rem;
            border-radius: 4px;
            border: 2px solid #555;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            align-items: center;
        }

        .budget-toggles {
            display: flex;
            gap: 1rem;
            width: 100%;
        }

        .toggle-btn {
            flex: 1;
            background: #222;
            color: #666;
            border: 2px solid #444;
            padding: 8px;
            font-size: 1.5rem;
            cursor: pointer;
            transition: all 0.2s;
        }

        .toggle-btn.active {
            background: var(--retro-blue);
            color: var(--retro-dark);
            border-color: var(--retro-blue);
            box-shadow: 0 0 10px var(--retro-blue);
        }

        .reel-window {
            width: 100%;
            height: 180px; /* 3 items visible, centered on middle */
            background: white;
            border: 4px solid var(--retro-dark);
            border-radius: 4px;
            position: relative;
            overflow: hidden;
            display: flex;
            justify-content: center;
            box-shadow: inset 0 0 20px rgba(0,0,0,0.5);
        }

        .reel-strip {
            width: 100%;
            position: absolute;
            top: 60px; /* Start with first item in middle (offset by 1 item height) - actually we set initial y=0 which means top. We just need to scroll correctly. */
             /* Let's align the strip so the first item is centered. 
                Height is 180. Item is 60. Center is 60-120.
                If strip y=0, first item (index 0) is at 0-60.
                To center index 0, we need y = 60.
             */
             top: 60px; 
             display: flex;
             flex-direction: column;
             align-items: center;
        }

        .reel-item {
            width: 100%;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-bottom: 1px dashed #eee;
            color: var(--retro-dark);
        }

        .item-text {
            font-size: 1.5rem;
            text-transform: uppercase;
            font-weight: bold;
            text-align: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            padding: 0 1rem;
        }

        .center-line {
            position: absolute;
            top: 50%;
            left: -10%;
            right: -10%;
            height: 4px;
            background: rgba(255, 0, 0, 0.5);
            transform: translateY(-50%);
            z-index: 10;
            pointer-events: none;
            box-shadow: 0 0 5px red;
        }
        
        .reel-overlay {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 80%, rgba(0,0,0,0.4) 100%);
            z-index: 5;
            pointer-events: none;
        }
        
        .empty-message-reel {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #999;
            width: 100%;
            text-align: center;
        }

        .lever-btn {
            background: var(--retro-pink);
            color: white;
            border: none;
            width: 100%;
            padding: 1rem;
            font-size: 1.5rem;
            box-shadow: 0 6px 0 #D45079;
            transition: all 0.1s;
        }

        .lever-btn:active {
            transform: translateY(4px);
            box-shadow: 0 2px 0 #D45079;
        }
        
        .lever-btn:disabled {
            background: #555;
            box-shadow: 0 6px 0 #333;
            color: #888;
            cursor: not-allowed;
            transform: none;
        }

        .result-display {
            min-height: 80px;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-top: 1rem;
        }

        .winner-card {
            background: #444;
            padding: 1rem 2rem;
            border-radius: 4px;
            border: 2px solid var(--retro-yellow);
            display: flex;
            align-items: center;
            gap: 1rem;
            box-shadow: 0 0 15px rgba(252, 246, 189, 0.2);
        }

        .winner-info h3 {
            color: var(--retro-yellow);
            margin: 0;
            font-size: 1.25rem;
        }
        
        .winner-info span {
            color: #aaa;
            font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};
