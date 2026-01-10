"""Journal entry CRUD endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from typing import Any
from datetime import datetime, timedelta

try:
    from backend.schemas import (
        User,
        JournalEntry,
        JournalEntryCreate,
        JournalEntryUpdateRequest,
        JournalEntryDeleteRequest,
    )
    from backend.dependencies import get_current_user, supabase
except ModuleNotFoundError:
    from schemas import (
        User,
        JournalEntry,
        JournalEntryCreate,
        JournalEntryUpdateRequest,
        JournalEntryDeleteRequest,
    )
    from dependencies import get_current_user, supabase


router = APIRouter(prefix="/api", tags=["journal"])


def calculate_journal_entry_date(days: int = 30) -> datetime:
    """Helper to calculate a date 'days' ago from now."""
    return datetime.now() - timedelta(days=days)


def format_entry_timestamps(entry: dict) -> dict:
    """Convert PostgreSQL timestamps to ISO 8601 format."""
    for field in ["created_at", "updated_at"]:
        if field in entry and entry[field]:
            # PostgreSQL format: "2025-12-29 11:06:37.634234+00"
            # Convert to ISO 8601: "2025-12-29T11:06:37.634234+00:00"
            ts = str(entry[field])
            if " " in ts and "T" not in ts:
                ts = ts.replace(" ", "T")
            if ts.endswith("+00"):
                ts = ts + ":00"
            entry[field] = ts
    return entry


@router.get("/health")
async def journal_health() -> dict[str, str]:
    """Health check for the inference service."""
    return {"status": "ok", "message": "Journal router is ready"}

@router.post("/post_journal_entry")
async def post_journal_entry(
    journal_entry: JournalEntryCreate,
    current_user: User = Depends(get_current_user),
) -> JournalEntry:
    """Create a new journal entry for the authenticated user."""
    try:
        insert_payload = journal_entry.model_dump(mode="json")
        insert_payload["user_id"] = current_user.id
        response = supabase.table("journal_entries").insert(insert_payload).execute()
        return format_entry_timestamps(response.data[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/get_journal_entries")
async def get_journal_entries(
    current_user: User = Depends(get_current_user),
    since: datetime = Depends(calculate_journal_entry_date),
) -> list[JournalEntry]:
    """Retrieve all journal entries for the authenticated user created since 'since'."""
    try:
        response = (
            supabase.table("journal_entries")
            .select("*")
            .eq("user_id", current_user.id)
            .gte("created_at", since)
            .order("created_at", desc=True)
            .execute()
        )
        return [format_entry_timestamps(entry) for entry in response.data]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/update_journal_entry")
async def update_journal_entry(
    update_request: JournalEntryUpdateRequest,
    current_user: User = Depends(get_current_user),
) -> JournalEntry:
    """Update an existing journal entry (content and updated_at) for the authenticated user."""
    try:
        update_payload = {
            "content": update_request.content,
            "updated_at": datetime.now().isoformat()
        }
        response = (
            supabase.table("journal_entries")
            .update(update_payload)
            .eq("id", str(update_request.journal_entry_id))
            .eq("user_id", current_user.id)
            .execute()
        )
        if not response.data:
            print(
                f"Journal entry not found or unauthorized: entry_id={update_request.journal_entry_id}, user_id={current_user.id}"
            )
            raise HTTPException(status_code=404, detail="Journal entry not found")
        return format_entry_timestamps(response.data[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/delete_journal_entry")
async def delete_journal_entry(
    delete_request: JournalEntryDeleteRequest,
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """Delete a journal entry for the authenticated user."""
    try:
        response = (
            supabase.table("journal_entries")
            .delete()
            .eq("id", str(delete_request.journal_entry_id))
            .eq("user_id", current_user.id)
            .execute()
        )
        if not response.data:
            raise HTTPException(status_code=404, detail="Journal entry not found")
        return {"message": "Journal entry deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

