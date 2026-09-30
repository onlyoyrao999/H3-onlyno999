#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fight FX Anchor Prompter - Reference Image Generator
为动作戏生成高稳定性参考图提示词（包括场景图、攻击方、受击方、起手对峙起始帧）。
"""

from typing import Dict

def generate_fight_image_prompts(scene_desc: str, char_a: str, char_b: str) -> Dict[str, str]:
    return {
        "scene_ref_p1": f"Cinematic wide establishing shot of {scene_desc}, dramatic dynamic atmospheric lighting, wet reflective ground, dust and air particles, highly detailed photorealistic, 8k resolution, film still.",
        "attacker_ref_p2": f"Character portrait and full body stance of {char_a}, dynamic combat ready pose, martial arts posture, holding weapon with rigid geometry, sharp focus on eyes and posture, photorealistic, cinematic backlight.",
        "defender_ref_p3": f"Character portrait and full body defensive stance of {char_b}, ready to parry, grounded footwork, clear clothing textures, cinematic depth of field, photorealistic.",
        "start_frame_p4": f"Cinematic 16:9 start frame composition showing {char_a} on the left and {char_b} on the right confronting each other across {scene_desc}, tension before impact, stable anatomy, dramatic volumetric fog."
    }

if __name__ == "__main__":
    prompts = generate_fight_image_prompts("misty bamboo forest", "swordsman in white robe", "assassin in black armor")
    for k, v in prompts.items():
        print(f"[{k}]:\n{v}\n")
