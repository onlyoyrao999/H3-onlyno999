# MV-AUTO-PIPELINE Skill 资源包 (V2.1)

本目录为 `mv-auto-pipeline` 专用 Skill 规范包，全链打通 **【音乐 MV】**、**【竖版 15 秒/362 帧短剧 (Short Drama)】** 与 **【商业广告 (Commercials)】** 三大题材生产。
内含全套 SOP 规范文档、两段式规划器（Awesome-Seedance 故事构思 ➔ MiniMax H3 官方 Ref2VA 规范转译）、**15 秒原子单元单次出片法则**、全画幅比例设定、**智能空间站位审图门禁**、**镜头级 100% 拟音全覆盖**，以及针对 **RunningHub (www.runninghub.cn)** 官方 Director 工作流（ID: `79e9753c-d7eb-464f-b072-38c26f869748`）的完整调用实现。

---

## 目录结构

```
skills/mv-auto-pipeline/
├── README.md                                # 本说明文档
├── SKILL.md                                 # Skill 主定义文件（遵循 AI Studio Skill 规范）
├── references/                              # 理论规范与技术文档
│   ├── h3_official_ref2va_rules.md          # MiniMax H3 官方规范 vs Awesome-Seedance 差异辨析
│   ├── h3_short_drama_and_commercial_pipeline.md # 三工作流短剧与广告 SOP (Qwen T2I ➔ Edit ➔ H3)
│   ├── aspect_ratio_table.md                # 全画幅比例契约与 ComfyUI 分辨率映射表 (9:16/16:9/21:9/1:1)
│   ├── audio_consistency_architecture.md    # 音频参考与三位一体声音一致性规范 (Sx 音色+0.35s afade)
│   ├── mv_forbidden_rules_lexicon.md        # MV 负向禁令护盾与静止/背景音乐/字幕规避准则
│   ├── six_iron_rules.md                    # 九大不可动摇铁律详解
│   ├── sop_12_steps_8_gates.md              # 十二步全链流程与八道 HTML 审核关
│   └── runninghub_workflow_spec.md          # RunningHub 节点参数映射规范
└── scripts/                                 # 自动化执行与门禁校验脚本
    ├── runninghub_client.py                 # RunningHub OpenAPI 任务派发与轮询客户端
    ├── prompt_validator.py                  # H3 官方六段式提示词机器自动化体检脚本
    ├── imgcheck.py                          # 像素级灰底监测脚本 (grey% < 3% 且欧氏距离 < 15)
    ├── subprobe.py                          # 窄带烧入字幕探测脚本 (定位 55%~75% 画面高度)
    ├── vcheck.py                            # 逐帧视频质量与曝光审计脚本
    └── duration_fitter.py                   # 17n+5 视频时长与 362 帧贴合脚本
```

---

## 核心生产技术要点

### 1. 15 秒（362 帧）原子单元出片法则
- 绝不拆成 3~4 秒的碎片镜头，单次渲染固定为 **15.083 秒（362 帧 @ 24fps）**。
- 单段装载 1 个主场景 + 1 次微型戏剧转折 + 1 条完整动作链 + 36～44 字台词，末帧定格姿态无缝咬合下一段。

### 2. 声音系统：支持有/无参考音频双模式
- **有参考音频（音色克隆）**：上传参考音频文件，在提示词中声明 `S1 始终使用一种固定的声音：参考音频1（男.mp3）...`，模型进行像素级声音克隆。
- **无参考音频（H3 原生自生成）**：Agent 在第 1 步全自动分析角色与剧本，自动写入自然语言声线特征（年龄、音域、性格、语速与禁令），H3 神经声码网络直接从文本自生成专属音色与对白口型！

### 3. 多模态空间逻辑与构图智能审图门禁
- **左右站位与 180° 轴线**：核验男女左右坐标，严禁越轴颠倒；
- **物理立足与重力逻辑**：双脚稳固着地或自然依坐，严禁悬空与踩桌穿模；
- **防走廊狭长陷阱**：中央走道收窄至 1 张桌宽，两侧铺满圆桌与宾客；
- **脚底下边缘留空 8.5%**：鞋底距底边保留空隙，杜绝断脚下坠感；
- **道具交互与落版收束**：手持道具朝向、持握手与尾帧依偎姿势 100% 对齐。

