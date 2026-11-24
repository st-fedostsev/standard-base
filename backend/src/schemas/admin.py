from pydantic import BaseModel
from typing import Optional
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