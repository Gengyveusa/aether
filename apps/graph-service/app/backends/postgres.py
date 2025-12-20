from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from .. import crud, graph_api
from ..schemas import SourceDocumentCreate


class PostgresGraphBackend:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def create_entity(self, payload: dict[str, Any]) -> dict[str, Any]:
        return await crud.create_entity(self._session, payload)

    async def get_entity(self, entity_id: str) -> Optional[dict[str, Any]]:
        return await crud.get_entity(self._session, entity_id)

    async def list_entities(
        self,
        *,
        entity_type: Optional[str] = None,
        brand_id: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[dict[str, Any]]:
        return await crud.list_entities(self._session, entity_type=entity_type, brand_id=brand_id, limit=limit, offset=offset)

    async def upsert_canonical_content(self, entity_id: str, data: dict[str, Any]) -> dict[str, Any]:
        return await crud.upsert_canonical_content(self._session, entity_id, data)

    async def get_canonical_content(self, entity_id: str) -> Optional[dict[str, Any]]:
        return await crud.get_canonical_content(self._session, entity_id)

    async def create_source_document(self, payload: dict[str, Any]) -> dict[str, Any]:
        req = SourceDocumentCreate.model_validate(payload)
        return await crud.create_source_document(
            self._session,
            brand_id=req.brandId,
            url=req.url,
            content=req.content,
            content_type=req.contentType or "text/html",
            ingested_at=datetime.now(timezone.utc),
        )

    async def list_source_documents(self, brand_id: str) -> list[dict[str, Any]]:
        return await crud.list_source_documents(self._session, brand_id)

    async def list_source_documents_with_content(self, brand_id: str) -> list[dict[str, Any]]:
        return await crud.list_source_documents_with_content(self._session, brand_id)

    async def create_relationship(self, payload: dict[str, Any]) -> dict[str, Any]:
        return await crud.create_relationship(self._session, payload)

    async def list_relationships(
        self,
        *,
        from_entity_id: Optional[str] = None,
        to_entity_id: Optional[str] = None,
        rel_type: Optional[str] = None,
    ) -> list[dict[str, Any]]:
        return await crud.list_relationships(self._session, from_entity_id=from_entity_id, to_entity_id=to_entity_id, rel_type=rel_type)

    async def get_neighbors(self, entity_id: str, relationship_types: Optional[list[str]] = None) -> list[dict[str, Any]]:
        return await graph_api.get_neighbors(self._session, entity_id, relationship_types=relationship_types)

    async def get_brand_policy(self, brand_id: str) -> Optional[dict[str, Any]]:
        return await crud.get_brand_policy(self._session, brand_id)

    async def upsert_brand_policy(self, brand_id: str, policy: dict[str, Any]) -> dict[str, Any]:
        return await crud.upsert_brand_policy(self._session, brand_id, policy)
