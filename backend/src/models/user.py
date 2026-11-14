from sqlmodel import Field, Session, SQLModel, Relationship, Column, Enum, JSON, LargeBinary, select
import uuid
import enum
from .guid import GUID
import datetime
from typing import Dict
import pyotp

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
    credential_updates: int = Field(default=0, nullable=False) # used to revoke jwt tokens after credential update

AUTH_CODE_VALID_FOR = 5 # minutes
AUTH_CODE_MAX_TRIES = 3

class AuthCodeType(str, enum.Enum):
    auth = 'auth'
    email_change = 'email_change'
    password_change = 'password_change'

class AuthCode(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, sa_column=Column(GUID, primary_key=True))
    code_otp: str = Field(nullable=False)
    user_id: uuid.UUID = Field(default_factory=uuid.uuid4, sa_column=Column(GUID))
    auth_code_type: AuthCodeType = Field(default=AuthCodeType.auth, sa_column=Column(Enum(AuthCodeType)))
    new_data: Dict = Field(default_factory=dict, sa_column=Column(JSON))
    tries: int = Field(default=0, nullable=False)
    created_at: datetime.datetime = Field(nullable=False)

    @classmethod
    async def create_code_for_user(cls, session: Session, user_id: uuid.UUID, auth_code_type: AuthCodeType, new_data: Dict | None = None):
        q = select(cls).where(cls.user_id == user_id).where(cls.auth_code_type == auth_code_type)
        old_codes = session.exec(q).all()
        session.delete_all(old_codes)

        hotp_key = pyotp.random_base32()
        hotp = pyotp.HOTP(hotp_key)
        code = cls(
            code_otp=hotp.at(0),
            user_id=user_id,
            auth_code_type=auth_code_type,
            new_data=new_data,
            created_at=datetime.datetime.now(datetime.timezone.utc)
        )
        session.add(code)
        session.commit()

        return code