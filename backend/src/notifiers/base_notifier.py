from abc import ABC, abstractmethod
from typing import Any

class BaseNotifier(ABC):
    @abstractmethod
    async def notify(self, dst: Any, subject: str, message: str) -> Any:
        ...