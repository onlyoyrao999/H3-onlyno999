#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fight FX Anchor Prompter - Package & Prompt Scanner
检测动作打斗戏、武侠仙法提示词的力学三段式、特效锚点、防穿模约束与防乱说话合规性。
"""

import re
import sys
from typing import Dict, List, Any

FORBIDDEN_WORDS = [
    "大打出手", "激烈地打", "非常愤怒", "十分悲伤", "痛哭流涕", "疯狂战斗",
    "强大破坏力", "极其惨烈", "毁天灭地"
]

def scan_prompt_text(prompt: str) -> Dict[str, Any]:
    issues = []
    warnings = []
    score = 100

    # 1. 检查 subject_definitions
    if "subject_definitions" not in prompt:
        issues.append("缺少 subject_definitions 容器定义")
        score -= 20
    
    # 2. 检查 detailed_description
    if "detailed_description" not in prompt:
        issues.append("缺少 detailed_description 容器包裹分镜")
        score -= 20

    # 3. 检查分镜项
    shots = re.findall(r"【Shot\s*\d+[^】]*】", prompt)
    if not shots:
        issues.append("未检测到标准【Shot N｜起止秒｜景别·描述】分镜标识")
        score -= 20

    # 4. 检查台词合规性（防乱说话）
    # 如果有台词，必须在 <d>[中文] ... </d> 内
    raw_dialogues = re.findall(r"<d>\[中文\](.*?)<\/d>", prompt, re.DOTALL)
    for d in raw_dialogues:
        clean_d = d.strip()
        if len(clean_d) > 12:
            warnings.append(f"打斗中台词过长（'{clean_d}' 共 {len(clean_d)} 字），建议缩短至 6 字以内的短喝，防止模型乱说话抽搐")
            score -= 5

    # 5. 检查音效中是否误加了背景音乐（排除'无背景音乐'、'禁止背景音乐'等合规写法）
    bgm_matches = re.findall(r"【音效】[^【]*?(?:背景音乐|BGM|配乐|旋律|歌声)", prompt, re.IGNORECASE)
    for bm in bgm_matches:
        if not re.search(r"(?:无|禁|严禁|杜绝|排除|不加)(?:背景音乐|BGM|配乐|旋律|歌声)", bm, re.IGNORECASE):
            issues.append("【音效】中检测到背景配乐/BGM生成请求！严禁在 H3 提示词中生成配乐，必须保持纯净物理拟音 (Foley)")
            score -= 15
            break
    if any(k in prompt for k in ["宏大BGM", "激烈配乐", "背景音乐起", "燃向BGM"]):
        issues.append("检测到背景音乐/配乐/BGM生成请求！严禁在 H3 提示词中生成配乐")
        score -= 15

    # 6. 检查是否包含特效锚点或物理受击描写
    has_contact = any(k in prompt for k in ["交击", "碰撞", "火星", "气浪", "犁地", "震波", "滑退", "硬架", "贯穿", "爆裂"])
    if not has_contact:
        warnings.append("动作描述中缺乏明确的物理受击或接触面描写（如碰撞火花、受力滑退），易导致模型生成无受力感动作")
        score -= 10

    # 7. 检查约束中是否有防穿模与刚体防弯折
    if "【约束】" in prompt:
        if not any(k in prompt for k in ["穿模", "扭曲", "刚体", "形变", "多肢", "骨骼"]):
            warnings.append("【约束】项中未强调防肢体穿模或武器刚体防弯折规则")
            score -= 5
    else:
        issues.append("镜头中缺少【约束】防崩坏项")
        score -= 15

    # 8. 检查形容词情绪/违禁空洞词汇
    for fw in FORBIDDEN_WORDS:
        if fw in prompt:
            issues.append(f"包含空洞形容词违禁词: '{fw}'，请翻译为具体的骨骼发力或生理动作")
            score -= 10

    score = max(0, min(100, score))
    return {
        "score": score,
        "passed": len(issues) == 0 and score >= 80,
        "issues": issues,
        "warnings": warnings,
        "shot_count": len(shots)
    }

if __name__ == "__main__":
    test_text = sys.stdin.read() if not sys.stdin.isatty() else ""
    if not test_text:
        print("[!] 请通过管道输入提示词内容进行扫描: python3 scan_package.py < prompt.txt")
        sys.exit(1)
    res = scan_prompt_text(test_text)
    print(f"扫描得分: {res['score']}/100 | 合规判定: {'PASSED' if res['passed'] else 'FAILED'}")
    if res['issues']:
        print("错误项:")
        for err in res['issues']:
            print(f"  - {err}")
    if res['warnings']:
        print("警告项:")
        for warn in res['warnings']:
            print(f"  - {warn}")
