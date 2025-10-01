#!/usr/bin/env python3
"""
Workflow: Gemini 2.5 Pro - Chunked Analysis (10-minute segments)
Description: Analyzes transcript in 10-minute segments independently, then aggregates. Better for long trials.
"""

import os
import sys
import json
import argparse
import re
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
WORKFLOW_ID = "gemini-25pro-chunked-10min"
WORKFLOW_TITLE = "📊 Gemini 2.5 Pro - Chunked Analysis"
WORKFLOW_DESCRIPTION = "Analyzes transcript in 10-minute segments independently, then aggregates. Better for long trials (>30 min)."
MODEL = "gemini-2.5-pro"
PROMPT_ID = "chunked-10min"
CHUNK_DURATION = 10
# ============================================


def parse_timestamp_to_seconds(timestamp_str):
    """Parse timestamp like [00:05:23,456] to seconds"""
    match = re.search(r'\[(\d{2}):(\d{2}):(\d{2})', timestamp_str)
    if match:
        hours, minutes, seconds = map(int, match.groups())
        return hours * 3600 + minutes * 60 + seconds
    return 0


def get_chunk_range_text(chunk_num, chunk_duration):
    """Get human-readable time range for a chunk"""
    start_minutes = (chunk_num - 1) * chunk_duration
    end_minutes = chunk_num * chunk_duration
    return f"{start_minutes:02d}:00 - {end_minutes:02d}:00"


def create_chunk_prompt(base_prompt, chunk_num, chunk_range, is_first, is_last):
    """Create a chunk-specific prompt"""
    chunk_context = f"""
IMPORTANT CONTEXT:
- You are analyzing a SEGMENT of the full trial transcript
- This segment covers: {chunk_range}
- This is {'the FIRST' if is_first else 'the LAST' if is_last else 'a MIDDLE'} segment of the trial

Guidelines for chunk analysis:
- Focus ONLY on issues that occur within this time segment
- If an issue spans across chunk boundaries, only report it if the problematic moment is within this chunk
- Provide timestamps as they appear in the transcript (they will be within the {chunk_range} range)
- Consider that some context may be missing (earlier or later conversation)

"""
    return chunk_context + base_prompt


def analyze_trial(trial_id):
    """Analyze a trial in chunks"""
    print(f"{'='*60}")
    print(f"WORKFLOW: {WORKFLOW_TITLE}")
    print(f"{'='*60}")
    print(f"Trial: {trial_id}")
    print(f"Chunk Duration: {CHUNK_DURATION} minutes")
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

    # Upload files (guidebook and playbook are uploaded for each chunk)
    # Transcript will be uploaded for each chunk separately
    print("Uploading reference files...")
    guidebook_file = client.files.upload(file=paths['guidebook'])
    playbook_file = client.files.upload(file=paths['playbook'])

    # For now, we'll analyze the full transcript in chunks
    # In a production version, you would parse the PDF and split it
    # For this implementation, we'll simulate chunking by instructing the model

    # Estimate number of chunks (this is a placeholder - in production, parse PDF)
    # Assuming a typical 45-minute trial
    estimated_duration_minutes = 45
    num_chunks = (estimated_duration_minutes + CHUNK_DURATION - 1) // CHUNK_DURATION

    print(f"\nEstimated chunks: {num_chunks}")
    print("Note: Chunked analysis is a placeholder implementation.")
    print("For production, parse PDF to extract and split transcript text.\n")

    # Upload full transcript
    transcript_file = client.files.upload(file=paths['transcript'])

    all_issues = []
    chunk_responses = []

    for chunk_num in range(1, num_chunks + 1):
        print(f"\n{'='*60}")
        print(f"CHUNK {chunk_num}/{num_chunks}")
        print(f"{'='*60}")

        chunk_range = get_chunk_range_text(chunk_num, CHUNK_DURATION)
        is_first = (chunk_num == 1)
        is_last = (chunk_num == num_chunks)

        # Create chunk-specific prompt
        chunk_prompt = create_chunk_prompt(
            base_prompt,
            chunk_num,
            chunk_range,
            is_first,
            is_last
        )

        print(f"Analyzing time range: {chunk_range}")
        print(f"Calling Gemini API (Chunk {chunk_num})...")

        # Generate analysis
        response = client.models.generate_content(
            model=MODEL,
            contents=[
                guidebook_file,
                playbook_file,
                chunk_prompt,
                transcript_file
            ],
        )

        # Parse response
        try:
            # Clean response
            response_text = response.text.strip()
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()

            parsed_issues = json.loads(response_text)

            # Add chunk metadata to each issue
            for issue in parsed_issues:
                issue["chunkNumber"] = chunk_num
                issue["chunkRange"] = chunk_range

            print(f"✓ Chunk {chunk_num} complete: Found {len(parsed_issues)} issues")
            all_issues.extend(parsed_issues)
            chunk_responses.append({
                "chunk": chunk_num,
                "chunkRange": chunk_range,
                "issuesFound": len(parsed_issues),
                "rawResponse": response.text[:500] + "..."
            })

        except json.JSONDecodeError as e:
            print(f"✗ Warning: Could not parse Chunk {chunk_num} response as JSON: {e}")
            chunk_responses.append({
                "chunk": chunk_num,
                "chunkRange": chunk_range,
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
        "analysisMethod": f"chunked-{CHUNK_DURATION}min",

        # Configuration
        "configuration": {
            "chunkDurationMinutes": CHUNK_DURATION,
            "totalChunks": num_chunks,
            "contextStrategy": "chunked",
            "promptVariant": PROMPT_ID,
            "assetsUsed": ["guidebook", "playbook", "transcript"]
        },

        # Results
        "status": "completed" if len(all_issues) > 0 else "failed",
        "issues": all_issues,
        "chunkDetails": chunk_responses,

        # Metrics
        "metrics": {
            "totalIssuesFound": len(all_issues),
            "issuesByChunk": {str(detail['chunk']): detail['issuesFound'] for detail in chunk_responses if 'issuesFound' in detail}
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
    print(f"  Analysis Method: Chunked ({CHUNK_DURATION}-minute segments)")
    print(f"  Total Chunks: {num_chunks}")
    print(f"  Total Issues Found: {len(all_issues)}")
    print(f"\nIssues by Chunk:")
    for detail in chunk_responses:
        if "error" in detail:
            print(f"  Chunk {detail['chunk']} ({detail['chunkRange']}): ERROR - {detail['error']}")
        else:
            print(f"  Chunk {detail['chunk']} ({detail['chunkRange']}): {detail['issuesFound']} issues")

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
