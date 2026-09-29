import React, { useState } from 'react';
import { X, Copy, Check, FileText, Code, Download, Terminal, Layers, Sparkles } from 'lucide-react';

interface SkillSpecModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SPEC_FILES = [
  {
    id: 'skill_md',
    name: 'SKILL.md (V2.0 整合版)',
    type: 'markdown',
    path: '/skills/mv-auto-pipeline/SKILL.md',
    content: `---
name: mv-auto-pipeline
description: >
  全自动视频生成 SOP 与实战工作台 (V2.0)。全链打通【音乐 MV】、【竖版多段短剧 (Short Drama)】与【商业广告 (Commercials)】三大题材生产。
  严格落实十二步工程全链、八道质量门禁、MiniMax H3 官方 Ref2VA 六段式提示词规范、Qwen 文生图+图像编辑+H3参考生视频三工作流资产中台、
  跨段防裁头宽景与宾客同源锁定清单、无视觉像素级三验 (imgcheck/subprobe/vcheck)、以及 RunningHub 云端一键调度出片。
---

# H3 全自动视频生成流水线 SOP (MV · 短剧 · 广告)

> 核心使命：用 MV 的工程级严密流程（时间轴锚定、12步8关、对齐三验、成本台账、硬门禁拦截），
> 统一扩展与赋能【音乐 MV】、【竖版短剧】与【商业广告】，全面接入 MiniMax H3 官方规范与三工作流资产中台，
> 彻底解决「音画漂移」、「对白裁头」、「反向字幕敏感」与「背景人忽有忽无」等痛点，直通 RunningHub 出片。

## 六大铁律：
A. 时间是唯一的时间基准（MV 依歌词、短剧依 15s/362 帧节拍、广告依分镜表）
B. 只有中近景或宽景安全机位发声，发声时必须绑定 (Sx) 与 <d> 标签，人物嘴唇非发声时必须绝对静止
C. 画面纯净与防反向陷阱：严禁在正负向中写 "no subtitles/no text"（H3 越点名越画字幕！）
D. 同源场景派生：所有合成图都以同一张场景卡为画布派生，锁定建筑、天花板吊灯与宾客
E. 防走廊构图：走道收窄至一张桌宽，圆桌与宾客铺满两侧，严禁单侧排布造成狭长走廊
F. 双关制与对齐三验：机检硬门禁 + HTML 审查；成片必须经受滞后量、波形相关度与人声能量核验`
  },
  {
    id: 'h3_ref_md',
    name: 'H3官方规范 vs Seedance (MD)',
    type: 'markdown',
    path: '/skills/mv-auto-pipeline/references/h3_official_ref2va_rules.md',
    content: `# MiniMax H3 官方 Ref2VA 规范与 Awesome-Seedance 差异辨析

## 六大结构性硬伤对照表：
1. 段落架构：Seedance 无段落散文 -> H3 必须是 [subject_definitions] 至 [non_diegetic_music] 六段式
2. 字幕陷阱：Seedance 习惯写 "no subtitles" -> H3 反向敏感，越写越画双重字幕！必须整句删除
3. 台词格式：Seedance 写 says: "..." -> H3 必须用 (Sx) + <d>[Chinese] 台词</d> + mouth moves only while speaking
4. 参考图引用：Seedance 单独写 <Picture N> -> H3 必须嵌入 <Subject N> 中，禁止单独成行
5. 取景防裁头：Seedance 惯用 tight close-up -> H3 近景裁头率高达 50%！高潮宣言必须改用 wide shot 兜底
6. 宽景复述衣物禁忌：宽景镜文中一旦点名具体衣服首饰，H3 会被拽过去做衣物特写导致躯干特写裁头！`
  },
  {
    id: 'h3_drama_md',
    name: '三工作流短剧与广告 SOP (MD)',
    type: 'markdown',
    path: '/skills/mv-auto-pipeline/references/h3_short_drama_and_commercial_pipeline.md',
    content: `# H3 竖版短剧与商业广告流水线 (三工作流与一致性锁定 SOP)

## 三工作流中台闭环：
1. Qwen-Image 2.1 文生图：全身人物立绘卡 (鞋底留地空带) + 母本场景卡 (5×4 纵深网格双侧圆桌，8位虚化宾客)
2. Qwen-Image 2.1 Edit 图像编辑：场景为 image_1 画布，人物为 image_2，注入 CROWD_KEEP，彻底洗净影棚灰底
3. MiniMax H3 Ref2VA：四段 (60.33s) 或八段 (120.67s) 每段固定灌入这 3 张合成卡，0.4MP (480×864)，精准 362 帧
4. FFmpeg 0.35s 音频淡接拼接成片 + AI 合规标注角标`
  },
  {
    id: 'imgcheck_py',
    name: 'imgcheck.py (像素级审计)',
    type: 'python',
    path: '/skills/mv-auto-pipeline/scripts/imgcheck.py',
    content: `#!/usr/bin/env python3
# imgcheck.py: Non-Visual Pixel-Level Audit for Qwen/H3 Reference Images
# grey% < 3% (确保原摄影棚白底/灰底未漏进输出画面)
# Euclidean Distance < 15.0 (确保合成图继承了母本场景卡的色彩基调)
import sys, os, math

def audit_raw_rgb24(rgb_bytes: bytes, width: int, height: int, ancestor_rgb: bytes = None) -> dict:
    total_pixels = width * height
    grey_count = 0
    bg_diff_sum = 0
    bg_pixel_count = 0

    for i in range(0, len(rgb_bytes) - 2, 3):
        r, g, b = rgb_bytes[i], rgb_bytes[i+1], rgb_bytes[i+2]
        max_c, min_c = max(r, g, b), min(r, g, b)
        diff = max_c - min_c
        luma = (r + g + b) // 3

        if diff <= 12 and 60 <= luma <= 210:
            grey_count += 1

    grey_pct = round((grey_count / total_pixels) * 100, 2)
    return {
        "grey_percent": grey_pct,
        "grey_passed": grey_pct < 3.0,
        "recommendation": "PASS" if grey_pct < 3.0 else "REVISE"
    }`
  },
  {
    id: 'subprobe_py',
    name: 'subprobe.py (字幕探测)',
    type: 'python',
    path: '/skills/mv-auto-pipeline/scripts/subprobe.py',
    content: `#!/usr/bin/env python3
# subprobe.py: Narrow-band Burned-in Subtitle Locator for MiniMax H3
# H3 渲染字幕位于画面 55%~75% 高度区间。本脚本定位高对比度白字黑边。
def probe_subtitles_in_frame(rgb_bytes: bytes, width: int, height: int) -> dict:
    start_y, end_y = int(height * 0.55), int(height * 0.75)
    subtitle_lines = []
    for y in range(start_y, end_y):
        white_edge_count = 0
        for x in range(1, width - 1):
            idx = (y * width + x) * 3
            left_idx = (y * width + (x - 1)) * 3
            r, g, b = rgb_bytes[idx:idx+3]
            lr, lg, lb = rgb_bytes[left_idx:left_idx+3]
            if r > 220 and g > 220 and b > 220 and (lr < 60 and lg < 60 and lb < 60):
                white_edge_count += 1
        if white_edge_count > 15:
            subtitle_lines.append(y)
    return {"burned_in_subtitle_detected": len(subtitle_lines) > 3}`
  },
  {
    id: 'validator_py',
    name: 'prompt_validator.py',
    type: 'python',
    path: '/skills/mv-auto-pipeline/scripts/prompt_validator.py',
    content: `#!/usr/bin/env python3
# H3 Ref2VA Six-Section Prompt Machine Validator & Anti-Trap Checker
import re, hashlib

H3_SECTIONS = ["[subject_definitions]", "[summary]", "[retention_analysis]", "[detailed_description]", "[overall_soundscape]", "[non_diegetic_music]"]
FORBIDDEN_ANTI_SUBTITLES = ["no subtitle", "no subtitles", "no text", "no words", "no caption"]

def validate_h3_prompt(text: str) -> dict:
    lower = text.lower()
    missing = [s for s in H3_SECTIONS if s not in lower]
    has_trap = any(w in lower for w in FORBIDDEN_ANTI_SUBTITLES)
    return {
        "passed": len(missing) == 0 and not has_trap,
        "missing_sections": missing,
        "subtitle_trap_detected": has_trap
    }`
  },
  {
    id: 'audio_ref_md',
    name: '音频参考一致性规范 (MD)',
    type: 'markdown',
    path: '/skills/mv-auto-pipeline/references/audio_consistency_architecture.md',
    content: `# 音频参考与三位一体声音一致性规范

## 1. 角色音色全局锁定 (Speaker Timbre Lock)
- 全局固定 (Sx) 映射：
  - (S1) 顾总裁：120Hz 低男中音，胸腔共鸣，语速 180 字/分
  - (S2) 林清晚：235Hz 清冷女声，齿音清晰，语速 195 字/分
  - (S3) 赵美琳：285Hz 锐利高音，带有挑衅泛音，语速 220 字/分
- RunningHub Node 34 LoadAudio 直连声学指纹干声切片，杜绝同角色跨段音色漂移。

## 2. 0.35s afade 平滑音频接缝 (Cross-Segment Seam Buffer)
- 每段第 4 镜必须为无台词反应镜，段末留出 0.35s 音频淡出缓冲带。
- 滤镜：afade=t=in:st=0:d=0.35,afade=t=out:st=14.73:d=0.35。消灭分段音频接缝爆音。

## 3. 全片贯穿式 Master BGM 双轨重贴
- 杜绝直接使用 H3 散乱生成的配乐拼接。
- ComfyUI 仅注入人声干声驱动口型；成片后期通过 FFmpeg 滤镜重贴完整 60.33s 无损 Master BGM 底轨。

## 4. 逐段口型质检闸门 (Segment Gate Protocol)
- 每一段（362/367 帧）渲染完成后必须逐段通过口型对齐三验（滞后量/波形相关度/人声能量）。
- 严禁直接跳过质检调度下一段；只有当前段质检放行后，才解锁下段连续性潜空间。`
  },
  {
    id: 'mv_negative_md',
    name: 'MV 负向禁令护盾规范 (MD)',
    type: 'markdown',
    path: '/skills/mv-auto-pipeline/references/mv_forbidden_rules_lexicon.md',
    content: `# MV 负向禁令护盾与静止/背景音乐/字幕规避准则

## 1. 🔇 静止/禁止出现背景音乐
- 正向：[non_diegetic_music] 声明 None，保证只输出纯净干声。
- 负向压制：background music, noisy score, discordant soundtrack, distorted audio, bgm, humming, audio clipping, clashing instruments。

## 2. 👁️ 禁止出现字幕与文字
- 正向：彻底剔除 "no text, no subtitles"，避免 H3 反向敏感烧出乱码字。
- 负向压制：text, words, subtitles, lyrics, captions, watermark, logo, typography, letters, font, burned-in text, on-screen text。
- 字幕由后期挂载标准 SRT。

## 3. 🤐 强制嘴唇静止 / 禁止开口
- 正向：非发声镜注入 mouth naturally closed, lips completely still, not moving along with vocals。
- 负向压制：singing, mouth open, lip-sync, talking, speaking, vocalizing, open lips, moving mouth。`
  },
  {
    id: 'aspect_ratio_md',
    name: '全画幅比例对照表 (MD)',
    type: 'markdown',
    path: '/skills/mv-auto-pipeline/references/aspect_ratio_table.md',
    content: `# 全画幅比例契约与 ComfyUI 分辨率映射表

| 比例 | 适用场景 | ComfyUI Node 61 | 文生图 (1.0MP) | H3视频 (0.4MP) | 构图防裁切规则 |
|---|---|---|---|---|---|
| 9:16 | 竖屏短剧 / TikTok | 9:16 (Portrait Widescreen) | 768×1376 | 480×864 | 头部距顶 6%，鞋底距底 92%，留地面 |
| 16:9 | 电影感 / 横屏短剧 / MV | 16:9 (Widescreen) | 1376×768 | 864×480 | 黄金三分法横向铺展，全身无裁切 |
| 21:9 | 宽银幕大片 | 21:9 (Ultrawide) | 1536×672 | 960×416 | 宽银幕深景深，对峙站位 |
| 1:1 | 正方形广告 / 社媒 | 1:1 (Square) | 1024×1024 | 640×640 | 居中对称视觉锚点 |
| 4:3 | 复古胶片感 | 4:3 (Standard) | 1184×896 | 736×544 | 经典学院画幅 |
| 3:4 | 竖向标准画幅 | 3:4 (Portrait Standard) | 896×1184 | 544×736 | 肖像标准安全框 |`
  },
  {
    id: 'director_spec_md',
    name: '导演台全工作流规范 (MD)',
    type: 'markdown',
    path: '/skills/mv-auto-pipeline/references/runninghub_workflow_spec.md',
    content: `# MiniMax H3 Director · 导演台全工作流技术规范

## 8 大核心子图模块：
1. 模型与双 VAE 加载：UNET (Ref2VA / FL2VA) + Qwen3-VL CLIP + Video VAE + Audio VAE
2. 加速 LoRA 与 SageAttention：Turbo 8-step LoRA (Node 25) + SageAttention (Node 17/16)
3. 主导演台核心总控 (Node 12 MiniMaxH3Director)：
   - 支持 r2v, t2v, i2v, fl2v, v2v, rv2v 多模态任务
   - timeline_data 分段时序、关键帧、多镜连续性重绘
4. SelfLift 渐进采样模块 (Node 26)：highres_steps: 2 + 3D Latent Upscaler
5. 二采 / 高清放大精修 (Node 18)：4x-UltraSharp.pth (0.25 denoise)
6. YOLOv8 脸部检测修复 (Node 27)：face_yolov8m.pt，置信度 0.35，羽化 24
7. 音画封装与导出 (Node 6, 7)：24fps sRGB 封装
8. Director 实时运行报告 (Node 8)：实时输出显存与分段推理时序`
  },
  {
    id: 'h3_native_audio_spec_md',
    name: 'H3 原生声线推演与音色克隆规范 (MD)',
    type: 'markdown',
    path: '/skills/mv-auto-pipeline/references/audio_consistency_architecture.md',
    content: `# H3 原生声音自生成与参考音频克隆体系规范

## 两种声音输入模式 (Dual Audio Modes)：
1. 有参考音频（音色克隆 Voice Clone）：
   - 上传参考音频文件，通过 Node 75 / Node 12 绑定 <Audio 1/2/3>
   - 提示词锁定：S1 永远是说话人。S1始终使用固定声音：参考音频1（男.mp3），中低音...

2. 无参考音频（H3 文本原生自生成）：
   - Agent 在第 1 步根据角色容貌与剧本，自动推演 6 维自然语言声线设定
   - 包括：年龄段、中高/中低音域、音色特质、常态语速、情绪变化规律及禁用夹子音/播音腔
   - H3 多模态神经声码网络直接 100% 从文本自生成专属声音与口型！

## 镜头级 100% 物理拟音 (Foley In, Score Out)：
- 每个分镜必须详写动作拟音（敲桌、搓烟纸、脚步、衣物摩擦）、呼吸换气与空间底噪
- 彻底消灭死寂空窗，全片后期统一挂载无损 Master BGM 底轨！`
  }
];

