"""
Immutable audit logging service for KrishiRaksha.
Tracks all critical platform events across Farmer, Expert, Officer, and Admin operations.
"""

import json
import uuid
from datetime import datetime
from app.database import execute_db


def log_audit(actor_role: str, actor_name: str, action_type: str, entity_type: str, entity_id: str = None, details: dict = None):
    log_id = "log_" + str(uuid.uuid4())[:8]
    details_str = json.dumps(details or {})
    execute_db("""
        INSERT INTO audit_logs (log_id, actor_role, actor_name, action_type, entity_type, entity_id, details_json, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    """, (log_id, actor_role, actor_name, action_type, entity_type, entity_id, details_str, datetime.now().isoformat()))
    return log_id
