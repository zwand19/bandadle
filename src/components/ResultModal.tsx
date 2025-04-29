import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { formatTime, getResultEmojis } from '@/gameData';
import { Clue } from '@/types';

interface ResultModalProps {
  isOpen: boolean;
  startTime: number | null;
  endTime: number | null;
  onClose: () => void;
  forfeit: boolean;
  clues: Clue[];
  gameDate?: string;
}

const ResultModal: React.FC<ResultModalProps> = ({
  isOpen,
  startTime,
  endTime,
  onClose,
  forfeit = false,
  clues = [],
  gameDate
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !startTime || !endTime) return null;

  const elapsedTime = endTime - startTime;
  const formattedTime = formatTime(elapsedTime);
  
  // Count solved and failed clues
  const totalSolved = clues.filter(clue => clue.solved).length;
  const failedCount = clues.filter(clue => clue.failed).length;
  const hintedCount = clues.filter(clue => clue.solved && clue.hinted && !clue.failed).length;
  
  const resultEmojis = getResultEmojis(
    elapsedTime, 
    forfeit, 
    totalSolved, 
    failedCount, 
    hintedCount,
    clues,
    gameDate
  );

  const copyResults = () => {
    navigator.clipboard.writeText(resultEmojis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Only show confetti if all clues are solved and none are failed
  const showConfetti = totalSolved === clues.length && failedCount === 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {showConfetti && (
            <Confetti 
              width={typeof window !== 'undefined' ? window.innerWidth : 0}
              height={typeof window !== 'undefined' ? window.innerHeight : 0}
              recycle={false}
              numberOfPieces={500}
              gravity={0.2}
            />
          )}
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}>
            <motion.div
              initial={{ 
                opacity: 0, 
                scale: 0.8,
                boxShadow: '0 0 0 rgba(0, 0, 0, 0)' 
              }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.8,
                boxShadow: '0 0 0 rgba(0, 0, 0, 0)' 
              }}
              style={{
                backgroundColor: 'white',
                borderRadius: '0.75rem',
                maxWidth: '28rem',
                width: '100%',
                padding: '1.5rem'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                  {forfeit ? '❌ Game Over ❌' : '🎉 Congratulations! 🎉'}
                </h2>
                <p style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
                  {forfeit ? `You solved ${totalSolved - failedCount} out of 4 puzzles!` : 'You solved all puzzles!'}
                </p>
                
                <div style={{ 
                  backgroundColor: '#f3f4f6', 
                  borderRadius: '0.5rem', 
                  padding: '1rem', 
                  marginBottom: '1.5rem' 
                }}>
                  <p style={{ fontWeight: '500', marginBottom: '0.5rem' }}>Your time:</p>
                  <p style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>{formattedTime}</p>
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ fontWeight: '500', marginBottom: '0.5rem' }}>Share your results:</p>
                  <div style={{ 
                    backgroundColor: '#f3f4f6',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    whiteSpace: 'pre-line'
                  }}>
                    {resultEmojis}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <motion.button 
                    onClick={copyResults}
                    initial={{ boxShadow: '0 0 0 rgba(0, 0, 0, 0)' }}
                    whileHover={{ 
                      scale: 1.03, 
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}
                    whileTap={{ scale: 0.97 }}
                    style={{ 
                      backgroundColor: '#2563eb',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      fontWeight: '500',
                      flexGrow: 1,
                      cursor: 'pointer',
                      border: 'none'
                    }}
                  >
                    {copied ? '✓ Copied!' : 'Copy Results'}
                  </motion.button>
                  <motion.button 
                    onClick={onClose}
                    initial={{ boxShadow: '0 0 0 rgba(0, 0, 0, 0)' }}
                    whileHover={{ 
                      scale: 1.03,
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' 
                    }}
                    whileTap={{ scale: 0.97 }}
                    style={{ 
                      border: '1px solid #d1d5db',
                      backgroundColor: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      fontWeight: '500',
                      flexGrow: 1,
                      cursor: 'pointer'
                    }}
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ResultModal; 