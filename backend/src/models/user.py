from sqlmodel import Field, Session, SQLModel, Relationship, Column, Enum
from sqlalchemy import BigInteger
import uuid
import enum
from .guid import GUID
import datetime

class UserRole(str, enum.Enum):
    guest = 'guest'
    auth_guest = 'auth_guest'
    author = 'author'
    admin = 'admin'

class User(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, sa_column=Column(GUID, primary_key=True))
    first_name: str = Field()
    last_name: str = Field()
    patronymic: str | None = None
    email: str = Field(unique=True)
    password_hash: str = Field(nullable=True)
    role: UserRole = Field(default=UserRole.guest, sa_column=Column(Enum(UserRole)))
    email_verified: bool = Field(default=False)

AUTH_CODE_VALID_FOR = 5 # minutes

class AuthCode(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, sa_column=Column(GUID, primary_key=True)) # returned in /users/register
    code_otp: str = Field(nullable=False) # checked in /users/check_code
    user_id: uuid.UUID = Field(default_factory=uuid.uuid4, sa_column=Column(GUID))
    created_at: datetime.datetime = Field(nullable=False)