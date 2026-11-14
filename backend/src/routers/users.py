from fastapi import APIRouter, Request, Depends, Security, Response, status, Cookie
from sqlmodel import Session, select
from database.session import get_session
from models import User, AuthCode, AUTH_CODE_VALID_FOR, Notification
from pwdlib import PasswordHash
from notifiers.email_notifier import EmailNotifier, get_email_notifier
from schemas.users import *
from schemas.common import Message
from auth.auth_handler import access_security, refresh_security
from fastapi_jwt import JwtAuthorizationCredentials
from datetime import timedelta
from decouple import config
import uuid
import pyotp
import asyncio
from datetime import datetime, timezone


router = APIRouter(
    prefix='/users',
    tags=['users'],
    responses={
        '200': {
            'model': Message,
            'description': 'Операция завершена успешно'
        },
        '400': {
            'model': Message,
            'description': 'Неверный запрос'
        },
        '401': {
            'model': Message,
            'description': 'Запрос не авториован(неправильно передан/не передан JWT токен)'
        },
        '422': {
            'description': 'JSON передан неправильно, см. ответ сервера'
        }
    }
)

pwd_context = PasswordHash.recommended()

@router.post(
    '/register',
    summary='Зарегистрировать пользователя'
)
async def register_user(
    response: Response, register_data: RegisterData, 
    session: Session = Depends(get_session), 
    notifier: EmailNotifier = Depends(get_email_notifier)
):
    user = session.exec(select(User).where(User.email == register_data.email).where(User.email_verified == True)).first()
    if user is not None:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return Message(msg='Пользователь уже зарегистрирован')

    user = User(
        last_name=register_data.last_name, 
        first_name=register_data.first_name,
        patronymic=register_data.patronymic,
        email=register_data.email,
        password_hash=pwd_context.hash(register_data.password)
    )
    hotp_key = pyotp.random_base32()
    hotp = pyotp.HOTP(hotp_key)
    code = AuthCode(
        code_otp=hotp.at(0),
        user_id=user.id,
        created_at=datetime.now(timezone.utc)
    )
    session.add_all([user, code])
    session.commit()

    asyncio.create_task(notifier.notify_code(register_data.email, 'Регистрация', str(code.code_otp), str(AUTH_CODE_VALID_FOR)))

    return CodeIdData(code_id=code.id)

@router.post(
    '/check_code',
    summary='Проверить 2FA-код'
)
async def check_code(response: Response, code_data: CodeData, session: Session = Depends(get_session)):
    q = select(AuthCode).where(AuthCode.id == code_data.code_id).where(AuthCode.code_otp == code_data.code_otp)
    code = session.exec(q).first()
    if code is None:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return Message(msg='Неверный код')

    q = select(User).where(User.id == code.user_id)
    user = session.exec(q).first()
    if user is None:
        response.status_code = status.HTTP_404_NOT_FOUND
        return Message(msg='Пользователь не найден')

    now = datetime.now(timezone.utc)
    if (now - code.created_at).seconds >= AUTH_CODE_VALID_FOR * 60:
        session.delete(code)
        if not user.email_verified:
            session.delete(user)
        session.commit()
        response.status_code = status.HTTP_422_UNPROCESSABLE_CONTENT
        return Message(msg='Срок действия кода истек')

    user.email_verified = True
    session.add(user)
    session.delete(code)
    session.commit()

    subject = {
        'id': str(user.id),
        'email': user.email
    }
    access_token = access_security.create_access_token(subject=subject)
    refresh_token = refresh_security.create_refresh_token(subject=subject)
    response.set_cookie(
        key='refresh_token_cookie',
        value=refresh_token
    )
    return TokenData(
        access_token=access_token
    )

@router.post(
    '/refresh',
    summary='Обновления JWT токена'
)
async def refresh_token(response: Response, credentials: JwtAuthorizationCredentials = Security(refresh_security)):
    access_token = access_security.create_access_token(subject=credentials.subject)
    refresh_token = refresh_security.create_refresh_token(subject=credentials.subject, expires_delta=timedelta(days=2))
    response.set_cookie(
        key='refresh_token_cookie',
        value=refresh_token
    )
    return TokenData(
        access_token=access_token
    )


@router.post(
    '/login',
    summary='Аутентификация'
)
async def login_user(login_data: LoginData, session: Session = Depends(get_session), notifier: EmailNotifier = Depends(get_email_notifier)):
    q = select(User).where(User.email == login_data.email)
    user = session.exec(q).first()
    if user is None:
        return Message(msg='Неверный email или пароль')

    if not pwd_context.verify(login_data.password, user.password_hash):
        return Message(msg='Неверный email или пароль')
    
    hotp_key = pyotp.random_base32()
    hotp = pyotp.HOTP(hotp_key)
    code = AuthCode(
        code_otp=hotp.at(0),
        user_id=user.id,
        created_at=datetime.now(timezone.utc)
    )
    session.add_all([user, code])
    session.commit()

    asyncio.create_task(notifier.notify_code(login_data.email, 'Вход', str(code.code_otp), str(AUTH_CODE_VALID_FOR)))

    return CodeIdData(code_id=code.id)

@router.get(
    '/me',
    summary='Получить информацию о текущем пользователе'
)
async def me(response: Response, session: Session = Depends(get_session), credentials: JwtAuthorizationCredentials = Security(access_security)):
    if not credentials:
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return Message(msg='Не передан JWT токен или JWT токен неверный')
    user_id = uuid.UUID(credentials['id'])
    q = select(User).where(User.id == user_id)
    user = session.exec(q).first()
    if user is None:
        return Message(msg='Пользователь не найден')

    return UserData(**dict(user))

@router.post(
    '/notifications',
    summary='Получить уведомления'
)
async def notifications(
    response: Response, 
    notifications_get_data: NotificationsGetData, 
    session: Session = Depends(get_session), 
    credentials: JwtAuthorizationCredentials = Security(access_security)
):
    if not credentials:
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return Message(msg='Не передан JWT токен или JWT токен неверный')
    user_id = uuid.UUID(credentials['id'])
    q = (select(Notification)
        .where(Notification.user_id == user_id)
        .offset(notifications_get_data.offset)
        .limit(notifications_get_data.limit))
    result = session.exec(q).all()
    if result is None:
        return []

    return list(map(dict, result))

@router.post(
    '/read_notification',
    summary='Прочитать уведомление'
)
async def read_notification(
    response: Response, 
    read_notification_data: ReadNotificationData, 
    session: Session = Depends(get_session), 
    credentials: JwtAuthorizationCredentials = Security(access_security)
):
    if not credentials:
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return Message(msg='Не передан JWT токен или JWT токен неверный')
    
    user_id = uuid.UUID(credentials['id'])
    q = (select(Notification)
        .where(Notification.id == read_notification_data.id)
        .where(Notification.user_id == user_id))
    notification = session.exec(q).first()
    if notification is None:
        response.status_code = status.HTTP_404_NOT_FOUND
        return Message(msg='Уведомление не найдено')
    
    notification.read = True
    session.add(notification)
    session.commit()

    return Message(msg='Уведомление прочитано')