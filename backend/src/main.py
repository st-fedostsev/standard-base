from fastapi import FastAPI, Security, Depends, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select, delete, and_
from database.session import init_database, get_session_cm
from models import *
from datetime import datetime
from routers import users
from pwdlib import PasswordHash
from fastapi_jwt import JwtAuthorizationCredentials
from auth.auth_handler import access_security, refresh_security
from middlewares.auth import AuthMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)
app.include_router(users.router)

app.add_middleware(AuthMiddleware)

@app.on_event('startup')
async def on_startup():
    init_database()