import { Clue } from './types';
import cluesData from './clues.json';

// Get date in YYYY-MM-DD format
export const getFormattedDate = (date: Date = new Date()): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// For demo purposes, use the mock date based on actual day
// This simulates having daily puzzles while using our limited demo data
export const getGameDateForToday = (): string => {
  const availableDates = Object.keys(cluesData);
  
  // Check for URL parameter date override - client-side only
  if (typeof window !== 'undefined') {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const dateParam = urlParams.get('date');
      
      if (dateParam) {
        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (dateRegex.test(dateParam)) {
          // Check if the requested date exists in our data
          if (availableDates.includes(dateParam)) {
            return dateParam;
          }
        }
      }
    } catch (e) {
      // If URL parsing fails, continue with default behavior
      console.error("Error parsing URL parameters:", e);
    }
  }
  
  const today = new Date();
  
  // Try to use today's date, or fall back to the latest available date
  const todayFormatted = getFormattedDate(today);
  return availableDates.includes(todayFormatted) 
    ? todayFormatted 
    : availableDates[availableDates.length - 1];
};

// Get clues for a specific date or today
export const getCluesForDate = (dateString?: string): Clue[] => {
  const gameDate = dateString || getGameDateForToday();
  
  // Get the clues for the specified date or fallback to the first available date
  const availableDates = Object.keys(cluesData);
  const date = availableDates.includes(gameDate) ? gameDate : availableDates[0];
  
  return (cluesData as any)[date]?.clues || [];
};

// Get title for a specific date or today
export const getTitleForDate = (dateString?: string): string => {
  const gameDate = dateString || getGameDateForToday();
  
  // Get the title for the specified date or fallback to the first available date
  const availableDates = Object.keys(cluesData);
  const date = availableDates.includes(gameDate) ? gameDate : availableDates[0];
  
  return (cluesData as any)[date]?.title || 'Daily Puzzle';
};

// Get extra words for a specific date
export const getExtraWordsForDate = (dateString?: string): string[] => {
  const gameDate = dateString || getGameDateForToday();
  
  // Get the extra words for the specified date or fallback to the first available date
  const availableDates = Object.keys(cluesData);
  const date = availableDates.includes(gameDate) ? gameDate : availableDates[0];
  
  return (cluesData as any)[date]?.extraWords || [];
};

// For backward compatibility
export const mockClues: Clue[] = getCluesForDate();

// Extract all unique words from answers and add extra related words
export const generateAvailableWords = (dateString?: string): string[] => {
  // Get clues for the specified date
  const clues = getCluesForDate(dateString);
  
  // Get all words from the answers
  const answerWords = clues
    .map(clue => clue.answer.split(' '))
    .flat()
    .map(word => word.toLowerCase());
  
  // Get extra words for the date
  const extraWords = getExtraWordsForDate(dateString);
  
  // Combine all words, remove duplicates, and sort alphabetically
  const allWords = [...new Set([...answerWords, ...extraWords])];
  
  // Ensure words are all lowercase for matching purposes
  return allWords
    .filter(word => word.trim() !== '')
    .sort((a, b) => a.localeCompare(b));
};

export const formatTime = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const getResultEmojis = (
  elapsedTimeMs: number, 
  forfeit: boolean = false, 
  solvedClues: number = 4, 
  failedClues: number = 0,
  hintedClues: number = 0,
  clues: Clue[] = [],
  gameDate?: string
): string => {
  // Convert to seconds
  const elapsedTime = Math.floor(elapsedTimeMs / 1000);
  
  // Determine emoji based on time
  let timeEmoji = '🔥'; // Default - amazing time
  
  if (forfeit) {
    timeEmoji = '❌';
  } else if (elapsedTime > 180) { // > 3 minutes
    timeEmoji = '⏱️';
  } else if (elapsedTime > 120) { // > 2 minutes
    timeEmoji = '⚡';
  }
  
  const formattedTime = formatTime(elapsedTimeMs);
  
  // Calculate actual solved count (without failed ones)
  const actualSolved = solvedClues - failedClues;
  
  // Generate emojis in clue order
  let completionEmojis = '';
  
  // If clues are provided, use them to determine the emoji order
  if (clues && clues.length > 0) {
    // Sort clues by ID to ensure they're in the correct order
    const orderedClues = [...clues].sort((a, b) => a.id - b.id);
    
    // Create an emoji for each clue in order
    completionEmojis = orderedClues.map(clue => {
      if (clue.failed) {
        return '🟥'; // Failed/given up
      } else if (clue.solved && clue.hinted) {
        return '🟨'; // Solved with hint
      } else if (clue.solved) {
        return '🟩'; // Solved without hint
      } else {
        return '⬜'; // Not solved (shouldn't happen in results, but just in case)
      }
    }).join('');
  } else {
    // Fallback to the old way if no clues are provided
    const greenSquares = '🟩'.repeat(actualSolved - hintedClues);  // Green for solved without hints
    const yellowSquares = '🟨'.repeat(hintedClues);                // Yellow for solved with hints
    const redSquares = '🟥'.repeat(failedClues);                   // Red for failed (revealed via give up)
    
    completionEmojis = greenSquares + yellowSquares + redSquares;
  }
  
  // Format the display date - use gameDate if provided, otherwise use today
  let displayDate = new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
  
  // If gameDate is provided (format: YYYY-MM-DD), parse and format it
  if (gameDate) {
    try {
      const [year, month, day] = gameDate.split('-').map(n => parseInt(n, 10));
      // Month is 0-indexed in JavaScript Date
      const date = new Date(year, month - 1, day);
      displayDate = date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
    } catch (e) {
      // Fallback to today's date if parsing fails
    }
  }
  
  return `Bandadle ${displayDate}\n${actualSolved}/4 ${timeEmoji}\nTime: ${formattedTime}\n\n${completionEmojis}\n\nbandadle.com`;
}; 