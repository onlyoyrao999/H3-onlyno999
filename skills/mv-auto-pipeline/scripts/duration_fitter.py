#!/usr/bin/env python3
"""
duration_fitter.py - MV-Auto-Pipeline Duration Fitting Tool
Calculates frame grid upward alignment and exact millisecond cut bounds to eliminate drift.
"""

import math
import json

def calculate_duration_fitting(window_start: float, window_end: float, fps: int = 24) -> dict:
    """
    Computes:
    1. Exact target seconds W_k = End - Start
    2. Upward grid aligned frames N_frames = ceil(W_k * FPS)
    3. Model request duration = N_frames / FPS
    4. Trimming pts bounds [0, W_k]
    """
    target_seconds = window_end - window_start
    if target_seconds <= 0:
        raise ValueError("Invalid window interval: end must be greater than start")

    target_frames = math.ceil(target_seconds * fps)
    model_request_seconds = target_frames / fps
    overhang_seconds = model_request_seconds - target_seconds

    # FFmpeg command for precise stream trim and PTS reset
    ffmpeg_trim_args = [
        "-ss", "0.000",
        "-t", f"{target_seconds:.4f}",
        "-vf", f"setpts=PTS-STARTPTS,fps={fps}",
        "-af", "asetpts=PTS-STARTPTS"
    ]

    return {
        "window_start": round(window_start, 4),
        "window_end": round(window_end, 4),
        "target_seconds": round(target_seconds, 4),
        "fps": fps,
        "grid_aligned_frames": target_frames,
        "model_request_seconds": round(model_request_seconds, 4),
        "overhang_trimmed_seconds": round(overhang_seconds, 4),
        "ffmpeg_trim_cmd_snippet": " ".join(ffmpeg_trim_args)
    }

if __name__ == "__main__":
    test = calculate_duration_fitting(14.25, 18.42, fps=24)
    print(json.dumps(test, indent=2, ensure_ascii=False))
