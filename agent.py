"""
Aura Career Studio - Multi-Tool Career Intelligence Orchestrator
==================================================================
Coordinates 6 specialized tools with real-time SSE event streaming and structured reporting.
"""

from __future__ import annotations

import time
import json
import logging
from typing import Dict, Any, Optional, AsyncGenerator

from tools import (
    job_search_advisor,
    skill_gap_analyzer,
    project_idea_generator,
    github_profile_reviewer,
    ats_optimizer,
    interview_preparator
)

logger = logging.getLogger("aura_career_agent")
logging.basicConfig(level=logging.INFO)


def analyze_career_pipeline(
    resume_text: str,
    target_role: str,
    github_username: Optional[str] = None,
    github_token: Optional[str] = None,
    groq_api_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Synchronously runs all 6 career intelligence tools and returns a consolidated report.
    """
    t_start = time.time()
    clean_resume = resume_text.strip()
    clean_role = target_role.strip() or "Software Engineer"
    clean_gh = (github_username or "").strip()

    logger.info(f"Starting career intelligence pipeline for role: {clean_role}, GitHub: {clean_gh}")

    # 1. Job Search
    logger.info("Executing Tool 1: Job Search Advisor...")
    job_search_res = job_search_advisor(clean_resume, clean_role, groq_api_key)

    # 2. Skill Gaps
    logger.info("Executing Tool 2: Skill Gap Analyzer...")
    skill_gap_res = skill_gap_analyzer(clean_resume, clean_role, groq_api_key)

    # 3. Portfolio Projects
    logger.info("Executing Tool 3: Project Idea Generator...")
    project_res = project_idea_generator(clean_resume, clean_role, skill_gap_res, groq_api_key)

    # 4. GitHub Review
    logger.info("Executing Tool 4: GitHub Profile Reviewer...")
    github_res = github_profile_reviewer(clean_gh, github_token, groq_api_key)

    # 5. ATS Scoring & Optimizer
    logger.info("Executing Tool 5: ATS Optimizer...")
    ats_res = ats_optimizer(clean_resume, clean_role, groq_api_key)

    # 6. Interview Preparator
    logger.info("Executing Tool 6: Interview Preparator...")
    interview_res = interview_preparator(clean_resume, clean_role, groq_api_key)

    total_time_ms = round((time.time() - t_start) * 1000, 1)

    return {
        "status": "success",
        "target_role": clean_role,
        "github_username": clean_gh,
        "execution_time_ms": total_time_ms,
        "ats_audit": ats_res,
        "job_search": job_search_res,
        "skill_gaps": skill_gap_res,
        "project_ideas": project_res,
        "github_review": github_res,
        "interview_prep": interview_res
    }


async def analyze_career_stream(
    resume_text: str,
    target_role: str,
    github_username: Optional[str] = None,
    github_token: Optional[str] = None,
    groq_api_key: Optional[str] = None
) -> AsyncGenerator[str, None]:
    """
    Asynchronous Server-Sent Events (SSE) generator streaming real-time stage updates.
    """
    clean_resume = resume_text.strip()
    clean_role = target_role.strip() or "Software Engineer"
    clean_gh = (github_username or "").strip()

    # Step 1: Ingestion
    yield f"data: {json.dumps({'stage': 'ingest', 'progress': 15, 'message': f'Parsing resume content for {clean_role}...'})}\n\n"

    # Step 2: ATS Scoring
    yield f"data: {json.dumps({'stage': 'ats', 'progress': 30, 'message': 'Auditing ATS keywords and calculating match density...'})}\n\n"
    ats_res = ats_optimizer(clean_resume, clean_role, groq_api_key)
    yield f"data: {json.dumps({'stage': 'ats_done', 'progress': 40, 'ats_audit': ats_res})}\n\n"

    # Step 3: Skill Gaps
    yield f"data: {json.dumps({'stage': 'skills', 'progress': 50, 'message': 'Mapping technical discrepancies & learning roadmap...'})}\n\n"
    skill_gap_res = skill_gap_analyzer(clean_resume, clean_role, groq_api_key)

    # Step 4: Job Market Strategies
    yield f"data: {json.dumps({'stage': 'jobs', 'progress': 65, 'message': 'Synthesizing targeted companies and job boards...'})}\n\n"
    job_search_res = job_search_advisor(clean_resume, clean_role, groq_api_key)

    # Step 5: Portfolio Projects
    yield f"data: {json.dumps({'stage': 'projects', 'progress': 80, 'message': 'Architecting custom portfolio project blueprints...'})}\n\n"
    project_res = project_idea_generator(clean_resume, clean_role, skill_gap_res, groq_api_key)

    # Step 6: GitHub & Interview Simulation
    yield f"data: {json.dumps({'stage': 'github_interview', 'progress': 90, 'message': 'Mining GitHub repositories and simulating interview questions...'})}\n\n"
    github_res = github_profile_reviewer(clean_gh, github_token, groq_api_key)
    interview_res = interview_preparator(clean_resume, clean_role, groq_api_key)

    # Final Payload
    final_payload = {
        "stage": "complete",
        "progress": 100,
        "status": "success",
        "target_role": clean_role,
        "github_username": clean_gh,
        "ats_audit": ats_res,
        "job_search": job_search_res,
        "skill_gaps": skill_gap_res,
        "project_ideas": project_res,
        "github_review": github_res,
        "interview_prep": interview_res
    }
    yield f"data: {json.dumps(final_payload)}\n\n"
