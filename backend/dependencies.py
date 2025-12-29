

from fastapi import Header, HTTPException
from jose import jwt, JWTError
from supabase import create_client, Client
from typing import Any
import os

try:
    from backend.schemas import User
except ModuleNotFoundError:
    from schemas import User


# Supabase client (singleton)
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_ANON_KEY"),
)


async def get_current_user(authorization: str = Header(...)) -> User:
    """
    Dependency that extracts and verifies the Bearer token from the Authorization header.
    Returns a User object with id, email, and token.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")

    token: str = authorization.replace("Bearer ", "")

    try:
        payload: dict[str, Any] = jwt.decode(
            token,
            os.getenv("SUPABASE_JWT_SECRET"),
            algorithms=["HS256"],
            audience="authenticated",
        )
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

    return User(id=payload["sub"], email=payload.get("email"), token=token)

