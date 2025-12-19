from __future__ import annotations

import uuid
from typing import Any, Optional

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased

from . import crud
from .db.models import EntityRow, RelationshipRow


RelationshipWithEntities = dict[str, Any]


async def get_entity(session: AsyncSession, id: str) -> dict[str, Any]:
    entity = await crud.get_entity(session, id)
    if not entity:
        raise KeyError("entity_not_found")
    return entity


async def get_neighbors(
    session: AsyncSession,
    entity_id: str,
    relationship_types: Optional[list[str]] = None,
) -> list[RelationshipWithEntities]:
    uid = uuid.UUID(entity_id)

    from_e = aliased(EntityRow)
    to_e = aliased(EntityRow)

    stmt = (
        select(RelationshipRow, from_e, to_e)
        .join(from_e, RelationshipRow.from_entity_id == from_e.id)
        .join(to_e, RelationshipRow.to_entity_id == to_e.id)
        .where(or_(RelationshipRow.from_entity_id == uid, RelationshipRow.to_entity_id == uid))
    )

    if relationship_types:
        stmt = stmt.where(RelationshipRow.type.in_(relationship_types))

    res = await session.execute(stmt)

    out: list[RelationshipWithEntities] = []
    for rel_row, from_row, to_row in res.all():
        out.append(
            {
                "relationship": crud.row_to_relationship(rel_row),
                "fromEntity": crud.row_to_entity(from_row),
                "toEntity": crud.row_to_entity(to_row),
            }
        )

    return out
