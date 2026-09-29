#!/usr/bin/env python3
"""
prompt_validator.py - MV-Auto-Pipeline Gate 5 Prompt Machine Checker
Validates 11 critical machine check rules for six-part MV prompts.
"""

import re
import hashlib
import json
import sys

ALLOWED_LIP_SYNC_SCALES = {"ECU", "CU", "MCU", "MS", "EXTREME CLOSE-UP", "CLOSE-UP", "MEDIUM CLOSE-UP", "MEDIUM SHOT"}
FORBIDDEN_TALK_VERBS = ["saying", "talking", "speaking", "chatting", "tells", "whispering to", "says"]

def validate_prompt(shot_meta: dict) -> dict:
    """
    Validates a single shot prompt against the 11 machine check rules.
    Returns { "valid": bool, "passed_checks": list, "failed_checks": list, "hash": str }
    """
    prompt = shot_meta.get("prompt", "")
    neg_prompt = shot_meta.get("negative_prompt", "")
    scale = shot_meta.get("shot_scale", "").upper().strip()
    is_lip_sync = shot_meta.get("is_lip_sync", False)
    lyrics = shot_meta.get("lyrics", "").strip()
    duration = shot_meta.get("duration", 4.0)

    passed = []
    failed = []

    # Check 1: Six-Part Structure
    required_sections = ["[SHOT]", "[SUBJECT]", "[ACTION]", "[ENVIRONMENT]", "[LIGHTING_COLOR]", "[CAMERA_TECH]"]
    missing_sections = [s for s in required_sections if s not in prompt]
    if not missing_sections:
        passed.append("01_CHECK_STRUCTURE: All 6 standard sections present")
    else:
        failed.append(f"01_CHECK_STRUCTURE: Missing sections {missing_sections}")

    # Check 2: Language tier check (Section headers uppercase English)
    has_valid_headers = all(s in prompt for s in required_sections)
    if has_valid_headers:
        passed.append("02_CHECK_LANG_TIER: Standard English section keys used")
    else:
        failed.append("02_CHECK_LANG_TIER: Invalid header casing or language")

    # Check 3: Vocal line presence for lip sync
    if is_lip_sync:
        if re.search(r'Singing vocals:\s*["\'].+?["\']', prompt, re.IGNORECASE):
            passed.append("03_CHECK_VOCAL_LINE: Proper singing vocal line formatted")
        else:
            failed.append("03_CHECK_VOCAL_LINE: Lip-sync shot missing 'Singing vocals: \"...\"' independent line")
    else:
        passed.append("03_CHECK_VOCAL_LINE: Non-lip-sync shot, vocal line not required")

    # Check 4: No dialogue verbs
    has_talk_verb = any(v in prompt.lower() for v in FORBIDDEN_TALK_VERBS)
    if not has_talk_verb:
        passed.append("04_CHECK_NO_TALK_VERB: No speech/dialogue verbs detected")
    else:
        failed.append("04_CHECK_NO_TALK_VERB: Forbidden dialogue verb found in prompt (use singing frame instead)")

    # Check 5: Scale match (Only ECU, CU, MCU, MS can lip sync)
    if is_lip_sync:
        if scale in ALLOWED_LIP_SYNC_SCALES:
            passed.append(f"05_CHECK_SCALE_MATCH: Valid lip-sync shot scale ({scale})")
        else:
            failed.append(f"05_CHECK_SCALE_MATCH: Shot scale '{scale}' not permitted for lip-sync (allowed: ECU, CU, MCU, MS)")
    else:
        passed.append(f"05_CHECK_SCALE_MATCH: Non-lip-sync scale approved ({scale})")

    # Check 6: Positive still lips suppression for non-lip-sync shots
    if not is_lip_sync:
        if "mouth naturally closed" in prompt.lower() or "lips completely still" in prompt.lower():
            passed.append("06_CHECK_LIP_STILL: Natural mouth closed suppression present in positive prompt")
        else:
            failed.append("06_CHECK_LIP_STILL: Non-lip-sync shot must declare 'mouth naturally closed, lips completely still'")
    else:
        passed.append("06_CHECK_LIP_STILL: Lip-sync shot - mouth action allowed")

    # Check 7: Negative prompt lip suppression and strict screen text suppression
    neg_lowered = neg_prompt.lower()
    prompt_lowered = prompt.lower()
    
    # 7a. Zero Screen Text Assertion (MV画面严禁任何文字/乱码/字幕出现)
    forbidden_screen_text = ["subtitles on screen", "burned-in text", "lyrics text overlaid", "words written on screen", "watermark on video"]
    has_text_instruction = any(t in prompt_lowered for t in forbidden_screen_text)
    
    text_suppress_keywords = ["text", "subtitles", "lyrics", "words", "watermark", "captions"]
    has_text_suppress = any(k in neg_lowered for k in text_suppress_keywords)
    
    if has_text_instruction:
        failed.append("07_CHECK_NEG_LIP_AND_TEXT: Positive prompt must NOT request text/subtitles on screen (MV画面严禁出现文字)")
    elif not has_text_suppress:
        failed.append("07_CHECK_NEG_LIP_AND_TEXT: Negative prompt must contain text suppression keywords ('text, subtitles, lyrics, words, watermark') to prevent distorted text/subtitles on video screen")
    elif not is_lip_sync:
        has_neg_lip = ("singing" in neg_lowered or "lip-sync" in neg_lowered or "mouth open" in neg_lowered)
        if has_neg_lip:
            passed.append("07_CHECK_NEG_LIP_AND_TEXT: Negative prompt suppresses mouth motion AND suppresses screen text/subtitles")
        else:
            failed.append("07_CHECK_NEG_LIP_AND_TEXT: Non-lip-sync negative prompt must contain 'singing, mouth open, lip-sync' in addition to text suppression")
    else:
        passed.append("07_CHECK_NEG_LIP_AND_TEXT: Negative prompt contains screen text/watermark suppression, lip-sync allowed")

    # Check 8: Character anchor presence if protagonist mode
    if shot_meta.get("has_protagonist", True):
        if "[SUBJECT]" in prompt and len(prompt.split("[SUBJECT]")[1].split("[")[0].strip()) > 15:
            passed.append("08_CHECK_CHAR_ANCHOR: Subject description anchor verified")
        else:
            failed.append("08_CHECK_CHAR_ANCHOR: Inadequate subject character anchor in [SUBJECT]")
    else:
        passed.append("08_CHECK_CHAR_ANCHOR: Scenery/non-protagonist mode active")

    # Check 9: Visual conflict check
    lowered = prompt.lower()
    if ("night" in lowered and "bright direct sunlight" in lowered) or ("indoor" in lowered and "open vast desert" in lowered):
        failed.append("09_CHECK_NO_CONFLICT: Detected contradictory lighting or environment tokens")
    else:
        passed.append("09_CHECK_NO_CONFLICT: No contradictory scene descriptions found")

    # Check 10: Motion pace fit
    if duration < 3.0:
        intense_verbs = ["running fast", "fighting", "dancing wildly", "spinning violently"]
        found_intense = [v for v in intense_verbs if v in lowered]
        if len(found_intense) > 1:
            failed.append(f"10_CHECK_MOTION_FIT: Too many intense actions {found_intense} for <3s window")
        else:
            passed.append("10_CHECK_MOTION_FIT: Motion complexity fits short duration")
    else:
        passed.append("10_CHECK_MOTION_FIT: Sufficient duration for intended motion")

    # Check 11: Prompt Hash Signature
    prompt_hash = hashlib.sha256((prompt + neg_prompt).encode("utf-8")).hexdigest()[:16]
    passed.append(f"11_CHECK_HASH_SIGN: Generated cryptographic fingerprint #{prompt_hash}")

    is_valid = len(failed) == 0
    return {
        "valid": is_valid,
        "shot_id": shot_meta.get("id", "shot_01"),
        "passed_count": len(passed),
        "failed_count": len(failed),
        "passed_checks": passed,
        "failed_checks": failed,
        "fingerprint": prompt_hash
    }

if __name__ == "__main__":
    sample_shot = {
        "id": "shot_02",
        "shot_scale": "CU",
        "is_lip_sync": True,
        "lyrics": "夜色渐浓 街灯也渐渐熄灭",
        "duration": 4.2,
        "has_protagonist": True,
        "prompt": """[SHOT]
Shot scale: Close-Up. Camera motion: Slow push-in tracking shot. Eye-level, cinematic 35mm lens.

[SUBJECT]
A young female singer with gentle dark eyes and crimson scarf, expressing contemplative melancholy.

[ACTION]
Standing near a rain-streaked window.
Singing vocals: "夜色渐浓 街灯也渐渐熄灭"

[ENVIRONMENT]
A warmly lit retro wooden cafe overlooking a rainy midnight neon boulevard.

[LIGHTING_COLOR]
Moody cinematic amber and emerald lighting, soft specular bokeh highlights on glass.

[CAMERA_TECH]
8k, photorealistic film look, delicate grain, high dynamic range.
""",
        "negative_prompt": "text, words, subtitles, lyrics, captions, watermark, logo, typography, cartoon, 3d render, deformed face, blur"
    }

    res = validate_prompt(sample_shot)
    print(json.dumps(res, indent=2, ensure_ascii=False))
