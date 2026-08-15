/**
 * Aura Career Studio - Executive Client Controller
 * ==================================================
 * 8-Tool SSE Telemetry streaming, Cover Letter & LinkedIn pitch generator,
 * 30-60-90 Day Strategic Plan, and Browser Speech Synthesis (TTS).
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const careerForm = document.getElementById('career-form');
  const resumeFileInput = document.getElementById('resume-file-input');
  const resumeDropzone = document.getElementById('resume-dropzone');
  const activeFileCard = document.getElementById('active-file-card');
  const activeFileName = document.getElementById('active-file-name');
  const activeFileSize = document.getElementById('active-file-size');
  const btnChangeResume = document.getElementById('btn-change-resume');
  const badgeResumeStatus = document.getElementById('badge-resume-status');

  const btnToggleRawText = document.getElementById('btn-toggle-raw-text');
  const rawResumeText = document.getElementById('raw-resume-text');

  const inputTargetRole = document.getElementById('input-target-role');
  const roleChips = document.querySelectorAll('.role-chip');

  const inputGithubUser = document.getElementById('input-github-user');
  const ghPreviewBadge = document.getElementById('gh-preview-badge');
  const ghAvatar = document.getElementById('gh-avatar');
  const ghName = document.getElementById('gh-name');
  const ghMeta = document.getElementById('gh-meta');

  const btnSubmit = document.getElementById('btn-submit-analysis');
  const progressCard = document.getElementById('progress-card');
  const progressStatusText = document.getElementById('progress-status-text');
  const progressPercent = document.getElementById('progress-percent');
  const progressBarFill = document.getElementById('progress-bar-fill');

  const suiteEmpty = document.getElementById('suite-empty');
  const suiteTabs = document.querySelectorAll('.suite-tab');
  const suitePanels = document.querySelectorAll('.suite-panel');

  // Executive Cover Letter Targets
  const hookText = document.getElementById('hook-text');
  const coverLetterText = document.getElementById('cover-letter-text');
  const inmailText = document.getElementById('inmail-text');

  // 30-60-90 Day Plan Target
  const contentOnboardingPlan = document.getElementById('content-onboarding-plan');

  // ATS Targets
  const atsScoreNumber = document.getElementById('ats-score-number');
  const atsTierBadge = document.getElementById('ats-tier-badge');
  const atsFeedbackTitle = document.getElementById('ats-feedback-title');
  const atsFeedbackText = document.getElementById('ats-feedback-text');
  const atsMatchedPills = document.getElementById('ats-matched-pills');
  const atsMissingPills = document.getElementById('ats-missing-pills');
  const atsRewritesContainer = document.getElementById('ats-rewrites-container');

  // Other Content Targets
  const contentSkillGaps = document.getElementById('content-skill-gaps');
  const contentPortfolioProjects = document.getElementById('content-portfolio-projects');
  const ghReposGrid = document.getElementById('gh-repos-grid');
  const contentGithubAudit = document.getElementById('content-github-audit');
  const contentInterviewPrep = document.getElementById('content-interview-prep');
  const contentJobSearch = document.getElementById('content-job-search');

  // Modals & Menus
  const btnSamplesMenu = document.getElementById('btn-samples-menu');
  const samplesDropdown = document.getElementById('samples-dropdown');
  const sampleItems = document.querySelectorAll('.dropdown-item');

  const btnConfigToggle = document.getElementById('btn-config-toggle');
  const configModal = document.getElementById('config-modal');
  const btnCloseConfig = document.getElementById('btn-close-config');
  const configBackdrop = document.getElementById('config-backdrop');
  const cfgGroqKey = document.getElementById('cfg-groq-key');
  const cfgGithubToken = document.getElementById('cfg-github-token');
  const btnSaveConfig = document.getElementById('btn-save-config');

  const btnExportStudio = document.getElementById('btn-export-studio');
  const exportModal = document.getElementById('export-modal');
  const btnCloseExport = document.getElementById('btn-close-export');
  const exportBackdrop = document.getElementById('export-backdrop');
  const btnExportMarkdown = document.getElementById('btn-export-markdown');
  const btnExportJson = document.getElementById('btn-export-json');

  const btnThemeToggle = document.getElementById('btn-theme-toggle');

  // Application State
  let currentFile = null;
  let currentReportData = null;
  let currentAudioUtterance = null;

  // --------------------------------------------------------------------------
  // Theme Toggle (Light Pearl / Dark Luxe)
  // --------------------------------------------------------------------------
  const savedTheme = localStorage.getItem('aura_career_theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('theme-dark');
  }

  if (btnThemeToggle) {
    btnThemeToggle.addEventListener('click', () => {
      document.body.classList.toggle('theme-dark');
      const isDark = document.body.classList.contains('theme-dark');
      localStorage.setItem('aura_career_theme', isDark ? 'dark' : 'light');
    });
  }

  // --------------------------------------------------------------------------
  // Configuration Settings
  // --------------------------------------------------------------------------
  if (cfgGroqKey) cfgGroqKey.value = localStorage.getItem('aura_groq_key') || '';
  if (cfgGithubToken) cfgGithubToken.value = localStorage.getItem('aura_gh_token') || '';

  if (btnConfigToggle) btnConfigToggle.addEventListener('click', () => configModal.classList.remove('hidden'));
  if (btnCloseConfig) btnCloseConfig.addEventListener('click', () => configModal.classList.add('hidden'));
  if (configBackdrop) configBackdrop.addEventListener('click', () => configModal.classList.add('hidden'));

  if (btnSaveConfig) {
    btnSaveConfig.addEventListener('click', () => {
      if (cfgGroqKey) localStorage.setItem('aura_groq_key', cfgGroqKey.value.trim());
      if (cfgGithubToken) localStorage.setItem('aura_gh_token', cfgGithubToken.value.trim());
      configModal.classList.add('hidden');
      alert('Aura preferences saved successfully!');
    });
  }

  // --------------------------------------------------------------------------
  // Sample Profiles Dropdown
  // --------------------------------------------------------------------------
  if (btnSamplesMenu) {
    btnSamplesMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      samplesDropdown.classList.toggle('hidden');
    });
  }

  document.addEventListener('click', () => {
    if (samplesDropdown) samplesDropdown.classList.add('hidden');
  });

  sampleItems.forEach(btn => {
    btn.addEventListener('click', async () => {
      const sampleKey = btn.getAttribute('data-sample');
      try {
        const res = await fetch(`/sample-resume/${sampleKey}`);
        if (!res.ok) throw new Error('Could not fetch sample resume');
        const data = await res.json();

        rawResumeText.value = data.text;
        rawResumeText.classList.remove('hidden');
        inputTargetRole.value = data.target_role;
        inputGithubUser.value = data.github_username;

        currentFile = null;
        resumeDropzone.classList.add('hidden');
        activeFileCard.classList.remove('hidden');
        activeFileName.textContent = `${data.title} (Preloaded)`;
        activeFileSize.textContent = `Ready for Pipeline`;
        badgeResumeStatus.classList.remove('hidden');

        fetchGithubPreview(data.github_username);
        samplesDropdown.classList.add('hidden');

      } catch (err) {
        alert(err.message);
      }
    });
  });

  // --------------------------------------------------------------------------
  // Resume Drag & Drop
  // --------------------------------------------------------------------------
  if (resumeDropzone) {
    resumeDropzone.addEventListener('click', () => resumeFileInput.click());

    ['dragenter', 'dragover'].forEach(name => {
      resumeDropzone.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        resumeDropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(name => {
      resumeDropzone.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        resumeDropzone.classList.remove('dragover');
      });
    });

    resumeDropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer.files.length > 0) {
        handleSelectedFile(e.dataTransfer.files[0]);
      }
    });
  }

  if (resumeFileInput) {
    resumeFileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleSelectedFile(e.target.files[0]);
      }
    });
  }

  if (btnChangeResume) {
    btnChangeResume.addEventListener('click', () => resumeFileInput.click());
  }

  function handleSelectedFile(file) {
    currentFile = file;
    resumeDropzone.classList.add('hidden');
    activeFileCard.classList.remove('hidden');
    activeFileName.textContent = file.name;
    const kb = (file.size / 1024).toFixed(1);
    activeFileSize.textContent = `${kb} KB • Ready for Parsing`;
    badgeResumeStatus.classList.remove('hidden');
  }

  if (btnToggleRawText) {
    btnToggleRawText.addEventListener('click', () => {
      rawResumeText.classList.toggle('hidden');
      if (!rawResumeText.classList.contains('hidden')) {
        rawResumeText.focus();
      }
    });
  }

  roleChips.forEach(chip => {
    chip.addEventListener('click', () => {
      inputTargetRole.value = chip.getAttribute('data-role');
    });
  });

  // --------------------------------------------------------------------------
  // Live GitHub Avatar Preview
  // --------------------------------------------------------------------------
  let ghDebounceTimer = null;
  if (inputGithubUser) {
    inputGithubUser.addEventListener('input', () => {
      clearTimeout(ghDebounceTimer);
      ghDebounceTimer = setTimeout(() => {
        fetchGithubPreview(inputGithubUser.value);
      }, 500);
    });

    if (inputGithubUser.value.trim()) {
      fetchGithubPreview(inputGithubUser.value);
    }
  }

  async function fetchGithubPreview(username) {
    const clean = username.trim().replace('@', '').trim();
    if (!clean) {
      if (ghPreviewBadge) ghPreviewBadge.classList.add('hidden');
      return;
    }

    try {
      const token = localStorage.getItem('aura_gh_token') || '';
      const url = token ? `/github-preview/${clean}?token=${encodeURIComponent(token)}` : `/github-preview/${clean}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.found && data.profile) {
          ghAvatar.src = data.profile.avatar_url;
          ghName.textContent = data.profile.name || data.profile.login;
          ghMeta.textContent = `${data.profile.public_repos || 0} public repos • ${data.profile.followers || 0} followers`;
          ghPreviewBadge.classList.remove('hidden');
          return;
        }
      }
      ghPreviewBadge.classList.add('hidden');
    } catch {
      ghPreviewBadge.classList.add('hidden');
    }
  }

  // --------------------------------------------------------------------------
  // Suite Tab Switching
  // --------------------------------------------------------------------------
  suiteTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetPanelId = tab.getAttribute('data-tab');
      activateSuiteTab(targetPanelId);
    });
  });

  function activateSuiteTab(targetPanelId) {
    suiteTabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-tab') === targetPanelId));
    suitePanels.forEach(p => {
      p.classList.toggle('hidden', p.id !== `panel-${targetPanelId}`);
    });
  }

  // --------------------------------------------------------------------------
  // Main Execution Pipeline (SSE Streaming)
  // --------------------------------------------------------------------------
  if (careerForm) {
    careerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const targetRole = inputTargetRole.value.trim() || 'Staff AI / ML Systems Architect';
      const ghUser = inputGithubUser.value.trim();
      const customGroq = localStorage.getItem('aura_groq_key') || '';
      const customGh = localStorage.getItem('aura_gh_token') || '';

      let resumeText = rawResumeText.value.trim();

      btnSubmit.disabled = true;
      btnSubmit.innerHTML = `<span class="spinner-sm"></span> Orchestrating 8 Tools...`;
      progressCard.classList.remove('hidden');
      updateProgress(10, `Ingesting candidate dossier for ${targetRole}...`);

      if (suiteEmpty) suiteEmpty.classList.add('hidden');

      try {
        if (currentFile && !resumeText) {
          updateProgress(25, `Extracting structure from ${currentFile.name}...`);
          const formData = new FormData();
          formData.append('resume_file', currentFile);
          formData.append('target_role', targetRole);
          if (ghUser) formData.append('github_username', ghUser);
          if (customGroq) formData.append('groq_api_key', customGroq);
          if (customGh) formData.append('github_token', customGh);

          const res = await fetch('/analyze', {
            method: 'POST',
            body: formData
          });

          if (!res.ok) {
            const errJson = await res.json().catch(() => ({ detail: 'Upload error' }));
            throw new Error(errJson.detail || 'Analysis request failed');
          }

          const report = await res.json();
          renderFullReport(report);
          updateProgress(100, `Complete! Executive Talent Suite Ready.`);
          setTimeout(() => progressCard.classList.add('hidden'), 1200);

        } else {
          if (!resumeText) {
            throw new Error('Please select a resume file or paste resume text.');
          }

          const response = await fetch('/analyze-stream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              resume_text: resumeText,
              target_role: targetRole,
              github_username: ghUser,
              groq_api_key: customGroq || null,
              github_token: customGh || null
            })
          });

          if (!response.ok) {
            throw new Error(`Streaming failed with status ${response.status}`);
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n\n');
            buffer = lines.pop();

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const jsonStr = line.replace('data: ', '').trim();
                try {
                  const eventData = JSON.parse(jsonStr);
                  if (eventData.progress) {
                    updateProgress(eventData.progress, eventData.message || 'Processing...');
                  }
                  if (eventData.cover_letter_pitch) {
                    renderCoverLetterSection(eventData.cover_letter_pitch);
                  }
                  if (eventData.ats_audit) {
                    renderAtsSection(eventData.ats_audit);
                  }
                  if (eventData.stage === 'complete') {
                    renderFullReport(eventData);
                  }
                } catch (e) {
                  console.warn('SSE parse error', e);
                }
              }
            }
          }

          updateProgress(100, `Executive Talent Suite Ready!`);
          setTimeout(() => progressCard.classList.add('hidden'), 1000);
        }

      } catch (err) {
        console.error(err);
        alert(`Notice: ${err.message}`);
        progressCard.classList.add('hidden');
      } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
          <span>Generate Executive Intelligence</span>
        `;
      }
    });
  }

  function updateProgress(percent, msg) {
    if (progressPercent) progressPercent.textContent = `${percent}%`;
    if (progressBarFill) progressBarFill.style.width = `${percent}%`;
    if (progressStatusText) progressStatusText.textContent = msg;
  }

  // --------------------------------------------------------------------------
  // Renderers
  // --------------------------------------------------------------------------
  function renderFullReport(data) {
    currentReportData = data;

    // 1. Cover Letter & InMail
    if (data.cover_letter_pitch) {
      renderCoverLetterSection(data.cover_letter_pitch);
    }

    // 2. 30-60-90 Day Plan
    if (contentOnboardingPlan && data.onboarding_roadmap) {
      contentOnboardingPlan.innerHTML = marked.parse(data.onboarding_roadmap);
    }

    // 3. ATS
    if (data.ats_audit) {
      renderAtsSection(data.ats_audit);
    }

    // 4. Skill Deficiencies
    if (contentSkillGaps && data.skill_gaps) {
      contentSkillGaps.innerHTML = marked.parse(data.skill_gaps);
    }

    // 5. Portfolio Blueprints
    if (contentPortfolioProjects && data.project_ideas) {
      contentPortfolioProjects.innerHTML = marked.parse(data.project_ideas);
    }

    // 6. GitHub
    if (data.github_review) {
      renderGithubSection(data.github_review);
    }

    // 7. Interview Prep
    if (contentInterviewPrep && data.interview_prep) {
      contentInterviewPrep.innerHTML = marked.parse(data.interview_prep);
    }

    // 8. Job Search
    if (contentJobSearch && data.job_search) {
      contentJobSearch.innerHTML = marked.parse(data.job_search);
    }

    const activeTab = document.querySelector('.suite-tab.active');
    const targetId = activeTab ? activeTab.getAttribute('data-tab') : 'tab-cover-letter';
    activateSuiteTab(targetId);
  }

  function renderCoverLetterSection(cl) {
    if (!cl) return;
    if (hookText) hookText.textContent = cl.executive_hook || 'Executive candidate specialized in high-throughput architectures.';
    if (coverLetterText) coverLetterText.innerText = cl.cover_letter || '';
    if (inmailText) inmailText.innerText = cl.linkedin_pitch || '';
  }

  function renderAtsSection(ats) {
    if (!ats) return;
    if (atsScoreNumber) atsScoreNumber.textContent = ats.ats_score || 88;
    if (atsTierBadge) atsTierBadge.textContent = ats.score_tier || 'Highly Competitive';
    if (atsFeedbackText) atsFeedbackText.textContent = ats.summary_feedback || 'Executive ATS parameters audited.';

    if (atsMatchedPills && ats.matched_keywords) {
      atsMatchedPills.innerHTML = ats.matched_keywords.map(kw => `<span class="kw-pill kw-matched">✓ ${escapeHtml(kw)}</span>`).join('');
    }

    if (atsMissingPills && ats.missing_keywords) {
      atsMissingPills.innerHTML = ats.missing_keywords.map(kw => `<span class="kw-pill kw-missing">+ ${escapeHtml(kw)}</span>`).join('');
    }

    if (atsRewritesContainer && ats.bullet_rewrites) {
      atsRewritesContainer.innerHTML = ats.bullet_rewrites.map(item => `
        <div class="rewrite-item">
          <div class="rewrite-orig">❌ "${escapeHtml(item.original)}"</div>
          <div class="rewrite-imp">✨ "${escapeHtml(item.improved)}"</div>
        </div>
      `).join('');
    }
  }

  function renderGithubSection(gh) {
    if (!gh) return;
    if (contentGithubAudit && gh.analysis) {
      contentGithubAudit.innerHTML = marked.parse(gh.analysis);
    }

    if (ghReposGrid) {
      if (gh.top_repos && gh.top_repos.length > 0) {
        ghReposGrid.innerHTML = gh.top_repos.map(r => `
          <a href="${r.html_url}" target="_blank" rel="noopener noreferrer" class="repo-card">
            <span class="repo-title">📂 ${escapeHtml(r.name)}</span>
            <p class="repo-desc">${escapeHtml(r.description)}</p>
            <div class="repo-meta-row">
              <span>● ${escapeHtml(r.language)}</span>
              <span>⭐ ${r.stars} • 🍴 ${r.forks}</span>
            </div>
          </a>
        `).join('');
      } else {
        ghReposGrid.innerHTML = '';
      }
    }
  }

  // --------------------------------------------------------------------------
  // Read Aloud (Browser Speech Synthesis)
  // --------------------------------------------------------------------------
  document.querySelectorAll('.btn-action-read').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;

      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        btn.textContent = '🔊 Read Aloud';
        return;
      }

      const text = targetEl.innerText.trim();
      if (!text) return;

      currentAudioUtterance = new SpeechSynthesisUtterance(text);
      currentAudioUtterance.rate = 1.0;
      currentAudioUtterance.pitch = 1.0;

      btn.textContent = '⏹ Stop Audio';

      currentAudioUtterance.onend = () => {
        btn.textContent = '🔊 Read Aloud';
      };

      window.speechSynthesis.speak(currentAudioUtterance);
    });
  });

  // --------------------------------------------------------------------------
  // 1-Click Copy
  // --------------------------------------------------------------------------
  document.querySelectorAll('.btn-action-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;

      navigator.clipboard.writeText(targetEl.innerText).then(() => {
        const old = btn.textContent;
        btn.textContent = '✓ Copied!';
        setTimeout(() => { btn.textContent = old; }, 2000);
      });
    });
  });

  // --------------------------------------------------------------------------
  // Export Studio
  // --------------------------------------------------------------------------
  if (btnExportStudio) btnExportStudio.addEventListener('click', () => exportModal.classList.remove('hidden'));
  if (btnCloseExport) btnCloseExport.addEventListener('click', () => exportModal.classList.add('hidden'));
  if (exportBackdrop) exportBackdrop.addEventListener('click', () => exportModal.classList.add('hidden'));

  if (btnExportMarkdown) {
    btnExportMarkdown.addEventListener('click', () => {
      if (!currentReportData) {
        alert('Please generate an executive analysis first before exporting.');
        return;
      }

      let md = `# Aura Executive Talent Dossier\n`;
      md += `**Target Position:** ${currentReportData.target_role}\n`;
      md += `**Generated:** ${new Date().toLocaleDateString()}\n\n---\n\n`;

      if (currentReportData.cover_letter_pitch) {
        md += `## 1. Executive Cover Letter\n${currentReportData.cover_letter_pitch.cover_letter}\n\n`;
        md += `## 2. LinkedIn InMail Pitch\n${currentReportData.cover_letter_pitch.linkedin_pitch}\n\n---\n\n`;
      }

      if (currentReportData.onboarding_roadmap) {
        md += `## 3. 30-60-90 Day Strategic Onboarding Roadmap\n${currentReportData.onboarding_roadmap}\n\n---\n\n`;
      }

      if (currentReportData.ats_audit) {
        md += `## 4. ATS Match Audit\nScore: ${currentReportData.ats_audit.ats_score}/100\n\n`;
      }

      if (currentReportData.project_ideas) md += `## 5. Enterprise Portfolio Blueprints\n${currentReportData.project_ideas}\n\n---\n\n`;
      if (currentReportData.skill_gaps) md += `## 6. Strategic Skill & Leadership Gaps\n${currentReportData.skill_gaps}\n\n---\n\n`;
      if (currentReportData.interview_prep) md += `## 7. STAR Interview Simulation\n${currentReportData.interview_prep}\n\n---\n\n`;
      if (currentReportData.job_search) md += `## 8. Executive Job Search Strategy\n${currentReportData.job_search}\n\n`;

      downloadBlob(md, `aura_executive_dossier_${Date.now()}.md`, 'text/markdown');
      exportModal.classList.add('hidden');
    });
  }

  if (btnExportJson) {
    btnExportJson.addEventListener('click', () => {
      if (!currentReportData) {
        alert('Please generate an executive analysis first before exporting.');
        return;
      }
      const jsonStr = JSON.stringify(currentReportData, null, 2);
      downloadBlob(jsonStr, `aura_executive_audit_${Date.now()}.json`, 'application/json');
      exportModal.classList.add('hidden');
    });
  }

  function downloadBlob(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function escapeHtml(str) {
    return (str || '')
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
});
