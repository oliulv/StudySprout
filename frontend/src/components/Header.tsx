import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../api/AuthContext';

const Header: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-indigo-600">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="w-full py-6 flex items-center justify-between border-b border-indigo-500 lg:border-none">
          <div className="flex items-center">
            <Link to="/" className="text-white text-2xl font-bold">
              StudySprout
            </Link>
            {isAuthenticated && (
              <div className="hidden ml-10 space-x-8 lg:block">
                <Link to="/sets" className="text-base font-medium text-white hover:text-indigo-50">
                  My Sets
                </Link>
                <Link to="/search" className="text-base font-medium text-white hover:text-indigo-50">
                  Discover Sets
                </Link>
              </div>
            )}
          </div>
          <div className="ml-10 space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-white">{user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="inline-block bg-indigo-500 py-2 px-4 border border-transparent rounded-md text-base font-medium text-white hover:bg-opacity-75"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-block bg-indigo-500 py-2 px-4 border border-transparent rounded-md text-base font-medium text-white hover:bg-opacity-75"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="inline-block bg-white py-2 px-4 border border-transparent rounded-md text-base font-medium text-indigo-600 hover:bg-indigo-50"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
        {isAuthenticated && (
          <div className="py-4 flex flex-wrap justify-center space-x-6 lg:hidden">
            <Link to="/sets" className="text-base font-medium text-white hover:text-indigo-50">
              My Sets
            </Link>
            <Link to="/search" className="text-base font-medium text-white hover:text-indigo-50">
              Discover Sets
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
