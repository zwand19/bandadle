import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntroModalProps {
  isOpen: boolean;
  onStart: () => void;
}

const IntroModal: React.FC<IntroModalProps> = ({ isOpen, onStart }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(31, 70, 57, 0.8)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              backgroundColor: 'rgb(242, 236, 215)',
              borderRadius: '0.75rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
              maxWidth: '28rem',
              width: '100%',
              padding: '1.5rem'
            }}
          >
            <div style={{ textAlign: 'center', color: 'rgb(31, 70, 57)' }}>
              <h2 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                marginBottom: '1rem' 
              }}>
                How to Play Bandadle
              </h2>

              <div style={{ 
                textAlign: 'left', 
                marginBottom: '1.5rem',
                fontSize: '0.9rem',
                lineHeight: '1.4'
              }}>
                <p style={{ marginBottom: '0.75rem' }}>
                  <strong>Before & After:</strong> Each clue describes a phrase that combines two things, where the end of the first connects to the beginning of the second.
                </p>
                <p style={{ marginBottom: '0.75rem' }}>
                  <strong>Example:</strong> "The King of Queens joins MI6" → "Kevin James Bond"
                </p>
                <p style={{ marginBottom: '0.75rem' }}>
                  <strong>Before & During & After:</strong> The final clue describes a phrase that combines three things, where the end of the first connects to the beginning of the second, and the end of the second connects to the beginning of the third.
                </p>
                <p style={{ marginBottom: '0.75rem' }}>
                  <strong>Solve All Clues:</strong> Build sentences by selecting words from the grid below to match each clue.
                </p>
                <p style={{ marginBottom: '0.75rem' }}>
                  <strong>Beat the Clock:</strong> Your time is tracked. How quickly can you solve all puzzles?
                </p>
                <p style={{ marginBottom: '0.75rem' }}>
                  <strong>Entering Clues:</strong> Click on words to select them or start typing to search for words. Press <strong>Space</strong> or <strong>Tab</strong> to autocomplete a word when it's the only match or matches exactly what you typed.
                </p>
                <p style={{ marginBottom: '0.75rem' }}>
                  <strong>Need Help?</strong> Click the hint button (?) on any clue to highlight answer words in the color of that clue. 3 red herrings will also be highlighted in the same color.
                </p>
              </div>

              <motion.button
                onClick={onStart}
                initial={{ boxShadow: '0 0 0 rgba(0, 0, 0, 0)' }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
                whileTap={{ scale: 0.95 }}
                style={{ 
                  backgroundColor: 'rgb(31, 70, 57)',
                  color: 'white',
                  padding: '0.75rem 2rem',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  fontSize: '1.125rem',
                  cursor: 'pointer',
                  border: 'none',
                  width: '100%',
                  marginTop: '0.5rem'
                }}
              >
                Start Playing
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default IntroModal; 