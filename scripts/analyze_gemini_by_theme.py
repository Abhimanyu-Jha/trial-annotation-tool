#!/usr/bin/env python3
"""
Workflow: Gemini 2.5 Pro - Theme-by-Theme Analysis
Description: 31 focused passes (one per theme) with context caching for cost optimization.
"""

import os
import sys
import json
import argparse
from pathlib import Path
from google import genai
from google.genai import types
from datetime import datetime
from dotenv import load_dotenv

# Add lib to path
sys.path.insert(0, str(Path(__file__).parent / "lib"))
from analysis_utils import (
    setup_paths,
    load_prompt,
    save_analysis,
    check_required_files
)

# Load environment variables
load_dotenv()

# ========== WORKFLOW CONFIGURATION ==========
WORKFLOW_ID = "gemini-25pro-by-theme"
WORKFLOW_TITLE = "🎯 Gemini 2.5 Pro - Theme-by-Theme"
WORKFLOW_DESCRIPTION = "31 focused passes (one per theme) with context caching for comprehensive coverage and cost optimization."
MODEL = "gemini-2.5-pro"
PROMPT_ID = "by-theme"
# ============================================

# All 31 themes organized by domain
THEMES = [
    # Domain 1: Parent Engagement (3 themes)
    {"name": "Narrow Reframing", "domain": "Parent Engagement"},
    {"name": "Scheduling & Pacing Rigidity", "domain": "Parent Engagement"},
    {"name": "Failing to Address Parent Concerns", "domain": "Parent Engagement"},

    # Domain 2: Student Engagement (7 themes)
    {"name": "Using Vague Openers", "domain": "Student Engagement"},
    {"name": "Awkward Rapport Attempt", "domain": "Student Engagement"},
    {"name": "Failing to Sustain Conversation", "domain": "Student Engagement"},
    {"name": "Over-reliance on Closed-Ended Questions", "domain": "Student Engagement"},
    {"name": "Not Addressing Child First", "domain": "Student Engagement"},
    {"name": "Misusing Child's Name/Pronoun", "domain": "Student Engagement"},
    {"name": "Parent-Dominated Talk (Failure to Redirect)", "domain": "Student Engagement"},

    # Domain 3: Pedagogical Effectiveness (8 themes)
    {"name": "Pre-emptive Questioning", "domain": "Pedagogical Effectiveness"},
    {"name": "Using Leading Questions", "domain": "Pedagogical Effectiveness"},
    {"name": "Insufficient Scaffolding", "domain": "Pedagogical Effectiveness"},
    {"name": "Interrupting Student's Thought Process", "domain": "Pedagogical Effectiveness"},
    {"name": "Failing to Check for Understanding (CFU)", "domain": "Pedagogical Effectiveness"},
    {"name": "Incorrect Problem Assessment", "domain": "Pedagogical Effectiveness"},
    {"name": "Failing to Identify Foundational Gaps", "domain": "Pedagogical Effectiveness"},
    {"name": "Skipping Concepts Without Assessment", "domain": "Pedagogical Effectiveness"},

    # Domain 4: Process & Platform Adherence (4 themes)
    {"name": "Rushing or Skipping Key Sections", "domain": "Process & Platform Adherence"},
    {"name": "Discussing Topics on Wrong Slide", "domain": "Process & Platform Adherence"},
    {"name": "Failing to Involve Parent as Required", "domain": "Process & Platform Adherence"},
    {"name": "Mishandling Parent Selections", "domain": "Process & Platform Adherence"},

    # Domain 5: Professionalism & Environment (5 themes)
    {"name": "Low Energy / Unenthusiastic", "domain": "Professionalism & Environment"},
    {"name": "Scripted or Robotic Delivery", "domain": "Professionalism & Environment"},
    {"name": "Poor Lighting or Background", "domain": "Professionalism & Environment"},
    {"name": "Poor Audio Quality", "domain": "Professionalism & Environment"},
    {"name": "Unprofessional Affiliation Talk", "domain": "Professionalism & Environment"},

    # Domain 6: Linguistic & Communicative Competence (4 themes)
    {"name": "Grammatical Errors", "domain": "Linguistic & Communicative Competence"},
    {"name": "Non-Idiomatic Phrasing", "domain": "Linguistic & Communicative Competence"},
    {"name": "Use of Non-Standard Pedagogical Terminology", "domain": "Linguistic & Communicative Competence"},
    {"name": "Disfluent Speech / Overuse of Fillers", "domain": "Linguistic & Communicative Competence"},
]

