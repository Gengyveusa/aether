import os
import sys
import uuid
from fastapi.testclient import TestClient


def test_graph_service_entity_and_canonical_roundtrip():
    os.environ["GRAPH_BACKEND"] = "in_memory"

    # Import after env set so dependency picks backend
    sys.path.insert(0, os.path.join(os.getcwd(), "apps", "graph-service"))
    from app.main import app  # type: ignore

    client = TestClient(app)

    brand_id = str(uuid.uuid4())
    now = "2025-01-01T00:00:00Z"

    # Create entity
    payload = {
        "id": brand_id,
        "type": "brand",
        "slug": "acme",
        "displayName": "Acme",
        "description": "",
        "websiteUrl": "https://acme.example",
        "primaryTopics": [],
        "targetAudiences": [],
        "createdAt": now,
        "updatedAt": now,
    }

    r = client.post("/entities", json=payload)
    assert r.status_code == 200
    created = r.json()
    assert created["id"] == brand_id

    # Read entity
    r = client.get(f"/entities/{brand_id}")
    assert r.status_code == 200
    fetched = r.json()
    assert fetched["id"] == brand_id

    # Store canonical content
    canonical = {
        "entityId": brand_id,
        "aboutShort": "",
        "aboutLong": "",
        "faq": [],
    }
    r = client.put(f"/canonical-content/{brand_id}", json=canonical)
    assert r.status_code == 200

    # Read canonical content
    r = client.get(f"/canonical-content/{brand_id}")
    assert r.status_code == 200
    cc = r.json()
    assert cc["entityId"] == brand_id
