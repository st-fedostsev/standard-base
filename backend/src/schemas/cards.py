from pydantic import BaseModel
from typing import Optional
import uuid
from models import CardStatus, CardVisibility
import datetime

class CardCreateData(BaseModel):
    title: str
    branch: str
    pilot_stream: str
    main_result: str
    is_positive_result_1: bool
    result_old_1: str
    result_new_1: str
    is_positive_result_2: bool
    result_old_2: str
    result_new_2: str
    is_positive_result_3: bool
    result_old_3: str
    result_new_3: str
    event: str
    category_id: uuid.UUID
    status: CardStatus
    visbility: CardVisibility

class CardGetData(BaseModel):
    created_from: Optional[datetime.datetime]
    created_to: Optional[datetime.datetime]
    title: Optional[str]
    status: Optional[CardStatus]
    category: Optional[uuid.UUID]
    limit: int
    offset: int