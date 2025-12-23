from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict


def load_schema(name: str) -> Dict[str, Any]:
    """Load a JSON Schema by name from packages/shared-types/schemas."""
    root = Path(__file__).resolve().parents[3]
    schema_path = root / "packages" / "shared-types" / "schemas" / f"{name}.schema.json"
    if not schema_path.exists():
        raise FileNotFoundError(f"Schema not found: {schema_path}")
    return json.loads(schema_path.read_text("utf-8"))
