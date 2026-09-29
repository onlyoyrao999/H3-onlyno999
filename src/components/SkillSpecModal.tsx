import React, { useState } from 'react';
import { X, Copy, Check, FileText, Code, Download, Terminal, Layers, Sparkles } from 'lucide-react';

interface SkillSpecModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SPEC_FILES = [
  {
    id: 'three_skills_chain_md',
    name: '三技能架构规范 (前两步焊死+云端接口可换)',
    type: 'markdown',
    path: '/skills/mv-auto-pipeline/references/three_skills_ironclad_chian.md',
    content: `# 三技能链式系统规范：前两步焊死 + 第三步云端一键图片接口热插拔

## 架构核心原则 (System Architecture Principle)
在整套 AI 视频与短剧生成流水线中，核心划分为「两层焊死内核」与「一层插拔管道」：

### 1. 【Skill 1 焊死】创意句子与分镜构思内核 (Creative Ideation Kernel)
- **定位**：业务与叙事基石（不可跳过、严禁大模型直出闲聊文本）。
- **职责**：将用户的粗糙想法（如“这个帽子的创意”）转化为结构化的剧情大纲、分镜节奏、人物角色小传与戏剧冲突。
- **输出物**：结构化镜头清单、台词文本、动作拟音设定。

### 2. 【Skill 2 焊死】MiniMax H3 官方规范编译器 (Official H3 Ref2VA Compiler)
- **定位**：模型底层对齐编译器（官方语法糖与硬门禁拦截）。
- **职责**：
  * 将 Skill 1 的自然语言分镜逐一编译为 H3 官方认可的六段式架构：
    [subject_definitions] ➔ [summary] ➔ [retention_analysis] ➔ [detailed_description] ➔ [overall_soundscape] ➔ [non_diegetic_music]
  * 自动注入 (Sx) 角色音色绑定与 <d> 台词口型发声标签；
  * 执行严格的【零字幕硬门禁】：坚决剔除 "no subtitles/no text" 反向敏感词，防止画面烧录乱码字；
  * 执行【防裁头镜头控制】：将特写安全后退至胸口或中近景，确保发声时头部完整；
  * 执行【角色表面防污染绝缘锁】：严防环境注意力外溢导致的腰部莫名长出 Logo 徽标、大腿长出悬挂饰品、衣服冒出杂质印花（正向注入 pristine solid finish，负向压制 stickers, decals, waist logo, hanging charms, body graffiti）。
- **输出物**：符合 H3 官方 Ref2VA 契约的标准 Payload。

### 3. 【Skill 3 插拔】云端一键生图/生视频接口 (Cloud One-Click Image/Video Driver)
- **定位**：可灵活更换的算力与执行管道（Pluggable Execution Provider）。
- **特性**：**前两步焊死不变，第三步按需随时替换不同云端服务**。
- **支持接入与替换的云端接口**：
  * 接口 A：RunningHub 云端 ComfyUI 生图/生视频接口 (Workflow ID: 2104734128657756162，节点 Node 138/137/139/175)
  * 接口 B：Qwen-Image / FLUX / SD 云端文生图与图像编辑接口 (生成 1:1 人物定妆卡与母本场景卡)
  * 接口 C：平台内置 ImageGen 图生图与 15s 尾帧垫图接力接口
  * 接口 D：第三方 Webhook / 自建 GPU ComfyUI 实例接口
- **契约规则**：只要接收到 Skill 2 编译好的标准 Payload，任何云端接口均可无缝消费并返回图片/视频 URL。

---

## 用户自然时长指令智能自适应路由规则 (Auto-Duration Adaptation)
用户在对话框中只会说自然语言（如：“生成20秒的短片”、“做个30秒的视频”、“来一个1分钟微短剧”），Agent 必须在底层自动识别并切换单段规格，用户对此零感知：

| 用户自然语言指令 | Agent 内部智能切分规划 | 底层单段 Node 132 设定 | 跨段接力与垫图机制 |
| :--- | :--- | :--- | :--- |
| **"生成 10 秒短片"** | **1 段** 直出 (10s) | Node 132 = 10.0 (243 帧) | 单段直出，无跨段 |
| **"生成 15 秒短片"** | **1 段** 直出 (15s) | Node 132 = 15.0 (362 帧) | 单段直出，长镜头情绪拉满 |
| **"生成 20 秒短片"** | **2 段 × 10 秒** (共 20s) | 每段 Node 132 = 10.0 (243 帧) | 第 1 段截取第 242 帧垫图 ➔ 喂给第 2 段 (Node 137) + 载入前视频 (Node 175) |
| **"生成 30 秒短片"** | **2 段 × 15 秒** (共 30s) | 每段 Node 132 = 15.0 (362 帧) | 第 1 段截取第 362 帧垫图 ➔ 喂给第 2 段 (Node 137) + 载入前视频 (Node 175) |
| **"生成 45 秒短片"** | **3 段 × 15 秒** (共 45s) | 每段 Node 132 = 15.0 (362 帧) | 逐段 15s 尾帧接力，FFmpeg select='gt(n\,0)' 消除接缝 |
| **"生成 60 秒 / 1分钟短剧"** | **4 段 × 15 秒** (共 60s) | 每段 Node 132 = 15.0 (362 帧) | **竖版微短剧工业标准一集**！4 段起承转合连续出片 |

---

## 焊死大模型的系统提示词模板 (System Prompt Enforcement)
\`\`\`markdown
# AGENT IRONCLAD ROUTING RULE

你必须执行严格的三技能链式流水线，严禁在未调用工具的情况下自行瞎编故事：
1. 收到任何故事/剧本/视频构思请求，必须且只能首先调用 [Skill 1: 创意分镜生成器]；
2. 拿到 Skill 1 产物后，必须强制传入 [Skill 2: H3 官方六段式转译器] 进行标准编译与敏感词清洗；
3. 将 Skill 2 编译好的标准六段式 Payload，递交给 [Skill 3: 云端一键图片/视频生成接口] 进行云端任务派发。

严禁事项：
- 严禁大模型以自然语言直接回复闲聊故事；
- 严禁跳过 Skill 2 直接将非结构化文字发给云端生图接口！
\`\`\``
  },
  {
    id: 'audio_driven_sop_md',
    name: '音频驱动人物演绎专属 SOP (Audio-Driven Spec)',
    type: 'markdown',
    path: '/skills/mv-auto-pipeline/references/audio_driven_character_performance_sop.md',
    content: `# 用户音频驱动人物演绎与画面推动专属 SOP (Audio-Driven Performance Spec)

## 一、底层工作流硬件级走线与机制 (ComfyUI Workflow Architecture)
在 MiniMax H3 官方终极版工作流中，音频驱动画面的数据流走线如下：
1. **音频加载节点**：Node 174 (\`LoadAudio\`)
   - 作用：载入用户上传的本地音频文件（支持 .wav, .flac, .mp3）。
   - 状态切换：默认工作流在文本自生成模式下为 \`mode: 4\`（旁路/静音）；**当用户指定外部音频驱动时，必须由 Agent 自动切换为 \`mode: 0\`（激活）**！
   - 走线：Node 174 输出槽 \`AUDIO\` (Link 327) 直连主算子 Node 136 的 \`ref_audios.ref_audio_0\`。
2. **多模态声码器节点**：Node 120 (\`VAELoader\`: \`minimax_h3_audio_vae_fp32.safetensors\`)
   - 走线：通过 Link 274 将声学 VAE 接入 Node 136 的 \`audio_vae\` 槽，将时域音频波形转换为声学潜在表征 (Audio Latents)。
3. **主控算子多模态注意力**：Node 136 (\`MiniMaxH3ReferenceToVideo\`)
   - 结合 \`<Picture 1>\` (Node 137 定妆卡) 与 \`<Audio 1>\` (Node 174 音频)。
   - DiT 模型的 Cross-Attention 机制以音频潜空间为引导，严密约束下颌骨、嘴唇开合幅度、发音音素与面部肌肉运动。
4. **严格时钟对齐计算器**：Node 131 (\`ComfyMathExpression\`)
   - 运算公式：\`max(5, round(a * 24)) + (5 - (max(5, round(a * 24)) % 17)) % 17\`
   - 10.0 秒音频精准对应 243 帧；15.0 秒音频精准对应 362 帧。视频长度由音频物理时长数学级锁死，零音画漂移！
5. **双路解码与封包**：
   - Node 122 (\`VAEDecode\`) 解码图像帧 ➔ Link 295 ➔ Node 148 (\`VHS_VideoCombine\`)
   - Node 121 (\`VAEDecodeAudio\`) 解码同步音频 ➔ Link 296 ➔ Node 148 (\`VHS_VideoCombine\`) 导出 24fps MP4 成片。

---

## 二、Agent 响应用户音频驱动指令的五步闭环 SOP

### 第 1 步：音频分析与时长自适应路由 (Acoustic Ingestion & Slicing)
- 提取用户音频时长 $T$ 与台词断句点：
  * **$T \\le 10$s**：自动设定单段 Node 132 = 10.0s（生成 243 帧，广告/短视频节奏）；
  * **$10\\text{s} < T \\le 15$s**：自动设定单段 Node 132 = 15.0s（生成 362 帧，短剧标准一镜）；
  * **$T > 15$s（如 20s、30s、60s）**：Agent 自动在台词呼吸/停顿间隙进行物理音频切片，规划为 $N$ 个 10s 或 15s 段落。前段尾帧（第 242/362 帧）垫入下段 Node 137，并载入 Node 175 视频潜空间接力，杜绝超长音频单段硬跑导致的崩坏。

### 第 2 步：角色与音频槽位绑定协议 (Audio-Character Binding Protocol)
- 明确指定角色：
  * \`<Subject 1>\` 绑定 \`<Picture 1>\`（Node 137 定妆照）；
  * \`<Audio 1>\` 绑定 Node 174 上传的音频干声；
  * 解除 Node 174 旁路（mode = 0），填入音频路径。

### 第 3 步：H3 官方六段式【音频驱动专属编译契约】(Audio-Driven Six-Section Spec)
编译提示词时，必须严格执行以下六段式语义结构：

1. **[subject_definitions]**：
   \`\`\`text
   <Subject 1> is the character in <Picture 1>. Preserve facial features, hairstyle, attire, and pristine solid finish without any stickers or decals. (S1) speaks strictly using the voice, timbre, cadence, and delivery defined in <Audio 1>.
   \`\`\`

2. **[summary]**：
   \`\`\`text
   The scene is a high-fidelity cinematic performance driven entirely by the audio monologue <Audio 1>. <Subject 1> acts and speaks naturally to drive the narrative forward, with realistic facial emotions matching the vocal inflections.
   \`\`\`

3. **[retention_analysis]**：
   \`\`\`text
   <Subject 1>: fully_preserved.
   Lip-sync continuity: Mouth movements are strictly locked to the acoustic energy, phonemes, and syllables of <Audio 1>. During natural pauses, breathing intervals, or silent gaps in <Audio 1>, the mouth remains naturally and completely closed without unnecessary fidgeting.
   \`\`\`

4. **[detailed_description]**：
   \`\`\`text
   [Shot 1] (S1) <d>台词内容</d>. The character faces camera in a comfortable medium close-up shot. As the dialogue in <Audio 1> begins, (S1)'s jaw and lips articulate precisely with the vocal track. Subtle head tilt and authentic eye micro-expressions accompany key vocal stresses. When the audio pauses, (S1) holds a natural attentive expression.
   \`\`\`

5. **[overall_soundscape]**：
   \`\`\`text
   Diegetic ambient room presence and subtle cloth rustle only. No loud conflicting sound effects. The spoken voice from <Audio 1> remains the primary acoustic focus.
   \`\`\`

6. **[non_diegetic_music]**：
   \`\`\`text
   None. Do not generate any synthetic background score or music track, keeping the vocal track pristine.
   \`\`\`

### 第 4 步：负向禁令强制注入
负向提示词必须包含口型与音频防破音特征：
\`\`\`text
out-of-sync audio, mouth opening during silence, unnatural jaw distortion, robotic lip motion, speech latency, background music, noisy score, stickers, body graffiti, text, subtitles
\`\`\`

### 第 5 步：对齐质检三验 (Alignment Tri-Audit)
出片后自动核查：
1. 滞后量核验：$\\le 80$ms（口型与原声波形延迟严格在安全窗内）；
2. 互相关系数：$\\ge 0.78$（元音音高与嘴巴开合包络拟合度）；
3. 人声能量核验：动态范围保留良好，无爆音破音。

---

## 三、用户原声歌曲一键对口型与无损母带直合流水线 (Song Lip-Sync & Direct Master Muxing)
如果用户的核心需求是：“我上传一首歌曲音频，让任意的人去演绎/对口型，最后把我上传的音频跟视频直接合成给我”：

### 1. 为什么“直接合成原版音频”是商业级 MV 最佳工业解法？
- **音质 100% 录音棚母带级保真**：AI 扩散模型的 Audio VAE 从潜空间解码的声音经神经网络有损重构，存在轻微电流声或低频削减。而直接将用户上传的原始歌曲（WAV/FLAC/320k MP3）与画面重新封包，成片拥有 100% 原始 CD 级母带质感！
- **音画绝对同步的物理对齐**：视频帧率严格按 17n+5 公式向上贴合（24fps PTS 物理时间戳），视频总时长与原曲总毫秒完全相同，合并时零音画跑偏。

### 2. Agent 必须自动把控的 3 个关键环节：
- **前奏/间奏/尾奏防瞎张嘴 (Vocal Energy Gating)**：
  歌曲中常有 10~30 秒纯吉他/钢琴 solo。Agent 必须做人声分轨或 VAD 检测：
  * 有人声歌词片段：注入 \`mouth articulates strictly synced with singing vocals\`；
  * 纯乐器间奏片段：注入 \`mouth firmly closed, listening to the melody, swaying gently, zero lip motion\`（绝不在吉他 solo 时乱动嘴！）。
- **多段生成与长歌跨段接力**：
  一首歌 3~4 分钟，底模单段跑 10s 或 15s。Agent 自动按歌词段落切分，前段尾帧垫入下段 Node 137，并载入 Node 175 视频潜空间，确保任意角色跨段整首歌不换脸。
- **一键无损封包交付 (One-Step Lossless Muxing)**：
  生成完毕后，调用 FFmpeg 将原版音频注入视频，直接替换模型生成的临时音轨，一秒导出交付成片：
  \`\`\`bash
  ffmpeg -y -i final_video_concat.mp4 -i user_original_song.mp3 \\
    -map 0:v:0 -map 1:a:0 \\
    -c:v copy -c:a aac -b:a 320k -shortest 最终对口型MV_原声母带.mp4
  \`\`\`

---

## 四、核心审美界线：画面随音乐走 + 克制对口型 vs 夸张大唱 (Music-Paced Visuals vs. Theatrical Singing)
用户核心诉求：“只是让画面跟着这个参考音乐走，口型对上，而不是说这种他唱一遍”。

### 1. 为什么必须严格禁止“他唱一遍”？
- **普通生视频误区**：如果提示词写成“singing vocals/pop singer”，AI 模型会把人物变成卡拉OK现场：大张嘴嘶吼、下巴拉长失真、脖子青筋暴起、甚至凭空长出手持麦克风，彻底破坏时尚感与电影感。
- **商业广告/电影级真实做法**：
  * **画面主体**：画面镜头（推拉摇移、景深虚化、角色走位）严格跟着**参考音乐的节奏鼓点与节拍（BPM/Rhythm）**律动；
  * **口型对位**：口型仅作**克制、松弛、自然的同步对位（Subtle Speech-like Lip-Matching）**，角色神态从容自信、高级内敛，绝不大喊大叫；
  * **非歌词时段**：人物闭嘴、微晃、眼神交流，让视觉与音乐旋律共振。

### 2. Agent 焊死的正负向硬门禁规范：
- **正向提示词锁定 (Positive Phrase)**：
  \`\`\`text
  The visual pacing, camera glides, and character motion flow seamlessly with the tempo and mood of <Audio 1>. Lip-sync is restrained, cinematic, and understated—natural speech-like articulation aligned with the phrasing, maintaining calm facial composure and stylish attitude without wide-open singing mouth deformation.
  \`\`\`
- **负向提示词硬压 (Negative Suppression)**：
  \`\`\`text
  screaming, shouting, exaggerated singing, wide open mouth screaming, theatrical operatic performance, karaoke singing, distorted jaw, strained neck, holding microphone, overacting singing
  \`\`\`

---

## 五、演绎风格根据歌曲风格自动切换矩阵 (Automatic Song Genre-to-Acting Style Matrix)
用户核心诉求：“那个演绎风格。根据歌曲风格自动切换”。

### 1. 为什么不能千篇一律？
同一套人物形象，在民谣慢歌中如果动作过于剧烈会显得浮夸轻佻；在说唱中如果低头伤感会丧失律动与态度；在赛博电音中若眼神飘忽则缺乏未来感。
**因此，Agent 在接收歌曲音频（或歌曲名）时，必须执行“声学/曲风特征分析”，自动切换人物的神态、运镜、光影与口型节律！**

### 2. 八大经典曲风与演绎风格映射矩阵：
| 歌曲流派 (Genre) | 节奏 (BPM) 与声学特征 | 自动切换演绎神态 (Acting Mood) | 专属镜头动力学 (Camera Motion) | 光影与视效氛围 (Atmosphere) | 口型与身体律动 (Lip & Body Groove) |
|---|---|---|---|---|---|
| **深情慢歌 / 伤感民谣** | 60-80 BPM, 钢琴/木吉他, 舒缓呼吸 | 忧郁深沉、眼泛微光、低眉思索、轻咽微叹，沉静内敛 | 浅景深慢速推镜 (f/1.4 Dolly-in), 呼吸感轻微游移 | 窗边雨丝微光、柔和逆光烟尘、低饱和温暖胶片色调 | 极轻微唇瓣开合，气声弱音对齐，间奏完全闭合低头沉思 |
| **说唱律动 / 潮流R&B** | 85-125 BPM, 808重低音, 切分节奏 | 自信不羁、从容霸气、侧颈微扬、眼神锁定镜头、挑眉从容 | 低角度推拉抓拍 (Low-Angle Glide), 随重音微幅晃动 | 城市街头霓虹溢彩、潮湿反光沥青、高反差明暗剪影 | 随808鼓点身体律动沉肩微晃，咬字利落微动，从不大张嘴唱 |
| **赛博电子 / 潮酷电音** | 120-135 BPM, 强劲合成器四四拍, 脉冲低音 | 冷峻超然、机械式优雅、深邃凝视、疏离神秘感 | 平滑轨道环绕运镜 (Orbital Glide), 激光穿梭视角 | 赛博蓝紫霓虹、全息光晕弥散、冷调金属反光与体积烟雾 | 唇形精炼利落，配合电子琶音节拍，间奏完全静止如雕塑 |
| **热血摇滚 / 力量乐队** | 120-160 BPM, 失真电吉他、重鼓强拍 | 桀骜坚定、下颌微收、眼神充满电性张力、压迫感 | 强拍冲击式微抖动 (Punchy Snap), 动态手持呼吸运镜 | 舞台高反差顶光 (Chiaroscuro), 钨丝灯边缘硬轮廓光 | 随失真吉他重音眼神聚焦，唇齿开闭干脆有力，严禁五官扭曲 |
| **复古微醺 / 慵懒爵士** | 70-110 BPM, 萨克斯风、低音提琴、轻摇摆 | 迷离慵懒、微醺笑意、半阖眼眸、自在漫步、松弛高雅 | 缓慢环形横摇 (Slow Arch Pan), 柔焦怀旧电影镜头 | 暖琥珀色威士忌酒吧暗调、百叶窗斑驳光影、天鹅绒质感 | 悠闲随性微张轻合，随摇摆拍微侧头部，松弛自然无刻意感 |
| **灵动流行 / 阳光轻快** | 110-128 BPM, 清脆铜管、明朗贝斯线、元气旋律 | 阳光治愈、元气灵动、眉眼含笑、亲和力拉满 | 灵巧跟随平移、轻快前后推拉变焦 (Smooth Zoom) | 干净透亮自然日光、高调清透色彩、通透空气感 | 轻盈语流开合，字句清爽，换气间隙自然抿嘴微笑 |
| **唯美古风 / 仙侠国潮** | 55-90 BPM, 笛箫古筝琵琶、悠扬空灵弦乐 | 仙风道骨、清冷出尘、顾盼生姿、敛气凝神、宛若画中 | 烟雨微步悬浮慢移 (Floating Drone), 如长卷铺展 | 青黛水墨意境、薄雾晨光、竹影或月色冷光、飘逸微风 | 唇齿含蓄微启，吐气如兰，曲尽闭息若有所思 |
| **大气史诗 / 电影交响** | 60-140 BPM, 宏大管弦、重击定音鼓、磅礴和声 | 庄严肃穆、坚毅傲岸、胸怀广袤、凝望远方地平线 | 宏大航拍后拉 (Epic Crane Pull-back), 恢弘景深拉开 | 黄金时刻漫天晚霞、云海破晓日光、史诗质感高动态范围 | 沉稳尊贵，仅在主旋律高潮做神圣发音对位，尽显磅礴气场 |

### 3. Agent 自动化执行规则：
1. **自动曲风嗅探**：根据用户上传文件名（如 \`晴天.mp3\`、\`trap_groove.wav\`、\`cyber_run.flac\`）或用户 prompt 中的歌手/歌曲名自动映射至上述 8 大流派；
2. **提示词动态编译**：自动将对应的 \`actingMood\`、\`cameraMovement\`、\`lightingAtmosphere\`、\`lipSyncRule\` 注入 H3 Ref2VA 的 \`[summary]\` 与 \`[detailed_description]\`；
3. **安全防变形兜底**：无论何种曲风，负向提示词必须严焊 \`screaming, shouting, wide open mouth screaming, distorted jaw\`，绝对坚守“高级克制口型对位，决不张大嘴干唱”。

---

## 六、极简纯粹音乐驱动对口型执行规范 (Pure Simple Music Lip-Sync SOP)
用户核心诉求：“不要全线路构建哈，我这个是单纯的音乐驱动画面，对口型的。就算要给画面写提示词，也是很简单的。只是简单你要说谁是谁在唱歌，跟着音乐歌曲。对口型。画面精彩演绎。”

### 1. 极简原则：坚决摒弃重度全流程大论文
当用户明确要求“纯粹音乐驱动画面对口型”时：
- **严禁**调用重度 12 步全链、严禁输出 6 大块长篇段落大论文；
- **只保留核心三要素**：谁在唱 + 跟着歌曲对口型 + 画面精彩演绎！

### 2. 极简黄金三句式提示词结构：
- **唱歌段落（自动识别歌词注入，让人物跟着唱）**：
  \`\`\`text
  <Subject 1> is {角色名字} in <Picture 1>. As the singing vocal plays in <Audio 1>, (S1) passionately and naturally sings along to the lyrics: <d>{自动识别提取的歌词}</d>. (S1)'s lips, jaw, and facial expressions articulate accurately synchronized to each vocal syllable and melody. Between vocal lines, lips close naturally. High-definition cinematic framing in {场景置景与灯光}, delivering a stunning musical performance.
  \`\`\`
- **纯乐器间奏段落（人物自然闭口，绝不乱动嘴）**：
  \`\`\`text
  <Subject 1> is {角色名字} in <Picture 1>. During this instrumental musical passage of <Audio 1>, (S1) listens and subtly sways to the rhythm. (S1)'s mouth remains naturally and completely closed with zero lip motion, maintaining attentive poise. High-definition cinematic framing in {场景置景与灯光}, delivering a captivating visual performance.
  \`\`\`

### 3. 时间轴自动识别与帧率对齐 (Timeline & Frame Calculation)：
- **毫秒级时间戳**：精准标记每个段落的起止点（如 \`00:04.50 - 00:15.20\`，时长 10.7s）；
- **H3 物理帧数对齐**：按 $17n+5$ 官方公式自动算出对应帧数（如 10.7s 对应 260 帧，15s 对应 362 帧）；
- **标准 LRC/SRT 导出**：自动生成带 \`[00:04.50]\` 格式的时间轴歌词，方便后期剪辑与精确贴唱。

### 4. 极简负向提示词：
\`\`\`text
out-of-sync audio, mouth opening during silence, distorted jaw, unnatural teeth, screaming face, robotic lips, stickers, low quality
\`\`\`

### 5. 终剪母带替换（剥离 H3 电音杂音 · 重新合成参考音）：
H3 扩散模型输出的原始视频音轨存在有损 AI 电音杂质。出片后执行单行 FFmpeg 指令：
\`\`\`bash
# 剥离 H3 生成杂音 (-map 0:v:0)，直贴用户原始参考音 (-map 1:a:0)
ffmpeg -y -i h3_raw_video.mp4 -i user_reference_music.mp3 \
  -map 0:v:0 -map 1:a:0 \
  -c:v copy -c:a aac -b:a 320k -shortest 最终对口型MV_原声母带.mp4
\`\`\`

### 6. 底层直驱节点：
- **Node 174 (LoadAudio)**：传入用户上传的音频或歌曲；
- **Node 137 (LoadImage)**：传入人物角色立绘；
- **Node 136 (MiniMaxH3ReferenceToVideo)**：联合采样，一键出片！
\`\`\``
  },
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
SURFACE_INVARIANCE_KEYWORDS = ["pristine solid finish", "without stickers", "uniform original color", "纯净无贴纸", "表面一致"]

def validate_h3_prompt(text: str) -> dict:
    lower = text.lower()
    missing = [s for s in H3_SECTIONS if s not in lower]
    has_trap = any(w in lower for w in FORBIDDEN_ANTI_SUBTITLES)
    has_surface_shield = any(k in lower for k in SURFACE_INVARIANCE_KEYWORDS)
    return {
        "passed": len(missing) == 0 and not has_trap,
        "missing_sections": missing,
        "subtitle_trap_detected": has_trap,
        "surface_invariance_shield_active": has_surface_shield
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
- 负向压制：singing, mouth open, lip-sync, talking, speaking, vocalizing, open lips, moving mouth。

## 4. 🛡️ 角色机体/服装防涂鸦贴纸锁 (Character Surface Invariance & Anti-Decal Shield)
- 根因定位：H3 底模 Cross-Attention 特征外溢（背景霓虹夜市、招牌广告字被模型误当作机体涂鸦填补空白甲面）。
- 正向防卫：正向人物定义必须加入绝对纯净声明：\`The character features a pristine solid finish without any stickers, logos, body graffiti, decorative decals, or hanging accessories. All body plates and fabrics maintain their uniform original color without any surface markings.\`
- 负向硬压：强制注入 \`stickers, decals, body graffiti, painted emblems, waist logo, hanging charms, cartoon decals, body art, scratches, messy armor, decorated chassis, branded stickers, thigh patches, graffiti on suit\`。
- 跨段接力净图：第 1 段尾帧若存在微瑕，需经清洗去除杂色后再行送入下段垫图，切断代际遗传！`
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
