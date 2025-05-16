import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { sets, cards } from '../../api/api';

// Type definitions
interface Set {
  id: number;
  title: string;
  description: string;
  user_id: number;
  user_email?: string;
  is_public: boolean;
}

interface Card {
  id: number;
  term: string;
  definition: string;
  image_url?: string;
  audio_url?: string;
}

const PublicSetViewer: React.FC = () => {
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();
  
  const [set, setSet] = useState<Set | null>(null);
  const [cardsList, setCardsList] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSetAndCards = async () => {
      if (!setId) return;
      
      setIsLoading(true);
      try {
        // Fetch set details
        const setResponse = await sets.getById(parseInt(setId));
        const setData = setResponse.data;
        
        // Ensure the set is public
        if (!setData.is_public) {
          setError('This set is private and cannot be viewed.');
          setIsLoading(false);
          return;
        }
        
        setSet(setData);
        
        // Fetch cards for this set
        const cardsResponse = await cards.getAllForSet(parseInt(setId));
        setCardsList(cardsResponse.data);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError('Failed to load flashcard set. It may be private or no longer exist.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSetAndCards();
  }, [setId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !set) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error || 'Flashcard set not found.'}</span>
        </div>
        <button
          onClick={() => navigate('/search')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Back to Search
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{set.title}</h1>
        <p className="mt-2 text-gray-600">{set.description}</p>
        {set.user_email && (
          <p className="mt-1 text-sm text-gray-500">Created by: {set.user_email}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-y-4 mb-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-xl font-medium text-gray-900">Study Options</h2>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Link
                to={`/study/public/${set.id}/flashcards`}
                className="inline-flex flex-col items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                Flashcards
              </Link>
              <Link
                to={`/study/public/${set.id}/learn`}
                className="inline-flex flex-col items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Learn
              </Link>
              <Link
                to={`/study/public/${set.id}/test`}
                className="inline-flex flex-col items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Test
              </Link>
              <Link
                to={`/study/public/${set.id}/match`}
                className="inline-flex flex-col items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Match
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h2 className="text-xl font-medium text-gray-900">Cards in this set ({cardsList.length})</h2>
        </div>
        
        {cardsList.length === 0 ? (
          <div className="px-4 py-5 sm:p-6">
            <p className="text-gray-500">This set doesn't have any cards yet.</p>
          </div>
        ) : (
          <div className="border-t border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Term
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Definition
                  </th>
                </tr>
              </thead>
              <tbody>
                {cardsList.map((card, index) => (
                  <tr key={card.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">
                      {card.term}
                      {card.image_url && (
                        <div className="mt-2">
                          <img src={card.image_url} alt={card.term} className="h-12 w-auto object-contain" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-500">
                      {card.definition}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="mt-8 flex justify-center">
        <button
          onClick={() => navigate('/search')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Back to Search
        </button>
      </div>
    </div>
  );
};

export default PublicSetViewer;