NUM_PASSES = len(THEMES)


def create_cached_context(client, paths):
    """Create a cached context with PDFs that can be reused across all passes"""
    print("Creating cached context with PDFs...")

    # Upload files
    transcript_file = client.files.upload(file=paths['transcript'])
    print(f"  ✓ Uploaded transcript: {transcript_file.name}")

    guidebook_file = client.files.upload(file=paths['guidebook'])
    print(f"  ✓ Uploaded guidebook: {guidebook_file.name}")

    playbook_file = client.files.upload(file=paths['playbook'])
    print(f"  ✓ Uploaded playbook: {playbook_file.name}")

    # Create cached content with these files (cache for 1 hour - enough for 31 passes)
    print("  ⚡ Creating cache...")

    cached_content = client.caches.create(
        model=MODEL,
        contents=[
            guidebook_file,
            playbook_file,
            transcript_file
        ],
        ttl="3600s",  # 1 hour TTL
        display_name=f"trial-analysis-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    )

    print(f"  ✓ Cache created: {cached_content.name}")
    print(f"  ✓ Cache expires in 1 hour")

    return cached_content


def analyze_trial(trial_id):
    """Analyze a trial using Gemini API with theme-by-theme passes"""
    print(f"{'='*60}")
    print(f"WORKFLOW: {WORKFLOW_TITLE}")
    print(f"{'='*60}")
    print(f"Trial: {trial_id}")
    print(f"Passes: {NUM_PASSES} (one per theme)")
    print(f"Model: {MODEL}")
    print(f"Prompt: {PROMPT_ID}")
    print(f"Context Caching: Enabled")
    print(f"{'='*60}\n")

    # Setup paths
    paths = setup_paths(trial_id)
    check_required_files(paths)

    # Initialize Gemini client
    print("Initializing Gemini client...")
    client = genai.Client()

    # Load base prompt template
    base_prompt_template = load_prompt(PROMPT_ID)

    # Create cached context with PDFs (reused across all 31 passes)
    cached_context = create_cached_context(client, paths)

    # Multi-pass theme analysis
    all_issues = []
    pass_responses = []
    issues_by_theme = {}

    for idx, theme_info in enumerate(THEMES, 1):
        theme_name = theme_info['name']
        domain = theme_info['domain']

        print(f"\n{'='*60}")
        print(f"PASS {idx}/{NUM_PASSES}: {theme_name}")
        print(f"Domain: {domain}")
        print(f"{'='*60}")

        # Inject theme into prompt
        prompt = base_prompt_template.replace("THEME_PLACEHOLDER", theme_name)

        print(f"Calling Gemini API (Pass {idx})...")

        try:
            # Generate analysis using cached context
            response = client.models.generate_content(
                model=cached_context.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    cached_content=cached_context.name
                )
            )

            # Parse response
            response_text = response.text.strip()
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()

            parsed_issues = json.loads(response_text)

            # Add pass metadata to each issue
            for issue in parsed_issues:
                issue["analysisPass"] = theme_name
                issue["domain"] = domain

            issues_found = len(parsed_issues)
            print(f"✓ Pass {idx} complete: Found {issues_found} issues for '{theme_name}'")

            all_issues.extend(parsed_issues)
            issues_by_theme[theme_name] = issues_found

            pass_responses.append({
                "pass": idx,
                "theme": theme_name,
                "domain": domain,
                "issuesFound": issues_found,
                "rawResponse": response.text[:500] + "..."
            })

        except json.JSONDecodeError as e:
            print(f"✗ Warning: Could not parse Pass {idx} ({theme_name}) response as JSON: {e}")
            pass_responses.append({
                "pass": idx,
                "theme": theme_name,
                "domain": domain,
                "error": f"Invalid JSON response: {str(e)}",
                "rawResponse": response.text[:500] + "..."
            })
        except Exception as e:
            print(f"✗ Error in Pass {idx} ({theme_name}): {str(e)}")
            pass_responses.append({
                "pass": idx,
                "theme": theme_name,
                "domain": domain,
                "error": str(e)
            })

    # Group issues by domain for summary
    issues_by_domain = {}
    for theme_info in THEMES:
        domain = theme_info['domain']
        theme_name = theme_info['name']
        if domain not in issues_by_domain:
            issues_by_domain[domain] = 0
        issues_by_domain[domain] += issues_by_theme.get(theme_name, 0)

    # Compile final analysis result
    analysis_result = {
        # Workflow metadata
        "workflowId": WORKFLOW_ID,
        "workflowTitle": WORKFLOW_TITLE,
        "workflowDescription": WORKFLOW_DESCRIPTION,
        "promptId": PROMPT_ID,

        # Analysis metadata
        "analysisId": f"analysis-{trial_id}-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
        "trialId": trial_id,
        "timestamp": datetime.now().isoformat(),
        "modelVersion": MODEL,
        "analysisMethod": f"theme-by-theme-{NUM_PASSES}x-cached",

        # Configuration
        "configuration": {
            "passes": NUM_PASSES,
            "contextStrategy": "cached-per-theme",
            "promptVariant": PROMPT_ID,
            "assetsUsed": ["guidebook", "playbook", "transcript"],
            "cachingEnabled": True,
            "themesCovered": [t['name'] for t in THEMES]
        },

        # Results
        "status": "completed" if len(all_issues) > 0 else "completed_no_issues",
        "issues": all_issues,
        "passDetails": pass_responses,

        # Metrics
        "metrics": {
            "totalIssuesFound": len(all_issues),
            "issuesByTheme": issues_by_theme,
            "issuesByDomain": issues_by_domain
        }
    }

    # Save analysis
    output_path = save_analysis(analysis_result, trial_id, WORKFLOW_ID)

    print(f"\n{'='*60}")
    print("ANALYSIS COMPLETE!")
    print(f"{'='*60}")
    print(f"\nSummary:")
    print(f"  Workflow: {WORKFLOW_TITLE}")
    print(f"  Trial ID: {trial_id}")
    print(f"  Output: {output_path}")
    print(f"  Analysis Method: {NUM_PASSES}-Pass Theme-by-Theme (Cached)")
    print(f"  Total Issues Found: {len(all_issues)}")

    print(f"\nIssues by Domain:")
    for domain, count in issues_by_domain.items():
        print(f"  {domain}: {count} issues")

    print(f"\nTop Themes:")
    sorted_themes = sorted(issues_by_theme.items(), key=lambda x: x[1], reverse=True)
    for theme_name, count in sorted_themes[:10]:
        if count > 0:
            print(f"  {theme_name}: {count} issues")

    # Clean up cache
    print(f"\nCleaning up cache...")
    try:
        client.caches.delete(name=cached_context.name)
        print(f"  ✓ Cache deleted")
    except Exception as e:
        print(f"  ⚠ Could not delete cache: {e}")

    return analysis_result


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description=f"{WORKFLOW_TITLE} - Trial Analysis Script",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=f"Example: python {Path(__file__).name} mousa-g1"
    )
    parser.add_argument("trial_id", help="Trial ID to analyze")

    args = parser.parse_args()

    # Show available trials if trial not found
    try:
        paths = setup_paths(args.trial_id)
    except FileNotFoundError:
        print(f"Error: Trial '{args.trial_id}' not found")
        print("\nAvailable trials:")
        trials_dir = Path(__file__).parent.parent / "data" / "trials"
        if trials_dir.exists():
            for trial_dir in sorted(trials_dir.iterdir()):
                if trial_dir.is_dir():
                    print(f"  - {trial_dir.name}")
        sys.exit(1)

    analyze_trial(args.trial_id)
