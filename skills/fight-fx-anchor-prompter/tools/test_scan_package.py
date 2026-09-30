#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fight FX Anchor Prompter - Test Suite
单元测试确保扫描器能准确拦截穿模风险、乱说话与背景音乐违规。
"""

import unittest
from scan_package import scan_prompt_text

GOOD_FIGHT_PROMPT = """
subject_definitions（主体定义）:
<Subject 1> 是 <Picture 1> 中的青石剑台。
<Subject 2> 是 <Picture 2> 中的白衣剑客。
detailed_description:
【Shot 1｜0–4秒｜中景·剑气破空】
【主体】<Subject 2> 居中。
【动作】<Subject 2> (S1) 右臂猛挥长剑撕开风幕，剑锋交击爆射火星，沉声喝道：
<d>[中文] 破！</d>
双足在地面犁地后滑半步。
【镜头】16:9 中景微仰拍。
【音效】金属交击尖锐轰鸣，无背景音乐，无对白外杂音。
【约束】角色肢体不扭曲穿模，武器刚体无形变，画面无跳变。
"""

BAD_FIGHT_PROMPT = """
两人非常愤怒地冲上去大打出手，场面十分悲伤惨烈，带有很燃的背景音乐起，宏大BGM！
"""

class TestFightFXScanner(unittest.TestCase):
    def test_good_prompt(self):
        res = scan_prompt_text(GOOD_FIGHT_PROMPT)
        self.assertTrue(res["passed"])
        self.assertGreaterEqual(res["score"], 80)
        self.assertEqual(len(res["issues"]), 0)

    def test_bad_prompt_fails(self):
        res = scan_prompt_text(BAD_FIGHT_PROMPT)
        self.assertFalse(res["passed"])
        self.assertLess(res["score"], 60)
        self.assertTrue(any("背景音乐" in err for err in res["issues"]))
        self.assertTrue(any("违禁词" in err for err in res["issues"]))

if __name__ == "__main__":
    unittest.main()
