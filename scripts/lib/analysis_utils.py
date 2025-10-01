"""
Shared utilities for trial analysis scripts
"""

import json
from pathlib import Path
from datetime import datetime


def setup_paths(trial_id):
    """Get all relevant paths for a trial"""
    PROJECT_ROOT = Path(__file__).parent.parent.parent
    DATA_DIR = PROJECT_ROOT / "data"
    TRIALS_DIR = DATA_DIR / "trials"
    PROMPT_ASSETS_DIR = DATA_DIR / "prompt-assets"

    trial_dir = TRIALS_DIR / trial_id

    if not trial_dir.exists():
        raise FileNotFoundError(f"Trial directory not found: {trial_dir}")

    return {
        'project_root': PROJECT_ROOT,
        'trial_dir': trial_dir,
        'transcript': trial_dir / "transcript.pdf",
        'guidebook': PROMPT_ASSETS_DIR / "annotation-guidebook-v0.2.pdf",
        'playbook': PROMPT_ASSETS_DIR / "trial-delivery-playbook-G2-US.pdf",
        'analyses_dir': trial_dir / "analyses",
        'prompt_assets_dir': PROMPT_ASSETS_DIR,
    }


def load_prompt(prompt_id):
    """Load a prompt by its ID"""
    PROJECT_ROOT = Path(__file__).parent.parent.parent
    PROMPTS_DIR = PROJECT_ROOT / "prompts"

    prompt_path = PROMPTS_DIR / f"prompt-{prompt_id}.txt"

    if not prompt_path.exists():
        raise FileNotFoundError(f"Prompt file not found: {prompt_path}")

    with open(prompt_path, 'r') as f:
        return f.read()


def upload_files_gemini(client, paths, include_playbook=True):
    """Upload files to Gemini"""
    print("Uploading files to Gemini...")

    files = {
        'transcript': client.files.upload(file=paths['transcript']),
        'guidebook': client.files.upload(file=paths['guidebook'])
    }

    if include_playbook:
        files['playbook'] = client.files.upload(file=paths['playbook'])

    return files


def save_analysis(analysis_result, trial_id, workflow_id):
    """Save analysis with proper naming convention"""
    paths = setup_paths(trial_id)

    # Create analyses directory if it doesn't exist
    paths['analyses_dir'].mkdir(exist_ok=True)

    # Generate filename with timestamp
    timestamp = datetime.now().strftime('%Y%m%d-%H%M%S')
    filename = f"{workflow_id}-{timestamp}.json"
    output_path = paths['analyses_dir'] / filename

    # Save JSON
    with open(output_path, 'w') as f:
        json.dump(analysis_result, f, indent=2)

    print(f"\n{'='*60}")
    print(f"Analysis saved to: {output_path}")
    print(f"{'='*60}")

    return output_path


def check_required_files(paths):
    """Check if all required files exist"""
    if not paths['transcript'].exists():
        raise FileNotFoundError(f"Transcript not found: {paths['transcript']}")
    if not paths['guidebook'].exists():
        raise FileNotFoundError(f"Guidebook not found: {paths['guidebook']}")
    if not paths['playbook'].exists():
        raise FileNotFoundError(f"Playbook not found: {paths['playbook']}")
