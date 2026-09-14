from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import os
from routes import analyze, explanations, explain
from core.error_pages import render_error_html

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Explain My Code API",
    version="2.0.0",
    description="Intelligent AI code deconstruction engine powered by Gemini 2.5 Flash",
)

# Production-ready CORS configuration
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
is_prod = os.getenv("ENVIRONMENT", "development").lower() == "production"

if allowed_origins_env:
    allowed_origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]
else:
    allowed_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://explainmycode.dev",
        "https://www.explainmycode.dev",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if is_prod or allowed_origins_env else ["*"],
    allow_credentials=True if (allowed_origins_env or is_prod) else False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# New unified endpoint
app.include_router(explain.router)

# Legacy endpoints (kept for backward compat)
app.include_router(analyze.router)
app.include_router(explanations.router)


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str


@app.get("/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(
        status="ok",
        service="explain-my-code-api",
        version="2.0.0",
    )


@app.get("/")
def root_index(request: Request):
    """
    Root endpoint offering friendly redirect/status.
    """
    accept = request.headers.get("accept", "")
    if "text/html" in accept:
        return HTMLResponse(
            content=render_error_html(
                status_code=200,
                detail="FastAPI backend operational. Explore /docs for OpenAPI specs or launch the Next.js frontend.",
                path="/",
                method="GET",
            ),
            status_code=200,
        )
    return {
        "service": "Explain My Code API",
        "version": "2.0.0",
        "status": "healthy",
        "docs": "/docs",
        "health": "/health",
        "unified_endpoint": "/v1/explain",
        "usage_endpoint": "/v1/usage",
    }


# ── Custom Exception Handlers ───────────────────────────────────────────

@app.exception_handler(StarletteHTTPException)
async def custom_http_exception_handler(request: Request, exc: StarletteHTTPException):
    """
    Handles 404 Not Found and other HTTP exceptions gracefully with HTML or JSON.
    """
    accept = request.headers.get("accept", "")
    if "text/html" in accept:
        return HTMLResponse(
            content=render_error_html(
                status_code=exc.status_code,
                detail=str(exc.detail),
                path=request.url.path,
                method=request.method,
            ),
            status_code=exc.status_code,
        )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "Route Not Found" if exc.status_code == 404 else "HTTP Error",
            "status_code": exc.status_code,
            "detail": exc.detail,
            "path": request.url.path,
            "method": request.method,
            "available_endpoints": [
                "/v1/explain",
                "/v1/usage",
                "/v1/usage/reset",
                "/health",
                "/docs",
            ],
        },
    )


@app.exception_handler(Exception)
async def custom_general_exception_handler(request: Request, exc: Exception):
    """
    Catches unhandled backend exceptions to prevent leaking server internal details in production.
    """
    is_production = os.getenv("ENVIRONMENT", "").lower() == "production"
    error_detail = "An unexpected internal server error occurred." if is_production else (str(exc) or "Internal backend processing exception.")

    accept = request.headers.get("accept", "")
    if "text/html" in accept:
        return HTMLResponse(
            content=render_error_html(
                status_code=500,
                detail=error_detail,
                path=request.url.path,
                method=request.method,
            ),
            status_code=500,
        )
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "status_code": 500,
            "detail": error_detail,
            "path": request.url.path,
            "method": request.method,
        },
    )
