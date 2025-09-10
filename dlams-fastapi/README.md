# Start the virtual env

source .venv/bin/activate

# Stop the virtual env

deactivate

# Run the app

uvicorn app.main:app --reload

# Proper imports

First party on top
Third party below that
Local imports below that

## Local PostgreSQL Setup (Homebrew)

To start the PostgreSQL service:

```bash
brew services start postgresql@14
```

To stop the PostgreSQL service:

```bash
brew services stop postgresql@14
```
