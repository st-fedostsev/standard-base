from pydantic import BaseModel
from typing import Optional
from models import UserRole, CardStatus
import uuid
import datetime


class CreateCategoryData(BaseModel):
    name: str

class CreateCategoryResult(BaseModel):
    id: uuid.UUID

class EditCategoryData(BaseModel):
    id: uuid.UUID
    name: str

class DeleteCategoryData(BaseModel):
    id: uuid.UUID

class GetUsersData(BaseModel):
    role: Optional[UserRole]
    limit: int
    offset: int

class GetUsersResult(BaseModel):
    id: uuid.UUID
    first_name: str
    last_name: str
    patronymic: Optional[str]
    email: str
    role: UserRole
    email_verified: bool
    avatar: Optional[str]

class UpdateUserData(BaseModel):
    id: uuid.UUID
    role: UserRole

class UpdateCardData(BaseModel):
    id: uuid.UUID
    title: Optional[str]
    category_id: Optional[uuid.UUID]
    status: Optional[CardStatus]