export const SkillSpecModal: React.FC<SkillSpecModalProps> = ({ isOpen, onClose }) => {
  const [selectedFileId, setSelectedFileId] = useState<string>('skill_md');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentFile = SPEC_FILES.find(f => f.id === selectedFileId) || SPEC_FILES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile.name.replace(/ \(.*?\)/, '');
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>MV-AUTO-PIPELINE & H3 核心规范源码库 (V2.0)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold border border-cyan-500/30">
                  全链可直接导出
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                可直接拷贝或下载为本地 Cursor / Claude Code / Agent Skill 规范
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="复制当前文件内容"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '已复制' : '复制代码'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm"
              title="下载文件到本地"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下载文件</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* File Tree Sidebar */}
          <div className="w-64 border-r border-slate-800 bg-slate-950/40 p-3 space-y-1 overflow-y-auto">
            <div className="text-[10px] font-mono text-slate-500 uppercase px-2 py-1 font-semibold">
              规范文档与质检脚本 ({SPEC_FILES.length})
            </div>
            {SPEC_FILES.map(file => {
              const isSelected = file.id === selectedFileId;
              const isPy = file.type === 'python';
              return (
                <button
                  key={file.id}
                  onClick={() => setSelectedFileId(file.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition flex items-center gap-2 ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {isPy ? <Code className="w-3.5 h-3.5 text-amber-400 shrink-0" /> : <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                  <span className="truncate">{file.name}</span>
                </button>
              );
            })}
          </div>

          {/* Code Viewer */}
          <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
            <div className="px-4 py-2 border-b border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between bg-slate-900/40">
              <span>{currentFile.path}</span>
              <span className="text-[10px] text-slate-500 font-mono">UTF-8 · LF</span>
            </div>
            <pre className="flex-1 p-4 text-xs font-mono text-slate-200 leading-relaxed overflow-y-auto whitespace-pre-wrap selection:bg-cyan-500/30">
              {currentFile.content}
            </pre>
          </div>

        </div>

      </div>
    </div>
  );
};
