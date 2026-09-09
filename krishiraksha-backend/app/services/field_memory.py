"""
FIELD MEMORY SERVICE
Analyzes temporal history for a given field across successive scans, expert reviews, and interventions.
Strictly adheres to cautious non-causal language rules:
  - Describes sequence and observed correlation
  - NEVER asserts direct causation (e.g. 'improvement observed following recorded intervention' vs 'intervention cured disease')
"""

import json
from datetime import datetime
from app.database import query_db


def analyze_field_memory(field_id: str):
    """
    Retrieves chronological observations, expert reviews, and interventions for a field.
    Returns memory insights and cautious comparative statements.
    """
    field = query_db("SELECT * FROM fields WHERE field_id = ?", (field_id,), one=True)
    if not field:
        return {"field_id": field_id, "insights": [], "total_scans": 0}

    observations = query_db(
        "SELECT * FROM observations WHERE field_id = ? ORDER BY created_at ASC;",
        (field_id,)
    )
    reviews = query_db(
        """
        SELECT er.*, o.created_at as obs_date
        FROM expert_reviews er
        JOIN observations o ON er.observation_id = o.observation_id
        WHERE o.field_id = ?
        ORDER BY er.created_at ASC;
        """,
        (field_id,)
    )
    interventions = query_db(
        "SELECT * FROM interventions WHERE field_id = ? ORDER BY created_at ASC;",
        (field_id,)
    )
    outcomes = query_db(
        "SELECT * FROM outcomes WHERE field_id = ? ORDER BY created_at ASC;",
        (field_id,)
    )

    insights = []
    scan_count = len(observations)

    # 1. Recurrence analysis
    if len(reviews) >= 2:
        prev_disease = reviews[-2]["confirmed_disease"]
        curr_disease = reviews[-1]["confirmed_disease"]
        if prev_disease == curr_disease:
            insights.append({
                "type": "recurrence",
                "badge": "Recurrent Pattern",
                "message": f"Similar symptoms corresponding to {curr_disease} were previously confirmed on this field.",
                "cautious_note": "Sequential occurrence recorded across multiple crop observation dates."
            })

    # 2. Sequential progression & intervention correlation
    if interventions and len(observations) >= 2:
        latest_intervention = interventions[-1]
        if outcomes:
            latest_outcome = outcomes[-1]
            if latest_outcome["new_severity_pct"] < latest_outcome["previous_severity_pct"]:
                insights.append({
                    "type": "improvement_sequence",
                    "badge": "Favorable Progression",
                    "message": f"Reduction in lesion severity ({latest_outcome['previous_severity_pct']}% → {latest_outcome['new_severity_pct']}%) observed following recorded advisory on {latest_intervention['action_taken']}.",
                    "cautious_note": "Report describes sequential correlation only; environmental shifts may also be contributing factors."
                })
            else:
                insights.append({
                    "type": "persistent_sequence",
                    "badge": "Active Monitoring Required",
                    "message": f"Symptoms remain persistent ({latest_outcome['new_severity_pct']}%) subsequent to recorded extension visit.",
                    "cautious_note": "Further observation warranted to rule out microclimate humidity effects."
                })
        else:
            insights.append({
                "type": "pending_followup",
                "badge": "Awaiting Follow-Up",
                "message": f"Intervention logged by {latest_intervention['officer_name']}; follow-up scan will assess symptom progression.",
                "cautious_note": "Awaiting post-intervention observation."
            })
    elif scan_count >= 2:
        # Compare last two analyses
        recent_analyses = query_db(
            """
            SELECT a.*, o.created_at as scan_time
            FROM ai_analyses a
            JOIN observations o ON a.observation_id = o.observation_id
            WHERE o.field_id = ?
            ORDER BY o.created_at DESC LIMIT 2;
            """,
            (field_id,)
        )
        if len(recent_analyses) == 2:
            latest = recent_analyses[0]
            prev = recent_analyses[1]
            if latest["top_disease"] == prev["top_disease"]:
                insights.append({
                    "type": "persistence",
                    "badge": "Symptom Consistency",
                    "message": f"Consistent {latest['top_disease']} markers detected across sequential scans (observed {prev['top_confidence']*100:.0f}% vs current {latest['top_confidence']*100:.0f}%).",
                    "cautious_note": "Correlation observed in sequential image analyses."
                })

    # 3. Microclimate & growth stage correlation
    if field["growth_stage"] in ["Flowering", "Fruiting"]:
        insights.append({
            "type": "stage_vulnerability",
            "badge": "Growth Phase Context",
            "message": f"Current {field['growth_stage']} stage coincides with elevated canopy microclimate sensitivity in cultivar '{field['variety']}'.",
            "cautious_note": "Phenological stage correlates with historical regional vulnerability."
        })

    return {
        "field_id": field_id,
        "total_scans": scan_count,
        "total_reviews": len(reviews),
        "total_interventions": len(interventions),
        "insights": insights
    }
