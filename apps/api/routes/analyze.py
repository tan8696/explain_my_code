from fastapi import APIRouter, HTTPException
from schemas.api_models import AnalyzeRequest, AnalyzeResponse, SourceMap, Summary
from core.tracer import AITracer, UnsupportedSyntaxError, TracerError

router = APIRouter()

@router.post("/v1/analyze", response_model=AnalyzeResponse)
def analyze_code(request: AnalyzeRequest):
    if request.language.lower() != "python":
        raise HTTPException(status_code=400, detail="Only Python is supported at this time.")

    tracer = AITracer()
    try:
        events = tracer.parse_and_trace(request.source)
        
        return AnalyzeResponse(
            analysisId="generated-uuid", # Placeholder for actual UUID
            status="visualized",
            sourceMap=SourceMap(lineCount=len(request.source.splitlines())),
            trace=events,
            summary=Summary(
                title="Code Analysis",
                supportedFeatures=["all_python_features"]
            ),
            warnings=[]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
