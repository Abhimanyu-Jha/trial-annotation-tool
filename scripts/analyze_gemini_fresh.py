#!/usr/bin/env python3
"""
Workflow: Gemini 2.5 Pro - Fresh Context 10x
Description: 10 independent fresh passes. Each pass starts with clean context for diverse perspectives.
"""

import os
import sys
import json
import argparse
from pathlib import Path
from google import genai
from datetime import datetime
from dotenv import load_dotenv

# Add lib to path
sys.path.insert(0, str(Path(__file__).parent / "lib"))
from analysis_utils import (
    setup_paths,
    load_prompt,
    upload_files_gemini,
    save_analysis,
    check_required_files
)

# Load environment variables
load_dotenv()

# ========== WORKFLOW CONFIGURATION ==========
WORKFLOW_ID = "gemini-25pro-10x-fresh"
WORKFLOW_TITLE = "🔄 Gemini 2.5 Pro - Fresh 10x"
WORKFLOW_DESCRIPTION = "10 independent fresh passes. Each pass starts with clean context for diverse perspectives. Current default approach."
MODEL = "gemini-2.5-pro"
PROMPT_ID = "standard-multipass"
NUM_PASSES = 10
# ============================================


def analyze_trial(trial_id):
    """Analyze a trial using Gemini API with fresh context per pass"""
    print(f"{'='*60}")
    print(f"WORKFLOW: {WORKFLOW_TITLE}")
    print(f"{'='*60}")
    print(f"Trial: {trial_id}")
    print(f"Passes: {NUM_PASSES}")
    print(f"Model: {MODEL}")
    print(f"Prompt: {PROMPT_ID}")
    print(f"{'='*60}\n")

    # Setup paths
    paths = setup_paths(trial_id)
    check_required_files(paths)

    # Initialize Gemini client
    print("Initializing Gemini client...")
    client = genai.Client()

    # Load base prompt
    base_prompt = load_prompt(PROMPT_ID)

    # Multi-pass analysis
    all_issues = []
    pass_responses = []

    for pass_num in range(1, NUM_PASSES + 1):
        print(f"\n{'='*60}")
        print(f"PASS {pass_num}/{NUM_PASSES}")
        print(f"{'='*60}")

        # Upload files for this pass (fresh context)
        files = upload_files_gemini(client, paths, include_playbook=True)

        # Build prompt for this pass
        if pass_num == 1:
            prompt = base_prompt
        else:
            # For subsequent passes, add instruction to exclude previous issues
            previous_issues_summary = json.dumps(all_issues, indent=2)
            prompt = f"""{base_prompt}

IMPORTANT: This is Pass {pass_num} of the analysis. You have already identified the following issues in previous passes:

{previous_issues_summary}

DO NOT include any of these previously identified issues again. Find NEW issues that were not identified in previous passes. Focus on finding additional problems that may have been missed.
"""

        print(f"Calling Gemini API (Pass {pass_num})...")

        # Generate analysis with multimodal input
        response = client.models.generate_content(
            model=MODEL,
            contents=[
                files['guidebook'],
                files['playbook'],
                prompt,
                files['transcript']
            ],
        )

        # Parse response
        try:
            # Clean response if it has markdown code blocks
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
                issue["analysisPass"] = pass_num

            print(f"✓ Pass {pass_num} complete: Found {len(parsed_issues)} new issues")
            all_issues.extend(parsed_issues)
            pass_responses.append({
                "pass": pass_num,
                "issuesFound": len(parsed_issues),
                "rawResponse": response.text[:500] + "..."
            })

        except json.JSONDecodeError as e:
            print(f"✗ Warning: Could not parse Pass {pass_num} response as JSON: {e}")
            pass_responses.append({
                "pass": pass_num,
                "error": f"Invalid JSON response: {str(e)}",
                "rawResponse": response.text[:500] + "..."
            })

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
        "analysisMethod": f"multi-pass-{NUM_PASSES}x-fresh",

        # Configuration
        "configuration": {
            "passes": NUM_PASSES,
            "contextStrategy": "fresh",
            "promptVariant": PROMPT_ID,
            "assetsUsed": ["guidebook", "playbook", "transcript"]
        },

        # Results
        "status": "completed" if len(all_issues) > 0 else "failed",
        "issues": all_issues,
        "passDetails": pass_responses,

        # Metrics
        "metrics": {
            "totalIssuesFound": len(all_issues),
            "issuesByPass": {str(detail['pass']): detail['issuesFound'] for detail in pass_responses if 'issuesFound' in detail}
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
    print(f"  Analysis Method: {NUM_PASSES}-Pass Multi-Pass (Fresh Context)")
    print(f"  Total Issues Found: {len(all_issues)}")
    print(f"\nIssues by Pass:")
    for detail in pass_responses:
        if "error" in detail:
            print(f"  Pass {detail['pass']}: ERROR - {detail['error']}")
        else:
            print(f"  Pass {detail['pass']}: {detail['issuesFound']} issues")

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
