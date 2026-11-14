from sqlmodel import Field, Session, SQLModel, Relationship, Column, Enum
from sqlmodel import LargeBinary
import uuid
import enum
from .guid import GUID
import datetime

class CardStatus(str, enum.Enum):
    draft = 'draft'
    review = 'review'
    published = 'published'
    returned = 'returned'
    archived = 'archived'

class CardVisibility(str, enum.Enum):
    public = 'public'
    protected = 'protected'
    private = 'private'

class CardCategory(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, sa_column=Column(GUID, primary_key=True))
    name: str = Field(nullable=False)

class Card(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, sa_column=Column(GUID, primary_key=True))
    title: str = Field()
    branch: str = Field()
    pilot_stream: str = Field()
    main_result: str = Field()
    is_positive_result_1: bool = Field()
    result_old_1: str = Field()
    result_new_1: str = Field()
    is_positive_result_2: bool = Field()
    result_old_2: str = Field()
    result_new_2: str = Field()
    is_positive_result_3: bool = Field()
    result_old_3: str = Field()
    result_new_3: str = Field()
    event: str = Field()
    photo: bytes = Field(sa_column=Column(LargeBinary))
    category_id: uuid.UUID = Field(sa_column=Column(GUID))
    author_id: uuid.UUID = Field(sa_column=Column(GUID))
    status: CardStatus = Field(default=CardStatus.review, sa_column=Column(Enum(CardStatus)))
    visibility: CardVisibility = Field(default=CardVisibility.private, sa_column=Column(Enum(CardVisibility)))
    created_at: datetime.datetime = Field()