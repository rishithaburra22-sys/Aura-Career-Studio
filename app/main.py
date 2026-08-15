"""
Aura Career Studio - Production FastAPI Application (app.main module)
======================================================================
AI Career & Talent Intelligence Suite with LangChain Tools, Live GitHub Mining, and SSE Streaming.
"""

from __future__ import annotations

import os
import gc
import json
import logging
import sys
from pathlib import Path
from contextlib import asynccontextmanager
from typing import Optional, Dict, Any

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Query, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from utils import extract_universal_resume, SAMPLE_RESUMES
from agent import analyze_career_pipeline, analyze_career_stream
from tools import github_profile_reviewer

load_dotenv()

logger = logging.getLogger("aura_career_api")
logging.basicConfig(level=logging.INFO)

STATIC_DIR = PROJECT_ROOT / "static"
if not STATIC_DIR.exists():
    STATIC_DIR = Path(__file__).resolve().parent / "static"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Clean, lightweight startup without heavy memory overhead."""
    gc.collect()
    logger.info("Aura Career Studio server online and ready.")
    yield
    gc.collect()


app = FastAPI(
    title="Aura Career Studio",
    version="1.0.0",
    description="Enterprise AI Career Intelligence Suite powered by LangChain Tools and Groq Llama 3.3 70B",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# PYDANTIC SCHEMAS
# ============================================================================
class AnalysisRequest(BaseModel):
    resume_text: str = Field(..., description="Raw text of candidate resume")
    target_role: str = Field(..., description="Desired job position or career target")
    github_username: Optional[str] = Field(None, description="GitHub handle for portfolio review")
    groq_api_key: Optional[str] = Field(None, description="Optional custom Groq API key")
    github_token: Optional[str] = Field(None, description="Optional custom GitHub token")


# ============================================================================
# API ENDPOINTS
# ============================================================================
@app.get("/health", tags=["System"])
async def health_check():
    """System health check and credentials status."""
    has_groq = bool(os.getenv("GROQ_API_KEY") and len(os.getenv("GROQ_API_KEY").strip()) > 10)
    has_gh = bool(os.getenv("GITHUB_TOKEN") and len(os.getenv("GITHUB_TOKEN").strip()) > 10)
    return {
        "status": "healthy",
        "app": "Aura Career Studio",
        "has_groq_api_key": has_groq,
        "has_github_token": has_gh,
        "model": os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
        "tools": [
            "job_search_advisor",
            "skill_gap_analyzer",
            "project_idea_generator",
            "github_profile_reviewer",
            "ats_optimizer",
            "interview_preparator"
        ]
    }


@app.get("/sample-resumes", tags=["Samples"])
async def list_sample_resumes():
    """List available pre-packaged resumes."""
    return [
        {"key": k, "title": v["title"], "target_role": v["target_role"], "github": v["github_username"]}
        for k, v in SAMPLE_RESUMES.items()
    ]


@app.get("/sample-resume/{key}", tags=["Samples"])
async def get_sample_resume(key: str):
    """Retrieve full text and parameters of a sample resume."""
    if key not in SAMPLE_RESUMES:
        raise HTTPException(status_code=404, detail="Sample resume not found")
    return SAMPLE_RESUMES[key]


@app.get("/github-preview/{username}", tags=["GitHub"])
async def get_github_preview(username: str, token: Optional[str] = None):
    """Lightweight endpoint for fast UI avatar and repository preview badge."""
    res = github_profile_reviewer(username, token)
    return res


@app.post("/analyze", tags=["Analysis"])
async def analyze_profile(
    resume_file: Optional[UploadFile] = File(None),
    resume_text: Optional[str] = Form(None),
    target_role: str = Form("Senior Software Engineer"),
    github_username: Optional[str] = Form(None),
    groq_api_key: Optional[str] = Form(None),
    github_token: Optional[str] = Form(None),
):
    """
    Main Multi-Tool Career Analysis Endpoint.
    Accepts either an uploaded file (PDF, DOCX, TXT) or raw resume text.
    """
    extracted_text = ""
    if resume_file:
        file_bytes = await resume_file.read()
        extracted_text = extract_universal_resume(file_bytes, resume_file.filename)
    elif resume_text:
        extracted_text = resume_text.strip()

    if not extracted_text:
        raise HTTPException(status_code=400, detail="Please upload a resume file or provide resume text.")

    try:
        report = analyze_career_pipeline(
            resume_text=extracted_text,
            target_role=target_role,
            github_username=github_username,
            github_token=github_token,
            groq_api_key=groq_api_key
        )
        return JSONResponse(content=report)
    except Exception as e:
        logger.error(f"Analysis failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Career analysis failed: {str(e)}")


@app.post("/analyze-stream", tags=["Analysis"])
async def analyze_profile_stream(request: AnalysisRequest):
    """
    Real-Time Server-Sent Events (SSE) streaming endpoint.
    """
    if not request.resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume text cannot be empty.")

    return StreamingResponse(
        analyze_career_stream(
            resume_text=request.resume_text,
            target_role=request.target_role,
            github_username=request.github_username,
            github_token=request.github_token,
            groq_api_key=request.groq_api_key
        ),
        media_type="text/event-stream"
    )


# ============================================================================
# STATIC FRONTEND SERVING
# ============================================================================
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

    @app.get("/")
    async def serve_ui():
        index_path = STATIC_DIR / "index.html"
        if index_path.exists():
            return FileResponse(str(index_path))
        return {"message": "Aura Career Studio API running. Visit /docs for OpenAPI specifications."}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)
