from fastapi import FastAPI
from aether.core.geo import compute_geo_score

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/geo/score")
async def geo_score(payload: dict):
    data = payload.get("data", {})
    result = compute_geo_score(data)
    return result
