from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from .db.models import CanonicalContentRow, EntityRow, SourceDocumentRow


def parse_iso_datetime(value: str) -> datetime:
    # Accept RFC3339 "Z" suffix (common in APIs) as UTC.
    if value.endswith("Z"):
        value = value[:-1] + "+00:00"
    return datetime.fromisoformat(value)


async def create_entity(session: AsyncSession, entity: dict[str, Any]) -> dict[str, Any]:
    entity_id = uuid.UUID(entity["id"]) if entity.get("id") else uuid.uuid4()

    row = EntityRow(
        id=entity_id,
        type=entity["type"],
        slug=entity["slug"],
        display_name=entity["displayName"],
        description=entity.get("description", ""),
        data={k: v for k, v in entity.items() if k not in {"id", "type", "slug", "displayName", "description", "createdAt", "updatedAt"}},
        created_at=parse_iso_datetime(entity["createdAt"]).astimezone(timezone.utc),
        updated_at=parse_iso_datetime(entity["updatedAt"]).astimezone(timezone.utc),
    )

    session.add(row)
    await session.commit()
    await session.refresh(row)

    return row_to_entity(row)


async def get_entity(session: AsyncSession, entity_id: str) -> Optional[dict[str, Any]]:
    try:
        uid = uuid.UUID(entity_id)
    except ValueError:
        return None

    res = await session.execute(select(EntityRow).where(EntityRow.id == uid))
    row = res.scalar_one_or_none()
    if not row:
        return None
    return row_to_entity(row)


async def upsert_canonical_content(session: AsyncSession, entity_id: str, data: dict[str, Any]) -> dict[str, Any]:
    uid = uuid.UUID(entity_id)
    now = datetime.now(timezone.utc)

    stmt = insert(CanonicalContentRow).values(
        entity_id=uid,
        data=data,
        created_at=now,
        updated_at=now,
    )
    stmt = stmt.on_conflict_do_update(
        index_elements=[CanonicalContentRow.entity_id],
        set_={"data": data, "updated_at": now},
    )

    await session.execute(stmt)
    await session.commit()

    # re-select
    res = await session.execute(select(CanonicalContentRow).where(CanonicalContentRow.entity_id == uid))
    row = res.scalar_one()
    return row.data


async def get_canonical_content(session: AsyncSession, entity_id: str) -> Optional[dict[str, Any]]:
    try:
        uid = uuid.UUID(entity_id)
    except ValueError:
        return None

    res = await session.execute(select(CanonicalContentRow).where(CanonicalContentRow.entity_id == uid))
    row = res.scalar_one_or_none()
    return row.data if row else None


async def create_source_document(
    session: AsyncSession,
    brand_id: str,
    url: str,
    content: str,
    content_type: str,
    ingested_at: datetime,
) -> dict[str, Any]:
    bid = uuid.UUID(brand_id)
    row = SourceDocumentRow(
        brand_id=bid,
        url=url,
        content=content,
        content_type=content_type,
        ingested_at=ingested_at,
    )
    session.add(row)
    await session.commit()
    await session.refresh(row)
    return row_to_source_document(row, include_content=True)


async def list_source_documents(session: AsyncSession, brand_id: str) -> list[dict[str, Any]]:
    bid = uuid.UUID(brand_id)
    res = await session.execute(select(SourceDocumentRow).where(SourceDocumentRow.brand_id == bid).order_by(SourceDocumentRow.ingested_at.desc()))
    rows = res.scalars().all()
    return [row_to_source_document(r, include_content=False) for r in rows]


def row_to_entity(row: EntityRow) -> dict[str, Any]:
    base = {
        "id": str(row.id),
        "type": row.type,
        "slug": row.slug,
        "displayName": row.display_name,
        "description": row.description,
        "createdAt": row.created_at.isoformat(),
        "updatedAt": row.updated_at.isoformat(),
    }
    return {**base, **(row.data or {})}


def row_to_source_document(row: SourceDocumentRow, *, include_content: bool) -> dict[str, Any]:
    doc: dict[str, Any] = {
        "id": str(row.id),
        "brandId": str(row.brand_id),
        "url": row.url,
        "contentType": row.content_type,
        "ingestedAt": row.ingested_at.isoformat(),
    }
    if include_content:
        doc["content"] = row.content
    return doc
