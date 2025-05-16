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

const FlashcardViewer: React.FC = () => {
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();
  
  const [cardsList, setCardsList] = useState<Card[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showFront, setShowFront] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCards = async () => {
      if (!setId) return;
      
      setIsLoading(true);
      try {
        const response = await cards.getAllForSet(parseInt(setId));
        setCardsList(response.data);
      } catch (err: any) {
        console.error('Error fetching cards:', err);
        setError('Failed to load flashcards. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCards();
  }, [setId]);

  const flipCard = () => {
    setShowFront(!showFront);
  };

  const nextCard = () => {
    setShowFront(true); // Reset to front side
    setCurrentCardIndex((prevIndex) => {
      if (prevIndex >= cardsList.length - 1) {
        return 0; // Loop back to the beginning
      }
      return prevIndex + 1;
    });
  };

  const prevCard = () => {
    setShowFront(true); // Reset to front side
    setCurrentCardIndex((prevIndex) => {
      if (prevIndex <= 0) {
        return cardsList.length - 1; // Loop to the end
      }
      return prevIndex - 1;
    });
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
          onClick={() => navigate('/sets')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Back to My Sets
        </button>
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

  const currentCard = cardsList[currentCardIndex];

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Flashcards</h1>
        <div className="text-sm text-gray-500">
          Card {currentCardIndex + 1} of {cardsList.length}
        </div>
      </div>

      {/* Flashcard */}
      <div 
        onClick={flipCard}
        className="w-full h-64 md:h-96 bg-white rounded-lg shadow-lg cursor-pointer perspective-1000 transition-transform duration-300 my-6"
      >
        <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${showFront ? '' : 'rotate-y-180'}`}>
          {/* Front side */}
          <div className={`absolute w-full h-full backface-hidden p-6 flex flex-col items-center justify-center text-center ${showFront ? '' : 'hidden'}`}>
            <h2 className="text-2xl font-bold text-gray-900">{currentCard.term}</h2>
            {currentCard.image_url && (
              <div className="mt-4">
                <img src={currentCard.image_url} alt={currentCard.term} className="max-h-48 max-w-full object-contain" />
              </div>
            )}
            <div className="absolute bottom-4 left-0 right-0 text-center text-gray-500 text-sm">
              Click to flip
            </div>
          </div>
          
          {/* Back side */}
          <div className={`absolute w-full h-full backface-hidden p-6 flex flex-col items-center justify-center text-center rotate-y-180 ${showFront ? 'hidden' : ''}`}>
            <p className="text-xl text-gray-700">{currentCard.definition}</p>
            <div className="absolute bottom-4 left-0 right-0 text-center text-gray-500 text-sm">
              Click to flip
            </div>
          </div>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-center space-x-4 mt-6">
        <button
          onClick={prevCard}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Previous
        </button>
        <button
          onClick={flipCard}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Flip
        </button>
        <button
          onClick={nextCard}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Next
        </button>
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

export default FlashcardViewer;
