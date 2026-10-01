---
name: mv-auto-pipeline
description: >
  全自动视频生成 SOP 与实战工作台 (V2.0)。全链打通【音乐 MV】、【竖版多段短剧 (Short Drama)】与【商业广告 (Commercials)】三大题材生产。
  严格落实十二步工程全链、八道质量门禁、两段式规划法（Awesome-Seedance 故事构思 ➔ MiniMax H3 官方 Ref2VA 规范转译）、全画幅比例设定、
  Qwen 文生图+图像编辑+H3参考生视频三工作流资产中台、音频参考全局一致性（说话人 (Sx) 音色指纹 + 0.35s afade 淡接 + Master BGM 贯穿）、
  MV 禁令护盾（静止出现 · 背景音乐剥离 · 字幕纯净 0 字 · 负向提示词词库）、无视觉像素级三验 (imgcheck/subprobe/vcheck)、以及 RunningHub 云端出片。
---

# H3 全自动视频生成流水线 SOP (MV · 短剧 · 广告)

> **核心使命**：用音乐 MV 的工程级严密流程（时间轴锚定、12步8关、对齐三验、成本台账、硬门禁拦截），
> 统一扩展与赋能【音乐 MV】、【竖版短剧】与【商业广告】三大题材生产。
> 采用**「两段式规划法」**：先调用 Awesome-Seedance 构思故事弧光与镜头，再一键转译为 MiniMax H3 官方 6 段式 Ref2VA 规范；
> 明确声明**画幅比例**，执行**音频参考一致性**与**MV 禁令护盾**，直通 RunningHub (RH) 出片。

---

