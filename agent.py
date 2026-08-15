"""
Aura Career Studio - Executive Talent Orchestrator & Live SSE Engine
======================================================================
Coordinates 8 executive career intelligence tools with real-time SSE streaming,
Cover Letter/LinkedIn InMail generation, and 30-60-90 Day Strategic Roadmaps.
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
    interview_preparator,
    cover_letter_pitch_generator,
    onboarding_roadmap_architect
)

logger = logging.getLogger("aura_executive_agent")
logging.basicConfig(level=logging.INFO)


def analyze_career_pipeline(
    resume_text: str,
    target_role: str,
    github_username: Optional[str] = None,
    github_token: Optional[str] = None,
    groq_api_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Synchronously runs all 8 executive career tools and returns a consolidated talent intelligence report.
    """
    t_start = time.time()
    clean_resume = resume_text.strip()
    clean_role = target_role.strip() or "Senior Software Engineer"
    clean_gh = (github_username or "").strip()

    logger.info(f"Starting executive career intelligence pipeline for role: {clean_role}, GitHub: {clean_gh}")

    # 1. Job Search
    job_search_res = job_search_advisor(clean_resume, clean_role, groq_api_key)

    # 2. Skill Gaps
    skill_gap_res = skill_gap_analyzer(clean_resume, clean_role, groq_api_key)

    # 3. Portfolio Projects
    project_res = project_idea_generator(clean_resume, clean_role, skill_gap_res, groq_api_key)

    # 4. GitHub Review
    github_res = github_profile_reviewer(clean_gh, github_token, groq_api_key)

    # 5. ATS Scoring & Optimizer
    ats_res = ats_optimizer(clean_resume, clean_role, groq_api_key)

    # 6. Interview Simulator
    interview_res = interview_preparator(clean_resume, clean_role, groq_api_key)

    # 7. Cover Letter & LinkedIn Pitch
    cover_letter_res = cover_letter_pitch_generator(clean_resume, clean_role, groq_api_key)

    # 8. 30-60-90 Day Roadmap
    onboarding_res = onboarding_roadmap_architect(clean_resume, clean_role, groq_api_key)

    total_time_ms = round((time.time() - t_start) * 1000, 1)

    return {
        "status": "success",
        "target_role": clean_role,
        "github_username": clean_gh,
        "execution_time_ms": total_time_ms,
        "ats_audit": ats_res,
        "cover_letter_pitch": cover_letter_res,
        "onboarding_roadmap": onboarding_res,
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
    clean_role = target_role.strip() or "Senior Software Engineer"
    clean_gh = (github_username or "").strip()

    # Step 1: Ingestion
    yield f"data: {json.dumps({'stage': 'ingest', 'progress': 12, 'message': f'Parsing executive dossier for {clean_role}...'})}\n\n"

    # Step 2: ATS & Keyword Audit
    yield f"data: {json.dumps({'stage': 'ats', 'progress': 24, 'message': 'Computing ATS keyword density and matching criteria...'})}\n\n"
    ats_res = ats_optimizer(clean_resume, clean_role, groq_api_key)
    yield f"data: {json.dumps({'stage': 'ats_done', 'progress': 34, 'ats_audit': ats_res})}\n\n"

    # Step 3: Cover Letter & LinkedIn Pitch
    yield f"data: {json.dumps({'stage': 'cover_letter', 'progress': 46, 'message': 'Synthesizing tailored Cover Letter & LinkedIn InMail pitch...'})}\n\n"
    cover_letter_res = cover_letter_pitch_generator(clean_resume, clean_role, groq_api_key)
    yield f"data: {json.dumps({'stage': 'cover_done', 'progress': 54, 'cover_letter_pitch': cover_letter_res})}\n\n"

    # Step 4: 30-60-90 Day Roadmap & Skills
    yield f"data: {json.dumps({'stage': 'roadmap', 'progress': 68, 'message': 'Architecting 30-60-90 Day Impact Plan & Skill Roadmap...'})}\n\n"
    skill_gap_res = skill_gap_analyzer(clean_resume, clean_role, groq_api_key)
    onboarding_res = onboarding_roadmap_architect(clean_resume, clean_role, groq_api_key)

    # Step 5: Enterprise Projects & Job Search
    yield f"data: {json.dumps({'stage': 'projects', 'progress': 82, 'message': 'Synthesizing enterprise system blueprints & executive search targets...'})}\n\n"
    project_res = project_idea_generator(clean_resume, clean_role, skill_gap_res, groq_api_key)
    job_search_res = job_search_advisor(clean_resume, clean_role, groq_api_key)

    # Step 6: GitHub Audit & Interview Prep
    yield f"data: {json.dumps({'stage': 'interview', 'progress': 92, 'message': 'Mining GitHub repositories & simulating executive interview scenarios...'})}\n\n"
    github_res = github_profile_reviewer(clean_gh, github_token, groq_api_key)
    interview_res = interview_preparator(clean_resume, clean_role, groq_api_key)

    # Final Consolidated Payload
    final_payload = {
        "stage": "complete",
        "progress": 100,
        "status": "success",
        "target_role": clean_role,
        "github_username": clean_gh,
        "ats_audit": ats_res,
        "cover_letter_pitch": cover_letter_res,
        "onboarding_roadmap": onboarding_res,
        "job_search": job_search_res,
        "skill_gaps": skill_gap_res,
        "project_ideas": project_res,
        "github_review": github_res,
        "interview_prep": interview_res
    }
    yield f"data: {json.dumps(final_payload)}\n\n"
