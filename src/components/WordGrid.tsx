import React from 'react';
import { motion } from 'framer-motion';

// Define colors for each clue
const clueColors = {
  0: '#3b82f6', // blue
  1: '#22c55e', // green
  2: '#eab308', // yellow
  3: '#f97316', // orange for the final clue
};

interface WordGridProps {
  words: string[];
  onWordClick: (word: string) => void;
  startTime: number | null;
  endTime: number | null;
  showHidden?: boolean;
  hintedWords?: Map<string, number>;
}

const WordGrid: React.FC<WordGridProps> = ({ 
  words, 
  onWordClick, 
  startTime, 
  endTime,
  showHidden = false,
  hintedWords = new Map()
}) => {
  const createPlaceholderWord = (word: string): string => {
    return '█'.repeat(word.length);
  };

  // Function to check if a word is hinted and get the clue ID
  const getHintInfo = (word: string): { isHinted: boolean, clueId: number | null } => {
    const clueId = hintedWords.get(word.toLowerCase());
    return { isHinted: clueId !== undefined, clueId: clueId ?? null };
  };

  return (
    <div style={{ 
      marginTop: '1.25rem',
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '0.5rem',
    }}>
      {words.map((word, index) => {
        const { isHinted, clueId } = getHintInfo(word);
        const hintColor = isHinted && clueId !== null ? clueColors[clueId as keyof typeof clueColors] : '#eab308';
        
        return (
          <motion.div
            key={`${word}-${index}`}
            style={{
              padding: '0.5rem',
              borderRadius: '0.375rem',
              border: isHinted ? `1px solid ${hintColor}` : '1px solid #d1d5db',
              background: isHinted ? `${hintColor}10` : '#f3f4f6',
              cursor: 'pointer',
              textAlign: 'center',
              fontWeight: isHinted ? '500' : 'normal',
              color: '#333333',
              boxShadow: isHinted 
                ? `0 1px 3px 0 ${hintColor}33` 
                : '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}
            onClick={() => onWordClick(word)}
            whileHover={{ 
              scale: 1.03, 
              boxShadow: isHinted 
                ? `0 4px 6px -1px ${hintColor}33` 
                : '0 2px 4px -1px rgba(0, 0, 0, 0.1)' 
            }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.2, 
              delay: index * 0.01,
              type: "spring",
              stiffness: 200
            }}
          >
            {showHidden ? createPlaceholderWord(word) : word}
          </motion.div>
        );
      })}
    </div>
  );
};

export default WordGrid; 