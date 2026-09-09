"""
WHAT-IF SCENARIO SIMULATOR (Explicitly labeled as Simulation, not a forecast)

Demonstrates how counterfactual regional signals (e.g. +N cases in cluster, +20% humidity spike)
alter field risk assessments and re-order officer inspection priority queues.
"""

import json
from app.database import query_db


def run_what_if_scenario(additional_cases: int = 5, humidity_spike_pct: float = 10.0):
    """
    Simulates impact of hypothetical events on the officer inspection priority queue.
    """
    fields = query_db("SELECT * FROM fields ORDER BY current_risk_score DESC;")
    original_rankings = []
    simulated_rankings = []

    for f in fields:
        original_score = f["current_risk_score"]
        original_rankings.append({
            "field_id": f["field_id"],
            "owner_name": f["owner_name"],
            "crop": f["crop"],
            "score": original_score,
            "level": f["current_risk_level"]
        })

        # Calculate simulated points:
        # Distance to cluster center (18.5220, 73.8580)
        from app.engine import haversine_km
        dist_to_cluster = haversine_km(f["latitude"], f["longitude"], 18.5220, 73.8580)

        proximity_weight = max(0, 1.0 - (dist_to_cluster / 5.0))
        added_case_risk = int(additional_cases * 3.5 * proximity_weight)

        # Humidity spike impact (fungal diseases accelerate above 70%)
        humidity_risk = int((humidity_spike_pct / 5.0) * (1.5 if f["growth_stage"] in ["Flowering", "Fruiting"] else 1.0))

        simulated_score = min(100, original_score + added_case_risk + humidity_risk)
        simulated_level = "HIGH" if simulated_score >= 70 else "MEDIUM" if simulated_score >= 40 else "LOW"

        simulated_rankings.append({
            "field_id": f["field_id"],
            "owner_name": f["owner_name"],
            "crop": f["crop"],
            "original_score": original_score,
            "simulated_score": simulated_score,
            "score_delta": simulated_score - original_score,
            "original_level": f["current_risk_level"],
            "simulated_level": simulated_level,
            "added_drivers": [
                f"+{added_case_risk} pts from {additional_cases} simulated nearby cluster cases",
                f"+{humidity_risk} pts from simulated +{humidity_spike_pct}% humidity stress"
            ]
        })

    # Sort simulated rankings
    simulated_rankings.sort(key=lambda x: x["simulated_score"], reverse=True)
    for idx, item in enumerate(simulated_rankings, 1):
        item["simulated_rank"] = idx

    return {
        "simulation_disclaimer": "SIMULATION ONLY: This counterfactual scenario model tests system response; it is NOT an actual meteorological or epidemiological forecast.",
        "scenario_parameters": {
            "additional_cases": additional_cases,
            "humidity_spike_pct": humidity_spike_pct
        },
        "results": simulated_rankings
    }
