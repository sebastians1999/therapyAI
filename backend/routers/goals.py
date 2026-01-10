"""Goal CRUD endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from typing import Any
from datetime import datetime
from postgrest.exceptions import APIError as PostgrestAPIError

try:
    from backend.schemas import (
        User,
        Goal,
        GoalCreate,
        GoalUpdateRequest,
        GoalDeleteRequest,
    )
    from backend.dependencies import get_current_user, supabase
except ModuleNotFoundError:
    from schemas import (
        User,
        Goal,
        GoalCreate,
        GoalUpdateRequest,
        GoalDeleteRequest,
    )
    from dependencies import get_current_user, supabase


router = APIRouter(prefix="/api", tags=["goals"])


def format_goal_timestamps(goal: dict) -> dict:
    """Convert PostgreSQL timestamps to ISO 8601 format."""
    if "created_at" in goal and goal["created_at"]:
        # PostgreSQL format: "2025-12-29 11:06:37.634234+00"
        # Convert to ISO 8601: "2025-12-29T11:06:37.634234+00:00"
        ts = str(goal["created_at"])
        if " " in ts and "T" not in ts:
            ts = ts.replace(" ", "T")
        if ts.endswith("+00"):
            ts = ts + ":00"
        goal["created_at"] = ts
    return goal


@router.get("/health")
async def goals_health() -> dict[str, str]:
    """Health check for the goals service."""
    return {"status": "ok", "message": "Goals router is ready"}


@router.post("/post_goal")
async def post_goal(
    goal: GoalCreate,
    current_user: User = Depends(get_current_user),
) -> Goal:
    """Create a new goal for the authenticated user."""
    try:
        insert_payload = goal.model_dump(mode="json")
        # Ensure body_text is not None (database might require it)
        if "body_text" not in insert_payload or insert_payload["body_text"] is None:
            insert_payload["body_text"] = ""
        insert_payload["user_id"] = current_user.id
        response = supabase.table("goals").insert(insert_payload).execute()
        if not response.data:
            # Check if there's an error in the response
            if hasattr(response, 'error') and response.error:
                raise HTTPException(status_code=500, detail=f"Supabase error: {response.error}")
            raise HTTPException(status_code=500, detail="Failed to create goal - no data returned")
        return format_goal_timestamps(response.data[0])
    except HTTPException:
        raise
    except PostgrestAPIError as e:
        # Handle Supabase/PostgREST API errors
        error_msg = str(e)
        if "row-level security policy" in error_msg.lower():
            raise HTTPException(
                status_code=403,
                detail="Permission denied. Please check your Supabase Row Level Security (RLS) policies for the 'goals' table."
            )
        raise HTTPException(status_code=500, detail=f"Database error: {error_msg}")
    except Exception as e:
        error_msg = str(e)
        if hasattr(e, 'message'):
            error_msg = e.message
        elif hasattr(e, 'args') and e.args:
            error_msg = str(e.args[0])
        raise HTTPException(status_code=500, detail=f"Error creating goal: {error_msg}")


@router.get("/get_goals")
async def get_goals(
    current_user: User = Depends(get_current_user),
) -> list[Goal]:
    """Retrieve all goals for the authenticated user."""
    try:
        response = (
            supabase.table("goals")
            .select("*")
            .eq("user_id", current_user.id)
            .order("created_at", desc=True)
            .execute()
        )
        return [format_goal_timestamps(goal) for goal in response.data]
    except PostgrestAPIError as e:
        error_msg = str(e)
        if "row-level security policy" in error_msg.lower():
            raise HTTPException(
                status_code=403,
                detail="Permission denied. Please check your Supabase Row Level Security (RLS) policies for the 'goals' table."
            )
        raise HTTPException(status_code=500, detail=f"Database error: {error_msg}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/get_goal/{goal_id}")
async def get_goal(
    goal_id: str,
    current_user: User = Depends(get_current_user),
) -> Goal:
    """Retrieve a specific goal by ID for the authenticated user."""
    try:
        response = (
            supabase.table("goals")
            .select("*")
            .eq("id", goal_id)
            .eq("user_id", current_user.id)
            .execute()
        )
        if not response.data:
            raise HTTPException(status_code=404, detail="Goal not found")
        return format_goal_timestamps(response.data[0])
    except HTTPException:
        raise
    except PostgrestAPIError as e:
        error_msg = str(e)
        if "row-level security policy" in error_msg.lower():
            raise HTTPException(
                status_code=403,
                detail="Permission denied. Please check your Supabase Row Level Security (RLS) policies for the 'goals' table."
            )
        raise HTTPException(status_code=500, detail=f"Database error: {error_msg}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/update_goal")
async def update_goal(
    update_request: GoalUpdateRequest,
    current_user: User = Depends(get_current_user),
) -> Goal:
    """Update an existing goal for the authenticated user."""
    try:
        # Build update payload with only provided fields
        update_payload: dict[str, Any] = {}
        if update_request.title is not None:
            update_payload["title"] = update_request.title
        if update_request.status is not None:
            update_payload["status"] = update_request.status
        if update_request.body_text is not None:
            update_payload["body_text"] = update_request.body_text

        if not update_payload:
            raise HTTPException(
                status_code=400, detail="At least one field must be provided for update"
            )

        response = (
            supabase.table("goals")
            .update(update_payload)
            .eq("id", str(update_request.goal_id))
            .eq("user_id", current_user.id)
            .execute()
        )
        if not response.data:
            print(
                f"Goal not found or unauthorized: goal_id={update_request.goal_id}, user_id={current_user.id}"
            )
            raise HTTPException(status_code=404, detail="Goal not found")
        return format_goal_timestamps(response.data[0])
    except HTTPException:
        raise
    except PostgrestAPIError as e:
        error_msg = str(e)
        if "row-level security policy" in error_msg.lower():
            raise HTTPException(
                status_code=403,
                detail="Permission denied. Please check your Supabase Row Level Security (RLS) policies for the 'goals' table."
            )
        raise HTTPException(status_code=500, detail=f"Database error: {error_msg}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/delete_goal")
async def delete_goal(
    delete_request: GoalDeleteRequest,
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """Delete a goal for the authenticated user."""
    try:
        response = (
            supabase.table("goals")
            .delete()
            .eq("id", str(delete_request.goal_id))
            .eq("user_id", current_user.id)
            .execute()
        )
        if not response.data:
            raise HTTPException(status_code=404, detail="Goal not found")
        return {"message": "Goal deleted successfully"}
    except HTTPException:
        raise
    except PostgrestAPIError as e:
        error_msg = str(e)
        if "row-level security policy" in error_msg.lower():
            raise HTTPException(
                status_code=403,
                detail="Permission denied. Please check your Supabase Row Level Security (RLS) policies for the 'goals' table."
            )
        raise HTTPException(status_code=500, detail=f"Database error: {error_msg}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

