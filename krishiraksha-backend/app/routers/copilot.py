from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.services.copilot import ask_copilot, explain_vision_diagnosis

router = APIRouter(prefix="/copilot", tags=["copilot"])


class CopilotChatRequest(BaseModel):
    query: Optional[str] = None
    message: Optional[str] = None
    role: Optional[str] = "Farmer"
    field_id: Optional[str] = "104"
    language: Optional[str] = "en"


class ExplainDiagnosisRequest(BaseModel):
    vision_result: Dict[str, Any]
    role: Optional[str] = "Farmer"
    language: Optional[str] = "en"


@router.post("/chat")
def copilot_chat(request: CopilotChatRequest):
    """
    Grounded Agricultural Copilot:
    Answers queries using the app's internal database state and structured knowledge base.
    Returns markdown-formatted response and verifiable citations.
    """
    user_query = request.query or request.message or "Hello"
    return ask_copilot(
        query=user_query,
        role=request.role,
        field_id=request.field_id,
        lang=request.language
    )


@router.post("/explain-diagnosis")
def copilot_explain_diagnosis(request: ExplainDiagnosisRequest):
    """
    Ollama gpt-oss:120b-cloud Language Layer:
    Takes structured output from the vision layer and generates a simplified,
    action-first explanation for farmers in their preferred language.
    """
    return explain_vision_diagnosis(
        vision_result=request.vision_result,
        role=request.role,
        lang=request.language
    )

