from fastapi import FastAPI, Security, Depends, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select, delete, and_
from database.session import init_database, get_session_cm
from models import *
from datetime import datetime
from routers import users, cards
from pwdlib import PasswordHash
from fastapi_jwt import JwtAuthorizationCredentials
from auth.auth_handler import access_security, refresh_security
from middlewares.auth import AuthMiddleware
from decouple import config

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)
app.include_router(users.router)
app.include_router(cards.router)

app.add_middleware(AuthMiddleware)

DEFAULT_CATEGORIES = [
    'Процессы',
    'Инструменты',
    'Показатели',
    'Обучение',
]
async def populate_defaults():
    pwd_context = PasswordHash.recommended()
    with get_session_cm() as session:
        if session.exec(select(CardCategory)).first() is None:
            categories = map(lambda x: CardCategory(name=x), DEFAULT_CATEGORIES)
            session.add_all(categories)
            session.commit()
        if session.exec(select(User)).first() is None:
            user = User(        
                last_name='Admin', 
                first_name='Admin',
                email=config('admin_email'),
                password_hash=pwd_context.hash(config('admin_password')),
                role=UserRole.admin
            )
            session.add(user)
            session.commit()
            await Notification.create_notification(
                session, 
                user.id, 
                'Добро пожаловать',
                'Вы являетесь администратором системы',
            )

@app.on_event('startup')
async def on_startup():
    init_database()
    await populate_defaults()