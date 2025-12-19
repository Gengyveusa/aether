from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
import uuid

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
def ingest_url(req: IngestUrlRequest):
    # TODO: enqueue ingestion job
    job_id = f"job_{uuid.uuid4().hex}"
    return {"jobId": job_id}


@app.post("/ingest/raw")
def ingest_raw(req: IngestRawRequest):
    # TODO: normalize + store raw content
    job_id = f"job_{uuid.uuid4().hex}"
    return {"jobId": job_id}
