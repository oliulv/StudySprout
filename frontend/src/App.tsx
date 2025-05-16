import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';

// Auth Components
import { AuthProvider } from './api/AuthContext';
import Login from './components/Auth/Login';
import SignUp from './components/Auth/SignUp';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Layout Components
import Header from './components/Header';
import HomePage from './components/HomePage';

// Main Feature Components
import SetList from './components/Sets/SetList';
import SetCreator from './components/Sets/SetCreator';
import CardEditor from './components/Sets/CardEditor';
import FlashcardViewer from './components/StudyModes/FlashcardViewer';
import LearnMode from './components/StudyModes/LearnMode';
import TestMode from './components/StudyModes/TestMode';
import MatchGame from './components/StudyModes/MatchGame';
import SearchBar from './components/Search/SearchBar';
import PublicSetViewer from './components/Search/PublicSetViewer';
import ProfilePage from './components/Profile/ProfilePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <main>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            
            {/* Protected routes */}
            <Route path="/sets" element={
              <ProtectedRoute>
                <SetList />
              </ProtectedRoute>
            } />
            <Route path="/sets/new" element={
              <ProtectedRoute>
                <SetCreator />
              </ProtectedRoute>
            } />
            <Route path="/sets/:setId" element={
              <ProtectedRoute>
                <CardEditor />
              </ProtectedRoute>
            } />
            <Route path="/sets/:setId/edit" element={
              <ProtectedRoute>
                <CardEditor />
              </ProtectedRoute>
            } />

            {/* Study modes for user's sets */}
            <Route path="/study/:setId/flashcards" element={
              <ProtectedRoute>
                <FlashcardViewer />
              </ProtectedRoute>
            } />
            <Route path="/study/:setId/learn" element={
              <ProtectedRoute>
                <LearnMode />
              </ProtectedRoute>
            } />
            <Route path="/study/:setId/test" element={
              <ProtectedRoute>
                <TestMode />
              </ProtectedRoute>
            } />
            <Route path="/study/:setId/match" element={
              <ProtectedRoute>
                <MatchGame />
              </ProtectedRoute>
            } />

            {/* Public sets and search */}
            <Route path="/search" element={<SearchBar />} />
            <Route path="/study/public/:setId" element={<PublicSetViewer />} />
            <Route path="/study/public/:setId/flashcards" element={<FlashcardViewer />} />
            <Route path="/study/public/:setId/learn" element={<LearnMode />} />
            <Route path="/study/public/:setId/test" element={<TestMode />} />
            <Route path="/study/public/:setId/match" element={<MatchGame />} />

            {/* User profile */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}
export default App;
