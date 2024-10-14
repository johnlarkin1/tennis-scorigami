from typing import Optional

from pydantic import BaseModel


class Sport(BaseModel):
    id: int
    p_id: int
    name: str
    last_call: int
    last: int
    special_last: Optional[int] = None
