from __future__ import annotations

import os


def get_graph_service_url() -> str:
    return (os.environ.get("GRAPH_SERVICE_URL") or "http://localhost:8001").rstrip("/")


def get_port(default: int) -> int:
    raw = os.environ.get("PORT")
    if not raw:
        return default
    try:
        return int(raw)
    except ValueError:
        return default
