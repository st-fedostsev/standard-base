from sqlmodel import Field, Session, SQLModel, Relationship, Column, Enum, JSON, LargeBinary
import uuid
import enum
from .guid import GUID
import datetime
from typing import Dict

class UserRole(str, enum.Enum):
    guest = 'guest'
    auth_guest = 'auth_guest'
    author = 'author'
    admin = 'admin'

class User(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, sa_column=Column(GUID, primary_key=True))
    first_name: str = Field()
    last_name: str = Field()
    patronymic: str = Field(nullable=True)
    email: str = Field(unique=True)
    password_hash: str = Field(nullable=True)
    role: UserRole = Field(default=UserRole.guest, sa_column=Column(Enum(UserRole)))
    email_verified: bool = Field(default=False)
    avatar: bytes = Field(sa_column=Column(LargeBinary, nullable=True))

AUTH_CODE_VALID_FOR = 5 # minutes

class AuthCodeType(str, enum.Enum):
    auth = 'auth'
    email_change = 'email_change'
    password_change = 'password_change'

class AuthCode(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, sa_column=Column(GUID, primary_key=True)) # returned in /users/register
    code_otp: str = Field(nullable=False) # checked in /users/check_code
    user_id: uuid.UUID = Field(default_factory=uuid.uuid4, sa_column=Column(GUID))
    auth_code_type: AuthCodeType = Field(default=AuthCodeType.auth, sa_column=Column(Enum(AuthCodeType)))
    new_data: Dict = Field(default_factory=dict, sa_column=Column(JSON))
    created_at: datetime.datetime = Field(nullable=False)