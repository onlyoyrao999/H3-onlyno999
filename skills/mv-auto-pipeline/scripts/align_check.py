#!/usr/bin/env python3
"""
align_check.py - MV-Auto-Pipeline Gate 8 Three-Fold Alignment Verification
Implements:
1. Audio envelope computation (downsampled RMS representation)
2. Local lag search in [-300ms, +300ms] window
3. Verification of 3 criteria:
   - |lag| <= 80ms
   - correlation >= 0.78
   - vocal RMS energy >= -36 dBFS
"""

import math
import json
import sys

def compute_local_search_alignment(
    master_envelope: list, 
    video_envelope: list, 
    expected_offset_idx: int, 
    search_radius: int = 30
) -> dict:
    """
    Computes normalized cross-correlation over a local radius (search_radius frames = 300ms at 100fps).
    """
    if not master_envelope or not video_envelope:
        return {"passed": False, "reason": "Empty audio envelope"}

    len_v = len(video_envelope)
    best_corr = -1.0
    best_lag_frames = 0

    mean_v = sum(video_envelope) / len_v
    var_v = sum((x - mean_v) ** 2 for x in video_envelope)
    std_v = math.sqrt(var_v) if var_v > 1e-9 else 1e-5

    # Search in window [-search_radius, +search_radius]
    for lag in range(-search_radius, search_radius + 1):
        target_start = expected_offset_idx + lag
        target_end = target_start + len_v

        if target_start < 0 or target_end > len(master_envelope):
            continue

        master_slice = master_envelope[target_start:target_end]
        mean_m = sum(master_slice) / len_v
        var_m = sum((x - mean_m) ** 2 for x in master_slice)
        std_m = math.sqrt(var_m) if var_m > 1e-9 else 1e-5

        # Covariance
        cov = sum((v - mean_v) * (m - mean_m) for v, m in zip(video_envelope, master_slice))
        corr = cov / (std_v * std_m * len_v)

        if corr > best_corr:
            best_corr = corr
            best_lag_frames = lag

    best_lag_ms = best_lag_frames * 10.0  # 1 frame = 10ms

    # Compute vocal RMS dBFS
    vocal_rms = math.sqrt(sum(x**2 for x in video_envelope) / len_v) if len_v > 0 else 0
    vocal_dbfs = 20 * math.log10(max(vocal_rms, 1e-5))

    # Acceptance criteria
    is_lag_ok = abs(best_lag_ms) <= 80.0
    is_corr_ok = best_corr >= 0.78
    is_energy_ok = vocal_dbfs >= -36.0

    passed = is_lag_ok and is_corr_ok and is_energy_ok

    return {
        "passed": passed,
        "best_lag_ms": round(best_lag_ms, 2),
        "correlation": round(best_corr, 4),
        "vocal_energy_dbfs": round(vocal_dbfs, 2),
        "checks": {
            "lag_within_80ms": is_lag_ok,
            "corr_ge_0_78": is_corr_ok,
            "vocal_energy_ge_neg_36dbfs": is_energy_ok
        }
    }

if __name__ == "__main__":
    # Synthetic test demonstration
    import random
    random.seed(42)
    # Master track envelope (100 Hz / 10ms per bin)
    master = [0.1 + 0.8 * math.sin(i * 0.05) ** 2 + random.uniform(-0.02, 0.02) for i in range(1000)]
    # Video segment extracted at index 200 with 30ms shift (3 frames)
    expected_idx = 200
    actual_idx = 203
    video = master[actual_idx:actual_idx + 150]

    report = compute_local_search_alignment(master, video, expected_offset_idx=expected_idx)
    print(json.dumps(report, indent=2, ensure_ascii=False))
