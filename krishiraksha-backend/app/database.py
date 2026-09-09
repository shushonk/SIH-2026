"""
SQLite database layer for KrishiRaksha.
Provides 24 relational tables backing the full closed-loop agricultural decision-support model.
Zero external database dependencies required.
"""

import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "krishiraksha.db")


def get_db():
    conn = sqlite3.connect(DB_PATH, timeout=20.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # 1. Roles
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS roles (
        role_id TEXT PRIMARY KEY,
        role_name TEXT UNIQUE NOT NULL,
        description TEXT
    );
    """)

    # 2. Users
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        phone TEXT,
        password_hash TEXT,
        role_id TEXT NOT NULL,
        avatar_url TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles(role_id)
    );
    """)
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN password_hash TEXT;")
    except Exception:
        pass

    # 3. Farms
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS farms (
        farm_id TEXT PRIMARY KEY,
        farm_name TEXT NOT NULL,
        owner_id TEXT,
        location_name TEXT NOT NULL,
        district TEXT,
        state TEXT,
        total_acres REAL,
        latitude REAL,
        longitude REAL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(user_id)
    );
    """)

    # 4. Crops
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS crops (
        crop_id TEXT PRIMARY KEY,
        crop_name TEXT UNIQUE NOT NULL,
        scientific_name TEXT,
        category TEXT,
        typical_duration_days INTEGER
    );
    """)

    # 5. Fields
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS fields (
        field_id TEXT PRIMARY KEY,
        farm_id TEXT,
        owner_name TEXT NOT NULL,
        field_name TEXT NOT NULL,
        crop TEXT NOT NULL,
        variety TEXT NOT NULL,
        age_days INTEGER DEFAULT 45,
        growth_stage TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        soil_type TEXT,
        soil_moisture_pct REAL,
        health_trend TEXT DEFAULT 'Stable',
        current_risk_score INTEGER DEFAULT 0,
        current_risk_level TEXT DEFAULT 'LOW',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (farm_id) REFERENCES farms(farm_id)
    );
    """)

    # 6. Crop Cycles
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS crop_cycles (
        cycle_id TEXT PRIMARY KEY,
        field_id TEXT NOT NULL,
        crop TEXT NOT NULL,
        variety TEXT,
        sowing_date TEXT,
        expected_harvest TEXT,
        current_stage TEXT,
        status TEXT DEFAULT 'active',
        FOREIGN KEY (field_id) REFERENCES fields(field_id)
    );
    """)

    # 7. Observations
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS observations (
        observation_id TEXT PRIMARY KEY,
        field_id TEXT NOT NULL,
        image_ref TEXT,
        symptom_notes TEXT,
        symptom_keywords_json TEXT,
        status TEXT DEFAULT 'analyzed',
        sync_status TEXT DEFAULT 'synced',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (field_id) REFERENCES fields(field_id)
    );
    """)

    # 8. Images
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS images (
        image_id TEXT PRIMARY KEY,
        observation_id TEXT NOT NULL,
        image_type TEXT DEFAULT 'primary',
        image_url TEXT,
        image_base64 TEXT,
        captured_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (observation_id) REFERENCES observations(observation_id)
    );
    """)

    # 9. AI Analyses (Explicitly labeled as deterministic mock AI or classifier)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ai_analyses (
        analysis_id TEXT PRIMARY KEY,
        observation_id TEXT NOT NULL,
        model_name TEXT NOT NULL,
        top_disease TEXT NOT NULL,
        top_confidence REAL NOT NULL,
        severity_estimate TEXT NOT NULL,
        explanation TEXT,
        needs_investigation INTEGER DEFAULT 0,
        investigation_question TEXT,
        model_type TEXT DEFAULT 'deterministic_mock_v1',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (observation_id) REFERENCES observations(observation_id)
    );
    """)

    # 10. Differential Diagnoses
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS differential_diagnoses (
        differential_id TEXT PRIMARY KEY,
        analysis_id TEXT NOT NULL,
        disease TEXT NOT NULL,
        confidence REAL NOT NULL,
        rank_order INTEGER NOT NULL,
        key_indicators TEXT,
        FOREIGN KEY (analysis_id) REFERENCES ai_analyses(analysis_id)
    );
    """)

    # 11. Investigation Requests (Uncertainty engine follow-ups)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS investigation_requests (
        request_id TEXT PRIMARY KEY,
        observation_id TEXT NOT NULL,
        question_prompt TEXT NOT NULL,
        requested_image_type TEXT,
        farmer_answer TEXT,
        narrowed_disease TEXT,
        narrowed_confidence REAL,
        status TEXT DEFAULT 'pending',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        answered_at TEXT,
        FOREIGN KEY (observation_id) REFERENCES observations(observation_id)
    );
    """)

    # 12. Expert Reviews (Ground truth & AI-Expert agreement pair)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS expert_reviews (
        review_id TEXT PRIMARY KEY,
        observation_id TEXT NOT NULL,
        expert_id TEXT,
        expert_name TEXT NOT NULL,
        confirmed_disease TEXT NOT NULL,
        original_ai_disease TEXT,
        original_ai_confidence REAL,
        agreement INTEGER DEFAULT 1,
        severity TEXT NOT NULL,
        comments TEXT,
        advisory_notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (observation_id) REFERENCES observations(observation_id)
    );
    """)

    # 13. Health Passports (Persistent field profile)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS health_passports (
        passport_id TEXT PRIMARY KEY,
        field_id TEXT UNIQUE NOT NULL,
        trend_label TEXT DEFAULT 'Stable',
        summary_narrative TEXT,
        total_scans INTEGER DEFAULT 0,
        last_observation_date TEXT,
        last_updated TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (field_id) REFERENCES fields(field_id)
    );
    """)

    # 14. Risk Assessments (Explainable 0-100 score + factor breakdown)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS risk_assessments (
        assessment_id TEXT PRIMARY KEY,
        field_id TEXT NOT NULL,
        score INTEGER NOT NULL,
        level TEXT NOT NULL,
        factors_json TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (field_id) REFERENCES fields(field_id)
    );
    """)

    # 15. Environmental Observations
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS environmental_observations (
        env_id TEXT PRIMARY KEY,
        field_id TEXT NOT NULL,
        temperature_c REAL,
        humidity_pct REAL,
        rainfall_mm REAL,
        leaf_wetness_hours REAL,
        source TEXT DEFAULT 'open-meteo',
        recorded_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (field_id) REFERENCES fields(field_id)
    );
    """)

    # 16. Regional Signals
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS regional_signals (
        signal_id TEXT PRIMARY KEY,
        cluster_id TEXT,
        disease TEXT NOT NULL,
        day_step INTEGER NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        intensity REAL DEFAULT 1.0,
        verified_count INTEGER DEFAULT 1,
        recorded_date TEXT NOT NULL
    );
    """)

    # 17. Clusters
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS clusters (
        cluster_id TEXT PRIMARY KEY,
        cluster_name TEXT NOT NULL,
        disease TEXT NOT NULL,
        center_lat REAL NOT NULL,
        center_lon REAL NOT NULL,
        radius_km REAL NOT NULL,
        total_cases INTEGER DEFAULT 1,
        spread_velocity_km_day REAL DEFAULT 0.2,
        active_status TEXT DEFAULT 'active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 18. Inspection Priorities
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS inspection_priorities (
        priority_id TEXT PRIMARY KEY,
        field_id TEXT UNIQUE NOT NULL,
        rank_order INTEGER NOT NULL,
        priority_score INTEGER NOT NULL,
        driving_reasons_json TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        assigned_officer TEXT,
        last_updated TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (field_id) REFERENCES fields(field_id)
    );
    """)

    # 19. Interventions
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS interventions (
        intervention_id TEXT PRIMARY KEY,
        field_id TEXT NOT NULL,
        observation_id TEXT,
        action_taken TEXT NOT NULL,
        officer_name TEXT NOT NULL,
        guidance_type TEXT DEFAULT 'advisory',
        status TEXT DEFAULT 'completed',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (field_id) REFERENCES fields(field_id)
    );
    """)

    # 20. Follow-Ups
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS follow_ups (
        followup_id TEXT PRIMARY KEY,
        field_id TEXT NOT NULL,
        intervention_id TEXT,
        due_date TEXT NOT NULL,
        status TEXT DEFAULT 'scheduled',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (field_id) REFERENCES fields(field_id),
        FOREIGN KEY (intervention_id) REFERENCES interventions(intervention_id)
    );
    """)

    # 21. Outcomes (Enforcing non-causal language)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS outcomes (
        outcome_id TEXT PRIMARY KEY,
        field_id TEXT NOT NULL,
        followup_id TEXT NOT NULL,
        previous_severity_pct INTEGER NOT NULL,
        new_severity_pct INTEGER NOT NULL,
        outcome_label TEXT NOT NULL,
        interpretation TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (field_id) REFERENCES fields(field_id),
        FOREIGN KEY (followup_id) REFERENCES follow_ups(followup_id)
    );
    """)

    # 22. Alerts
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS alerts (
        alert_id TEXT PRIMARY KEY,
        field_id TEXT NOT NULL,
        alert_type TEXT NOT NULL,
        disease TEXT NOT NULL,
        message TEXT NOT NULL,
        treatment_summary TEXT NOT NULL,
        distance_km REAL DEFAULT 0.0,
        sync_status TEXT DEFAULT 'synced',
        is_read INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (field_id) REFERENCES fields(field_id)
    );
    """)

    # 23. Knowledge Documents
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS knowledge_documents (
        doc_id TEXT PRIMARY KEY,
        disease TEXT UNIQUE NOT NULL,
        description TEXT NOT NULL,
        symptoms_json TEXT NOT NULL,
        prevention_json TEXT NOT NULL,
        safe_next_steps_json TEXT NOT NULL,
        escalation_note TEXT NOT NULL,
        translations_json TEXT NOT NULL
    );
    """)

    # 24. Audit Logs (Immutable trace)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        log_id TEXT PRIMARY KEY,
        actor_role TEXT NOT NULL,
        actor_name TEXT NOT NULL,
        action_type TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT,
        details_json TEXT,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 25. Sensor Readings (basic field sensors: soil moisture, leaf wetness, canopy temp/RH)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sensor_readings (
        reading_id TEXT PRIMARY KEY,
        field_id TEXT NOT NULL,
        sensor_type TEXT NOT NULL,
        value REAL NOT NULL,
        unit TEXT NOT NULL,
        threshold_exceeded INTEGER DEFAULT 0,
        source TEXT DEFAULT 'IoT_Station',
        recorded_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (field_id) REFERENCES fields(field_id)
    );
    """)

    # 26. Trap Counts (pheromone / light pest traps with economic thresholds)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS trap_counts (
        trap_id TEXT PRIMARY KEY,
        field_id TEXT NOT NULL,
        trap_type TEXT NOT NULL,
        target_pest TEXT NOT NULL,
        count INTEGER NOT NULL,
        economic_threshold INTEGER NOT NULL,
        threshold_breached INTEGER DEFAULT 0,
        logged_by TEXT NOT NULL,
        notes TEXT,
        recorded_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (field_id) REFERENCES fields(field_id)
    );
    """)

    # 27. Forecast Alerts (Weather-based 3-7 day forward outbreak probability)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS forecast_alerts (
        forecast_id TEXT PRIMARY KEY,
        field_id TEXT NOT NULL,
        disease TEXT NOT NULL,
        forecast_window_days INTEGER DEFAULT 5,
        probability_pct INTEGER NOT NULL,
        favorable_conditions_summary TEXT NOT NULL,
        preventive_actions_json TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (field_id) REFERENCES fields(field_id)
    );
    """)

    # 28. Messages (Direct human-to-human case communication)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS messages (
        message_id TEXT PRIMARY KEY,
        case_id TEXT NOT NULL,
        field_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        receiver_id TEXT NOT NULL,
        text TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (field_id) REFERENCES fields(field_id),
        FOREIGN KEY (sender_id) REFERENCES users(user_id),
        FOREIGN KEY (receiver_id) REFERENCES users(user_id)
    );
    """)

    conn.commit()
    conn.close()


def query_db(query, args=(), one=False):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(query, args)
    r = cur.fetchall()
    conn.close()
    if not r:
        return None if one else []
    results = [dict(row) for row in r]
    return results[0] if one else results


def execute_db(query, args=()):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(query, args)
    conn.commit()
    last_id = cur.lastrowid
    conn.close()
    return last_id
