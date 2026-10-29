
import os
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_KEY"]

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(title="ForestGuard AI API", version="1.0.0")

origins = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGIN", "").split(",")
    if origin.strip()
]

if origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=False,
        allow_methods=["GET"],
        allow_headers=["*"],
    )


@app.get("/health")
def health():
    return {"status": "ok", "service": "ForestGuard AI API"}


@app.get("/regions")
def get_regions():
    try:
        return (
            supabase.table("regions")
            .select("id, name, country")
            .order("name")
            .execute()
            .data
        )
    except Exception:
        raise HTTPException(503, "Could not retrieve regions")


@app.get("/observations")
def get_observations(
    region_id: int = Query(default=1, ge=1),
    limit: int = Query(default=115, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
):
    try:
        return (
            supabase.table("observations")
            .select(
                "id, region_id, observation_month, "
                "ndvi, ndmi, rainfall_mm, temperature_c"
            )
            .eq("region_id", region_id)
            .order("observation_month")
            .range(offset, offset + limit - 1)
            .execute()
            .data
        )
    except Exception:
        raise HTTPException(503, "Could not retrieve observations")


@app.get("/alerts")
def get_alerts(
    alert_level: Optional[str] = None,
    limit: int = Query(default=115, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
):
    allowed = {
        "Green", "Yellow", "Orange", "Red",
        "Insufficient satellite data",
    }

    if alert_level and alert_level not in allowed:
        raise HTTPException(400, "Invalid alert_level")

    try:
        query = (
            supabase.table("alerts")
            .select(
                "id, observation_id, alert_level, "
                "reason, generated_at"
            )
        )

        if alert_level:
            query = query.eq("alert_level", alert_level)

        return (
            query.order("id")
            .range(offset, offset + limit - 1)
            .execute()
            .data
        )
    except Exception:
        raise HTTPException(503, "Could not retrieve alerts")


@app.get("/summary")
def get_summary():
    try:
        result = (
            supabase.table("alerts")
            .select("alert_level")
            .range(0, 999)
            .execute()
        )

        counts = {
            "Green": 0,
            "Yellow": 0,
            "Orange": 0,
            "Red": 0,
            "Insufficient satellite data": 0,
        }

        for row in result.data:
            if row["alert_level"] in counts:
                counts[row["alert_level"]] += 1

        return {
            "total_alerts": len(result.data),
            "alert_counts": counts,
        }
    except Exception:
        raise HTTPException(503, "Could not calculate summary")
