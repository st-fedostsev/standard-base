from pydantic import BaseModel
from typing import Optional
import uuid


class RegisterData(BaseModel):
    first_name: str
    last_name: str
    patronymic: Optional[str] = None
    email: str
    password: str

class LoginData(BaseModel):
    email: str
    password: str

class CodeIdData(BaseModel):
    code_id: uuid.UUID

class CodeData(BaseModel):
    code_id: uuid.UUID
    code_otp: str

class TokenData(BaseModel):
    access_token: str

class UserData(BaseModel):
    id: uuid.UUID
    first_name: str
    last_name: str
    patronymic: Optional[str] = None
    email: str
    role: str
    avatar: Optional[str] = None

class ReadNotificationData(BaseModel):
    id: uuid.UUID

class NotificationsGetData(BaseModel):
    limit: int
    offset: int

class NotificationsGetResult(BaseModel):
    result: int
    unread_count: int
    data: list

class ChangeEmailData(BaseModel):
    new_email: str

class ChangePasswordData(BaseModel):
    current_password: str
    new_password: str

class ChangeNameData(BaseModel):
    first_name: Optional[str]
    last_name: Optional[str]
    patronymic: Optional[str]