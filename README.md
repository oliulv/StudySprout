# StudySprout

StudySprout is a web application that replicates the core functionality of Quizlet, focusing on study and revision features. It enables users to create, manage, and study flashcard sets, providing an effective tool for learning and memorization.

## Project Structure

This repository contains both the frontend and backend code:

- `frontend/`: React application with TypeScript and Tailwind CSS
- `backend/`: FastAPI application with SQLAlchemy and PostgreSQL (via Supabase)

## Features

### User Authentication
- Sign up with email and password
- Secure login and logout
- JWT-based authentication

### Flashcard Sets Management
- Create flashcard sets with title and description
- Add, edit, and delete cards within a set (term and definition pairs)
- Mark sets as public or private
- Edit or delete sets

### Study Modes
- **Flashcard Mode**: Display cards one at a time with flipping capability
- **Learn Mode**: Adaptive learning system that prioritizes unknown cards
- **Test Mode**: Multiple-choice and true/false questions
- **Match Game**: Timed game to match terms with definitions

### Sharing and Searching
- Search for public flashcard sets
- Study public sets created by others

### User Profile
- View all owned flashcard sets

## Tech Stack

### Frontend
- React.js with TypeScript
- React Router for navigation
- Axios for API communication
- Tailwind CSS for styling
- JWT authentication

### Backend
- FastAPI (Python)
- SQLAlchemy ORM
- PostgreSQL database (hosted on Supabase)
- JWT authentication with bcrypt password hashing
- Alembic for database migrations

## Setup and Installation

See the README files in the `frontend/` and `backend/` directories for detailed setup instructions.

## Development

### Prerequisites

- Node.js 16+
- Python 3.8+
- Supabase account (for PostgreSQL database)

### Running the Application

1. Start the backend server (from the `backend/` directory):
   ```
   python run.py
   ```

2. Start the frontend development server (from the `frontend/` directory):
   ```
   npm start
   ```

## License

This project is licensed under the MIT License.
