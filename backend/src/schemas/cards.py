from pydantic import BaseModel
from typing import Optional
import uuid
from models import CardStatus, CardVisibility
import datetime


class ResultInfo(BaseModel):
    title: str
    before: float
    after: float
    is_positive: bool

class AuthorInfo(BaseModel):
    id: uuid.UUID
    first_name: str
    last_name: str
    patronymic: Optional[str]

class CategoryInfo(BaseModel):
    id: uuid.UUID
    name: str

class CardCreateData(BaseModel):
    title: str
    industry: str
    pilot_stream: str
    results: list[ResultInfo]
    activities: list[str]
    category_id: uuid.UUID
    #status: CardStatus
    visibility: CardVisibility

class CardGetData(BaseModel):
    created_from: Optional[datetime.datetime]
    created_to: Optional[datetime.datetime]
    title: Optional[str]
    status: Optional[CardStatus]
    category: Optional[uuid.UUID]
    limit: int
    offset: int

class CardExportData(BaseModel):
    id: uuid.UUID

class CardGetResult(BaseModel):
    id: uuid.UUID
    title: str
    industry: str
    pilot_stream: str
    results: list[ResultInfo]
    activities: list[str]
    photo: Optional[str]
    category: CategoryInfo
    author: AuthorInfo
    status: CardStatus
    visibility: CardVisibility
    created_at: datetime.datetime

class CardImportResult(BaseModel):
    id: uuid.UUID

class GetCategoryData(BaseModel):
    limit: int
    offset: int