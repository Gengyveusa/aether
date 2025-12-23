from __future__ import annotations

import os


def get_graph_db_url() -> str:
    return os.environ.get("GRAPH_DB_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/aether")


def get_graph_backend() -> str:
    # postgres | neo4j | in_memory
    return os.environ.get("GRAPH_BACKEND", "postgres")


def get_port(default: int) -> int:
    raw = os.environ.get("PORT")
    if not raw:
        return default
    try:
        return int(raw)
    except ValueError:
        return default
