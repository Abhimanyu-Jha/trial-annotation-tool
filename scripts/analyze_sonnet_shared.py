#!/usr/bin/env python3
"""
Workflow: Claude Sonnet 4.5 - Shared Context 3x
Description: 3 passes using Claude's superior reasoning in a shared conversation. Efficient and coherent analysis.
"""

import os
import sys
import json
import argparse
import base64
import time
from pathlib import Path
from anthropic import Anthropic
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
WORKFLOW_ID = "sonnet-45-3x-shared"
WORKFLOW_TITLE = "🤖 Claude Sonnet 4.5 - Shared 3x"
WORKFLOW_DESCRIPTION = "3 passes using Claude's superior reasoning in a shared conversation. Efficient and coherent analysis."
MODEL = "claude-sonnet-4-5-20250929"
PROMPT_ID = "standard-multipass"
NUM_PASSES = 3
# ============================================


def pdf_to_base64(file_path):
    """Convert PDF to base64 for Claude API"""
    with open(file_path, 'rb') as f:
        return base64.standard_b64encode(f.read()).decode('utf-8')


def analyze_trial(trial_id):
    """Analyze a trial using Claude API with shared context across passes"""
    print(f"{'='*60}")
    print(f"WORKFLOW: {WORKFLOW_TITLE}")
    print(f"{'='*60}")
    print(f"Trial: {trial_id}")
    print(f"Passes: {NUM_PASSES}")
    print(f"Model: {MODEL}")
    print(f"Context: Shared (Messages API)")
    print(f"Prompt: {PROMPT_ID}")
    print(f"{'='*60}\n")

    # Setup paths
    paths = setup_paths(trial_id)
    check_required_files(paths)

    # Initialize Anthropic client
    print("Initializing Anthropic client...")
    client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

    # Load base prompt
    base_prompt = load_prompt(PROMPT_ID)

    # Encode PDFs to base64
    # NOTE: Playbook (29MB) exceeds Claude API size limits, so we skip it
    # This workflow uses guidebook + transcript only
    print("Encoding files...")
    transcript_b64 = pdf_to_base64(paths['transcript'])
    guidebook_b64 = pdf_to_base64(paths['guidebook'])

    # Multi-pass analysis using messages
    all_issues = []
    pass_responses = []
    message_history = []

    for pass_num in range(1, NUM_PASSES + 1):
        print(f"\n{'='*60}")
        print(f"PASS {pass_num}/{NUM_PASSES}")
        print(f"{'='*60}")

        # Build message for this pass
        if pass_num == 1:
            # First pass: Full prompt with PDFs + prompt caching
            user_message = {
                "role": "user",
                "content": [
                    {
                        "type": "document",
                        "source": {
                            "type": "base64",
                            "media_type": "application/pdf",
                            "data": guidebook_b64
                        },
                        "cache_control": {"type": "ephemeral"}
                    },
                    {
                        "type": "text",
                        "text": base_prompt
                    },
                    {
                        "type": "document",
                        "source": {
                            "type": "base64",
                            "media_type": "application/pdf",
                            "data": transcript_b64
                        },
                        "cache_control": {"type": "ephemeral"}
                    }
                ]
            }
        else:
            # Subsequent passes: Simple instruction to continue
            user_message = {
                "role": "user",
                "content": """Continue analyzing the transcript. Find additional issues that you haven't identified yet in previous passes.

IMPORTANT: Do NOT repeat any issues you've already found. Focus on finding NEW issues that were missed in previous passes."""
            }

        # Add to message history
        message_history.append(user_message)

        print(f"Sending request to Claude API (Pass {pass_num})...")

        # Generate response
        response = client.messages.create(
            model=MODEL,
            max_tokens=16000,
            messages=message_history
        )

        # Extract text from response
        response_text = ""
        for block in response.content:
            if block.type == "text":
                response_text += block.text

        # Add assistant response to history
        message_history.append({
            "role": "assistant",
            "content": response_text
        })

        # Parse response
        try:
            # Clean response if it has markdown code blocks
            cleaned_text = response_text.strip()
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text[7:]
            if cleaned_text.startswith("```"):
                cleaned_text = cleaned_text[3:]
            if cleaned_text.endswith("```"):
                cleaned_text = cleaned_text[:-3]
            cleaned_text = cleaned_text.strip()

            parsed_issues = json.loads(cleaned_text)

            # Add pass metadata to each issue
            for issue in parsed_issues:
                issue["analysisPass"] = pass_num

            print(f"✓ Pass {pass_num} complete: Found {len(parsed_issues)} new issues")
            all_issues.extend(parsed_issues)
            pass_responses.append({
                "pass": pass_num,
                "issuesFound": len(parsed_issues),
                "rawResponse": response_text[:500] + "..."
            })

        except json.JSONDecodeError as e:
            print(f"✗ Warning: Could not parse Pass {pass_num} response as JSON: {e}")
            pass_responses.append({
                "pass": pass_num,
                "error": f"Invalid JSON response: {str(e)}",
                "rawResponse": response_text[:500] + "..."
            })

        # Small delay between passes (prompt caching handles the heavy lifting)
        if pass_num < NUM_PASSES:
            delay = 2  # Brief delay between passes
            print(f"\nWaiting {delay}s before next pass...")
            time.sleep(delay)

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
        "analysisMethod": f"multi-pass-{NUM_PASSES}x-shared",

        # Configuration
        "configuration": {
            "passes": NUM_PASSES,
            "contextStrategy": "shared",
            "promptVariant": PROMPT_ID,
            "assetsUsed": ["guidebook", "transcript"]  # Playbook excluded due to 29MB size limit
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
    print(f"  Analysis Method: {NUM_PASSES}-Pass Multi-Pass (Shared Context)")
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

    # Check for API key
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("Error: ANTHROPIC_API_KEY not found in environment")
        print("Please set it in your .env file or export it:")
        print("  export ANTHROPIC_API_KEY=your_key_here")
        sys.exit(1)

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