### 4. 镜头级 100% 物理拟音全覆盖 (Foley In, Score Out)
- 每镜必须配置微观动作拟音（敲击/摩擦/脚步）、生理拟音（换气/吞咽/叹气）与宏观空间底噪，彻底杜绝无声死寂；
- 负向提示词全量封杀配乐（`background music, bgm, score`），全片统一由后期外挂无损 Master BGM 底轨。

### 5. 智能资产分流与跨段尾帧自动垫图接力 (Smart Asset Routing & Tail-Frame Chaining)
- **有图走图生图 (Image-to-Image)**：用户上传主角/场景图时，自动提取面部与服饰特征，进行换装换景与姿势重绘；
- **无图走文生图 (Text-to-Image)**：剧本出现新场景（如 80 年代红砖老房子/斑驳木桌/旧日历）或未提供角色时，自动文生图生成场景母本卡并锁定为全剧背景；
- **跨段自动截取尾帧垫图**：前一段 15 秒（362 帧）渲染完成时，后台自动提取末尾 362 帧作为下一段的垫底参考图（以图生图驱动），确保老房子的桌椅摆设、墙壁光影与角色站位 100% 连贯无跳切！

---

## RunningHub 官方 MiniMax H3 Director 核心节点映射参数表

* **平台**：[RunningHub (www.runninghub.cn)](https://www.runninghub.cn)
* **官方工作流 ID**：`79e9753c-d7eb-464f-b072-38c26f869748`
* **邀请码**：`wefjn44t`（赠送 1000 RH 币）

| 模块 | 节点类型 | Node ID | 字段 | 功能与注入内容 |
| :--- | :--- | :--- | :--- | :--- |
| **主导演台** | `MiniMaxH3Director` | **12** | `task_type` | `r2v — 参考生视频` / `t2v` / `i2v` / `fl2v` / `v2v` |
| **主导演台** | `MiniMaxH3Director` | **12** | `global_prompt` | H3 官方六段式全局主体与场景定义 (`<Subject N>` 锚定) |
| **主导演台** | `MiniMaxH3Director` | **12** | `timeline_data` | 15 秒标准分段时序 JSON 数据 |
| **主导演台** | `MiniMaxH3Director` | **12** | `total_frames` | 严格锁定 **362 帧**（对应 15.083 秒） |
| **主导演台** | `MiniMaxH3Director` | **12** | `width / height` | 9:16 (736×1280) / 16:9 (1280×736) / 1:1 (1024×1024) |
| **主导演台** | `MiniMaxH3Director` | **12** | `seed` | 独立随机采样噪波种子（锁定画风） |
| **加速 LoRA** | `LoraLoaderModelOnly` | **16** | `strength_model` | Turbo 8-step LoRA（强度 1.0，8 步极速推理） |
| **二采精修** | `ResolutionSelector` + `SamplerCustomAdvanced` | **58 / 51** | `aspect_ratio` / `sigmas` | 2MP 高清二次重采样放大精修 |
| **二采惰性开关** | `LazySwitch1way` | **109** | `boolean` | TRUE 开启 2MP 二采精修；FALSE 原片直出 |
| **音画封包** | `CreateVideo` + `SaveVideo` | **106 / 107** | `fps` / `filename_prefix` | 24fps sRGB 音画对齐封包与最终 MP4 导出 |
| **二采精修输出** | `VHS_VideoCombine` | **72 / 150** | `filename_prefix` | `H3_Ref2VA二采` 高清精修备份轨 |

---

## 📄 README 实时同步更正指令 (Sync Directive)

* **最高纪律**：无论后续工程代码进行了任何新增功能、参数字段变更、工作流配置增减或算法调优，**必须始终无条件同步更正根目录 `/README.md` 与本目录 `skills/mv-auto-pipeline/README.md`**。
* **三位一体验证**：确保 **代码 (Code)**、**文档 (READMEs & SKILL.md)**、**机检清单 (Checklists)** 实时咬合一致，禁止单侧更新。
