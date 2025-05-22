import React from 'react';
import { motion } from 'framer-motion';
import { Clue } from '@/types';

interface ClueCardProps {
  clue: Clue;
  showHidden?: boolean;
  forfeit?: boolean;
  onHint?: (clueId: number) => void;
}

// Define colors for each clue
const clueColors = {
  0: '#3b82f6', // blue
  1: '#22c55e', // green
  2: '#eab308', // yellow
  3: '#f97316', // orange for the final clue (Before, During & After)
};

const ClueCard: React.FC<ClueCardProps> = ({ 
  clue, 
  showHidden = false, 
  forfeit = false,
  onHint
}) => {
  // Function to create redacted text with similar length to original
  const createRedactedText = (text: string): string => {
    return Array.from({ length: text.split(' ').length })
      .map(() => '█████')
      .join(' ');
  };
  
  // Determine if this clue should be styled as failed
  const isFailed = clue.failed || false;
  const isHinted = clue.hinted || false;
  
  // Get the appropriate color for this clue
  const clueColor = clueColors[clue.id as keyof typeof clueColors] || '#3b82f6';

  return (
    <div 
      style={{
        padding: '0.5rem',
        marginBottom: '0.25rem',
        backgroundColor: clue.solved 
          ? (isFailed ? '#fef2f2' : isHinted ? `${clueColor}10` : '#f0fdf4') 
          : 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        borderLeft: `4px solid ${
          clue.solved 
            ? (isFailed ? '#ef4444' : isHinted ? clueColor : '#22c55e') 
            : clueColor
        }`,
        fontSize: '0.875rem',
        height: '100%',
        position: 'relative'
      }}
    >
      <h3 style={{ 
        fontWeight: '500', 
        color: '#4b5563', 
        fontSize: '0.75rem',
        margin: '0 0 0.25rem 0',
        paddingRight: '2rem' // Make room for hint button
      }}>
        {clue.id === 3 ? "Before, During & After" : "Before & After"}
      </h3>
      
      {!clue.solved && onHint && (
        <motion.button
          onClick={() => onHint(clue.id)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#a1a1aa',
            cursor: 'pointer',
            padding: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            fontWeight: '500'
          }}
          title="Get a hint"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
          </svg>
        </motion.button>
      )}
      
      <p style={{ 
        margin: '0',
        fontSize: '0.875rem',
        lineHeight: '1.25',
        color: '#333333'
      }}>
        {showHidden ? createRedactedText(clue.question) : clue.question}
      </p>
      {clue.solved && (
        <div style={{ 
          marginTop: '0.25rem', 
          display: 'flex', 
          alignItems: 'center', 
          color: isFailed ? '#ef4444' : isHinted ? clueColor : '#16a34a',
          fontSize: '0.75rem'
        }}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            style={{ height: '0.875rem', width: '0.875rem', marginRight: '0.25rem' }}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            {isFailed ? (
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            ) : (
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            )}
          </svg>
          <span style={{ fontWeight: '500' }}>
            {showHidden ? createRedactedText(clue.answer) : clue.answer}
          </span>
        </div>
      )}
    </div>
  );
};

export default ClueCard; 