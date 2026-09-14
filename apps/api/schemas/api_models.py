from pydantic import BaseModel
from typing import List, Dict, Any, Optional


# ── Legacy trace models (kept for backward compatibility) ──────────────

class Change(BaseModel):
    name: str
    before: Any
    after: Any


class TraceEvent(BaseModel):
    step: int
    type: str
    line: int
    lineEnd: int
    label: str
    variables: Dict[str, Any]
    changes: List[Change]
    output: List[str]


class AnalyzeRequest(BaseModel):
    source: str
    language: str = "python"
    learningLevel: str = "beginner"
    includeExplanation: bool = True


class SourceMap(BaseModel):
    lineCount: int


class Summary(BaseModel):
    title: str
    supportedFeatures: List[str]


class AnalyzeResponse(BaseModel):
    analysisId: str
    status: str
    sourceMap: Optional[SourceMap] = None
    trace: Optional[List[TraceEvent]] = None
    summary: Optional[Summary] = None
    warnings: Optional[List[str]] = None


# ── New unified explain models ─────────────────────────────────────────

class ExplainRequest(BaseModel):
    code: str


class LineExplanation(BaseModel):
    lineNumber: int
    code: str
    explanation: str


class Bug(BaseModel):
    line: int
    severity: str          # "error" | "warning" | "info"
    description: str
    fix: str


class Concept(BaseModel):
    name: str
    explanation: str


class CreditInfo(BaseModel):
    limit: int
    used: int
    remaining: int
    isLimitReached: bool
    quotaExhausted: bool = False
    reason: Optional[str] = ""
    mode: str = "gemini_live"  # "gemini_live" | "free_tier_fallback" | "limit_reached_fallback" | "offline_heuristic"
    resetAt: str = "Midnight UTC"


class ExplainResponse(BaseModel):
    language: str
    summary: str
    lineByLine: List[LineExplanation]
    logic: str
    bugs: List[Bug]
    concepts: List[Concept]
    output: str
    credits: Optional[CreditInfo] = None
