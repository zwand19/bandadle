import React, { useState, useEffect } from 'react';
import { formatTime } from '@/gameData';

interface GameTimerProps {
  startTime: number | null;
  endTime: number | null;
  isPaused?: boolean; // New prop for external pause control
}

const GameTimer: React.FC<GameTimerProps> = ({ startTime, endTime, isPaused: externalPause = false }) => {
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [internalPause, setInternalPause] = useState<boolean>(false);
  const [pausedTime, setPausedTime] = useState<number>(0);
  
  // Combined pause state (either internal or external)
  const isPaused = internalPause || externalPause;
  
  // Handle tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden, pause the timer
        setInternalPause(true);
        setPausedTime(Date.now());
      } else {
        // Tab is visible again, resume timer if not externally paused
        if (internalPause && !externalPause) {
          setInternalPause(false);
          // Adjust startTime to account for the paused duration
          const pauseDuration = Date.now() - pausedTime;
          setPausedTime(prev => prev + pauseDuration);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [internalPause, pausedTime, externalPause]);
  
  useEffect(() => {
    if (!startTime) return;
    
    const intervalId = setInterval(() => {
      if (endTime) {
        setElapsedTime(endTime - startTime);
        clearInterval(intervalId);
      } else if (!isPaused) {
        // Only update time when not paused and calculate with pause offset
        setElapsedTime(Date.now() - startTime - pausedTime);
      }
    }, 100);
    
    return () => clearInterval(intervalId);
  }, [startTime, endTime, isPaused, pausedTime]);
  
  if (!startTime) return null;
  
  return (
    <div style={{ textAlign: 'center', margin: '0.25rem 0 0.5rem' }}>
      <div style={{ 
        display: 'inline-block', 
        backgroundColor: 'white', 
        borderRadius: '0.25rem', 
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', 
        padding: '0.25rem 0.75rem',
        border: '1px solid #e5e7eb',
        fontSize: '0.875rem', 
        fontFamily: 'monospace'
      }}>
        ⏱️ {formatTime(elapsedTime)} {isPaused ? "(paused)" : ""}
      </div>
    </div>
  );
};

export default GameTimer; 