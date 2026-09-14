from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from core.ai import generate_explanation

router = APIRouter()

class ExplanationRequest(BaseModel):
    source: str
    trace: List[Dict[str, Any]]

@router.post("/v1/explanations")
def get_explanation(request: ExplanationRequest):
    try:
        explanation = generate_explanation(request.source, request.trace)
        return {"explanation": explanation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
