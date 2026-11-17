from fastapi import APIRouter, Request, Depends, Security, Response, status, UploadFile, Form
from sqlmodel import Session, select, column, or_
from database.session import get_session
from models import User, AuthCode, UserRole, Card, CardCategory, CardVisibility
from pwdlib import PasswordHash
from notifiers.email_notifier import EmailNotifier, get_email_notifier
from schemas.cards import *
from schemas.common import Message
from auth.auth_handler import access_security, refresh_security
from fastapi_jwt import JwtAuthorizationCredentials
from datetime import timedelta, datetime, timezone
from decouple import config
from typing import Optional
import uuid
import asyncio
import base64
from urllib.parse import quote


router = APIRouter(
    prefix='/cards',
    tags=['cards'],
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
    '/create',
    summary='Создать карточку'
)
async def create(
    response: Response,
    photo: Optional[UploadFile] = None,
    data: str = Form(default=None),
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
        response.status_code = status.HTTP_403_FORBIDDEN
        return Message(msg='Пользователь не найден')

    if user.role not in [UserRole.author, UserRole.admin]:
        response.status_code = status.HTTP_403_FORBIDDEN
        return Message(msg='Недостаточно прав')

    try:
        card_create_data = CardCreateData.model_validate_json(data)
    except Exception as e:
        response.status_code = status.HTTP_422_UNPROCESSABLE_CONTENT
        return Message(msg='Данные указаны неверно')
    
    photo_data = await photo.read() if photo is not None else None
    card = Card(
        **card_create_data.model_dump(),
        author_id=user.id,
        photo=photo_data,
        created_at=datetime.now(timezone.utc)
    )
    session.add(card)
    session.commit()
    return Message(msg='Данные сохранены')

@router.post(
    '/get',
    summary='Получить карточки'
)
async def get(
    response: Response,
    card_get_data: CardGetData,
    session: Session = Depends(get_session), 
    credentials: JwtAuthorizationCredentials = Security(access_security)
):
    q = select(Card).where(Card.visibility == CardVisibility.public)
    if credentials is not None:
        q = select(Card).where(or_(Card.visibility == CardVisibility.public, CardVisibility == CardVisibility.protected))
    
    if card_get_data.created_from:
        q = q.where(Card.created_at >= card_get_data.created_from)
    if card_get_data.created_to:
        q = q.where(Card.created_at < card_get_data.created_to)
    if card_get_data.title:
        q = q.where(column('title').ilike(f'%{card_get_data.title}%'))
    if card_get_data.status:
        q = q.where(Card.status == card_get_data.status)
    if card_get_data.category:
        q = q.where(Card.category_id == card_get_data.category)
    q = q.offset(card_get_data.offset).limit(card_get_data.limit)
    cards = session.exec(q)

    result = list(map(dict, cards))
    for i in range(len(result)):
        result[i]['photo'] = base64.b64encode(result[i]['photo']).decode() if result[i]['photo'] is not None else None

    return result

@router.get(
    '/categories',
    summary='Получить категории карточек'
)
async def categories(response: Response, session: Session = Depends(get_session)):
    q = select(CardCategory)
    result = session.exec(q).all()
    return list(map(dict, result))

@router.post(
    '/export',
    summary='Экспортировать карточку как слайд'
)
async def export(   
    response: Response,
    card_export_data: CardExportData,
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
        response.status_code = status.HTTP_403_FORBIDDEN
        return Message(msg='Пользователь не найден')

    q = select(Card).where(Card.id == card_export_data.id)
    card = session.exec(q).first()
    if card is None:
        response.status_code = status.HTTP_404_NOT_FOUND
        return Message(msg='Карточка не найдена')
    
    if (card.visibility == CardVisibility.private) and (user.id != card.author_id) and (user.role != UserRole.admin):
        response.status_code = status.HTTP_403_FORBIDDEN
        return Message(msg='Недостаточно прав')
    
    result = await card.to_pptx()
    return Response(
        content=result,
        media_type='application/vnd.openxmlformats-officedocument.presentationml.presentation',
        headers={
            'Content-Disposition': f"attachment; filename*=UTF-8''{quote(card.title)}.pptx"
        }
    )