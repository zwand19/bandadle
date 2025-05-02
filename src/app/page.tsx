'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClueCard from '@/components/ClueCard';
import WordGrid from '@/components/WordGrid';
import SentenceBuilder from '@/components/SentenceBuilder';
import GameTimer from '@/components/GameTimer';
import ResultModal from '@/components/ResultModal';
import IntroModal from '@/components/IntroModal';
import HeaderMenu from '@/components/HeaderMenu';
import { getCluesForDate, generateAvailableWords, getGameDateForToday, getTitleForDate } from '@/gameData';
import { GameState } from '@/types';
import ReactDOM from 'react-dom/client';

export default function Home() {
  const [gameState, setGameState] = useState<GameState>({
    clues: [],
    availableWords: [],
    selectedWords: [],
    gameCompleted: false,
    startTime: null,
    endTime: null,
    currentDate: new Date().toDateString(),
    gameDate: getGameDateForToday(),
    forfeit: false,
    hintedWords: new Map(),
    title: ''
  });
  
  const [showResultModal, setShowResultModal] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(true);
  const [timerPaused, setTimerPaused] = useState(true);
  const [shouldFocusInput, setShouldFocusInput] = useState(false);
  
  // Initialize game
  useEffect(() => {
    // Only run client-side
    if (typeof window === 'undefined') return;
    
    const savedGameState = localStorage.getItem('bandadleGameStatev2');
    const today = new Date().toDateString();
    const hasSeenIntro = localStorage.getItem('bandadleIntroSeen');
    const todayGameDate = getGameDateForToday();
    
    if (hasSeenIntro === today) {
      setShowIntroModal(false);
    }
    
    // Check if URL has a date parameter - always initialize new game when date parameter is present
    const urlParams = new URLSearchParams(window.location.search);
    const isOverriddenDate = urlParams.has('date');
    
    if (isOverriddenDate) {
      // When date is specified in URL, always load a fresh game
      initializeNewGame();
      setShowIntroModal(true);
    } else if (savedGameState) {
      const parsedData = JSON.parse(savedGameState);
      
      // Convert hintedWords to Map, handling both object and array formats
      let hintedWordsMap = new Map();
      
      // Check if hintedWords exists and what format it's in
      if (parsedData.hintedWords) {
        if (Array.isArray(parsedData.hintedWords)) {
          // It's already in the entries format
          hintedWordsMap = new Map(parsedData.hintedWords);
        } else if (typeof parsedData.hintedWords === 'object') {
          // It's in object format, convert to entries
          Object.entries(parsedData.hintedWords).forEach(([key, value]) => {
            hintedWordsMap.set(key, value);
          });
        }
      }
      
      const parsedState = {
        ...parsedData,
        hintedWords: hintedWordsMap
      } as GameState;
      
      // If it's a new day or new game date, reset the game
      if (parsedState.currentDate !== today || parsedState.gameDate !== todayGameDate) {
        initializeNewGame();
        setShowIntroModal(true);
      } else {
        setGameState(parsedState);
      }
    } else {
      initializeNewGame();
    }
  }, []);
  
  // Save game state to localStorage
  useEffect(() => {
    if (gameState.clues.length > 0) {
      // Convert Map to array for serialization
      const serializedState = {
        ...gameState,
        hintedWords: Array.from(gameState.hintedWords.entries())
      };
      localStorage.setItem('bandadleGameStatev2', JSON.stringify(serializedState));
    }
  }, [gameState]);
  
  // Show modal when game is completed
  useEffect(() => {
    if (gameState.gameCompleted && !showResultModal) {
      setShowResultModal(true);
    }
  }, [gameState.gameCompleted]);
  
  // Start timer when game starts
  useEffect(() => {
    if (gameState.clues.length > 0 && !gameState.startTime && !gameState.gameCompleted && !showIntroModal) {
      setGameState(prev => ({
        ...prev,
        startTime: Date.now()
      }));
    }
  }, [gameState.clues, showIntroModal]);
  
  // Pause timer when showing intro modal or navigating away
  useEffect(() => {
    // Timer should be paused when intro modal is showing
    if (showIntroModal) {
      setTimerPaused(true);
    } else if (!gameState.gameCompleted) {
      setTimerPaused(false);
      // Trigger input focus when intro modal is closed
      setShouldFocusInput(true);
    }
  }, [showIntroModal, gameState.gameCompleted]);
  
  // Pause timer when user navigates away
  useEffect(() => {
    const handleBeforeUnload = () => {
      setTimerPaused(true);
    };
    
    // Listen for navigation events
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // For Next.js navigation
    const handleRouteChange = () => {
      setTimerPaused(true);
    };
    
    // Use a simpler approach to detect navigation
    const handleClick = (e: MouseEvent) => {
      // Check if it's a link click
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (link && link.href && !link.href.includes('#') && !e.ctrlKey && !e.metaKey) {
        setTimerPaused(true);
      }
    };
    
    document.addEventListener('click', handleClick);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleClick);
    };
  }, []);
  
  const initializeNewGame = () => {
    const todayGameDate = getGameDateForToday();
    const allWords = generateAvailableWords(todayGameDate);
    const todayClues = getCluesForDate(todayGameDate);
    const todayTitle = getTitleForDate(todayGameDate);
    
    setGameState({
      clues: [...todayClues],
      availableWords: allWords,
      selectedWords: [],
      gameCompleted: false,
      startTime: null,
      endTime: null,
      currentDate: new Date().toDateString(),
      gameDate: todayGameDate,
      forfeit: false,
      hintedWords: new Map(),
      title: todayTitle
    });
  };
  
  const handleWordClick = (word: string) => {
    setGameState(prev => ({
      ...prev,
      selectedWords: [...prev.selectedWords, word]
    }));
    
    // Check if the current sentence matches any of the answers
    checkForMatch([...gameState.selectedWords, word]);
  };
  
  const handleWordRemove = (index: number) => {
    // Get the current selected words and create a new array without the word at the given index
    const updatedWords = gameState.selectedWords.filter((_, i) => i !== index);
    
    // Update state first with the new words
    setGameState(prev => ({
      ...prev,
      selectedWords: updatedWords
    }));
    
    // Check if removing the word now matches any clue
    if (updatedWords.length > 0) {
      // Use setTimeout to ensure state is updated before checking matches
      setTimeout(() => checkForMatch(updatedWords), 0);
    }
  };
  
  const handleClearSentence = () => {
    setGameState(prev => ({
      ...prev,
      selectedWords: []
    }));
  };
  
  const checkForMatch = (selectedWords: string[]) => {
    const currentSentence = selectedWords.join(' ').toLowerCase();
    
    // Check if the sentence matches any clue
    let matchedClueId = -1;
    const updatedClues = gameState.clues.map(clue => {
      if (!clue.solved && clue.answer.toLowerCase() === currentSentence) {
        matchedClueId = clue.id;
        return { ...clue, solved: true };
      }
      return clue;
    });
    
    // If there was a match
    if (JSON.stringify(updatedClues) !== JSON.stringify(gameState.clues)) {
      // Remove these words from available words
      const wordsToRemove = new Set(selectedWords.map(w => w.toLowerCase()));
      
      // If the matched clue had hints, also remove the red herring words
      const newHintedWords = new Map(gameState.hintedWords);
      
      // Find all the answer words for remaining unsolved clues
      const remainingAnswerWords = new Set(
        updatedClues
          .filter(clue => !clue.solved)
          .flatMap(clue => clue.answer.split(' ').map(word => word.toLowerCase()))
      );
      
      // Only remove hints if we found a match and the clue used hints
      if (matchedClueId >= 0) {
        // Find the clue that was just solved
        const solvedClue = updatedClues.find(c => c.id === matchedClueId);
        
        // If the clue used hints, remove all red herring words
        if (solvedClue?.hinted) {
          // Identify and remove red herring words
          for (const [word, clueId] of newHintedWords.entries()) {
            if (clueId === matchedClueId) {
              // If it's a hint word for this clue and not needed for any remaining clue
              if (!remainingAnswerWords.has(word)) {
                // Add to words to remove
                wordsToRemove.add(word);
              }
              // Remove the highlighting in any case
              newHintedWords.delete(word);
            }
          }
        }
      }
      
      // Filter out all words that should be removed
      const filteredWords = gameState.availableWords.filter(
        word => !wordsToRemove.has(word.toLowerCase())
      );
      
      // Check if all clues are solved
      const allSolved = updatedClues.every(clue => clue.solved);
      
      setGameState(prev => ({
        ...prev,
        clues: updatedClues,
        availableWords: filteredWords,
        selectedWords: [],
        gameCompleted: allSolved,
        endTime: allSolved ? Date.now() : prev.endTime,
        hintedWords: newHintedWords
      }));
    }
  };
  
  const handleStartGame = () => {
    setShowIntroModal(false);
    localStorage.setItem('bandadleIntroSeen', new Date().toDateString());
    setShouldFocusInput(true);
    
    // Start the timer after closing the intro modal
    if (gameState.clues.length > 0 && !gameState.startTime && !gameState.gameCompleted) {
      setGameState(prev => ({
        ...prev,
        startTime: Date.now()
      }));
    }
  };
  
  const handleGiveUp = () => {
    if (!gameState.gameCompleted) {
      // Mark only unsolved clues as failed
      const updatedClues = gameState.clues.map(clue => {
        // Keep already solved clues as is
        if (clue.solved) {
          return clue;
        }
        // Mark unsolved clues as solved but failed
        return {
          ...clue,
          solved: true,
          failed: true // Add failed flag
        };
      });
      
      // Clear all hints
      const newHintedWords = new Map();
      
      // Find all hint words that are not part of any answer
      const allAnswerWords = new Set(
        gameState.clues.flatMap(c => 
          c.answer.split(' ').map(word => word.toLowerCase())
        )
      );
      
      // Identify words to remove (red herrings that are not used in any answer)
      const wordsToRemove = new Set();
      for (const [word, clueId] of gameState.hintedWords.entries()) {
        if (!allAnswerWords.has(word)) {
          wordsToRemove.add(word);
        }
      }
      
      // Remove red herring words from available words
      const filteredWords = gameState.availableWords.filter(
        word => !wordsToRemove.has(word.toLowerCase())
      );
      
      setGameState(prev => ({
        ...prev,
        clues: updatedClues,
        gameCompleted: true,
        endTime: Date.now(),
        forfeit: true,
        hintedWords: newHintedWords,
        availableWords: filteredWords
      }));
    }
  };
  
  const closeResultModal = () => {
    setShowResultModal(false);
  };
  
  const handleHint = (clueId: number) => {
    // Find the clue by ID
    const clue = gameState.clues.find(c => c.id === clueId);
    if (!clue || clue.solved) return;
    
    // Get all words from the answer
    const answerWords = clue.answer.split(' ').map(word => word.toLowerCase());
    
    // Mark the clue as hinted
    const updatedClues = gameState.clues.map(c => 
      c.id === clueId ? { ...c, hinted: true } : c
    );
    
    // Find all words that are part of any answer
    const allAnswerWords = new Set(
      gameState.clues.flatMap(c => 
        c.answer.split(' ').map(word => word.toLowerCase())
      )
    );
    
    // Get words that aren't part of any answer for use as red herrings
    const availableForHint = gameState.availableWords.filter(
      word => !allAnswerWords.has(word.toLowerCase())
    );
    
    let redHerringWords: string[] = [];
    if (availableForHint.length > 0) {
      // Shuffle and take up to 3 words
      redHerringWords = availableForHint
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.min(3, availableForHint.length));
    }
    
    // Create a new Map from the existing one
    const newHintedWords = new Map(gameState.hintedWords);
    
    // Add answer words with the current clue ID
    answerWords.forEach(word => {
      newHintedWords.set(word, clueId);
    });
    
    // Add red herring words with the current clue ID
    redHerringWords.forEach(word => {
      // Store the word in lowercase to match how we look them up
      newHintedWords.set(word.toLowerCase(), clueId);
    });
    
    setGameState(prev => ({
      ...prev,
      clues: updatedClues,
      hintedWords: newHintedWords
    }));
  };
  
  const handleShowIntro = () => {
    setShowIntroModal(true);
    setTimerPaused(true);
  };
  
  // Check if we're viewing a date other than today
  const isViewingHistoricalPuzzle = () => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).has('date');
  };

  // Return to today's puzzle
  const returnToToday = () => {
    if (typeof window !== 'undefined') {
      // Using window.location.replace to force a full page reload and avoid hydration issues
      window.location.replace('/');
    }
  };
  
  // Render HeaderMenu into the container on mount
  useEffect(() => {
    const headerMenuContainer = document.getElementById('headerMenuContainer');
    if (headerMenuContainer && typeof window !== 'undefined') {
      try {
        const root = ReactDOM.createRoot(headerMenuContainer);
        root.render(
          <HeaderMenu 
            onShowIntro={handleShowIntro}
            onGiveUp={handleGiveUp}
            gameStarted={!!gameState.startTime && !gameState.gameCompleted}
          />
        );
      } catch (error) {
        console.error('Error rendering header menu:', error);
      }
    }
  }, [gameState.startTime, gameState.gameCompleted]);
  
  // Reset focus trigger after it's been used
  useEffect(() => {
    if (shouldFocusInput) {
      const timer = setTimeout(() => {
        setShouldFocusInput(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [shouldFocusInput]);
  
  return (
    <>
      <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
        <GameTimer 
          startTime={gameState.startTime} 
          endTime={gameState.endTime}
          isPaused={timerPaused}
        />
        
        {gameState.title && !showIntroModal && (
          <motion.div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                textAlign: 'center',
                margin: '0.5rem 0 1rem',
                color: 'rgb(31, 70, 57)'
              }}
            >
              {gameState.title}
            </motion.h1>
            
            {isViewingHistoricalPuzzle() && (
              <div style={{ marginTop: '0.5rem' }}>
                <motion.button
                  onClick={returnToToday}
                  initial={{ boxShadow: '0 0 0 rgba(0, 0, 0, 0)' }}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}
                  whileTap={{ scale: 0.95 }}
                  style={{ 
                    backgroundColor: 'rgb(31, 70, 57)',
                    color: 'white',
                    padding: '0.35rem 1rem',
                    borderRadius: '0.375rem',
                    fontWeight: '500',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    border: 'none'
                  }}
                >
                  Return to Today's Puzzle
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          rowGap: '1.25rem',
          columnGap: '0.75rem',
          marginBottom: '1.25rem' 
        }}>
          <AnimatePresence>
            {gameState.clues.map(clue => (
              <motion.div
                key={clue.id}
                initial={{ opacity: 0, y: 10, boxShadow: '0 0 0 rgba(0, 0, 0, 0)' }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' 
                }}
                transition={{ duration: 0.2, delay: clue.id * 0.05 }}
              >
                <ClueCard 
                  clue={clue} 
                  showHidden={showIntroModal} 
                  forfeit={gameState.forfeit}
                  onHint={!gameState.gameCompleted ? handleHint : undefined}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        <SentenceBuilder 
          selectedWords={gameState.selectedWords}
          onWordRemove={handleWordRemove}
          onClearSentence={handleClearSentence}
          showHidden={showIntroModal}
          availableWords={gameState.availableWords}
          onWordClick={handleWordClick}
          shouldFocus={shouldFocusInput}
          clues={gameState.clues}
          checkForMatch={checkForMatch}
        />
        
        <div className="flex-1 overflow-auto">
          <WordGrid 
            words={gameState.availableWords} 
            onWordClick={handleWordClick}
            startTime={gameState.startTime}
            endTime={gameState.endTime}
            showHidden={showIntroModal}
            hintedWords={gameState.hintedWords}
          />
        </div>
        
        {gameState.startTime && !gameState.gameCompleted && (
          <div style={{ 
            marginTop: '2.5rem', 
            marginBottom: '1.5rem',
            display: 'flex', 
            justifyContent: 'center' 
          }}>
            <motion.button
              onClick={handleGiveUp}
              initial={{ boxShadow: '0 0 0 rgba(0, 0, 0, 0)' }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
              whileTap={{ scale: 0.95 }}
              style={{ 
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '0.5rem 2rem',
                borderRadius: '0.5rem',
                fontWeight: '500',
                fontSize: '0.875rem',
                cursor: 'pointer',
                border: 'none',
                minWidth: '150px'
              }}
            >
              Give Up
            </motion.button>
          </div>
        )}
        
        <ResultModal 
          isOpen={showResultModal}
          startTime={gameState.startTime}
          endTime={gameState.endTime}
          onClose={closeResultModal}
          forfeit={gameState.forfeit}
          clues={gameState.clues}
          gameDate={gameState.gameDate}
        />
        
        <IntroModal 
          isOpen={showIntroModal}
          onStart={handleStartGame}
        />
      </div>
    </>
  );
}
