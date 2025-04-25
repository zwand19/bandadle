export interface Clue {
  id: number;
  question: string;
  answer: string;
  solved: boolean;
  failed?: boolean;
  hinted?: boolean;
}

export interface GameState {
  clues: Clue[];
  availableWords: string[];
  selectedWords: string[];
  gameCompleted: boolean;
  startTime: number | null;
  endTime: number | null;
  currentDate: string;
  gameDate: string;
  forfeit: boolean;
  hintedWords: Map<string, number>;
  title: string;
}

export interface ResultEmoji {
  [key: string]: string;
} 