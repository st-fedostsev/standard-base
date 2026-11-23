from sqlmodel import Field, Session, SQLModel, Relationship, Column, Enum
from sqlmodel import LargeBinary
from sqlmodel import Session
import uuid
import enum
from .guid import GUID
import datetime

class Notification(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, sa_column=Column(GUID, primary_key=True))
    user_id: uuid.UUID = Field(sa_column=Column(GUID))
    title: str = Field()
    description: str = Field()
    read: bool = Field(default=False)
    action_label: str = Field(nullable=True)
    action_url: str = Field(nullable=True)

    @staticmethod
    async def create_notification(
        session: Session, 
        user_id: uuid.UUID, 
        title: str, 
        description: str, 
        action_label: str | None = None, 
        action_url: str | None = None
    ):
        notification = Notification(
            user_id=user_id,
            title=title,
            description=description,
            action_label=action_label,
            action_url=action_url
        )
        session.add(notification)
        session.commit()