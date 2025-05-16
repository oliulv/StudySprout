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

interface Question {
  type: 'multiple-choice' | 'true-false';
  cardId: number;
  question: string;
  correctAnswer: string;
  options?: string[];
  selectedAnswer?: string;
  isCorrect?: boolean;
}

const TestMode: React.FC = () => {
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();
  
  const [cardsList, setCardsList] = useState<Card[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCards = async () => {
      if (!setId) return;
      
      setIsLoading(true);
      try {
        const response = await cards.getAllForSet(parseInt(setId));
        setCardsList(response.data);
        
        if (response.data.length < 3) {
          setError('This set needs at least 3 cards to create a test.');
          setIsLoading(false);
          return;
        }
        
        // Generate questions
        const generatedQuestions = generateQuestions(response.data);
        setQuestions(generatedQuestions);
        setScore({ correct: 0, total: generatedQuestions.length });
      } catch (err: any) {
        console.error('Error fetching cards:', err);
        setError('Failed to load flashcards. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCards();
  }, [setId]);

  const generateQuestions = (cards: Card[]): Question[] => {
    const questions: Question[] = [];
    
    // Create multiple-choice questions (with 3 distractors)
    cards.forEach((card) => {
      // Get 3 random distractor definitions from other cards
      const distractors = getRandomDistractors(cards, card.id, 3)
        .map(distractor => distractor.definition);
      
      // Shuffle the options (correct answer + distractors)
      const options = [...distractors, card.definition].sort(() => Math.random() - 0.5);
      
      questions.push({
        type: 'multiple-choice',
        cardId: card.id,
        question: `What is the definition of "${card.term}"?`,
        correctAnswer: card.definition,
        options,
      });
    });
    
    // Create true-false questions (half true, half false)
    cards.forEach((card) => {
      // Randomly decide if this will be a true or false statement
      const isTrue = Math.random() > 0.5;
      
      let question: Question;
      
      if (isTrue) {
        // True statement
        question = {
          type: 'true-false',
          cardId: card.id,
          question: `True or False: "${card.term}" is defined as "${card.definition}"?`,
          correctAnswer: 'True',
          options: ['True', 'False'],
        };
      } else {
        // False statement - get a random wrong definition
        const wrongDefinition = getRandomDistractors(cards, card.id, 1)[0].definition;
        
        question = {
          type: 'true-false',
          cardId: card.id,
          question: `True or False: "${card.term}" is defined as "${wrongDefinition}"?`,
          correctAnswer: 'False',
          options: ['True', 'False'],
        };
      }
      
      questions.push(question);
    });
    
    // Shuffle all questions and return a subset (to avoid too many questions)
    return questions.sort(() => Math.random() - 0.5).slice(0, Math.min(10, questions.length));
  };

  const getRandomDistractors = (cards: Card[], excludeId: number, count: number): Card[] => {
    const otherCards = cards.filter(card => card.id !== excludeId);
    return otherCards
      .sort(() => Math.random() - 0.5) // Shuffle
      .slice(0, Math.min(count, otherCards.length)); // Get the requested count
  };

  const handleAnswerSelect = (answer: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;
    
    // Update the question with the selected answer and result
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex] = {
      ...currentQuestion,
      selectedAnswer: answer,
      isCorrect,
    };
    setQuestions(updatedQuestions);
    
    // Update score if correct
    if (isCorrect) {
      setScore(prevScore => ({
        ...prevScore,
        correct: prevScore.correct + 1,
      }));
    }
    
    // Move to next question or show results
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const restartTest = () => {
    if (cardsList.length > 0) {
      const newQuestions = generateQuestions(cardsList);
      setQuestions(newQuestions);
      setCurrentQuestionIndex(0);
      setScore({ correct: 0, total: newQuestions.length });
      setShowResults(false);
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

  if (showResults) {
    const scorePercentage = Math.round((score.correct / score.total) * 100);
    
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Test Results</h1>
        
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Your Score: {score.correct} / {score.total}</h2>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div 
              className={`h-4 rounded-full ${
                scorePercentage >= 80 ? 'bg-green-600' : 
                scorePercentage >= 60 ? 'bg-yellow-500' : 'bg-red-600'
              }`}
              style={{ width: `${scorePercentage}%` }}
            ></div>
          </div>
          <p className="text-xl font-semibold mb-6">
            {scorePercentage}% Correct
            {scorePercentage >= 80 ? ' - Great job!' : 
             scorePercentage >= 60 ? ' - Good effort!' : ' - Keep practicing!'}
          </p>
          
          <h3 className="text-xl font-semibold mb-4">Review Questions:</h3>
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg ${
                  question.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}
              >
                <p className="font-medium">{index + 1}. {question.question}</p>
                <p className="mt-2">
                  Your answer: <span className={question.isCorrect ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                    {question.selectedAnswer}
                  </span>
                </p>
                {!question.isCorrect && (
                  <p className="text-green-600 font-medium mt-1">
                    Correct answer: {question.correctAnswer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={restartTest}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Take Test Again
          </button>
          <button
            onClick={() => navigate(`/sets/${setId}`)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Set
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">Could not generate test questions. Make sure you have enough cards in this set.</span>
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

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Test Mode</h1>
        <div className="text-sm text-gray-500">
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div 
          className="bg-indigo-600 h-2.5 rounded-full" 
          style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
        ></div>
      </div>

      {/* Question */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">{currentQuestion.question}</h2>
        
        {/* Answer options */}
        <div className="space-y-3">
          {currentQuestion.options?.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              className="w-full py-3 px-4 text-left border rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestMode;
