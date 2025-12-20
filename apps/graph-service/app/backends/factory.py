from __future__ import annotations

import os
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import get_graph_backend
from ..db.session import get_db_session
from .base import GraphBackend
from .in_memory import InMemoryGraphBackend
from .neo4j import Neo4jGraphBackend
from .postgres import PostgresGraphBackend

_in_memory_singleton = InMemoryGraphBackend()


def get_backend_kind() -> str:
    return get_graph_backend()


async def maybe_get_db_session() -> AsyncSession | None:
    # Avoid initializing SQLAlchemy / asyncpg when running in-memory backend (tests/local).
    kind = get_backend_kind()
    if kind != "postgres":
        return None

    async for session in get_db_session():
        return session
    return None


async def get_graph_backend_dep(session: AsyncSession | None = Depends(maybe_get_db_session)) -> GraphBackend:
    kind = get_backend_kind()

    if kind == "in_memory":
        return _in_memory_singleton

    if kind == "neo4j":
        uri = os.environ.get("NEO4J_URI", "bolt://localhost:7687")
        user = os.environ.get("NEO4J_USER", "neo4j")
        password = os.environ.get("NEO4J_PASSWORD", "neo4j")
        return Neo4jGraphBackend(uri, user, password)

    # default postgres
    if session is None:
        raise RuntimeError("Postgres backend requires a DB session")
    return PostgresGraphBackend(session)
