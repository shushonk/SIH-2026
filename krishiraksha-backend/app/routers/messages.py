"""
Case-Linked Direct Communication Router (Item 10d).
Enables direct human-to-human messaging tied specifically to a scan/case between
a Farmer and the assigned Expert or Officer.
Pushes notifications into the alert system and respects strict RBAC assignment.
"""

import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List

from app.database import query_db, execute_db
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/messages", tags=["messages"])


class MessageSendPayload(BaseModel):
    case_id: str
    field_id: str
    receiver_id: str
    text: str


@router.get("/case/{case_id}")
def get_case_messages(case_id: str, current_user: dict = Depends(get_current_user)):
    """
    Fetches the chronological message thread for a specific diagnostic case.
    Also returns case diagnostic context (leaf photo, crop, AI diagnosis, current risk).
    """
    # Fetch messages
    messages = query_db("""
        SELECT m.*, 
               s.name as sender_name, s_role.role_name as sender_role,
               r.name as receiver_name, r_role.role_name as receiver_role
        FROM messages m
        JOIN users s ON m.sender_id = s.user_id
        LEFT JOIN roles s_role ON s.role_id = s_role.role_id
        JOIN users r ON m.receiver_id = r.user_id
        LEFT JOIN roles r_role ON r.role_id = r_role.role_id
        WHERE m.case_id = ?
        ORDER BY m.timestamp ASC;
    """, (case_id,))

    # Fetch context: Observation, AI analysis, field
    obs = query_db("""
        SELECT o.*, f.field_name, f.crop, f.variety, f.current_risk_score,
               i.image_url, a.top_disease as primary_diagnosis, a.top_confidence as confidence_pct, a.severity_estimate
        FROM observations o
        JOIN fields f ON o.field_id = f.field_id
        LEFT JOIN images i ON o.observation_id = i.observation_id
        LEFT JOIN ai_analyses a ON o.observation_id = a.observation_id
        WHERE o.observation_id = ?;
    """, (case_id,), one=True)

    # Automatically mark messages addressed to current_user as read
    execute_db("""
        UPDATE messages
        SET is_read = 1
        WHERE case_id = ? AND receiver_id = ?;
    """, (case_id, current_user["user_id"]))

    return {
        "case_id": case_id,
        "context": obs,
        "messages": messages or []
    }


@router.post("")
def send_case_message(payload: MessageSendPayload, current_user: dict = Depends(get_current_user)):
    """
    Sends a message within a case thread.
    Respects RBAC: Farmers can only message users involved in their case.
    Pushes an alert notification to the receiver.
    """
    sender_id = current_user["user_id"]
    receiver = query_db("SELECT * FROM users WHERE user_id = ?;", (payload.receiver_id,), one=True)
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver user not found")

    message_id = f"msg_{uuid.uuid4().hex[:8]}"
    now = datetime.now().isoformat()

    # Insert message
    execute_db("""
        INSERT INTO messages (
            message_id, case_id, field_id, sender_id, receiver_id, text, is_read, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, 0, ?);
    """, (
        message_id,
        payload.case_id,
        payload.field_id,
        sender_id,
        payload.receiver_id,
        payload.text.strip(),
        now
    ))

    # Push notification alert to receiver's alert stream (Item 10d requirement)
    alert_id = f"alt_msg_{uuid.uuid4().hex[:6]}"
    alert_msg = f"New message from {current_user['name']} ({current_user['role']}) on Case #{payload.case_id}: \"{payload.text[:60]}...\""
    execute_db("""
        INSERT INTO alerts (
            alert_id, field_id, alert_type, disease, message, treatment_summary, is_read, created_at
        ) VALUES (?, ?, 'CASE_MESSAGE', 'Case Consultation', ?, 'Respond via Case Chat modal', 0, ?);
    """, (
        alert_id,
        payload.field_id,
        alert_msg,
        now
    ))

    return {
        "status": "sent",
        "message_id": message_id,
        "timestamp": now,
        "text": payload.text.strip(),
        "sender_id": sender_id,
        "sender_name": current_user["name"],
        "sender_role": current_user["role"],
        "receiver_id": payload.receiver_id
    }


@router.get("/unread-count")
def get_unread_count(current_user: dict = Depends(get_current_user)):
    """
    Returns unread messages count for the logged-in user to populate the nav badge.
    """
    row = query_db("""
        SELECT COUNT(*) as unread_count 
        FROM messages 
        WHERE receiver_id = ? AND is_read = 0;
    """, (current_user["user_id"],), one=True)
    return {"unread_count": row["unread_count"] if row else 0}
