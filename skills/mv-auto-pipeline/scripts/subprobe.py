#!/usr/bin/env python3
"""
subprobe.py: Narrow-band Burned-in Subtitle Locator for MiniMax H3
H3 renders subtitles not at the bottom edge, but floating between 55%~75% height.
This script scans for high-contrast white text strokes with black borders.
"""

def probe_subtitles_in_frame(rgb_bytes: bytes, width: int, height: int) -> dict:
    start_y = int(height * 0.55)
    end_y = int(height * 0.75)
    subtitle_lines = []

    for y in range(start_y, end_y):
        white_edge_count = 0
        for x in range(1, width - 1):
            idx = (y * width + x) * 3
            left_idx = (y * width + (x - 1)) * 3
            r, g, b = rgb_bytes[idx:idx+3]
            lr, lg, lb = rgb_bytes[left_idx:left_idx+3]

            # High contrast sharp white edge with dark border
            if r > 220 and g > 220 and b > 220 and (lr < 60 and lg < 60 and lb < 60):
                white_edge_count += 1

        if white_edge_count > 15:
            subtitle_lines.append(y)

    detected = len(subtitle_lines) > 3
    return {
        "burned_in_subtitle_detected": detected,
        "line_band_height_pct": f"{int((sum(subtitle_lines)/max(1, len(subtitle_lines))/height)*100)}%" if detected else "None",
        "action": "Overlay custom post-production subtitles or retain as native caption."
    }

if __name__ == "__main__":
    print("subprobe.py: Subtitle probe initialized.")
