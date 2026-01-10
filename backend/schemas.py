from pydantic import BaseModel
from datetime import datetime
import uuid




class User(BaseModel):
    id: str
    email: str
    token: str


class JournalEntry(BaseModel):
    """Represents a row in the journal_entries table."""

    id: uuid.UUID
    user_id: uuid.UUID
    content: str
    created_at: datetime
    updated_at: datetime


class JournalEntryCreate(BaseModel):
    """Payload for creating a journal entry (DB fills id/created_at/updated_at)."""

    content: str


class JournalEntryUpdate(BaseModel):
    """Payload for updating a journal entry."""

    content: str


class JournalEntryUpdateRequest(BaseModel):
    """Request body for updating a specific journal entry."""

    journal_entry_id: uuid.UUID
    content: str


class JournalEntryDeleteRequest(BaseModel):
    """Request body for deleting a specific journal entry.

    Note: Some HTTP clients don't send bodies with DELETE requests reliably.
    If that becomes an issue, switch this to a path param or use POST for delete.
    """

    journal_entry_id: uuid.UUID


class Goal(BaseModel):
    """Represents a row in the goals table."""

    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    status: str
    body_text: str
    created_at: datetime


class GoalCreate(BaseModel):
    """Payload for creating a goal (DB fills id/created_at)."""

    title: str
    status: str = "active"
    body_text: str = ""


class GoalUpdate(BaseModel):
    """Payload for updating a goal."""

    title: str | None = None
    status: str | None = None
    body_text: str | None = None


class GoalUpdateRequest(BaseModel):
    """Request body for updating a specific goal."""

    goal_id: str  # Accept string, will convert to UUID if needed
    title: str | None = None
    status: str | None = None
    body_text: str | None = None


class GoalDeleteRequest(BaseModel):
    """Request body for deleting a specific goal."""

    goal_id: str  # Accept string, will convert to UUID if needed