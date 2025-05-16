import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sets } from '../../api/api';

// Type definitions
interface Set {
  id: number;
  title: string;
  description: string;
  user_id: number;
  user_email?: string;
  is_public: boolean;
  card_count?: number;
}

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Set[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If the search bar is empty, fetch popular/recent public sets as suggestions
    if (!query) {
      fetchPopularSets();
    }
  }, []);

  const fetchPopularSets = async () => {
    setIsLoading(true);
    try {
      const response = await sets.getPublic('');
      setSearchResults(response.data);
    } catch (err: any) {
      console.error('Error fetching popular sets:', err);
      setError('Failed to load popular sets. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      fetchPopularSets();
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await sets.getPublic(query);
      setSearchResults(response.data);
      setError('');
    } catch (err: any) {
      console.error('Error searching sets:', err);
      setError('Failed to search sets. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Find Study Sets</h1>
      
      <div className="flex mb-6">
        <div className="relative flex-grow">
          <input
            type="text"
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
            placeholder="Search for sets by title or description..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {isLoading && (
              <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
          </div>
        </div>
        <button
          className="ml-3 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={handleSearch}
          disabled={isLoading}
        >
          Search
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {query ? 'Search Results' : 'Popular Study Sets'}
        </h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
            <p className="text-gray-500 text-lg">No study sets found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {searchResults.map((set) => (
              <div key={set.id} className="bg-white shadow overflow-hidden rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">{set.title}</h3>
                  <div className="mt-2 max-w-xl text-sm text-gray-500">
                    <p>{set.description}</p>
                  </div>
                  <div className="mt-3 text-sm">
                    {set.user_email && (
                      <p className="text-xs text-gray-500">Created by: {set.user_email}</p>
                    )}
                    <span className="text-xs text-gray-500">{set.card_count || 0} cards</span>
                  </div>
                </div>
                <div className="px-4 py-4 sm:px-6">
                  <Link
                    to={`/study/public/${set.id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Study This Set
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
