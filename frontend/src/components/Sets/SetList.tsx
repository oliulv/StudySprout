import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sets } from '../../api/api';

// Type definitions
interface Set {
  id: number;
  title: string;
  description: string;
  is_public: boolean;
  card_count?: number;
}

const SetList: React.FC = () => {
  const [userSets, setUserSets] = useState<Set[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSets = async () => {
      setIsLoading(true);
      try {
        const response = await sets.getAll();
        setUserSets(response.data);
        setError('');
      } catch (err: any) {
        setError('Failed to load your flashcard sets. Please try again later.');
        console.error('Error fetching sets:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSets();
  }, []);

  const handleDeleteSet = async (setId: number) => {
    if (!window.confirm('Are you sure you want to delete this set? This action cannot be undone.')) {
      return;
    }

    try {
      await sets.delete(setId);
      setUserSets(userSets.filter((set) => set.id !== setId));
    } catch (err) {
      console.error('Error deleting set:', err);
      setError('Failed to delete the set. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Flashcard Sets</h1>
        <Link
          to="/sets/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create New Set
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {userSets.length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
          <p className="text-gray-500 text-lg">You don't have any flashcard sets yet.</p>
          <Link
            to="/sets/new"
            className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create your first set!
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {userSets.map((set) => (
            <div key={set.id} className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">{set.title}</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>{set.description}</p>
                </div>
                <div className="mt-3 text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    set.is_public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {set.is_public ? 'Public' : 'Private'}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">{set.card_count || 0} cards</span>
                </div>
              </div>
              <div className="px-4 py-4 sm:px-6 flex justify-between">
                <div className="flex space-x-2">
                  <Link
                    to={`/sets/${set.id}`}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    View
                  </Link>
                  <Link
                    to={`/sets/${set.id}/edit`}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Edit
                  </Link>
                </div>
                <button
                  onClick={() => handleDeleteSet(set.id)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
              <div className="px-4 py-4 sm:px-6 bg-gray-50 flex justify-between">
                <Link
                  to={`/study/${set.id}/flashcards`}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  Flashcards
                </Link>
                <Link
                  to={`/study/${set.id}/learn`}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  Learn
                </Link>
                <Link
                  to={`/study/${set.id}/test`}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  Test
                </Link>
                <Link
                  to={`/study/${set.id}/match`}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  Match
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SetList;
