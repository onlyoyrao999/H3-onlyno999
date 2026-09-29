# MiniMax H3 全自动视频生成流水线 (MV · 短剧 · 广告)

> **一键视频全自动化生成平台与 SOP 工作台 (V2.2 - H3 官流终极版)**  
> 用音乐 MV 的工程级严密流程（12步8关、时间轴锚定、对齐三验、成本台账、硬门禁拦截），  
> 统一扩展与赋能 **【音乐 MV】**、**【竖版短剧 (Short Drama)】** 与 **【商业广告 (Commercials)】** 三大题材生产。  
> 独创**「两段式规划法」**：调用 Awesome-Seedance 设计文学剧本故事 ➔ 一键转译为 MiniMax H3 官方 Ref2VA 规范，  
> **全面接入 H3 官流终极版（支持图生视频、文生视频、视频参考、多图矩阵）**，  
> 搭载**大白话安全脱敏**、**跨段视频参考接力（100% 杜绝变脸漂移）**与**镜头级 100% 物理音效全覆盖**，直通 RunningHub (RH) 云端一键出片！

---

## 🎯 核心解决的痛点与系统级创新突破

### 1. 🎬 跨段视频与多角度细节抽卡接力 (Multi-Detail Keyframe & Video Chaining) —— 彻底根治角色变脸与服装细节缺失！
- **痛点**：传统多段短剧在生成第 2 段、第 3 段时容易发生面容与服饰漂移（例如裤套标志缺失、臂章位置错乱或变脸）。
- **终极解法：10 秒分段 + 3张多角度细节定妆矩阵抽卡 + 视频参考双通道接力**！
- **自动化工作流闭环**：
  1. **第 1 段 (10s / 243f) 生成**：使用初始角色卡或文生图生成第 1 段视频；
  2. **多角度细节抽卡矩阵 (3张组合)**：第 1 段 10s 渲染完成后，系统自动按时序精准抽取 **3 张多角度细节图**：
     * `<Picture 1>` (`ref_image_0`): 全身完整定妆卡 (Full-Body) -> 锁全局比例与站位；
     * `<Picture 2>` (`ref_image_1`): 上半身/胸口标识特写卡 (Upper Body) -> 锁“铁蛋”标识与 Emoji 屏；
     * `<Picture 3>` (`ref_image_2`): 下半身/腿套细节特写卡 (Lower Body) -> 锁红色裤套/花纹与鞋履；
  3. **第 2 段自动多图灌入**：将上述 3 张细节卡同时灌入 Node 137, 139, 167，同时将第 1 段成片作为 `ref_video_0` 灌入 Node 175；
  4. 100% 确保全剧人物角色、服装商标印花、腿套花纹与动作连贯性零缺失、零漂移！

### 2. 🖼️ 多图主体参考矩阵（支持最多 6+ 张 Picture 参考图）
- **Node 137 (`ref_image_0` / `<Picture 1>`)**：主角全身三视图 / 主人物面容卡；
- **Node 139 (`ref_image_1` / `<Picture 2>`)**：第二主体 / 配角 / 核心道具（如大黄牛、饮料罐）；
- **Node 167 (`ref_image_2` / `<Picture 3>`)**：场景母本卡（如 80 年代红砖老房子 / 乡村菜地）；
- **Node 173, 172, 171 (`ref_image_3~5`)**：扩展角色卡、起始画面构图参考图（`<Picture 4>`）；
- **全方位硬锁**：多图 + 视频参考双重锁合，彻底杜绝模型自由脑补。

### 3. 🛡️ 大白话安全脱敏引擎 (Anti-integrity_check_failed)
- **痛点**：大白话剧本中常有“被牛撞飞”、“打架互殴”、“车祸”等词汇，直接发送会触发平台内容安全风控拦截抛错。
- **解法**：在第 1 步提示词转译引擎中自动执行影视级安全脱敏：
  * “被大黄牛撞飞” ➔ 转译为 “大黄牛向前猛冲顶起，机器人身形夸张滑稽地轻盈腾空翻转两周半，稳稳坐落在松软草垛上，激起一圈金黄色草屑（滑稽动作喜剧，卡通物理弹跳，无真实物理伤害）”；
  * 100% 绕过安全策略拦截，画面观赏性与喜剧张力更强！

### 4. 严格锁定 10 秒 / 15 秒（362 帧）标准节拍
- 符合 H3 17n+5 帧数公式：
  $$\text{frames} = \max(5, \text{round}(a \times 24)) + \left(5 - (\max(5, \text{round}(a \times 24)) \bmod 17)\right) \bmod 17$$
- **10 秒** = 243 帧；**15 秒** = 362 帧；
- **1 分钟短剧** = 4 段 × 15 秒（60.33 秒 / 1448 帧）；
- 每段预留 0.35s 段末对白留白，配合 FFmpeg 交叉淡化，拼合出大电影级一镜到底体验。

