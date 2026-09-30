#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fight FX Anchor Prompter - Deliverables Generator
将动作戏/武侠仙法提示词快速打包输出为 MiniMax H3 官流与 RunningHub API 友好格式。
"""

import os
import sys
import json
from datetime import datetime

def make_deliverables(prompt_content: str, output_path: str = "fight_fx_deliverable.json"):
    data = {
        "generator": "Fight FX Anchor Prompter v1.0",
        "timestamp": datetime.now().isoformat(),
        "prompt": prompt_content.strip(),
        "negative_prompt": "(background music:1.3), (bgm:1.3), (noisy soundtrack:1.3), (speech outside dialogue:1.4), (deformed limbs:1.5), (extra hands:1.5), (fused bodies:1.5), (soft weapons:1.4), (bending swords:1.4), (floating characters:1.3), (distorted faces:1.4), low resolution",
        "recommended_settings": {
            "model": "MiniMax H3 Official / RunningHub Node 137 Matrix",
            "resolution": "1080p",
            "aspect_ratio": "16:9",
            "fps": 24,
            "foley_policy": "foley_native_retain_score_suppress"
        }
    }
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"[+] 动作打斗提示词交付包已成功生成: {output_path}")

if __name__ == "__main__":
    if len(sys.argv) > 1 and os.path.exists(sys.argv[1]):
        with open(sys.argv[1], "r", encoding="utf-8") as f:
            content = f.read()
    else:
        content = sys.stdin.read() if not sys.stdin.isatty() else ""
    if not content:
        print("用法: python3 make_deliverables.py <prompt_file>")
        sys.exit(1)
    make_deliverables(content)
