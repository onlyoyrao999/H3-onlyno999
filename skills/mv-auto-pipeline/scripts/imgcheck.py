#!/usr/bin/env python3
"""
imgcheck.py: Non-Visual Pixel-Level Audit for Qwen/H3 Reference Images
Audits:
1. grey%: Near-neutral grey pixel ratio. If >3%, studio grey background leaked into output!
2. Euclidean Distance: Average color distance between composite card background and ancestor scene card.
   Must be < 15.0 to prove background inheritance.
"""

import sys, os, math

def audit_raw_rgb24(rgb_bytes: bytes, width: int, height: int, ancestor_rgb: bytes = None) -> dict:
    total_pixels = width * height
    grey_count = 0
    bg_diff_sum = 0
    bg_pixel_count = 0

    for i in range(0, len(rgb_bytes) - 2, 3):
        r = rgb_bytes[i]
        g = rgb_bytes[i+1]
        b = rgb_bytes[i+2]

        # Neutral grey check: low saturation with medium luminance
        max_c = max(r, g, b)
        min_c = min(r, g, b)
        diff = max_c - min_c
        luma = (r + g + b) // 3

        if diff <= 12 and 60 <= luma <= 210:
            grey_count += 1

        # Ancestor difference check (sample border zones)
        pixel_idx = i // 3
        x = pixel_idx % width
        y = pixel_idx // height

        if (x < width * 0.2 or x > width * 0.8) and ancestor_rgb and i < len(ancestor_rgb) - 2:
            ar = ancestor_rgb[i]
            ag = ancestor_rgb[i+1]
            ab = ancestor_rgb[i+2]
            dist = math.sqrt((r - ar)**2 + (g - ag)**2 + (b - ab)**2)
            bg_diff_sum += dist
            bg_pixel_count += 1

    grey_pct = round((grey_count / total_pixels) * 100, 2)
    euclidean_dist = round(bg_diff_sum / max(1, bg_pixel_count), 2) if bg_pixel_count > 0 else 0.0

    return {
        "grey_percent": grey_pct,
        "grey_passed": grey_pct < 3.0,
        "euclidean_distance": euclidean_dist,
        "euclidean_passed": euclidean_dist < 15.0,
        "recommendation": "PASS" if grey_pct < 3.0 and euclidean_dist < 15.0 else "REVISE"
    }

if __name__ == "__main__":
    print("imgcheck.py ready. Simulating synthetic composite card:")
    # Synthetic test sample
    dummy_width, dummy_height = 576, 1024
    dummy_bytes = bytes([30, 25, 20] * (dummy_width * dummy_height))
    res = audit_raw_rgb24(dummy_bytes, dummy_width, dummy_height)
    print(f"Audit Result: {res}")
