"""Journal entry CRUD endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from typing import Any
from datetime import datetime, timedelta

try:
    from backend.schemas import (
        User,
        JournalEntryCreate,
        JournalEntryUpdateRequest,
        JournalEntryDeleteRequest,
    )
    from backend.dependencies import get_current_user, supabase
except ModuleNotFoundError:
    from schemas import (
        User,
        JournalEntryCreate,
        JournalEntryUpdateRequest,
        JournalEntryDeleteRequest,
    )
    from dependencies import get_current_user, supabase


router = APIRouter(prefix="/api", tags=["journal"])


def calculate_journal_entry_date(days: int = 30) -> datetime:
    """Helper to calculate a date 'days' ago from now."""
    return datetime.now() - timedelta(days=days)


@router.get("/health")
async def journal_health() -> dict[str, str]:
    """Health check for the inference service."""
    return {"status": "ok", "message": "Journal router is ready"}

@router.post("/post_journal_entry")
async def post_journal_entry(
    journal_entry: JournalEntryCreate,
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """Create a new journal entry for the authenticated user."""
    try:
        insert_payload = journal_entry.model_dump(mode="json")
        insert_payload["user_id"] = current_user.id
        response = supabase.table("journal_entries").insert(insert_payload).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"message": "Journal entry posted successfully", "data": response.data}


@router.get("/get_journal_entries")
async def get_journal_entries(
    current_user: User = Depends(get_current_user),
    since: datetime = Depends(calculate_journal_entry_date),
) -> dict[str, Any]:
    """Retrieve all journal entries for the authenticated user created since 'since'."""
    try:
        response = (
            supabase.table("journal_entries")
            .select("*")
            .eq("user_id", current_user.id)
            .gte("created_at", since)
            .execute()
        )
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/update_journal_entry")
async def update_journal_entry(
    update_request: JournalEntryUpdateRequest,
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """Update an existing journal entry (content only) for the authenticated user."""
    try:
        update_payload = {"content": update_request.content}
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
        return {"message": "Journal entry updated successfully", "data": response.data}
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

