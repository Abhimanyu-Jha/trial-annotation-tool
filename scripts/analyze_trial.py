#!/usr/bin/env python3
"""
Trial Analysis Script using Gemini 2.5 Pro
Usage: python analyze_trial.py <trial_id>
Example: python analyze_trial.py mousa-g1

Requirements:
    pip install google-genai

Set API key:
    export GEMINI_API_KEY=your_key_here
"""

import os
import sys
import json
from pathlib import Path
from google import genai
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Setup paths
PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data"
TRIALS_DIR = DATA_DIR / "trials"
PROMPT_ASSETS_DIR = DATA_DIR / "prompt-assets"

def load_file_for_gemini(client, file_path):
    """Upload file to Gemini for processing"""
    return client.files.upload(file=file_path)

def load_prompt():
    """Load the analysis prompt"""
    prompt_path = PROMPT_ASSETS_DIR / "analysis-prompt.txt"
    with open(prompt_path, 'r') as f:
        return f.read()

def analyze_trial(trial_id):
    """Analyze a trial using Gemini API"""
    print(f"Analyzing trial: {trial_id}")

    # Check trial directory exists
    trial_dir = TRIALS_DIR / trial_id
    if not trial_dir.exists():
        print(f"Error: Trial directory not found: {trial_dir}")
        sys.exit(1)

    # Load transcript
    transcript_path = trial_dir / "transcript.pdf"
    if not transcript_path.exists():
        print(f"Error: Transcript not found: {transcript_path}")
        sys.exit(1)

    # Load prompt assets
    guidebook_path = PROMPT_ASSETS_DIR / "annotation-guidebook-v0.2.pdf"
    playbook_path = PROMPT_ASSETS_DIR / "trial-delivery-playbook-G2-US.pdf"

    # Initialize Gemini client
    print("Initializing Gemini client...")
    client = genai.Client()

    print("Uploading files to Gemini...")
    transcript_file = load_file_for_gemini(client, transcript_path)
    guidebook_file = load_file_for_gemini(client, guidebook_path)
    playbook_file = load_file_for_gemini(client, playbook_path)

    # Load prompt
    base_prompt = load_prompt()

    # Multi-pass analysis
    all_issues = []
    pass_responses = []

    for pass_num in range(1, 4):
        print(f"\n{'='*60}")
        print(f"PASS {pass_num}/3")
        print(f"{'='*60}")

        # Build prompt for this pass
        if pass_num == 1:
            prompt = base_prompt
        else:
            # For passes 2 and 3, add instruction to exclude previous issues
            previous_issues_summary = json.dumps(all_issues, indent=2)
            prompt = f"""{base_prompt}

IMPORTANT: This is Pass {pass_num} of the analysis. You have already identified the following issues in previous passes:

{previous_issues_summary}

DO NOT include any of these previously identified issues again. Find NEW issues that were not identified in previous passes. Focus on finding additional problems that may have been missed.
"""

        print(f"Calling Gemini API (Pass {pass_num})...")

        # Generate analysis with multimodal input
        response = client.models.generate_content(
            model="gemini-2.5-pro",
            contents=[
                guidebook_file,
                playbook_file,
                prompt,
                transcript_file
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
        "analysisId": f"analysis-{trial_id}-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
        "trialId": trial_id,
        "timestamp": datetime.now().isoformat(),
        "modelVersion": "gemini-2.5-pro",
        "analysisMethod": "multi-pass-3x",
        "status": "completed" if len(all_issues) > 0 else "failed",
        "issues": all_issues,
        "passDetails": pass_responses
    }

    # Save analysis
    output_path = trial_dir / "ai-analysis.json"
    print(f"Saving analysis to: {output_path}")
    with open(output_path, 'w') as f:
        json.dump(analysis_result, f, indent=2)

    print(f"\n{'='*60}")
    print("ANALYSIS COMPLETE!")
    print(f"{'='*60}")
    print(f"\nSummary:")
    print(f"  Trial ID: {trial_id}")
    print(f"  Output: {output_path}")
    print(f"  Analysis Method: 3-Pass Multi-Pass")
    print(f"  Total Issues Found: {len(all_issues)}")
    print(f"\nIssues by Pass:")
    for detail in pass_responses:
        if "error" in detail:
            print(f"  Pass {detail['pass']}: ERROR - {detail['error']}")
        else:
            print(f"  Pass {detail['pass']}: {detail['issuesFound']} issues")
    print(f"\nAnalysis saved to: {output_path}")

    return analysis_result

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python analyze_trial.py <trial_id>")
        print("Example: python analyze_trial.py mousa-g1")
        print("\nAvailable trials:")
        if TRIALS_DIR.exists():
            for trial_dir in sorted(TRIALS_DIR.iterdir()):
                if trial_dir.is_dir():
                    print(f"  - {trial_dir.name}")
        sys.exit(1)

    trial_id = sys.argv[1]
    analyze_trial(trial_id)