---

## 🔗 RunningHub (RH) MiniMax H3 官流终极版配置

* **平台官网**：[RunningHub (www.runninghub.cn)](https://www.runninghub.cn)
* **官方工作流地址**：[H3 官流终极版](https://www.runninghub.cn/post/2084788947984666625/?inviteCode=zedwxo2q)
* **工作流 ID**：`2084788947984666625`
* **官方邀请码**：`zedwxo2q`（填写送 1000 RH 币）
* **核心节点与参数映射表**：

| 模块 | 节点类型 | Node ID | 核心功能与字段配置 |
| :--- | :--- | :--- | :--- |
| **H3 视频参考总控** | `MiniMaxH3ReferenceToVideo` | **136** | **核心出片枢纽**：接收提示词、多图参考、视频参考、音频参考与画幅尺寸 |
| **🎬 视频参考输入** | `VHS_LoadVideo` | **175** | **跨段一致性神器**：`video` 字段载入上一段视频路径，实现无缝接力 |
| **多图参考矩阵** | `LoadImage` | **137 / 139 / 167 / 173 / 172 / 171** | 分别接入 `<Picture 1>` 至 `<Picture 6>` 角色/场景母本卡 |
| **提示词输入** | `PrimitiveStringMultiline` | **138** | `value`: H3 官方六段式提示词 |
| **时长控制器** | `PrimitiveFloat` + `ComfyMathExpression` | **132 / 131** | `value`: 10.0 / 15.0 秒，自动计算 17n+5 帧数 |
| **画幅选择器** | `ResolutionSelector` | **115** | `aspect_ratio`: 9:16 (Portrait) / 16:9 (Widescreen) / 1:1 (Square) |
| **音频参考** | `LoadAudio` | **174** | `audio`: 挂载角色专属音色参考干声 |
| **音画合成与导出** | `VHS_VideoCombine` | **148** | 输出标准 24fps H.264 MP4 视频成片 |

---

## 🚀 命令行 CLI 派发与视频参考接力

```bash
# 1. 生成第 1 段 (P01) - 使用多图参考：
python3 rh_h3.py --shot P01 --duration 10.0 \
  --ref-image-0 "workspace/tiedan_character.png" \
  --ref-image-1 "workspace/cow.png" \
  --prompt "铁蛋在菜地拔菜，语调欢快..." \
  --api-key "你的RunningHub_Key"

# 2. 生成第 2 段 (P02) - 直接将 P01 成片作为视频参考 (Node 175) 连贯接力：
python3 rh_h3.py --shot P02 --duration 10.0 \
  --ref-video "workspace/tiedan_p01.mp4" \
  --prompt "承接上一段，铁蛋在木桥上被大黄奔跑追赶..." \
  --api-key "你的RunningHub_Key"
```

---

## 🛠️ 多段 FFmpeg 零重影无缝终剪脚本 (Zero-Ghosting Seamless Concat Engine)

```bash
# 彻底解决每 10 秒接缝处的重影与叠影（禁用视频淡化混合，自动切除第 2 段起的第 0 帧重复垫图帧）：
ffmpeg -y -v error \
 -i P01_10s.mp4 -i P02_10s.mp4 -i P03_10s.mp4 -i P04_10s.mp4 -i master_bgm.wav \
 -filter_complex "
   [0:v]setpts=PTS-STARTPTS[v0];[0:a]asetpts=PTS-STARTPTS[a0];
   [1:v]select='gt(n\,0)',setpts=PTS-STARTPTS[v1];[1:a]asetpts=PTS-STARTPTS[a1];
   [2:v]select='gt(n\,0)',setpts=PTS-STARTPTS[v2];[2:a]asetpts=PTS-STARTPTS[a2];
   [3:v]select='gt(n\,0)',setpts=PTS-STARTPTS[v3];[3:a]asetpts=PTS-STARTPTS[a3];
   [v0][v1][v2][v3]concat=n=4:v=1:a=0[vconcat];
   [a0][a1][a2][a3]concat=n=4:v=0:a=1[adialogue];
   [4:a]volume=0.45[abgm];
   [adialogue][abgm]amix=inputs=2:duration=first:dropout_transition=2[aout]" \
 -map "[vconcat]" -map "[aout]" -c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p \
 -c:a aac -b:a 192k -movflags +faststart 成片_零重影无缝短剧.mp4
```

---

## 📁 目录结构速查

```
├── rh_h3.py                                     # RunningHub 官流终极版 OpenAPI 调度客户端
├── skills/
│   └── mv-auto-pipeline/
│       ├── SKILL.md                             # 全自动流水线 SOP 规范
│       └── README.md                            # 流水线完整文档
├── src/
│   ├── components/ThreeWorkflowAssetStudio.tsx  # 三工作流资产中台与多图/视频参考
│   └── utils/h3PromptEngine.ts                  # 大白话安全脱敏与六段式提示词引擎
```
