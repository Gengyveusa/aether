from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any, Optional


class InMemoryGraphBackend:
    def __init__(self):
        self.entities: dict[str, dict[str, Any]] = {}
        self.canonical: dict[str, dict[str, Any]] = {}
        self.source_docs: list[dict[str, Any]] = []
        self.relationships: list[dict[str, Any]] = []
        self.policies: dict[str, dict[str, Any]] = {}

    async def create_entity(self, payload: dict[str, Any]) -> dict[str, Any]:
        self.entities[payload["id"]] = payload
        return payload

    async def get_entity(self, entity_id: str) -> Optional[dict[str, Any]]:
        return self.entities.get(entity_id)

    async def upsert_canonical_content(self, entity_id: str, data: dict[str, Any]) -> dict[str, Any]:
        self.canonical[entity_id] = data
        return data

    async def get_canonical_content(self, entity_id: str) -> Optional[dict[str, Any]]:
        return self.canonical.get(entity_id)

    async def create_source_document(self, payload: dict[str, Any]) -> dict[str, Any]:
        doc = {
            "id": payload.get("id") or str(uuid.uuid4()),
            "brandId": payload["brandId"],
            "url": payload["url"],
            "content": payload["content"],
            "contentType": payload.get("contentType") or "text/html",
            "ingestedAt": datetime.now(timezone.utc).isoformat(),
        }
        self.source_docs.append(doc)
        return doc

    async def list_source_documents(self, brand_id: str) -> list[dict[str, Any]]:
        docs = [d for d in self.source_docs if d.get("brandId") == brand_id]
        return [
            {k: v for k, v in d.items() if k != "content"}
            for d in sorted(docs, key=lambda x: x.get("ingestedAt", ""), reverse=True)
        ]

    async def list_source_documents_with_content(self, brand_id: str) -> list[dict[str, Any]]:
        docs = [d for d in self.source_docs if d.get("brandId") == brand_id]
        return sorted(docs, key=lambda x: x.get("ingestedAt", ""), reverse=True)

    async def create_relationship(self, payload: dict[str, Any]) -> dict[str, Any]:
        self.relationships.append(payload)
        return payload

    async def list_relationships(
        self,
        *,
        from_entity_id: Optional[str] = None,
        to_entity_id: Optional[str] = None,
        rel_type: Optional[str] = None,
    ) -> list[dict[str, Any]]:
        items = self.relationships
        if from_entity_id:
            items = [r for r in items if r.get("fromEntityId") == from_entity_id]
        if to_entity_id:
            items = [r for r in items if r.get("toEntityId") == to_entity_id]
        if rel_type:
            items = [r for r in items if r.get("type") == rel_type]
        return list(items)

    async def get_neighbors(self, entity_id: str, relationship_types: Optional[list[str]] = None) -> list[dict[str, Any]]:
        out: list[dict[str, Any]] = []
        for r in self.relationships:
            if relationship_types and r.get("type") not in relationship_types:
                continue
            if r.get("fromEntityId") == entity_id or r.get("toEntityId") == entity_id:
                fe = self.entities.get(r.get("fromEntityId"), {})
                te = self.entities.get(r.get("toEntityId"), {})
                out.append({"relationship": r, "fromEntity": fe, "toEntity": te})
        return out

    async def get_brand_policy(self, brand_id: str) -> Optional[dict[str, Any]]:
        return self.policies.get(brand_id)

    async def upsert_brand_policy(self, brand_id: str, policy: dict[str, Any]) -> dict[str, Any]:
        self.policies[brand_id] = policy
        return policy
