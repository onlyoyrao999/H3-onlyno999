#!/usr/bin/env python3
"""
gate6_checker.py - MV-Auto-Pipeline Gate 6 Hard Barrier
Validates:
1. Mathematical window continuity: Start_i == End_{i-1}, sum(durations) == master_track_duration
2. Scale vs lip-sync consistency
3. Lip-sync cadence: target ~45% total duration, max 3 consecutive lip-sync shots
"""

import json
import sys

ALLOWED_LIP_SYNC_SCALES = {"ECU", "CU", "MCU", "MS"}

def check_gate_6(storyboard: list, master_duration: float, tolerance: float = 0.05) -> dict:
    errors = []
    warnings = []
    
    if not storyboard:
        return {"passed": False, "errors": ["Storyboard is empty"], "stats": {}}

    total_duration = 0.0
    lip_sync_duration = 0.0
    consecutive_lip_sync = 0
    max_consecutive_lip_sync = 0

    prev_end = 0.0

    for idx, shot in enumerate(storyboard):
        shot_id = shot.get("id", f"shot_{idx+1:02d}")
        start = float(shot.get("start", 0.0))
        end = float(shot.get("end", 0.0))
        duration = end - start
        scale = str(shot.get("shot_scale", "")).upper().strip()
        is_lip_sync = bool(shot.get("is_lip_sync", False))

        # Check 1: Window continuity
        if idx == 0 and abs(start - 0.0) > tolerance:
            errors.append(f"Shot {shot_id}: First shot must start at 0.00s (got {start:.3f}s)")
        
        if idx > 0 and abs(start - prev_end) > tolerance:
            errors.append(f"Shot {shot_id}: Gap or overlap detected! Expected start {prev_end:.3f}s, got {start:.3f}s")

        if duration <= 0.2:
            errors.append(f"Shot {shot_id}: Invalid shot duration ({duration:.3f}s <= 0.2s)")

        total_duration += duration
        prev_end = end

        # Check 2: Scale vs Lip-sync
        if is_lip_sync:
            lip_sync_duration += duration
            consecutive_lip_sync += 1
            if consecutive_lip_sync > max_consecutive_lip_sync:
                max_consecutive_lip_sync = consecutive_lip_sync

            if scale not in ALLOWED_LIP_SYNC_SCALES:
                errors.append(f"Shot {shot_id}: Shot scale '{scale}' is forbidden for lip-sync! Must be ECU/CU/MCU/MS")
            
            if consecutive_lip_sync > 3:
                errors.append(f"Shot {shot_id}: Consecutive lip-sync shot limit exceeded ({consecutive_lip_sync} > 3). Must insert a narrative or scenery shot!")
        else:
            consecutive_lip_sync = 0

    # Check 3: Master track duration conservation
    if abs(total_duration - master_duration) > tolerance:
        errors.append(f"Total storyboard duration ({total_duration:.3f}s) does not match master audio length ({master_duration:.3f}s, diff: {abs(total_duration - master_duration):.3f}s)")

    # Check 4: Ratio calculation
    lip_sync_ratio = (lip_sync_duration / total_duration) if total_duration > 0 else 0.0
    if lip_sync_ratio > 0.65:
        warnings.append(f"Lip-sync ratio ({lip_sync_ratio*100:.1f}%) is higher than optimal 45%. Audience fatigue likely.")
    elif lip_sync_ratio < 0.25:
        warnings.append(f"Lip-sync ratio ({lip_sync_ratio*100:.1f}%) is lower than 25%. Character singing presence may feel scarce.")

    passed = len(errors) == 0
    return {
        "passed": passed,
        "errors": errors,
        "warnings": warnings,
        "stats": {
            "total_shots": len(storyboard),
            "total_duration": round(total_duration, 3),
            "master_duration": round(master_duration, 3),
            "lip_sync_duration": round(lip_sync_duration, 3),
            "lip_sync_ratio_pct": round(lip_sync_ratio * 100, 1),
            "max_consecutive_lip_sync": max_consecutive_lip_sync
        }
    }

if __name__ == "__main__":
    sample_sb = [
        {"id": "shot_01", "start": 0.0, "end": 4.5, "shot_scale": "ELS", "is_lip_sync": False},
        {"id": "shot_02", "start": 4.5, "end": 8.5, "shot_scale": "CU", "is_lip_sync": True},
        {"id": "shot_03", "start": 8.5, "end": 12.0, "shot_scale": "MCU", "is_lip_sync": True},
        {"id": "shot_04", "start": 12.0, "end": 16.2, "shot_scale": "MS", "is_lip_sync": True},
        {"id": "shot_05", "start": 16.2, "end": 20.0, "shot_scale": "FS", "is_lip_sync": False}
    ]
    report = check_gate_6(sample_sb, master_duration=20.0)
    print(json.dumps(report, indent=2, ensure_ascii=False))
