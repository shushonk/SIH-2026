from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.simulator import run_what_if_scenario

router = APIRouter(prefix="/simulator", tags=["simulator"])


class WhatIfRequest(BaseModel):
    additional_cases: Optional[int] = 5
    humidity_spike_pct: Optional[float] = 10.0


@router.post("/what-if")
def simulate_scenario(request: WhatIfRequest):
    """
    What-If Simulator:
    Simulates counterfactual scenarios (e.g. +N cluster cases, humidity spike)
    and demonstrates how officer inspection priorities shift.
    Clearly labeled as simulation, not a forecast.
    """
    return run_what_if_scenario(
        additional_cases=request.additional_cases,
        humidity_spike_pct=request.humidity_spike_pct
    )
