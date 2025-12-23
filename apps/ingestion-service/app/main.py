from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import httpx

from .config import get_graph_service_url

app = FastAPI(title="Aether Ingestion Service", version="0.0.0")


class IngestUrlRequest(BaseModel):
    brandId: str
    url: str


class IngestRawRequest(BaseModel):
    brandId: str
    content: str
    sourceUrl: Optional[str] = None


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/ingest/url")
async def ingest_url(req: IngestUrlRequest):
    graph_base = get_graph_service_url()

    timeout = httpx.Timeout(20.0, connect=10.0)
    async with httpx.AsyncClient(timeout=timeout, follow_redirects=True) as client:
        # Fetch HTML
        try:
            resp = await client.get(req.url, headers={"user-agent": "AetherIngestion/0.0.0"})
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"Failed to fetch URL: {e}")

        if resp.status_code >= 400:
            raise HTTPException(status_code=502, detail=f"Upstream returned {resp.status_code}")

        html = resp.text

        # Persist as source document in graph-service
        try:
            store = await client.post(
                f"{graph_base}/source-documents",
                json={
                    "brandId": req.brandId,
                    "url": req.url,
                    "content": html,
                    "contentType": "text/html",
                },
            )
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"Failed to store source document: {e}")

        if store.status_code >= 400:
            raise HTTPException(status_code=store.status_code, detail=store.text)

    return {"status": "ok", "brandId": req.brandId, "url": req.url}


@app.post("/ingest/raw")
def ingest_raw(req: IngestRawRequest):
    # TODO: normalize + store raw content
    job_id = f"job_{uuid.uuid4().hex}"
    return {"jobId": job_id}
