"""
Aura Career Studio - Executive Test Suite
===========================================
Tests universal extraction, 8 executive tools, Cover Letter/LinkedIn pitch generation,
and 30-60-90 day strategic roadmaps.
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

from app.main import app
from utils import extract_universal_resume, SAMPLE_RESUMES
from agent import analyze_career_pipeline

client = TestClient(app)


def test_health_endpoint():
    """Verify system health endpoint returns 8 executive tools."""
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "Aura Career Studio" in data["app"]
    assert len(data["tools"]) == 8


def test_sample_resumes_endpoints():
    """Verify sample resumes listing and retrieval."""
    res = client.get("/sample-resumes")
    assert res.status_code == 200
    samples = res.json()
    assert len(samples) >= 3

    sample_key = samples[0]["key"]
    res_ind = client.get(f"/sample-resume/{sample_key}")
    assert res_ind.status_code == 200
    data = res_ind.json()
    assert "title" in data
    assert "target_role" in data
    assert len(data["text"]) > 100


def test_universal_text_extraction():
    """Verify plain text extraction from raw bytes."""
    sample_text = "Experienced VP of Engineering and Technical Director."
    extracted = extract_universal_resume(sample_text.encode("utf-8"), "resume.txt")
    assert extracted == sample_text


def test_universal_docx_extraction():
    """Verify docx extractor runs safely without crashing."""
    extracted = extract_universal_resume(b"fake docx content", "resume.docx")
    assert isinstance(extracted, str)


def test_github_preview_endpoint():
    """Verify GitHub preview endpoint handles missing and valid handles."""
    with patch("requests.get") as mock_get:
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {
            "login": "testuser",
            "name": "Test User",
            "avatar_url": "https://example.com/avatar.png",
            "public_repos": 15,
            "followers": 42
        }
        res = client.get("/github-preview/testuser")
        assert res.status_code == 200
        data = res.json()
        assert data["username"] == "testuser"


@patch("tools.get_groq_client")
def test_analyze_pipeline_mocked(mock_groq):
    """Verify 8-tool executive agent pipeline orchestration."""
    mock_client = MagicMock()
    mock_choice = MagicMock()
    mock_choice.message.content = "Mocked executive response."
    mock_client.chat.completions.create.return_value.choices = [mock_choice]
    mock_groq.return_value = mock_client

    resume_text = SAMPLE_RESUMES["fullstack"]["text"]
    report = analyze_career_pipeline(
        resume_text=resume_text,
        target_role="Staff AI / ML Systems Architect",
        github_username="karpathy"
    )

    assert report["status"] == "success"
    assert report["target_role"] == "Staff AI / ML Systems Architect"
    assert "cover_letter_pitch" in report
    assert "onboarding_roadmap" in report
    assert "ats_audit" in report
    assert "job_search" in report
    assert "skill_gaps" in report
    assert "project_ideas" in report
    assert "interview_prep" in report


@patch("tools.get_groq_client")
def test_analyze_api_endpoint(mock_groq):
    """Verify POST /analyze endpoint with form data."""
    mock_client = MagicMock()
    mock_choice = MagicMock()
    mock_choice.message.content = "Mocked API response."
    mock_client.chat.completions.create.return_value.choices = [mock_choice]
    mock_groq.return_value = mock_client

    res = client.post("/analyze", data={
        "resume_text": "Experienced Engineering Director",
        "target_role": "VP of Engineering",
        "github_username": "testuser"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["target_role"] == "VP of Engineering"
