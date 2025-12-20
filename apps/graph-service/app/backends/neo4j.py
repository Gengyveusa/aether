from __future__ import annotations

from typing import Any, Optional


class Neo4jGraphBackend:
    # TODO: implement Neo4j driver integration.
    def __init__(self, _uri: str, _user: str, _password: str):
        pass

    async def create_entity(self, _payload: dict[str, Any]) -> dict[str, Any]:
        raise NotImplementedError

    async def get_entity(self, _entity_id: str) -> Optional[dict[str, Any]]:
        raise NotImplementedError

    async def upsert_canonical_content(self, _entity_id: str, _data: dict[str, Any]) -> dict[str, Any]:
        raise NotImplementedError

    async def get_canonical_content(self, _entity_id: str) -> Optional[dict[str, Any]]:
        raise NotImplementedError

    async def create_source_document(self, _payload: dict[str, Any]) -> dict[str, Any]:
        raise NotImplementedError

    async def list_source_documents(self, _brand_id: str) -> list[dict[str, Any]]:
        raise NotImplementedError

    async def list_source_documents_with_content(self, _brand_id: str) -> list[dict[str, Any]]:
        raise NotImplementedError

    async def create_relationship(self, _payload: dict[str, Any]) -> dict[str, Any]:
        raise NotImplementedError

    async def list_relationships(
        self,
        *,
        from_entity_id: Optional[str] = None,
        to_entity_id: Optional[str] = None,
        rel_type: Optional[str] = None,
    ) -> list[dict[str, Any]]:
        raise NotImplementedError

    async def get_neighbors(self, _entity_id: str, relationship_types: Optional[list[str]] = None) -> list[dict[str, Any]]:
        raise NotImplementedError

    async def get_brand_policy(self, _brand_id: str) -> Optional[dict[str, Any]]:
        raise NotImplementedError

    async def upsert_brand_policy(self, _brand_id: str, _policy: dict[str, Any]) -> dict[str, Any]:
        raise NotImplementedError
