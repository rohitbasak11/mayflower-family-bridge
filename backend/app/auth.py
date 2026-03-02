from fastapi import Depends, HTTPException, status
from pydantic import BaseModel

class User(BaseModel):
    id: str
    email: str
    role: str

# STUB: Mock users
MOCK_ADMIN = User(id="admin-123", email="admin@example.com", role="staff")
MOCK_FAMILY = User(id="family-123", email="family@example.com", role="family")

async def get_current_user() -> User:
    # In stub mode, return the mock admin
    return MOCK_ADMIN

async def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "staff":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin role required"
        )
    return current_user
