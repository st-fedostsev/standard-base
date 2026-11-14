import aiohttp
from .base_notifier import BaseNotifier
from decouple import config
from typing import Any
import aiosmtplib
import ssl
from email.message import EmailMessage
from pathlib import Path

SMTP_SERVER = config('smtp_server')
SMTP_PORT = int(config('smtp_port'))
SMTP_EMAIL = config('smtp_email')
SMTP_PASSWORD = config('smtp_password')

BASE_DIR = Path(__file__).parent.resolve()
TEMPLATE = (BASE_DIR / 'templates' / 'mail.html').read_text(encoding='utf-8')

class EmailNotifier(BaseNotifier):
    async def notify(self, dst: str, subject: str, message: str) -> Any:
        #print(f'notify: {dst} {message}')
        msg = EmailMessage()
        msg['From'] = SMTP_EMAIL
        msg['To'] = dst
        msg['Subject'] = subject
        msg.set_content(message)
        await aiosmtplib.send(
            msg,
            hostname=SMTP_SERVER,
            port=SMTP_PORT,
            username=SMTP_EMAIL,
            password=SMTP_PASSWORD,
            start_tls=True
        )

    async def notify_code(self, dst: Any, subject: str, code: str, ttl_minutes: str) -> Any:
        html = TEMPLATE.replace('{{CODE}}', code).replace('{{TTL_MINUTES}}', ttl_minutes)
        msg = EmailMessage()
        msg['From'] = SMTP_EMAIL
        msg['To'] = dst
        msg['Subject'] = subject
        msg.set_content(f'Ваш код: {code}\nДействителен: {ttl_minutes} минут')
        msg.add_alternative(html, subtype='html')
        await aiosmtplib.send(
            msg,
            hostname=SMTP_SERVER,
            port=SMTP_PORT,
            username=SMTP_EMAIL,
            password=SMTP_PASSWORD,
            start_tls=True
        )

class MockNotifier(BaseNotifier):
    async def notify(self, dst: str, subject: str, message: str) -> Any:
        print(f'Notification: {dst} {subject} {message}')
    
    async def notify_code(self, dst: Any, subject: str, code: str, ttl_minutes: str) -> Any:
        print(f'Notification: {dst} {subject} {code} {ttl_minutes}')

#EMAIL_NOTIFIER = EmailNotifier()
EMAIL_NOTIFIER = MockNotifier()
def get_email_notifier():
    return EMAIL_NOTIFIER