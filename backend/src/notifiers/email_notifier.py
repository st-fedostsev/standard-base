import aiohttp
from .base_notifier import BaseNotifier
from decouple import config
from typing import Any
import aiosmtplib
import ssl
from email.message import EmailMessage

SMTP_SERVER = config('smtp_server')
SMTP_PORT = int(config('smtp_port'))
SMTP_EMAIL = config('smtp_email')
SMTP_PASSWORD = config('smtp_password')

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

EMAIL_NOTIFIER = EmailNotifier()
def get_email_notifier():
    return EMAIL_NOTIFIER