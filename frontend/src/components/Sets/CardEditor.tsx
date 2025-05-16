import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sets, cards } from '../../api/api';

// Type definitions
interface Card {
  id?: number;
  term: string;
  definition: string;
  image_url?: string;
  audio_url?: string;
}

interface Set {
  id: number;
  title: string;
  description: string;
  is_public: boolean;
}

const CardEditor: React.FC = () => {
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();
  
  const [set, setSet] = useState<Set | null>(null);
  const [cardsList, setCardsList] = useState<Card[]>([]);
  const [newCard, setNewCard] = useState<Card>({ term: '', definition: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchSetAndCards = async () => {
      if (!setId) return;
      
      setIsLoading(true);
      try {
        // Fetch set details
        const setResponse = await sets.getById(parseInt(setId));
        setSet(setResponse.data);
        
        // Fetch cards for this set
        const cardsResponse = await cards.getAllForSet(parseInt(setId));
        setCardsList(cardsResponse.data);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError('Failed to load flashcard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSetAndCards();
  }, [setId]);

  const handleAddCard = async () => {
    if (!setId || !newCard.term.trim() || !newCard.definition.trim()) {
      setError('Both term and definition are required');
      return;
    }

    setIsSaving(true);
    try {
      const response = await cards.create(parseInt(setId), newCard);
      setCardsList([...cardsList, response.data]);
      setNewCard({ term: '', definition: '' }); // Clear form
      setSuccess('Card added successfully!');
      setTimeout(() => setSuccess(''), 3000); // Clear success message after 3 seconds
    } catch (err: any) {
      console.error('Error adding card:', err);
      setError(err.response?.data?.message || 'Failed to add card. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateCard = async (index: number, updatedCard: Card) => {
    if (!setId || !updatedCard.id) return;
    
    setIsSaving(true);
    try {
      await cards.update(parseInt(setId), updatedCard.id, updatedCard);
      
      // Update the cards list with the edited card
      const updatedCardsList = [...cardsList];
      updatedCardsList[index] = updatedCard;
      setCardsList(updatedCardsList);
      
      setSuccess('Card updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error updating card:', err);
      setError(err.response?.data?.message || 'Failed to update card. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCard = async (cardId: number | undefined) => {
    if (!setId || !cardId) return;
    
    if (!window.confirm('Are you sure you want to delete this card?')) {
      return;
    }

    setIsSaving(true);
    try {
      await cards.delete(parseInt(setId), cardId);
      setCardsList(cardsList.filter(card => card.id !== cardId));
      setSuccess('Card deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error deleting card:', err);
      setError(err.response?.data?.message || 'Failed to delete card. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeCardField = (index: number, field: keyof Card, value: string) => {
    const updatedCardsList = [...cardsList];
    updatedCardsList[index] = { ...updatedCardsList[index], [field]: value };
    setCardsList(updatedCardsList);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!set) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">Flashcard set not found.</span>
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit: {set.title}</h1>
        <button
          onClick={() => navigate('/sets')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Done
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError('')}
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{success}</span>
        </div>
      )}

      {/* Add new card form */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Card</h3>
          <div className="mt-5 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label htmlFor="term" className="block text-sm font-medium text-gray-700">
                Term
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="term"
                  id="term"
                  value={newCard.term}
                  onChange={(e) => setNewCard({ ...newCard, term: e.target.value })}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <label htmlFor="definition" className="block text-sm font-medium text-gray-700">
                Definition
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="definition"
                  id="definition"
                  value={newCard.definition}
                  onChange={(e) => setNewCard({ ...newCard, definition: e.target.value })}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
          <div className="mt-5">
            <button
              type="button"
              onClick={handleAddCard}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isSaving ? 'Adding...' : 'Add Card'}
            </button>
          </div>
        </div>
      </div>

      {/* Cards list */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Cards ({cardsList.length})</h2>
      
      {cardsList.length === 0 ? (
        <div className="text-center py-10 bg-white shadow overflow-hidden sm:rounded-lg">
          <p className="text-gray-500">No cards yet. Add your first card above!</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {cardsList.map((card, index) => (
              <li key={card.id || index} className="px-4 py-4">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Term</label>
                    <input
                      type="text"
                      value={card.term}
                      onChange={(e) => handleChangeCardField(index, 'term', e.target.value)}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Definition</label>
                    <input
                      type="text"
                      value={card.definition}
                      onChange={(e) => handleChangeCardField(index, 'definition', e.target.value)}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => handleUpdateCard(index, card)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCard(card.id)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CardEditor;
