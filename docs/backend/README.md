# Backend

Стек: Python, FastAPI, SQLModel, PostgreSQL, JWT (`fastapi_jwt`), `python-pptx`, email-нотификатор.

## Запуск

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cd src && uvicorn main:app --reload
```

Точка входа — `main:app` из `backend/src` (не `app.main:app`). Swagger: http://localhost:8000/docs.

Переменные окружения — в `backend/.env` (не коммитится), шаблон — `backend/.env.example`: `db_connection_string`, `jwt_secret`, `jwt_algorithm`, `smtp_*`, `admin_*`, `environment`. Значения `environment`: `DEV` (OTP печатается в консоль через `MockNotifier`) и `RELEASE` (отправка почты).

## Проверки

Отдельного backend-CI сейчас нет: `ci.yml` проверяет только frontend, а `deploy-backend.yml` деплоит стек по push в `dev`/`rc`. Линтер и тесты запускаются вручную:

| Команда                 | Что делает                                           |
| ----------------------- | ---------------------------------------------------- |
| `ruff check .`          | линтер (вручную, в CI не входит)                     |
| `ruff format --check .` | проверка форматирования (`ruff format .` исправляет) |
| `pytest`                | тесты (пока их нет, команда завершится кодом 5)      |

## Известные ограничения

Код бэкенда в текущей итерации не менялся; список добавлен в документацию, чтобы не потерять при следующем заходе.

- `AuthCode.create_code_for_user` вызывает `session.delete_all(...)`, которого нет у SQLModel `Session`; также сохраняет `new_data=None` вместо нового кода.
- `POST /cards/create` индексирует три результата без проверки длины; в `POST /cards/get` третий результат скопирован со второго.
- Роль `author` нигде не выдаётся: регистрация создаёт `guest`, админской ручки смены роли нет.
- Нет `logout`: refresh-cookie остаётся на устройстве после выхода из интерфейса.
- `AuthMiddleware` использует приватные поля `fastapi_jwt`; refresh-cookie выставляется без `HttpOnly`/`Secure`/`SameSite`.
- CORS разрешает `*` вместе с `allow_credentials=True`.
- `smtp_port=465` в `.env.example`, а нотификатор использует STARTTLS — для 465 нужен implicit TLS.
- Фронтовые кнопки импорта/экспорта теперь вызывают существующие `/cards/import` и `/cards/export`; контракты этих ручек стоит сверить при следующей итерации бэкенда.

Общие сценарии — в [корневом README](../../README.md).
