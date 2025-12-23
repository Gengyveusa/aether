from __future__ import annotations

from typing import Any, Optional


class Neo4jGraphBackend:
    """Neo4j graph backend (skeleton).

    Intended mapping (docstring pseudo-queries; not executed yet):

    - Entity nodes:
      MERGE (e:Entity {id: $id}) SET e.type=$type, e.slug=$slug, e.displayName=$displayName, e.description=$description, e.createdAt=$createdAt, e.updatedAt=$updatedAt, e.data=$data

    - Relationship edges:
      MATCH (a:Entity {id:$from}), (b:Entity {id:$to})
      MERGE (a)-[r:REL {id:$id, type:$type}]->(b)
      SET r.proofIds=$proofIds, r.createdAt=$createdAt, r.updatedAt=$updatedAt

    - Neighbors:
      MATCH (e:Entity {id:$id})-[r:REL]-(n:Entity) RETURN r,e,n
    """

    def __init__(self, uri: str, user: str, password: str):
        self.uri = uri
        self.user = user
        self.password = password
        # TODO: initialize neo4j.AsyncGraphDatabase driver here.

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
