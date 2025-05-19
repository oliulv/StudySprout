import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cards, progress } from '../../api/api';

// Type definitions
interface Card {
  id: number;
  term: string;
  definition: string;
  image_url?: string;
  audio_url?: string;
  mastery_level?: number; // 0 = unknown, 1 = known
}

const LearnMode: React.FC = () => {
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();
  
  const [cardsList, setCardsList] = useState<Card[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchCards = async () => {
      if (!setId) return;
      
      setIsLoading(true);
      try {
        // Fetch cards
        const cardsResponse = await cards.getAllForSet(parseInt(setId));
        
        // Fetch user progress for these cards
        const progressResponse = await progress.getUserProgress();
        
        // Combine card data with progress data
        const cardsWithProgress = cardsResponse.data.map((card: Card) => {
          const cardProgress = progressResponse.data.find((p: any) => p.card_id === card.id);
          return {
            ...card,
            mastery_level: cardProgress ? cardProgress.mastery_level : 0
          };
        });
        
        setCardsList(cardsWithProgress);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setErrorMessage('Failed to load flashcards. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCards();
  }, [setId]);

  // Sort cards - show unknown cards (mastery_level = 0) more frequently
  const sortedCards = useMemo(() => {
    // Clone to avoid modifying the original array
    const cards = [...cardsList];
    return cards.sort((a, b) => {
      // Unknown cards (mastery_level = 0) come first
      return (a.mastery_level || 0) - (b.mastery_level || 0);
    });
  }, [cardsList]);

  const markCardAs = async (cardId: number, masteryLevel: number) => {
    try {
      await progress.updateCardProgress(cardId, { mastery_level: masteryLevel });
      
      // Update the local state
      setCardsList(cardsList.map(card => {
        if (card.id === cardId) {
          return { ...card, mastery_level: masteryLevel };
        }
        return card;
      }));
      
      // Move to the next card
      nextCard();
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  };

  const nextCard = () => {
    setShowAnswer(false);
    setCurrentCardIndex((prevIndex) => {
      if (prevIndex >= sortedCards.length - 1) {
        return 0; // Loop back to the beginning
      }
      return prevIndex + 1;
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (cardsList.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">This set doesn't have any cards yet.</span>
        </div>
        <button
          onClick={() => navigate(`/sets/${setId}/edit`)}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Add Cards
        </button>
      </div>
    );
  }

  if (sortedCards.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const currentCard = sortedCards[currentCardIndex];
  const knownCardsCount = cardsList.filter(card => card.mastery_level === 1).length;
  const progressPercentage = Math.round((knownCardsCount / cardsList.length) * 100);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Learn Mode</h1>
        <div className="text-sm text-gray-500">
          Card {currentCardIndex + 1} of {sortedCards.length}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div 
          className="bg-green-600 h-2.5 rounded-full" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <div className="text-sm text-gray-500 mb-6">
        {knownCardsCount} of {cardsList.length} cards mastered ({progressPercentage}%)
      </div>

      {/* Card */}
      <div className="w-full bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentCard.term}</h2>
        
        {currentCard.image_url && (
          <div className="mb-4">
            <img src={currentCard.image_url} alt={currentCard.term} className="max-h-48 max-w-full object-contain mx-auto" />
          </div>
        )}
        
        {showAnswer ? (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Definition:</h3>
            <p className="text-xl">{currentCard.definition}</p>
          </div>
        ) : (
          <button
            onClick={() => setShowAnswer(true)}
            className="w-full py-2 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Show Answer
          </button>
        )}

        {showAnswer && (
          <div className="mt-8 flex space-x-4">
            <button
              onClick={() => markCardAs(currentCard.id, 0)}
              className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Still Learning
            </button>
            <button
              onClick={() => markCardAs(currentCard.id, 1)}
              className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Know It
            </button>
          </div>
        )}
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

export default LearnMode;
