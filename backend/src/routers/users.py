from fastapi import APIRouter, Request, Depends, Security, Response, status, Cookie, UploadFile
from sqlmodel import Session, select
from database.session import get_session
from models import User, AuthCode, AuthCodeType, AUTH_CODE_VALID_FOR, AUTH_CODE_MAX_TRIES, Notification
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
from datetime import datetime, timezone, timedelta
import base64


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
    
    session.add(user)
    session.commit()

    code = await AuthCode.create_code_for_user(session, user.id, AuthCodeType.auth)
    asyncio.create_task(notifier.notify_code(register_data.email, 'Регистрация', str(code.code_otp), str(AUTH_CODE_VALID_FOR)))

    return CodeIdData(code_id=code.id)

@router.post(
    '/check_code',
    summary='Проверить 2FA-код'
)
async def check_code(response: Response, code_data: CodeData, session: Session = Depends(get_session)):
    q = select(AuthCode).where(AuthCode.id == code_data.code_id) #.where(AuthCode.code_otp == code_data.code_otp)
    code = session.exec(q).first()
    if code is None:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return Message(msg='Неверный код')

    if code.code_otp != code_data.code_otp:
        code.tries += 1
        if code.tries >= AUTH_CODE_MAX_TRIES:
            session.delete(code)
            session.commit()
            response.status_code = status.HTTP_429_TOO_MANY_REQUESTS
            return Message(msg='Неверный код. Попытки исчерпаны.')
        
        session.add(code)
        session.commit()
        response.status_code = status.HTTP_400_BAD_REQUEST
        return Message(msg='Неверный код')

    q = select(User).where(User.id == code.user_id)
    user = session.exec(q).first()
    if user is None:
        response.status_code = status.HTTP_404_NOT_FOUND
        return Message(msg='Пользователь не найден')

    code_timed_out = False
    now = datetime.now(timezone.utc)
    if (now - code.created_at) >= timedelta(minutes=AUTH_CODE_VALID_FOR):
        code_timed_out = True

    if code.auth_code_type == AuthCodeType.auth:
        if code_timed_out:
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
            'email': user.email,
            'credential_updates': user.credential_updates
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
    elif code.auth_code_type == AuthCodeType.email_change:
        if code_timed_out:
            session.delete(code)
            session.commit()
            response.status_code = status.HTTP_422_UNPROCESSABLE_CONTENT
            return Message(msg='Срок действия кода истек')
        user.email = code.new_data['email']
        user.email_verified = False
        user.credential_updates += 1
        session.add(user)
        session.delete(code)
        session.commit()
        return Message(msg='Данные сохранены')
    elif code.auth_code_type == AuthCodeType.password_change:
        if code_timed_out:
            session.delete(code)
            session.commit()
            response.status_code = status.HTTP_422_UNPROCESSABLE_CONTENT
            return Message(msg='Срок действия кода истек')
        user.password_hash = code.new_data['password']
        user.credential_updates += 1
        session.add(user)
        session.delete(code)
        session.commit()
        return Message(msg='Данные сохранены')
    response.status_code = status.HTTP_422_UNPROCESSABLE_CONTENT
    return Message(msg='Действие не может быть выполнено')

@router.post(
    '/change_email',
    summary='Изменить почту'
)
async def change_email(
    response: Response, 
    change_email_data: ChangeEmailData, 
    session: Session = Depends(get_session), 
    credentials: JwtAuthorizationCredentials = Security(access_security),
    notifier: EmailNotifier = Depends(get_email_notifier)
):
    if not credentials:
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return Message(msg='Не передан JWT токен или JWT токен неверный')
    
    user_id = uuid.UUID(credentials['id'])
    q = select(User).where(User.id == user_id)
    user = session.exec(q).first()
    if user is None:
        response.status_code = status.HTTP_404_NOT_FOUND
        return Message(msg='Пользователь не найден')
    
    q = select(User).where(User.email == change_email_data.new_email)
    existing_user = session.exec(q).first()
    if existing_user is not None:
        response.status_code = status.HTTP_422_UNPROCESSABLE_CONTENT
        return Message(msg='Почта уже используется')

    code = await AuthCode.create_code_for_user(
        session, 
        user.id, 
        AuthCodeType.email_change, 
        { 'email': change_email_data.new_email }
    )

    asyncio.create_task(notifier.notify_code(user.email, 'Изменение почты', str(code.code_otp), str(AUTH_CODE_VALID_FOR)))

    return CodeIdData(code_id=code.id)

@router.post(
    '/change_password',
    summary='Изменить пароль'
)
async def change_password(
    response: Response, 
    change_password_data: ChangePasswordData, 
    session: Session = Depends(get_session), 
    credentials: JwtAuthorizationCredentials = Security(access_security),
    notifier: EmailNotifier = Depends(get_email_notifier)
):
    if not credentials:
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return Message(msg='Не передан JWT токен или JWT токен неверный')
    
    user_id = uuid.UUID(credentials['id'])
    q = select(User).where(User.id == user_id)
    user = session.exec(q).first()
    if user is None:
        return Message(msg='Пользователь не найден')

    if not pwd_context.verify(change_password_data.current_password, user.password_hash):
        response.status_code = status.HTTP_403_FORBIDDEN
        return Message(msg='Введен неверный пароль')

    code = await AuthCode.create_code_for_user(
        session, 
        user.id, 
        AuthCodeType.password_change, 
        { 'password': pwd_context.hash(change_password_data.new_password) }
    )
    asyncio.create_task(notifier.notify_code(user.email, 'Изменение пароля', str(code.code_otp), str(AUTH_CODE_VALID_FOR)))

    return CodeIdData(code_id=code.id)

@router.post(
    '/change_avatar',
    summary='Изменить аватар'
)
async def change_avatar(
    response: Response, 
    avatar: UploadFile,
    session: Session = Depends(get_session), 
    credentials: JwtAuthorizationCredentials = Security(access_security)
):
    if not credentials:
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return Message(msg='Не передан JWT токен или JWT токен неверный')
    
    user_id = uuid.UUID(credentials['id'])
    q = select(User).where(User.id == user_id)
    user = session.exec(q).first()
    if user is None:
        return Message(msg='Пользователь не найден')

    avatar_data = await avatar.read()
    user.avatar = avatar_data
    session.add(user)
    session.commit()

    return Message(msg='Данные сохранены')

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
    
    code = await AuthCode.create_code_for_user(session, user.id, AuthCodeType.auth)
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

    user_tmp = dict(user)
    user_tmp['avatar'] = base64.b64encode(user_tmp['avatar']).decode() if user_tmp['avatar'] is not None else None
    return UserData(**user_tmp) 

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