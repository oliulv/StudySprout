import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cards } from '../../api/api';

// Type definitions
interface Card {
  id: number;
  term: string;
  definition: string;
  image_url?: string;
  audio_url?: string;
}

interface MatchItem {
  id: string;
  content: string;
  type: 'term' | 'definition';
  cardId: number;
  matched: boolean;
  selected: boolean;
}

const MatchGame: React.FC = () => {
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();
  
  const [cardsList, setCardsList] = useState<Card[]>([]);
  const [matchItems, setMatchItems] = useState<MatchItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MatchItem | null>(null);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCards = async () => {
      if (!setId) return;
      
      setIsLoading(true);
      try {
        const response = await cards.getAllForSet(parseInt(setId));
        setCardsList(response.data);
        
        if (response.data.length < 2) {
          setError('This set needs at least 2 cards to play the match game.');
          setIsLoading(false);
          return;
        }
        
        // Initialize the game
        initializeGame(response.data);
      } catch (err: any) {
        console.error('Error fetching cards:', err);
        setError('Failed to load flashcards. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCards();

    return () => {
      // Clean up timer on component unmount
      setTimerRunning(false);
    };
  }, [setId]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timerRunning) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning]);

  const initializeGame = (cards: Card[]) => {
    // Limit to 10 cards for better gameplay
    const gameCards = cards.slice(0, 10);
    
    // Create match items from cards (terms and definitions)
    const items: MatchItem[] = [];
    
    gameCards.forEach(card => {
      // Add term
      items.push({
        id: `term-${card.id}`,
        content: card.term,
        type: 'term',
        cardId: card.id,
        matched: false,
        selected: false
      });
      
      // Add definition
      items.push({
        id: `def-${card.id}`,
        content: card.definition,
        type: 'definition',
        cardId: card.id,
        matched: false,
        selected: false
      });
    });
    
    // Shuffle the items
    const shuffledItems = [...items].sort(() => Math.random() - 0.5);
    setMatchItems(shuffledItems);
    
    // Start the timer
    setTimeElapsed(0);
    setTimerRunning(true);
  };

  const handleItemClick = (item: MatchItem) => {
    // Ignore if already matched or the same item is clicked again
    if (item.matched || item.selected) return;
    
    // If no item is selected yet, select this one
    if (!selectedItem) {
      setMatchItems(prevItems =>
        prevItems.map(i => (i.id === item.id ? { ...i, selected: true } : i))
      );
      setSelectedItem(item);
      return;
    }
    
    // If an item is already selected, check if it matches with the current item
    if (
      selectedItem.cardId === item.cardId && 
      selectedItem.type !== item.type
    ) {
      // Match found
      setMatchItems(prevItems =>
        prevItems.map(i => {
          if (i.id === item.id || i.id === selectedItem.id) {
            return { ...i, matched: true, selected: false };
          }
          return i;
        })
      );
    } else {
      // No match - briefly show the selection, then reset
      setMatchItems(prevItems =>
        prevItems.map(i => (i.id === item.id ? { ...i, selected: true } : i))
      );
      
      // Wait a short time, then clear selections
      setTimeout(() => {
        setMatchItems(prevItems =>
          prevItems.map(i => {
            if (i.id === item.id || i.id === selectedItem.id) {
              return { ...i, selected: false };
            }
            return i;
          })
        );
      }, 1000);
    }
    
    // Clear the selected item
    setSelectedItem(null);
    
    // Check if game is complete
    const allMatched = matchItems.every(item => item.matched || item.id === item.id);
    if (allMatched) {
      setIsGameComplete(true);
      setTimerRunning(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const restartGame = () => {
    if (cardsList.length > 0) {
      initializeGame(cardsList);
      setIsGameComplete(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
        <button
          onClick={() => navigate(`/sets/${setId}`)}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Back to Set
        </button>
      </div>
    );
  }

  if (isGameComplete) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white shadow-lg rounded-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Game Complete!</h1>
          <p className="text-xl mb-6">
            You matched all pairs in <span className="font-bold">{formatTime(timeElapsed)}</span>!
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={restartGame}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Play Again
            </button>
            <button
              onClick={() => navigate(`/sets/${setId}`)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Set
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Match Game</h1>
        <div className="text-xl font-medium">
          Time: {formatTime(timeElapsed)}
        </div>
      </div>
      
      <p className="text-gray-600 mb-6">
        Match each term with its correct definition by clicking on the cards.
      </p>

      {/* Game grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {matchItems.map((item) => (
          <div
            key={item.id}
            onClick={() => handleItemClick(item)}
            className={`
              h-32 p-4 flex items-center justify-center text-center rounded-lg shadow cursor-pointer transition-all
              ${item.matched 
                ? 'bg-green-100 border-2 border-green-500' 
                : item.selected 
                  ? 'bg-indigo-100 border-2 border-indigo-500' 
                  : 'bg-white hover:bg-gray-50'
              }
            `}
          >
            <span className="text-sm sm:text-base">
              {item.matched || item.selected ? item.content : '?'}
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-8 flex justify-center">
        <button
          onClick={() => navigate(`/sets/${setId}`)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Back to Set
        </button>
      </div>
    </div>
  );
};

export default MatchGame;
