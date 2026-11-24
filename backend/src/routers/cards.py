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
from typing import Optional, Annotated
from pydantic import WithJsonSchema
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
        title=card_create_data.title,
        industry=card_create_data.industry,
        pilot_stream=card_create_data.pilot_stream,
        result_title_1=card_create_data.results[0].title,
        is_positive_result_1=card_create_data.results[0].is_positive,
        result_old_1=card_create_data.results[0].before,
        result_new_1=card_create_data.results[0].after,
        result_title_2=card_create_data.results[1].title,
        is_positive_result_2=card_create_data.results[1].is_positive,
        result_old_2=card_create_data.results[1].before,
        result_new_2=card_create_data.results[1].after,
        result_title_3=card_create_data.results[2].title,
        is_positive_result_3=card_create_data.results[2].is_positive,
        result_old_3=card_create_data.results[2].before,
        result_new_3=card_create_data.results[2].after,
        activities=card_create_data.activities,
        photo=photo_data,
        category_id=card_create_data.category_id,
        author_id=user.id,
        status=CardStatus.review,
        visibility=card_create_data.visibility,
        created_at=datetime.now(timezone.utc),
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
        q = select(Card).where(or_(Card.visibility == CardVisibility.public, Card.visibility == CardVisibility.protected))
    
    if card_get_data.created_from is not None:
        q = q.where(Card.created_at >= card_get_data.created_from)
    if card_get_data.created_to is not None:
        q = q.where(Card.created_at < card_get_data.created_to)
    if card_get_data.title is not None:
        q = q.where(column('title').ilike(f'%{card_get_data.title}%'))
    if card_get_data.status is not None:
        q = q.where(Card.status == card_get_data.status)
    if card_get_data.category is not None:
        q = q.where(Card.category_id == card_get_data.category)
    q = q.offset(card_get_data.offset).limit(card_get_data.limit)
    cards = session.exec(q).all()

    result = []
    for card in cards:
        q = select(CardCategory).where(CardCategory.id == card.category_id)
        category = session.exec(q).first()
        if category is None:
            continue
        q = select(User).where(User.id == card.author_id)
        author = session.exec(q).first()
        if author is None:
            continue
        result.append(CardGetResult(
            id=card.id,
            title=card.title,
            industry=card.industry,
            pilot_stream=card.pilot_stream,
            results=[
                ResultInfo(
                    title=card.result_title_1,
                    before=card.result_old_1,
                    after=card.result_new_1,
                    is_positive=card.is_positive_result_1,
                ),
                ResultInfo(
                    title=card.result_title_2,
                    before=card.result_old_2,
                    after=card.result_new_2,
                    is_positive=card.is_positive_result_2,
                ),
                ResultInfo(
                    title=card.result_title_2,
                    before=card.result_old_2,
                    after=card.result_new_2,
                    is_positive=card.is_positive_result_2,
                )
            ],
            activities=card.activities,
            photo=base64.b64encode(card.photo).decode() if card.photo is not None else None,
            category=CategoryInfo(**dict(category)),
            author=AuthorInfo(**dict(author)),
            status=card.status,
            visibility=card.visibility,
            created_at=card.created_at
        ))

    return result

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

@router.post(
    '/import',
    summary='Импортировать карточку как слайд'
)
async def import_card(
    response: Response,
    category_id: uuid.UUID,
    visibility: CardVisibility,
    file: Optional[UploadFile] = None,
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
    
    file_data = await file.read()
    card = await Card.from_pptx(user.id, file_data, category_id, visibility)
    if card is None:
        response.status_code = status.HTTP_422_UNPROCESSABLE_CONTENT
        return Message(msg='Не удалось обработать презентацию')

    session.add(card)
    session.commit()

    return CardImportResult(id=card.id)

@router.post(
    '/categories',
    summary='Получить категории карточек'
)
async def categories(
    response: Response, 
    get_category_data: GetCategoryData, 
    session: Session = Depends(get_session), 
    credentials: JwtAuthorizationCredentials = Security(access_security)
):
    q = select(CardCategory).offset(get_category_data.offset).limit(get_category_data.limit)
    result = session.exec(q).all()

    return result