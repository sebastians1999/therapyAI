### Running the API (FastAPI)

### Installing dependencies (recommended)

This backend uses a local virtual environment in `backend/.venv`.

From the `backend/` directory, run:

```bash
uv sync
```

Then start the server (see below).
If you are **in the project root** (the folder that contains `backend/` and `client/`):

Use the backend virtualenv's uvicorn (recommended, avoids "No module named supabase"):

```bash
backend/.venv/bin/uvicorn backend.server:app --reload --port 8000
```

Or, if you activated the venv, you can use plain `uvicorn`:

```bash
uvicorn backend.server:app --reload --port 8000
```

If you `cd backend` first, run:

```bash
uvicorn server:app --reload --port 8000
```

If you run `uvicorn backend.server:app` **from inside `backend/`**, you will get:
`ModuleNotFoundError: No module named 'backend'`.

### Postman request bodies (quick reference)

- **POST** `/api/post_journal_entry` body:

```json
{ "content": "Hello" }
```

- **PUT** `/api/update_journal_entry` body:

```json
{
  "journal_entry_id": "6dcd62d4-7cff-4248-9048-08c41ee24c1e",
  "content": "Updated content"
}
```

- **DELETE** `/api/delete_journal_entry` body:

```json
{ "journal_entry_id": "6dcd62d4-7cff-4248-9048-08c41ee24c1e" }
```
