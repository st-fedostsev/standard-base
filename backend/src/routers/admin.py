from fastapi import APIRouter, Request, Depends, Security, Response, status, Cookie, UploadFile
from sqlmodel import Session, select
from database.session import get_session
from models import User, UserRole, Card, CardCategory
from notifiers.email_notifier import EmailNotifier, get_email_notifier
from schemas.admin import *
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
    prefix='/admin',
    tags=['admin'],
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

@router.post(
    '/create_category',
    summary='Создать категорию'
)
async def create_category(
    response: Response, 
    create_category_data: CreateCategoryData, 
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

    if user.role != UserRole.admin:
        response.status_code = status.HTTP_403_FORBIDDEN
        return Message(msg='Доступ запрещен')

    category = CardCategory(name=create_category_data.name)
    session.add(category)
    session.commit()

    return CreateCategoryResult(id=category.id)

@router.post(
    '/edit_category',
    summary='Редактировать категорию'
)
async def edit_category(
    response: Response, 
    edit_category_data: EditCategoryData, 
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

    if user.role != UserRole.admin:
        response.status_code = status.HTTP_403_FORBIDDEN
        return Message(msg='Доступ запрещен')

    q = select(CardCategory).where(CardCategory.id == edit_category_data.id)
    category = session.exec(q).first()
    if category is None:
        response.status_code = status.HTTP_404_NOT_FOUND
        return Message(msg='Категория не найдена')

    category.name = edit_category_data.name
    session.add(category)
    session.commit()

    return Message(msg='Данные сохранены')

@router.post(
    '/delete_category',
    summary='Удалить категорию'
)
async def delete_category(
    response: Response, 
    delete_category_data: DeleteCategoryData, 
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

    if user.role != UserRole.admin:
        response.status_code = status.HTTP_403_FORBIDDEN
        return Message(msg='Доступ запрещен')

    q = select(CardCategory).where(CardCategory.id == delete_category_data.id)
    category = session.exec(q).first()
    if category is None:
        response.status_code = status.HTTP_404_NOT_FOUND
        return Message(msg='Категория не найдена')

    session.delete(category)
    session.commit()

    return Message(msg='Данные сохранены')


@router.post(
    '/get_users',
    summary='Получить список пользователей'
)
async def get_users(
    response: Response, 
    get_users_data: GetUsersData, 
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

    if user.role != UserRole.admin:
        response.status_code = status.HTTP_403_FORBIDDEN
        return Message(msg='Доступ запрещен')

    q = select(User)
    if get_users_data.role is not None:
        q = q.where(User.role == get_users_data.role)
    q = q.offset(get_users_data.offset).limit(get_users_data.limit)
    users = session.exec(q).all()
    
    result = []
    for q_user in users:
        result.append(GetUsersResult(
            id=q_user.id,
            first_name=q_user.first_name,
            last_name=q_user.last_name,
            patronymic=q_user.patronymic,
            email=q_user.email,
            role=q_user.role,
            email_verified=q_user.email_verified,
            avatar=base64.b64encode(q_user.avatar).decode() if q_user.avatar is not None else None,
        ))
    return result

@router.post(
    '/update_user',
    summary='Обновить роль пользователя'
)
async def update_user(
    response: Response, 
    update_user_data: UpdateUserData, 
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

    if user.role != UserRole.admin:
        response.status_code = status.HTTP_403_FORBIDDEN
        return Message(msg='Доступ запрещен')

    q = select(User).where(User.id == update_user_data.id)
    target_user = session.exec(q).first()
    if target_user is None:
        response.status_code = status.HTTP_404_NOT_FOUND
        return Message(msg='Пользователь не найден')
    
    target_user.role = update_user_data.role
    session.add(target_user)
    session.commit()

    return Message(msg='Данные сохранены')

@router.post(
    '/update_card',
    summary='Обновить карточку'
)
async def update_card(
    response: Response, 
    update_card_data: UpdateCardData, 
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

    if user.role != UserRole.admin:
        response.status_code = status.HTTP_403_FORBIDDEN
        return Message(msg='Доступ запрещен')

    q = select(Card).where(Card.id == update_card_data.id)
    card = session.exec(q).first()
    if card is None:
        response.status_code = status.HTTP_404_NOT_FOUND
        return Message(msg='Карточка не найдена')
    
    if update_card_data.title is not None:
        card.title = update_card_data.title
    if update_card_data.category_id is not None:
        q = select(CardCategory).where(CardCategory.id == update_card_data.category_id)
        category = session.exec(q).first()
        if category is None:
            response.status_code = status.HTTP_404_NOT_FOUND
            return Message(msg='Категория не найдена')
        card.category_id = update_card_data.category_id
    if update_card_data.status is not None:
        card.status = update_card_data.status

    session.add(card)
    session.commit()

    return Message(msg='Данные сохранены')