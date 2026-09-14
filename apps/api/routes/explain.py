import os
from fastapi import APIRouter, HTTPException, Request
from schemas.api_models import ExplainRequest, ExplainResponse, LineExplanation, Bug, Concept, CreditInfo
from core.ai import explain_code
from core.credit_manager import credit_manager

router = APIRouter()


@router.get("/v1/usage", response_model=CreditInfo)
def get_usage():
    """Retrieve current AI credit usage, limits, and free-tier protection status."""
    return CreditInfo(**credit_manager.get_credit_info())


@router.post("/v1/usage/reset", response_model=CreditInfo)
@router.get("/v1/usage/reset", response_model=CreditInfo)
def reset_usage(request: Request):
    """Reset AI credit usage for today (development/testing only, disabled in production without admin secret)."""
    env = os.getenv("ENVIRONMENT", "development").lower()
    admin_secret = os.getenv("ADMIN_RESET_SECRET", "")
    header_secret = request.headers.get("x-admin-secret", "")

    if env == "production" and (not admin_secret or header_secret != admin_secret):
        raise HTTPException(
            status_code=403,
            detail="Credit reset is disabled in production environment.",
        )
    return CreditInfo(**credit_manager.reset_credits())


@router.post("/v1/explain", response_model=ExplainResponse)
def explain(request: ExplainRequest):
    """Universal code explanation endpoint — supports any language."""
    code = request.code.strip()
    if not code:
        raise HTTPException(status_code=400, detail="No code provided.")

    if len(code) > 50_000:
        raise HTTPException(status_code=400, detail="Code exceeds maximum length (50,000 characters).")

    try:
        raw = explain_code(code)
        credit_data = raw.get("credits")
        credits_obj = CreditInfo(**credit_data) if credit_data else None

        return ExplainResponse(
            language=raw.get("language", "Unknown"),
            summary=raw.get("summary", ""),
            lineByLine=[
                LineExplanation(
                    lineNumber=item.get("lineNumber", 0),
                    code=item.get("code", ""),
                    explanation=item.get("explanation", ""),
                )
                for item in raw.get("lineByLine", [])
            ],
            logic=raw.get("logic", ""),
            bugs=[
                Bug(
                    line=bug.get("line", 0),
                    severity=bug.get("severity", "info"),
                    description=bug.get("description", ""),
                    fix=bug.get("fix", ""),
                )
                for bug in raw.get("bugs", [])
            ],
            concepts=[
                Concept(
                    name=concept.get("name", ""),
                    explanation=concept.get("explanation", ""),
                )
                for concept in raw.get("concepts", [])
            ],
            output=raw.get("output", ""),
            credits=credits_obj,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Explanation failed: {str(e)}")
