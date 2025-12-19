from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class SourceDocumentCreate(BaseModel):
    brandId: str
    url: str
    content: str
    contentType: Optional[str] = Field(default="text/html")


class SourceDocumentOut(BaseModel):
    id: str
    brandId: str
    url: str
    ingestedAt: str
    contentType: Optional[str] = None
