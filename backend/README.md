# StudySprout Backend

This is the backend API for StudySprout, a flashcard learning application similar to Quizlet. It is built with FastAPI, SQLAlchemy, and PostgreSQL (with Supabase).

## Features

- User authentication (register, login, logout)
- Flashcard set management (create, read, update, delete)
- Card management (create, read, update, delete)
- Study progress tracking
- Public set search

## Prerequisites

- Python 3.8+
- PostgreSQL database (via Supabase)
- pip

## Setup

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/studysprout.git
cd studysprout/backend
```

2. **Create a virtual environment**

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**

```bash
pip install -r requirements.txt
```

4. **Configure environment variables**

Copy the `.env.example` file to `.env` and fill in your Supabase PostgreSQL connection details:

```bash
cp .env.example .env
```

Edit the `.env` file with your Supabase credentials:

```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_supabase_password
POSTGRES_SERVER=db.your-project-id.supabase.co
POSTGRES_PORT=5432
POSTGRES_DB=postgres

SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your_supabase_anon_key

SECRET_KEY=your_secret_key_for_jwt
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

5. **Run database migrations**

```bash
alembic upgrade head
```

6. **Start the API server**

```bash
python run.py
```

The API will be available at http://localhost:8000

## API Documentation

Once the server is running, you can access:

- Interactive API docs: http://localhost:8000/docs
- Alternative API docs: http://localhost:8000/redoc

## Database Schema

- **users**: Store user accounts
- **sets**: Store flashcard sets
- **cards**: Store individual flashcards
- **user_card_progress**: Track learning progress

## Development

To create new database migrations after model changes:

```bash
alembic revision --autogenerate -m "Description of changes"
alembic upgrade head
```