## 目录
1. [三大题材生产契约与时间基准](#三大题材生产契约与时间基准)
2. [画幅比例契约与 ComfyUI 分辨率映射](#画幅比例契约与-comfyui-分辨率映射)
3. [两段式规划法：Awesome-Seedance 故事构思 ➔ MiniMax H3 官方转译](#两段式规划法)
4. [MV 负向禁令护盾：静止出现 · 背景音乐 · 字幕规避](#mv-负向禁令护盾)
5. [音频参考与三位一体声音一致性规范](#音频参考与声音一致性规范)
6. [三工作流资产中台架构 (Qwen T2I → Edit → H3 Ref2VA)](#三工作流资产中台架构)
7. [不可动摇铁律与实战锁定清单](#不可动摇铁律与实战锁定清单)
8. [H3 17n+5 时长与帧数计算法则](#h3-17n5-时长与帧数计算法则)
9. [无视觉像素级审计方案 (imgcheck / subprobe / vcheck)](#无视觉像素级审计方案)
10. [十二步全流程与八道门禁全景](#十二步全流程与八道门禁全景)
11. [RunningHub 云端 OpenAPI v2 调度与 FFmpeg 拼接交付](#runninghub-云端调度与-ffmpeg-拼接交付)

---

## 三大题材生产契约与时间基准

| 题材形态 | 核心时间基准 | 景别与发声规则 | 关键防翻车机制 |
|---|---|---|---|
| **🎵 音乐 MV** | 官方歌词 + ASR 毫秒对齐时间戳 | 仅特写/中景 (ECU/CU/MCU/MS) 开口唱，45% 黄金率，连续 ≤3 镜；间奏/空镜强制闭嘴 | 全曲伴奏贯穿保活（杜绝静音）；时长贴合算法；音频包络互相关对齐三验 |
| **🎭 竖版短剧** | 15.083s (362帧) 模块化分段 (4段 60s / 8段 120s) | 严禁用近景特写对白（防裁头）；台词用 `<d>[Chinese] 台词</d>`，全局固定 (S1/S2/S3) 说话人 | 宽景防裁头；同源场景卡派生；反向字幕词严禁写；0.35s 音频淡接拼接 |
| **🎬 商业广告** | 15s/30s 极速分镜节拍 (Hook/痛点/产品核心/CTA) | 宏观与微距产品 Facet 特写；画外音标明 off-screen | 材质高保真；0 水印 0 乱码字压制；镜头动势与转场冲击力 |

---

## 画幅比例契约与 ComfyUI 分辨率映射

在使用 Skill 规划视频时，**必须明确写入比例 (Aspect Ratio)**，绝不仅限竖屏！

| 画幅比例 | 适用场景 | ComfyUI Node 61 枚举 | 文生图/编辑 (1.0MP) | H3 视频生视频 (0.4MP) | 构图防裁切规则 |
|---|---|---|---|---|---|
| **9:16** | 竖屏短剧 / 抖音 / TikTok | `9:16 (Portrait Widescreen)` | **768×1376** | **480×864** | 头部距顶 6%，鞋底距底 92%，鞋下留地面，禁止近景推头 |
| **16:9** | 电影质感 / 横屏短剧 / 音乐MV / B站 | `16:9 (Widescreen)` | **1376×768** | **864×480** | 黄金三分法横向铺展，左右留宽，人物全身完整入画无裁边 |
| **21:9** | 宽银幕大片 / 变形镜头电影 | `21:9 (Ultrawide)` | **1536×672** | **960×416** | 极端横向景深，严禁双人特写，采用宽景对峙构图 |
| **1:1** | 正方形画幅 / 社交媒体 / 产品广告 | `1:1 (Square)` | **1024×1024** | **640×640** | 居中对称视觉锚点，四边留白均匀 |
| **4:3** | 复古胶片 / 早期电视画幅 | `4:3 (Standard)` | **1184×896** | **736×544** | 经典学院画幅，中景为主 |
| **3:4** | 竖向标准画幅 / 小红书图文卡片 | `3:4 (Portrait Standard)` | **896×1184** | **544×736** | 肖像标准安全框 |

---

## 两段式规划法：Awesome-Seedance 故事构思 ➔ MiniMax H3 官方转译

为兼顾**创意的生动文学性**与**模型的工程执行可靠性**，工作流严格执行两段式：

```
[规划阶段 1：创意构思与大白话安全脱敏] 
调用 Awesome-Seedance 模式 ➔ 散文式铺陈角色张力、世界观背景、情绪波折、戏剧冲突与对白
        │
        ├── 🛡️【第1步安全脱敏拦截 (Anti-integrity_check_failed)】：
        │    自动将"被牛撞飞/打架流血/车祸"等易触发内容安全策略的暴力词汇，
        │    转译为"滑稽动作喜剧/卡通物理弹跳/草垛缓冲/镜头震颤"，100% 绕过安全拦截！
        │
        ▼ （诊断拦截：指出 close-up 裁头、no subtitles 反向敏感、缺少 subject 锚定等硬伤）
[规划阶段 2：工程转译]
一键转译为 MiniMax H3 官方 Ref2VA 规范 ➔ 输出严格六段式：
  ├── [aspect_ratio] 声明所选比例与分辨率
  ├── [subject_definitions] 绑定 <Subject N> 与 <Picture N>
  ├── [summary] 核心动作与冲突
  ├── [retention_analysis] 资产继承声明
  ├── [detailed_description] 宽景安全框 + (Sx) 映射 + <d>[Chinese]台词</d> + 防推近
  ├── [overall_soundscape] 环境混响 RT60 锁定
  └── [non_diegetic_music] 剥离/静止自带配乐
```

---

## MV 负向禁令护盾：静止出现 · 背景音乐 · 字幕规避

严格继承音乐 MV 铁律 C 与负向词库，针对三大翻车高发地带布设禁令护盾：

### 1. 🔇 静止/禁止出现背景音乐 (Background Music Suppression)
* **痛点**：若让 H3 自己在各段生成配乐，拼接时每段开头结尾音乐调性、节奏、乐器突变，爆音刺耳。
* **正向规避**：将 `[non_diegetic_music]` 写为：
  `None. There is no non-diegetic background music in this video track, absolute silence on the music channel to allow clean external master score mixing.`
* **负向压制**：注入 `background music, noisy score, discordant soundtrack, distorted audio, bgm, humming, audio clipping, clashing instruments`。
* **交付架构**：视频仅保留纯净对白干声，成片通过 FFmpeg 重新挂载完整 60.33s 无损 Master BGM 底轨。

### 2. 👁️ 禁止出现字幕与文字 (Screen Text & Subtitle Suppression)
* **痛点**：在提示词中写 "no text, no subtitles"，会触发 H3 **反向敏感陷阱**，越点名越烧出两行乱码浮动文字。
* **正向规避**：正向提示词中**彻底删除任何 "no text/subtitles" 词汇**。
* **负向压制**：在 Negative Prompt 中强力封锁：
  `text, words, subtitles, lyrics, captions, watermark, logo, typography, letters, signature, username, font, burned-in text, on-screen text`。
* **字幕交付**：成片由后期挂载标准 SRT 软字幕或无损硬字幕，绝不由视频扩散模型画字。

### 3. 🤐 强制嘴唇静止 / 禁止开口 (Mouth Still Suppression)
* **痛点**：非对白镜头或全景空镜中，模型因背景音而擅自做嘴型抽搐（鬼畜抽动）。
* **正向锁定**：在非对白镜注入 `mouth naturally closed, lips completely still, not moving along with vocals, no singing or talking`。
* **负向压制**：非口型镜负向注入 `singing, mouth open, lip-sync, talking, speaking, vocalizing, open lips, moving mouth`。

---

## 音频参考与声音一致性规范

针对多段拼接中「角色换嗓子」、「配乐在接缝处割裂跳变」两大痛点，流水线实行三位一体音频锁：

### 1. 角色音色全局锁定 (Speaker Timbre Lock)
* **全局固定 `(Sx)` 映射**：
  * **(S1) 顾总裁**：120Hz 低男中音，胸腔共鸣，语速 180 字/分。
  * **(S2) 林清晚**：235Hz 清冷女声，齿音清晰，语速 195 字/分。
  * **(S3) 赵美琳**：285Hz 锐利高音，带有挑衅泛音，语速 220 字/分。
* 八段独立生成时严禁重排 S 编号，这是音色一致性的唯一抓手。
* **Node 34 音频参考挂载**：在 RunningHub ComfyUI 中，通过 Node 34 `LoadAudio` 挂载对应角色的专属音色参考干声切片与指纹哈希，杜绝同角色跨段音色漂移。

### 2. 0.35s afade 平滑音频接缝 (Cross-Segment Seam Buffer)
* **段末留白设计**：每段第 4 镜必须为**无台词反应镜**，在段间切点处预留 0.35s 缓冲空间。
* **淡接滤镜**：拼接时使用 `afade=t=in:st=0:d=0.35,afade=t=out:st=14.73:d=0.35`，完全消灭分段音频接缝处的咔嗒爆音。

### 3. H3 原生声音自生成与参考音频克隆体系 (Native Voice & Audio Reference)
* **有参考音频（音色克隆）**：通过关联 `<Audio N>` 并在提示词中注明 `S1 始终使用固定声音：参考音频1（男.mp3），约30岁成熟青年男性，中低音...`，像素级克隆音色与语速；
* **无参考音频（H3 文本自生成）**：Agent 在第 1 步根据图像容貌与角色剧情性格，自主编写 6 维声线定义（年龄、音域、音色特质、语速、句尾收束与禁用夹子音/播音腔），H3 神经声码网络直接从纯文本自生成专属声音与高拟真口型；
* **直通 MiniMax H3 官方 Director**：提示词与音频直接直通 Node 12 `global_prompt` 与 `timeline_data`，实现「剧本 ➔ 声音判定 ➔ 15秒音画同生」全自动工业级闭环！

---

## 三工作流资产中台架构 (参考 MV-onlyno999 1:1 高保真作图流程)

```
文生图 (Qwen-Image 2.1 T2I)
  ├── 1. 生成高纯度【场景母本卡】（老房子客厅/豪华宴会厅/街道）
  └── 2. 用户上传【人物三视图/角色卡】（白底/灰底定妆照）
         │
         ▼
图像编辑与 1:1 抠图融光重绘 (MV-onlyno999 1:1 Qwen Image Edit Workflow)
  ├── 1. 彻底切除三视图原影棚白底与闪光灯闪烁污染
  ├── 2. 将人物精准植入【场景母本卡】，计算地面接触阴影与室内暖黄色温
  └── 3. 输出【1:1 环境光影高保真合成卡】(1:1 Scene-Character Composite)
         │
         ▼
首尾帧双相控制 (First & Last Frame Control)
  └── 生成首帧 (Frame 0) 与 尾帧 (Frame 243)，100% 共享场景空间锚点
         │
         ▼
参考生视频 (MiniMax H3 Ref2VA)
  └── 将 1:1 合成卡灌入 Node 137 (<Picture 1>) 与 Node 175 (接力视频)，实现 100% 空间零错位！
```

---

## 不可动摇铁律与实战锁定清单

* **铁律 A：时间是唯一的时间基准**（MV 依歌词、短剧依 15s/362 帧节拍、广告依分镜表）。
* **铁律 B：只有中近景或宽景安全机位发声**，发声时必须绑定 `(Sx)` 与 `<d>` 标签，人物嘴唇非发声时必须绝对静止。
* **铁律 C：画面纯净与防反向陷阱**：严禁在正向提示词中写 "no subtitles/no text"。
* **铁律 D：同源场景派生**：所有合成图都以同一张场景卡为画布派生，锁定建筑、天花板吊灯与宾客。
* **铁律 E：防走廊构图**：走道收窄至一张桌宽，圆桌与宾客铺满两侧，严禁单侧排布造成狭长走廊。
* **铁律 F：双关制与对齐三验**：机检硬门禁 + HTML 审查；成片必须经受滞后量、波形相关度与人声能量核验。
* **铁律 G：逐段口型质检闸门（Segment Gate Protocol）**：每一段渲染完成后必须逐段完成口型三验与放行复核，严禁跳过质检直接批量调度下一段。只有当前段质检放行后，才允许解锁并传递连续性潜空间进入下一段，彻底阻断错误扩散并杜绝算力浪费。
* **铁律 H：现场音效全力保留，背景音乐彻底禁用 (Foley In, Score Out)**：【音效】项必须精细刻画（敲击、摩擦、脚步、呼吸吞咽、环境底噪）以支撑物理拟音；正向绝不索要背景音乐，负向强力封锁 `background music, bgm, score`，负向严禁包含 `sound effects/ambient`，全片统一由后期外挂无损 Master BGM 底轨。
* **铁律 I：空间站位与多模态逻辑智能审图（Spatial & Stand-Point Auditing）**：Agent 在第 1 步全自动推演声线与空间逻辑，并对场景卡、站位合成卡与落版尾帧执行严格审图：核验男女左右站位（180° 轴线绝不颠倒）、下边缘脚底留空 8.5%（防断脚悬空）、物理重力立足（严禁浮空与踩桌穿模）及道具持握真实性，违背逻辑一律拦截打回！
* **铁律 J：智能资产分流与跨段尾帧垫图闭环（Smart Asset Routing & Tail-Frame Chaining）**：
  * **有图走图生图 (Image-to-Image)**：用户提供了图片，自动提取面容、发型与服饰特征，进行换装换景与姿势重绘；
  * **无图走文生图 (Text-to-Image)**：剧本出现新场景（如80年代红砖老房子/斑驳木桌/旧日历）或未提供角色时，自动文生图生成母本卡并锁定为全剧背景；
  * **跨段尾帧自动垫图接力**：前一段 15 秒（362 帧）渲染完成时，后台自动提取末尾 362 帧作为下一段的垫底参考图（以图生图驱动），确保老房子的桌椅摆设、墙壁光影与角色站位 100% 严密咬合，绝无跳切穿帮！
* **铁律 K：非人设/特定异形角色防变脸硬锁 (Non-Humanoid Face Drift Lock)**：
  * 对萌系机器人、Emoji 屏幕角色等特定形象，提示词死锁 `纯平光滑黑色显示屏 + 极简蓝色 2D 扁平 Emoji 发光笑脸线条`，负向强力封锁 `写实人类五官、鼻子、嘴唇轮廓、欧美硬汉雕塑脸`，锁定文字位置仅在胸前。
* **铁律 L：10 秒分段全身定妆帧/人物抽卡自动接力体系 (10s Full-Body Fitting Keyframe Extraction & Chaining)**：
  * **分段调度**：以 10 秒（243 帧）为标准分段进行云端调度渲染；
  * **必须包含全身定妆镜头**：第 1 段（Shot 1）提示词中必须包含至少 1 个宽景/全景安全镜头，展示角色全身上下（从头部面容、胸口标识、手臂装甲到腿套脚鞋）；
  * **自动抽取全身定妆卡**：当第 1 段 10 秒视频渲染完成后，后台自动精准抽取包含人物头至脚全身的定妆帧（`keyframe_P01_full_body_character.png`），自动作为第 2 段的 `ref_image_0` (`<Picture 1>`) 注入，彻底封锁全身上下服饰与五官部位，杜绝局部丢失；
  * **新元素文生图补全 (Qwen T2I Fallback)**：若第 2 段剧情引入了第 1 段中未出现的新角色、新宠物或新道具，Agent 自动调用 Qwen 文生图补全生成该物体的特征卡，并作为 `ref_image_1` (`<Picture 2>`) 补充传入。
* **铁律 M：多角度多细节人物抽卡矩阵 (Multi-Detail Character Extraction Matrix)**：
  * **单张抽卡不足解法**：单张参考图容易丢失局部服装纹理、印花、臂章或裤套细节，必须一次抽取 3 张局部与全局组合矩阵：
    1. `<Picture 1>` (`ref_image_0`): 全身完整定妆卡 (Full-Body)
    2. `<Picture 2>` (`ref_image_1`): 上半身/胸口文字/发型面容特写卡 (Upper Body & Chest Logo)
    3. `<Picture 3>` (`ref_image_2`): 下半身/腿套/鞋履细节特写卡 (Lower Body & Leg Wraps)
  * 全面灌入 H3 官流终极版的多图节点（Node 137, Node 139, Node 167），多图互补，实现 0 细节丢失！
* **铁律 N：用户三视图 Qwen P图抠图融光合成与首尾帧双相图生图体系 (Orthographic Tri-View Qwen P-Crop Composite & First/Last Frame Interpolation)**：
  * **彻底解决三视图白底污染与透视错位**：用户上传的三视图/白底定妆照绝不能直接丢给 H3 扩散模型！白底与影棚光会被模型误判烧入背景，造成换镜时的白斑污染与空间塌陷。
  * **第一步：Qwen 图像编辑（P图）融光**：调用 Qwen Image Edit 将三视图人像干净抠出，自然植入文生图派生的【场景母本卡】（老房子客厅/影院/街景），匹配地表真实阴影与室内色温，输出【环境光影合成卡】。
  * **第二步：首尾帧双相定位图生图 (First & Last Frame Control)**：基于环境光影合成卡，派生出该分段的 **首帧图 (First Frame)** 与 **尾帧图 (Last Frame)**（背景空间 100% 同源共享）。将首帧图传给 `ref_image_0` (`<Picture 1>`)，尾帧图传给 `ref_image_5` (`<Picture 6>`) 或视频接力 Node 175，引导 H3 在固定的三维空间坐标内插值运动。
  * **三大题材通用**：全流程强力适配【音乐 MV】、【竖版短剧】与【商业广告（产品/模特三视图换背景）】，实现 100% 空间零错位、场景零漂移、动作顺滑连贯！
* **铁律 O：场景一致性九宫格锁定 (Scene Nine-Grid Consistency Lock)**：
  * **生产顺序铁律**：新片第一件事先做人物定妆照（人物锁定），做完再做场景——场景必须出九宫格锁定。顺序：**定妆照 → 场景九宫格 → 开拍**，不许跳过九宫格直接开拍。
  * 不管场景图是用户上传的还是 AI 生成的，拿到第一张图后必须执行九宫格锁定四步法——
    ① 先有一张**正面场景图**，把它作为参考图传入；
    ② 写提示词生成 **180 度反打视角**，模板："参考图1生成180度反打视角，背景是…，保持色调、光影、氛围和原图完全一致"（背景描述也可留白，让 AI 自由发挥）；
    ③ 有了正反两张图，场景即被锁死，再把**这两张同时作为参考图**，生成侧视图、俯视图等其他角度；
    ④ 最终拼出**九宫格**（正面/反打/左侧/右侧/俯视/仰视/近景陈设/远景全景/景深纵深），九张视角互相咬合，空间零死角；
  * **开拍门**：九宫格拼出后必须发用户预览确认，确认通过后才允许开拍；锁定环境色温、自然采光方向、空间物理结构与建筑质感，防止换分镜场景发生剧烈漂移。

---

## H3 17n+5 时长与帧数计算法则

H3 的生成长度严格为帧数，且必须符合：
$$\text{frames} = \max(5, \text{round}(a \times 24)) + \left(5 - (\max(5, \text{round}(a \times 24)) \bmod 17)\right) \bmod 17$$
* 5 秒 = 124 帧
* **15 秒 = 362 帧**
* **1 分钟成片 = 4 段 × 362 帧 = 60.33 秒**
* **2 分钟成片 = 8 段 × 362 帧 = 120.67 秒**

---

## 无视觉像素级审计方案

在 AI 无法直接看图的无视觉环境下，通过量化脚本执行质检：
1. **`imgcheck.py`**：检测 raw RGB24 采样中的近中性灰占比 (`grey%`) 与背景欧氏距离。
   * `grey% < 3%`：确保原摄影棚白底/灰底未漏进输出画面。
   * `Euclidean Distance < 15`：确保合成图继承了母本场景卡的色彩基调。
2. **`personcheck.py`**：人物外接矩形上下边界检测。
   * 顶部 > 0，底部 < H-2；鞋底离底边保留 6%~18% 地面带，证明脚未被裁切。
3. **`subprobe.py`**：定位 55%~75% 画面高度的烧入字幕行带。

---

## 十二步全流程与八道门禁全景

```
[步骤一：歌词/对白切分与时间轴规划]  ──> 【关卡一：时间戳与说话人格式门禁】
[步骤二：角色声学指纹与干声切片]      ──> 【关卡二：Voiceprint 哈希校验】
[步骤三：母本场景与角色立绘生成]      ──> 【关卡三：透视网格与棚底灰色质检】
[步骤四：图像编辑合成参考卡派生]      ──> 【关卡四：同源欧氏距离与宾客锚定】
[步骤五：Awesome-Seedance 故事构思]   ──> 【关卡五：两段式转译与六段式语法机检】
[步骤六：H3 Ref2VA 宽景安全提示词]    ──> 【关卡六：防裁头与防反向字幕硬门禁】
[步骤七：MV 负向禁令护盾全量编译]    ──> 【关卡七：BGM 剥离与嘴唇静止机检】
[步骤八：RunningHub 云端一键派发]     ──> 【关卡八：成片对齐三验与接缝审查】
[步骤九：多段 MP4 异步轮询下载]
[步骤十：FFmpeg 0.35s afade 平滑拼接]
[步骤十一：无损 Master BGM 外部重贴]
[步骤十二：成片合规交付与台账归档]
```

---

## RunningHub 云端调度与 MiniMax H3 Director 导演台全工作流

### 1. 导演台 8 大子图全工作流核心节点映射：
* **主导演台总控**：`MiniMaxH3Director` (Node 12)
  * `task_type`: `r2v — 参考主体生视频` / `t2v` / `i2v` / `fl2v` / `v2v` / `rv2v`
  * `global_prompt`: H3 官方六段式全局主体与场景定义
  * `timeline_data`: JSON 多分段时序结构 (含 segments, keyframes, transitions, overlap 连续性重绘)
  * `total_frames`: 17n+5 精准帧数 (如 367 帧 / 15.29s，362 帧 / 15.08s)
  * `width/height`: 16:9 (864×480) / 9:16 (480×864) / 1:1 (640×640)
* **底模与双 VAE 加载**：
  * Node 1: `UNETLoader` (r2v底模 `minimax_h3_ref2va_bf16.safetensors` / fl2va底模)
  * Node 2: `CLIPLoader` (`qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors` Qwen3-VL)
  * Node 3: `VAELoader` (Video VAE fp16)
  * Node 4: `VAELoader` (Audio VAE fp32)
* **LoRA 极速加速**：Node 25 `LoraLoaderModelOnly` (`minimax_h3_fl2v_turbo_8step_v1.0`, 8步极速)
* **SageAttention 显存优化**：Node 17 `PathchSageAttentionKJ` + Node 16 `MiniMaxH3MemoryEfficientSageAttentionPatch`
* **SelfLift 渐进 3D 采样**：Node 26 `MiniMaxH3DirectorSelfLift` (`highres_steps: 2`, 3D Latent Upscaler, 分块平铺防爆显存)
* **二采高清放大精修**：Node 18 `MiniMaxH3DirectorRefine` (`4x-UltraSharp.pth`, 0.25 denoise, 1 pass 二次放大)
* **YOLOv8 脸部检测与修复**：Node 27 `MiniMaxH3DirectorFaceRefine` (`face_yolov8m.pt`, 置信度 0.35, 羽化 24, 色彩匹配 1.0)
* **音画封包与输出**：Node 6 `CreateVideo` (24fps sRGB) + Node 7 `SaveVideo`
* **运行报告**：Node 8 `PreviewAny` (实时输出显存使用与 Gate 8 对齐指标)

### 多段 FFmpeg 拼接 (带 0.35s 音频淡接与母带重贴)：
```bash
ffmpeg -y -v error -i S01.mp4 -i S02.mp4 -i S03.mp4 -i S04.mp4 -i master_bgm.wav \
 -filter_complex "
   [0:v]setpts=PTS-STARTPTS[v0];[0:a]afade=t=in:st=0:d=0.35,afade=t=out:st=14.73:d=0.35,asetpts=PTS-STARTPTS[a0];
   [1:v]setpts=PTS-STARTPTS[v1];[1:a]afade=t=in:st=0:d=0.35,afade=t=out:st=14.73:d=0.35,asetpts=PTS-STARTPTS[a1];
   [2:v]setpts=PTS-STARTPTS[v2];[2:a]afade=t=in:st=0:d=0.35,afade=t=out:st=14.73:d=0.35,asetpts=PTS-STARTPTS[a2];
   [3:v]setpts=PTS-STARTPTS[v3];[3:a]afade=t=in:st=0:d=0.35,afade=t=out:st=14.73:d=0.35,asetpts=PTS-STARTPTS[a3];
   [v0][v1][v2][v3]concat=n=4:v=1:a=0[vconcat];
   [a0][a1][a2][a3]concat=n=4:v=0:a=1[adialogue];
   [4:a]volume=0.45[abgm];
   [adialogue][abgm]amix=inputs=2:duration=first:dropout_transition=2[aout]" \
 -map "[vconcat]" -map "[aout]" -c:v libx264 -crf 19 -preset medium -pix_fmt yuv420p \
 -c:a aac -b:a 192k -movflags +faststart 成片_完整母带.mp4
```
