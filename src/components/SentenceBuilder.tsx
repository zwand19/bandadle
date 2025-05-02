import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clue } from '@/types';

interface SentenceBuilderProps {
  selectedWords: string[];
  onWordRemove: (index: number) => void;
  onClearSentence: () => void;
  showHidden?: boolean;
  availableWords?: string[];
  onWordClick: (word: string) => void;
  shouldFocus?: boolean;
  clues?: Clue[];
  checkForMatch?: (words: string[]) => void;
}

const SentenceBuilder: React.FC<SentenceBuilderProps> = ({ 
  selectedWords, 
  onWordRemove, 
  onClearSentence,
  showHidden = false,
  availableWords = [],
  onWordClick,
  shouldFocus = false,
  clues = [],
  checkForMatch
}) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isInputFlashing, setIsInputFlashing] = useState<boolean>(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(-1);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const createPlaceholderWord = (word: string): string => {
    return '█'.repeat(word.length);
  };

  // Filter available words based on input
  useEffect(() => {
    if (inputValue.trim() === '') {
      setSuggestions([]);
      return;
    }

    const filtered = availableWords.filter(word => 
      word.toLowerCase().startsWith(inputValue.toLowerCase())
    );
    setSuggestions(filtered);
  }, [inputValue, availableWords]);

  // Focus input when shouldFocus changes to true
  useEffect(() => {
    if (shouldFocus && inputRef.current && !showHidden) {
      inputRef.current.focus();
    }
  }, [shouldFocus, showHidden]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace to remove the last word when input is empty
    if (e.key === 'Backspace' && inputValue === '' && selectedWords.length > 0) {
      e.preventDefault();
      onWordRemove(selectedWords.length - 1);
      
      // If we have words left after removing, check if they match a clue
      if (selectedWords.length > 1 && checkForMatch) {
        // We pass selectedWords.length - 1 because we need to exclude the last word that will be removed
        const remainingWords = selectedWords.slice(0, -1);
        checkForMatch(remainingWords);
      }
      return;
    }

    // Handle spacebar or tab
    if ((e.key === ' ' || e.key === 'Tab') && inputValue.trim()) {
      e.preventDefault();
      
      // Check if we have exactly one match or an exact match
      const exactMatch = availableWords.find(
        word => word.toLowerCase() === inputValue.toLowerCase()
      );
      
      // The word we'll potentially add
      let wordToAdd: string | null = null;
      
      if (exactMatch) {
        wordToAdd = exactMatch;
      } else if (suggestions.length === 1) {
        wordToAdd = suggestions[0];
      }
      
      if (wordToAdd) {
        // Check if adding this word would complete a clue
        if (selectedWords.length > 0 && checkForMatch) {
          const testWords = [...selectedWords, wordToAdd];
          const currentSentence = testWords.join(' ').toLowerCase();
          
          // Check against unsolved clues - this is just for logging, the actual check happens in onWordClick
          clues.some(clue => 
            !clue.solved && clue.answer.toLowerCase() === currentSentence
          );
        }
        
        // Add the word normally
        onWordClick(wordToAdd);
        setInputValue('');
        setSelectedSuggestionIndex(-1);
        return;
      }
      
      // Flash the input to indicate no match
      setIsInputFlashing(true);
      setTimeout(() => setIsInputFlashing(false), 300);
      return;
    }

    // Handle keyboard navigation for suggestions
    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
      } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
        e.preventDefault();
        onWordClick(suggestions[selectedSuggestionIndex]);
        setInputValue('');
        setSelectedSuggestionIndex(-1);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setSuggestions([]);
        setSelectedSuggestionIndex(-1);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // If the input is empty, don't continue
    if (!newValue.trim()) return;
    
    // Check if the input exactly matches an available word
    const exactMatch = availableWords.find(
      word => word.toLowerCase() === newValue.toLowerCase()
    );
    
    if (exactMatch && selectedWords.length > 0 && checkForMatch) {
      // Check if adding this word would complete a clue
      const testWords = [...selectedWords, exactMatch];
      const currentSentence = testWords.join(' ').toLowerCase();
      
      // Check against unsolved clues
      const isCompleteAnswer = clues.some(clue => 
        !clue.solved && clue.answer.toLowerCase() === currentSentence
      );
      
      if (isCompleteAnswer) {
        // If it's a complete answer, add the word
        onWordClick(exactMatch);
        setInputValue('');
      }
    }
  };

  const handleSuggestionClick = (word: string) => {
    // Check if adding this word would complete a clue
    if (selectedWords.length > 0 && checkForMatch) {
      const testWords = [...selectedWords, word];
      const currentSentence = testWords.join(' ').toLowerCase();
      
      // Check against unsolved clues
      const isCompleteAnswer = clues.some(clue => 
        !clue.solved && clue.answer.toLowerCase() === currentSentence
      );
      
      // If it's not a complete answer, we still add the word normally
      onWordClick(word);
      setInputValue('');
      inputRef.current?.focus();
    } else {
      // If no words selected yet or no checkForMatch function, just add the word
      onWordClick(word);
      setInputValue('');
      inputRef.current?.focus();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  // Reset selected suggestion when suggestions change
  useEffect(() => {
    setSelectedSuggestionIndex(-1);
  }, [suggestions]);

  // Scroll active suggestion into view
  useEffect(() => {
    if (selectedSuggestionIndex >= 0 && suggestionsRef.current) {
      const activeElement = suggestionsRef.current.children[selectedSuggestionIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedSuggestionIndex]);

  // Focus input when clicking on the container
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div style={{ margin: '0.75rem 0 0.5rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '0.25rem' 
      }}>
        <h3 style={{ 
          fontSize: '0.875rem', 
          fontWeight: '500',
          margin: 0
        }}>
          Your sentence:
        </h3>
        {selectedWords.length > 0 && (
          <motion.button 
            onClick={onClearSentence}
            initial={{ boxShadow: '0 0 0 rgba(0, 0, 0, 0)' }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' 
            }}
            whileTap={{ scale: 0.95 }}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              fontSize: '0.75rem',
              padding: '0.15rem 0.5rem',
              borderRadius: '0.25rem',
              fontWeight: '500',
              cursor: 'pointer',
              border: 'none'
            }}
          >
            Clear
          </motion.button>
        )}
      </div>
      <div 
        onClick={focusInput}
        tabIndex={-1}
        style={{ 
          padding: '0.5rem', 
          margin: '0',
          minHeight: '40px', 
          backgroundColor: 'white', 
          borderRadius: '0.375rem', 
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          border: `1px solid ${isFocused ? '#3b82f6' : '#e5e7eb'}`,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.25rem',
          alignItems: 'center',
          cursor: 'text',
          position: 'relative',
          transition: 'border-color 0.2s ease'
        }}
      >
        {selectedWords.map((word, index) => (
          <motion.span
            key={`${word}-${index}`}
            style={{
              padding: '0.15rem 0.35rem',
              backgroundColor: '#dbeafe',
              color: '#1d4ed8',
              borderRadius: '0.25rem',
              border: '1px solid #93c5fd',
              cursor: 'pointer',
              fontSize: '0.75rem',
              boxShadow: '0 0 0 rgba(0, 0, 0, 0)'
            }}
            onClick={(e) => {
              e.stopPropagation(); // Prevent container's onClick from firing
              onWordRemove(index);
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {showHidden ? createPlaceholderWord(word) : word}
          </motion.span>
        ))}
        <input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{
            flex: '1',
            minWidth: '100px',
            border: 'none',
            outline: 'none',
            fontSize: '0.875rem',
            backgroundColor: isInputFlashing ? '#ffebeb' : 'transparent',
            transition: 'background-color 0.2s ease',
            padding: '0.15rem 0'
          }}
          placeholder="Type to build your sentence..."
          autoFocus
        />
      </div>
      
      {/* Typeahead suggestions without animations */}
      {suggestions.length > 0 && inputValue.trim() !== '' && (
        <div
          ref={suggestionsRef}
          style={{
            marginTop: '0.25rem',
            backgroundColor: 'white',
            borderRadius: '0.375rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            maxHeight: '150px',
            overflowY: 'auto',
            zIndex: 10,
            position: 'relative'
          }}
        >
          {suggestions.map((word, index) => (
            <div
              key={`suggestion-${word}-${index}`}
              onClick={() => handleSuggestionClick(word)}
              style={{
                padding: '0.5rem',
                cursor: 'pointer',
                borderBottom: index !== suggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
                fontSize: '0.875rem',
                backgroundColor: index === selectedSuggestionIndex ? '#f3f4f6' : 'white'
              }}
              onMouseEnter={() => setSelectedSuggestionIndex(index)}
              onMouseLeave={() => setSelectedSuggestionIndex(-1)}
            >
              {word}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SentenceBuilder; 