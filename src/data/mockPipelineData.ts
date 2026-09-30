export interface DialogueLine {
  id: string;
  start: number; // in seconds
  end: number;
  speakerId: 'S1' | 'S2' | 'S3';
  speakerName: string;
  text: string;
  type: 'establishing' | 'dialogue' | 'action_clash' | 'climax_declaration' | 'outro';
  confidence: number;
  isInstrumental?: boolean;
}

export interface StoryboardShot {
  id: string;
  index: number;
  start: number;
  end: number;
  duration: number;
  shotScale: 'ECU' | 'CU' | 'MCU' | 'MS' | 'MLS' | 'FS' | 'ELS' | 'Scenery' | 'Back-View';
  cameraMotion: string;
  isLipSync: boolean;
  speakerId?: 'S1' | 'S2' | 'S3';
  lyricsSnippet: string; // Used for dialogue subtitle / action prompt in timeline
  prompt: string;
  negativePrompt: string;
  fingerprint: string;
  pool: 'spot_free' | 'priority_paid';
  costUsd: number;
  status: 'approved' | 'generating' | 'completed' | 'reroll';
  seed?: number;
  lagMs?: number;
  correlation?: number;
  vocalDbfs?: number;
  // 9-Grid Spatial Scene Integration
  sceneGridCellId?: number; // 1~9
  sceneGridCellName?: string;
  // Multi-Grid Props Bank Integration
  propId?: string;
  propName?: string;
  // Dry Vocal Stem Chaining (Post-Segment 1 extraction & cross-segment auto-reuse)
  dryVocalAssetId?: string;
  dryVocalStatus?: 'extracted_source' | 'auto_chained_inherited' | 'pending';
  dryVocalSnippet?: string;
  useUploadedBackground?: boolean;
  backgroundImageUrl?: string;
  backgroundImageName?: string;
  generatedKeyframeUrl?: string;
  imageGenStatus?: 'idle' | 'generating' | 'completed' | 'failed';
  imageGenPlugin?: 'buddy-multimodal-generation';
  imageGenLogs?: string[];
}

export interface GateDefinition {
  id: number;
  name: string;
  shortName: string;
  phase: string;
  stepIndex: number;
  isHardBarrier: boolean;
  description: string;
  reviewMode: 'Machine + Human HTML' | 'Machine Hard Block' | 'Audit Verification';
  keyChecks: string[];
}

export const GATES_DATA: GateDefinition[] = [
  {
    id: 1,
    name: "分镜剧本提取与对白强制对齐",
    shortName: "关 1: 对白/招式对齐",
    phase: "准备阶段",
    stepIndex: 1,
    isHardBarrier: false,
    description: "角色台词提取与起止秒数计算，短喝台词与招式时序锚定，确立全链唯一时间基准与防乱说话门禁。",
    reviewMode: "Machine + Human HTML",
    keyChecks: ["短促台词(≤6字)短喝合规", "武侠/动作招式三段时序打标", "起止分镜毫秒时间戳固化"]
  },
  {
    id: 2,
    name: "视觉风格锁定",
    shortName: "关 2: 风格锁定",
    phase: "基调确立",
    stepIndex: 2,
    isHardBarrier: false,
    description: "确立美术基调、色彩空间 (LUT)、光影与画幅比例。必须先于资产确立，防止服装色调返工。",
    reviewMode: "Machine + Human HTML",
    keyChecks: ["画幅比锁定 (16:9 / 9:16)", "色彩基调与 LUT 参数表", "光影反差与颗粒感预设"]
  },
  {
    id: 3,
    name: "人物与核心资产",
    shortName: "关 3: 人物资产",
    phase: "资产准备",
    stepIndex: 3,
    isHardBarrier: false,
    description: "主人公多角度面容图与核心服装，或直接一键启用「无主角模式」由空镜与道具承载情绪。",
    reviewMode: "Machine + Human HTML",
    keyChecks: ["面部多角度特征一致性", "关键服装与道具指纹生成", "无主角模式环境图集确立"]
  },
  {
    id: 4,
    name: "影视/短剧分镜设计与切段",
    shortName: "关 4: 分镜设计",
    phase: "结构设计",
    stepIndex: 4,
    isHardBarrier: false,
    description: "切点严格落在对白句尾或动作停歇点，严禁一词切半；分配景别、运镜方向与动作/对白口型策略。",
    reviewMode: "Machine + Human HTML",
    keyChecks: ["切点严禁切断单句对白", "运镜动势与打斗/戏剧节奏匹配", "初设口型与景别初审"]
  },
  {
    id: 5,
    name: "提示词派生与 11 项机检",
    shortName: "关 5: 提示词硬门禁",
    phase: "核心门禁",
    stepIndex: 5,
    isHardBarrier: true,
    description: "MiniMax H3 六段式结构 + 动作打斗/对白专用框架 + 嘴唇闭合正负双向压制。11 项机检全绿方可放行，计算防伪指纹。",
    reviewMode: "Machine Hard Block",
    keyChecks: [
      "1. 六段式结构完整度 [SHOT] 至 [CAMERA_TECH]",
      "2. 语言分层 (英文键名与参数，中文叙述与对白)",
      "3. 独立行 Speaking dialogue: <d>[语言] ...</d>",
      "4. 绝无非规范口型动词",
      "5. 口型段仅限特写/中景 (ECU/CU/MCU/MS)",
      "6. 非口型段正向必须含 mouth naturally closed",
      "7. 负向必须注入 text/subtitles/watermark 防印刷乱码压制",
      "8. 人物识别特征一致性锚点",
      "9. 无日夜/光照逻辑自相矛盾词",
      "10. 短窗口动作幅度适配度",
      "11. SHA-256 签名校验，改写自动退回"
    ]
  },
  {
    id: 6,
    name: "对白窗口与段落时序核对",
    shortName: "关 6: 窗口硬门禁",
    phase: "核心门禁",
    stepIndex: 6,
    isHardBarrier: true,
    description: "窗口首尾相接无间断、时长合计严格等于片段设定、口型景别完全一致、连续对口型<=3段、全片口型率~45%。",
    reviewMode: "Machine Hard Block",
    keyChecks: [
      "分镜数学闭环: Start_i == End_{i-1}",
      "严禁任何手工四舍五入秒数",
      "总时长 ∑ == 剧本设定时长",
      "非中近景严禁对口型",
      "连续对口型镜头 <= 3 个",
      "全片口型比例在 40% ~ 50% 黄金区间"
    ]
  },
  {
    id: 7,
    name: "拼接成片与母带双轨重贴",
    shortName: "关 7: 双轨合成",
    phase: "后期合成",
    stepIndex: 11,
    isHardBarrier: false,
    description: "向上对齐帧网格并精准裁切。输出两条成片：一条重贴无损原曲母带交付，一条内嵌逐段音频用于交叉验证。",
    reviewMode: "Machine + Human HTML",
    keyChecks: [
      "全曲伴奏底轨贯穿保活 (前奏/间奏/尾奏/气口杜绝任何静音断层)",
      "时长贴合消除浮点漂移",
      "母带原声强制替换合成",
      "双轨盲审比对就绪"
    ]
  },
  {
    id: 8,
    name: "对齐三实验收与复盘发版",
    shortName: "关 8: 对齐三验",
    phase: "验收发版",
    stepIndex: 12,
    isHardBarrier: true,
    description: "音频包络提取 + 局部时滞搜索：最优滞后量 <=80ms，相关度 >=0.78，人声能量 >=-36dBFS。复盘三问沉淀发版。",
    reviewMode: "Audit Verification",
    keyChecks: [
      "指标 1: 最优时间滞后 |τ| <= 80ms",
      "指标 2: 归一化波形相关度 >= 0.78",
      "指标 3: 人声有效能量 >= -36 dBFS",
      "复盘三问沉淀并同步代码、文档与清单"
    ]
  }
];

export const DEMO_DIALOGUES: DialogueLine[] = [
  { id: "line_01", start: 0.0, end: 4.5, speakerId: "S1", speakerName: "环境空镜", text: "[九宫格 S1 极远景全景建立 · 暴雨狂风吹竹林 / 老式红砖房]", type: "establishing", confidence: 0.99, isInstrumental: true },
  { id: "line_02", start: 4.5, end: 9.0, speakerId: "S2", speakerName: "S2 女主/对手", text: "这道门，你今天若踏进去，就再无退路！", type: "dialogue", confidence: 0.98 },
  { id: "line_03", start: 9.0, end: 13.5, speakerId: "S1", speakerName: "S1 主角/银枪", text: "退路？我自踏入这江湖起，就没打算回头！", type: "dialogue", confidence: 0.96 },
  { id: "line_04", start: 13.5, end: 17.8, speakerId: "S1", speakerName: "动作音效", text: "[九宫格 S5 交击位 · 长枪回马磕飞刀 · 金铁激鸣火星迸溅]", type: "action_clash", confidence: 0.99, isInstrumental: true },
  { id: "line_05", start: 17.8, end: 22.4, speakerId: "S1", speakerName: "S1 主角", text: "见她如见我！谁敢动她分毫，先问过我手中这杆枪！", type: "climax_declaration", confidence: 0.99 },
  { id: "line_06", start: 22.4, end: 27.2, speakerId: "S2", speakerName: "S2 对手", text: "好大的口气！那就看你有没有这个本事！", type: "dialogue", confidence: 0.96 },
  { id: "line_07", start: 27.2, end: 32.0, speakerId: "S1", speakerName: "定格收势", text: "[九宫格 S9 远景深 · 雨幕渐歇 · 二人对峙定格]", type: "outro", confidence: 0.99, isInstrumental: true },
];

export const DEMO_LYRICS = DEMO_DIALOGUES; // Backward compatibility alias

export const DEMO_STORYBOARD: StoryboardShot[] = [
  {
    id: "shot_01",
    index: 1,
    start: 0.0,
    end: 4.5,
    duration: 4.5,
    shotScale: "ELS",
    cameraMotion: "Slow panoramic tilt down matching 9-Grid S1 establishing view",
    isLipSync: false,
    speakerId: "S1",
    lyricsSnippet: "[第1段视频起步 · 九宫格 S1 全景机位建立空间关系]",
    sceneGridCellId: 1,
    sceneGridCellName: "全景建立视角 (Wide Establishing)",
    propId: "prop_wuxia_spear",
    propName: "玄铁银枪 (道具多宫格)",
    dryVocalStatus: "extracted_source",
    dryVocalAssetId: "dry_vocal_p01_s1",
    dryVocalSnippet: "S1 顾沉/银枪少侠 原始声源 (生成后立即提取干声)",
    prompt: `[SHOT]
Shot scale: Extreme Long Shot. Camera motion: Slow cinematic high-altitude crane down drift through storm.

[SUBJECT]
<Subject 4> 是九宫格场景大图中的第 1 机位【全景建立视角】：平视极远景，暴雨幽深毛竹林决战场，密密麻麻苍翠毛竹在狂风中倾斜，地面湿滑积水与青石板。

[ACTION]
Atmospheric spatial establishment. Ground mist swirling, lightning flashing in distant sky. Mouth naturally closed, lips completely still, no talking.

[ENVIRONMENT]
A grand cinematic wuxia bamboo forest battlefield under violent rainfall.

[LIGHTING_COLOR]
Nocturnal blue storm backlight with sharp lightning rim lights, high dynamic range.

[CAMERA_TECH]
8k resolution, cinematic anamorphic lens, photorealistic film grain, 24fps motion blur.`,
    negativePrompt: "text, words, subtitles, watermark, logo, singing, mouth open, distorted perspective, extra structures, cartoon",
    fingerprint: "a93f1d8c0b24e671",
    pool: "spot_free",
    costUsd: 0.0,
    status: "completed",
    lagMs: -12.0,
    correlation: 0.92,
    vocalDbfs: -44.2
  },
  {
    id: "shot_02",
    index: 2,
    start: 4.5,
    end: 9.0,
    duration: 4.5,
    shotScale: "CU",
    cameraMotion: "Eye-level slow push-in focusing on lead actor dialogue",
    isLipSync: true,
    speakerId: "S2",
    lyricsSnippet: "这道门，你今天若踏进去，就再无退路！",
    sceneGridCellId: 2,
    sceneGridCellName: "核心对决位 (Hero Arena)",
    propId: "prop_wuxia_flying_knife",
    propName: "子母飞刀 (道具多宫格)",
    dryVocalStatus: "extracted_source",
    dryVocalAssetId: "dry_vocal_p01_s2",
    dryVocalSnippet: "S2 对白干声已提取 · 纯度 34.5dB SNR",
    prompt: `[SHOT]
Shot scale: Close-Up. Camera motion: Slow subtle push-in tracking shot toward the speaker's face.

[SUBJECT]
<Subject 2> 对手角色面容微冷，雨水自发丝滴落，眼神锋芒毕露。<Subject 4> 依托九宫格第 2 机位【核心对决位】背景。

[ACTION]
Speaking dialogue: <d>[中文] 这道门，你今天若踏进去，就再无退路！</d> 咬字冷冽，胸腔微震。

[ENVIRONMENT]
Bamboo trees swaying behind her, heavy rain splashing on shoulders.

[LIGHTING_COLOR]
Cool blue environmental rim light, crisp edge lighting emphasizing intense expression.

[CAMERA_TECH]
Photorealistic, cinematic Kodak Vision3 profile, shallow depth of field, natural 24fps.`,
    negativePrompt: "text, subtitles, watermark, distorted face, oversaturated, cartoon, 3d render",
    fingerprint: "f428c90e55b172a3",
    pool: "spot_free",
    costUsd: 0.0,
    status: "completed",
    lagMs: 24.5,
    correlation: 0.88,
    vocalDbfs: -21.4
  },
  {
    id: "shot_03",
    index: 3,
    start: 9.0,
    end: 13.5,
    duration: 4.5,
    shotScale: "MCU",
    cameraMotion: "Lateral slide along fighting corridor with weapon in view",
    isLipSync: true,
    speakerId: "S1",
    lyricsSnippet: "退路？我自踏入这江湖起，就没打算回头！",
    sceneGridCellId: 3,
    sceneGridCellName: "45° 侧身透视 (Lateral Flank)",
    propId: "prop_wuxia_spear",
    propName: "玄铁银枪 (道具多宫格)",
    dryVocalStatus: "auto_chained_inherited",
    dryVocalAssetId: "dry_vocal_p01_s1",
    dryVocalSnippet: "✓ 已自动调取第1段 S1 磁性干声 (Node 34 绑定)",
    prompt: `[SHOT]
Shot scale: Medium Close-Up. Camera motion: Smooth sideways tracking dolly alongside protagonist stance.

[SUBJECT]
<Subject 1> 主角横枪立马，黑发飞扬，眼神如电，单手握持 <Subject 3> 玄铁银枪。<Subject 4> 对应九宫格第 3 机位【45° 侧身透视】。

[ACTION]
Speaking dialogue: <d>[中文] 退路？我自踏入这江湖起，就没打算回头！</d> (自动继承第1段提取干声音色).

[ENVIRONMENT]
Dense bamboo stalks receding in 45-degree linear perspective, rain trails cascading down gun barrel.

[LIGHTING_COLOR]
High-contrast side key light illuminating weapon metallic edge and rain mist.

[CAMERA_TECH]
8k, cinematic anamorphic bokeh, authentic textures, organic camera motion.`,
    negativePrompt: "text, subtitles, watermark, deformed hands, broken weapon, cartoon, jitter",
    fingerprint: "b715e290dc419a64",
    pool: "priority_paid",
    costUsd: 0.35,
    status: "completed",
    lagMs: 18.0,
    correlation: 0.85,
    vocalDbfs: -23.1
  },
  {
    id: "shot_04",
    index: 4,
    start: 13.5,
    end: 17.8,
    duration: 4.3,
    shotScale: "MS",
    cameraMotion: "Dynamic tracking of weapon clash impact point",
    isLipSync: false,
    speakerId: "S1",
    lyricsSnippet: "[第2段核心高潮 · 调取九宫格 S5 受力交击与道具多宫格 P01/P02]",
    sceneGridCellId: 5,
    sceneGridCellName: "物理碰撞受力锚点 (Impact Anchor)",
    propId: "prop_wuxia_flying_knife",
    propName: "子母飞刀相击 (道具多宫格)",
    dryVocalStatus: "auto_chained_inherited",
    dryVocalAssetId: "dry_vocal_p01_s1",
    dryVocalSnippet: "✓ 已自动调取第1段短喝音效干声",
    prompt: `[SHOT]
Shot scale: Medium Shot. Camera motion: Rapid whip-pan following the clash of cold steel.

[SUBJECT]
<Subject 1> 银枪枪尖与 <Subject 3> 破空飞刀在半空猛烈撞击！背景严丝合缝对齐九宫格第 5 机位【物理碰撞/受击锚点】。

[ACTION]
0~1.5s 枪尖甩出残月弧光；1.5~2.5s 枪尖硬磕飞刀，爆出金黄与炽白刺目金属撞击火花；2.5~4.3s 飞刀打着旋擦入竹身，木屑炸裂。

[ENVIRONMENT]
Impact epicenter with shattered bamboo splinters and rain droplets blasted outwards in radial shockwave.

[LIGHTING_COLOR]
Sudden burst of blinding white-orange spark flashes illuminating rain curtains.

[CAMERA_TECH]
Arri Alexa 65 look, ultra-sharp shutter, zero hallucinated extra blades.`,
    negativePrompt: "text, subtitles, watermark, distorted limbs, rubber weapons, cartoon, blur",
    fingerprint: "c3098f12a441e88d",
    pool: "spot_free",
    costUsd: 0.0,
    status: "completed",
    lagMs: 5.0,
    correlation: 0.94,
    vocalDbfs: -46.0
  },
  {
    id: "shot_05",
    index: 5,
    start: 17.8,
    end: 22.4,
    duration: 4.6,
    shotScale: "MCU",
    cameraMotion: "Rotational orbit around hero holding position",
    isLipSync: true,
    speakerId: "S1",
    lyricsSnippet: "见她如见我！谁敢动她分毫，先问过我手中这杆枪！",
    sceneGridCellId: 7,
    sceneGridCellName: "主光源投射面 (Main Rim Light)",
    propId: "prop_wuxia_spear",
    propName: "玄铁银枪 (道具多宫格)",
    dryVocalStatus: "auto_chained_inherited",
    dryVocalAssetId: "dry_vocal_p01_s1",
    dryVocalSnippet: "✓ 第3段自动继承第1段干声指纹 (vp_s1_7b29a1)",
    prompt: `[SHOT]
Shot scale: Medium Close-Up. Camera motion: Fluid circular 45-degree rotational orbit around protagonist.

[SUBJECT]
<Subject 1> 主角立于暴雨之中，枪尖斜指地面，雨水在枪尖汇成水线滴落。背景对齐九宫格第 7 机位【主光源投射面】。

[ACTION]
Speaking dialogue: <d>[中文] 见她如见我！谁敢动她分毫，先问过我手中这杆枪！</d> 音色 100% 继承自第 1 段提取干声。

[ENVIRONMENT]
Rain curtain illuminated by oblique moonlight beam filtering through bamboo canopy.

[LIGHTING_COLOR]
Vibrant cinematic rim lighting, backlit rain particles creating a glowing halo.

[CAMERA_TECH]
8k cinematic mastery, 35mm master prime, volumetric mist, crisp textures.`,
    negativePrompt: "text, subtitles, watermark, mouth closed, stuttering frames, 3d CGI",
    fingerprint: "d891e4f3aa274c10",
    pool: "priority_paid",
    costUsd: 0.45,
    status: "completed",
    lagMs: 31.0,
    correlation: 0.89,
    vocalDbfs: -18.2
  },
  {
    id: "shot_06",
    index: 6,
    start: 22.4,
    end: 27.2,
    duration: 4.8,
    shotScale: "CU",
    cameraMotion: "Intimate handheld tremor facing the antagonist reaction",
    isLipSync: true,
    speakerId: "S2",
    lyricsSnippet: "好大的口气！那就看你有没有这个本事！",
    sceneGridCellId: 6,
    sceneGridCellName: "反拍景深机位 (Reverse Depth)",
    propId: "prop_wuxia_flying_knife",
    propName: "子母飞刀 (道具多宫格)",
    dryVocalStatus: "auto_chained_inherited",
    dryVocalAssetId: "dry_vocal_p01_s2",
    dryVocalSnippet: "✓ 第3段自动继承第1段 S2 冷厉干声音色",
    prompt: `[SHOT]
Shot scale: Close-Up. Camera motion: Subtle intimate camera breathing motion on antagonist.

[SUBJECT]
<Subject 2> 对手神色震动随即化为更甚的冷厉，九宫格第 6 机位【反拍景深机位】完美交代其背后退路。

[ACTION]
Speaking dialogue: <d>[中文] 好大的口气！那就看你有没有这个本事！</d> 语速骤快，尾音如刀。

[ENVIRONMENT]
Bamboo forest background blurring into soft rain bokeh spheres.

[LIGHTING_COLOR]
High key contrast with flash of distant thunder lighting her cold eyes.

[CAMERA_TECH]
8k photorealistic perfection, organic camera breathing, natural skin micro-textures.`,
    negativePrompt: "text, subtitles, watermark, flat lighting, lowres, warped limbs",
    fingerprint: "e10287a93cd561f2",
    pool: "priority_paid",
    costUsd: 0.45,
    status: "completed",
    lagMs: 16.0,
    correlation: 0.91,
    vocalDbfs: -19.5
  },
  {
    id: "shot_07",
    index: 7,
    start: 27.2,
    end: 32.0,
    duration: 4.8,
    shotScale: "Back-View",
    cameraMotion: "Slow pull-back revealing endless bamboo depth and stance",
    isLipSync: false,
    speakerId: "S1",
    lyricsSnippet: "[第4段定格收势 · 调取九宫格 S9 远景深 · 全剧无数段落无缝调取]",
    sceneGridCellId: 9,
    sceneGridCellName: "远景环境空气延伸 (Atmospheric Depth)",
    propId: "prop_wuxia_spear",
    propName: "玄铁银枪 (道具多宫格)",
    dryVocalStatus: "auto_chained_inherited",
    dryVocalAssetId: "dry_vocal_p01_s1",
    dryVocalSnippet: "✓ 无限段落干声库全局就绪",
    prompt: `[SHOT]
Shot scale: Back-View. Camera motion: Slow cinematic pull-back widening the frame into misty distance.

[SUBJECT]
Back of <Subject 1> standing motionless like a lone pine in the bamboo forest, long spear upright beside him. 对齐九宫格第 9 机位【远景环境空气延伸】。

[ACTION]
Rain steadily pouring down, character standing motionless in battle-ready poise. Mouth naturally closed, lips completely still, no talking.

[ENVIRONMENT]
Vast bamboo sea receding into dense midnight fog, raindrops splashing on wet rocks.

[LIGHTING_COLOR]
Deep nocturnal cyan and emerald palette, volumetric atmospheric fog diffusion.

[CAMERA_TECH]
Cinema-grade wide lens, pristine composition, slow shutter filmic trail.`,
    negativePrompt: "text, subtitles, watermark, singing, mouth open, lip-sync, talking, cartoon, 3d CGI",
    fingerprint: "92bb34f820c78914",
    pool: "spot_free",
    costUsd: 0.0,
    status: "completed",
    lagMs: -4.0,
    correlation: 0.95,
    vocalDbfs: -48.0
  }
];

export const SIX_IRON_RULES_LIST = [
  {
    code: "A",
    title: "台词与动作时序是唯一基准（干声贯穿提取与多段复用）",
    tagline: "Script & Timing As Truth & Dry Vocal Reuse",
    rule: "段长、切点、口型位置由台词对白与招式时序严格推导。第1段视频生成后立即提取纯净干声，方便第2段及后续无数段落自动调取。前奏、间奏、尾声保持环境声场或全片贯穿底轨铺底，绝不出现任何静音断层。"
  },
  {
    code: "B",
    title: "只有中近景才对口型",
    tagline: "Restricted Lip-Sync Shot Scales",
    rule: "允许对口型仅限四类：大特写(ECU)、特写(CU)、近景(MCU)、中景(MS)。远景、全景、空镜、背影一律严禁开口。连续对口型<=3段，全片口型率~45%。"
  },
  {
    code: "C",
    title: "台词严格遵循 <d> 规范（画面纯净铁律，严禁出现乱码印字）",
    tagline: "Dialogue Syntax & Zero Screen Text Trap",
    rule: "发声行以 <d>[语言] ...</d> 形式编写。成片画面严禁任何印刷体文字与字幕混入：正向禁止索要字幕文字，负向必须强行封死 text, words, subtitles, lyrics, watermark，杜绝画面出现乱码。非口型段正向强行注入 mouth naturally closed，负向必须压制 lip-sync。"
  },
  {
    code: "D",
    title: "不猜字段、不烧冤枉钱",
    tagline: "Defensive Execution",
    rule: "先拉取后端工作流节点表体检再改造，契约不过拒绝提交。共享模板清洗残留人脸音轨。九宫格场景图与道具多宫格资产只传一次入库复用。双池真钱封顶独立开关。"
  },
  {
    code: "E",
    title: "八道关 + 对齐三验",
    tagline: "Two-Tier Gates & Verification",
    rule: "双关制：机检硬门禁 + HTML可视复核。成片必过三验：时长守恒、局部互相关相关度>=0.78、滞后量<=80ms、人声能量>=-36dBFS。任一不过拒绝交付。"
  },
  {
    code: "F",
    title: "会自己长本事 (自演进闭环)",
    tagline: "Self-Evolution & Institutional Memory",
    rule: "每个短剧/动作片段必做复盘三问。经验必须同时落到代码、文档、自检清单三处方可发版。具备自动快照和回滚防线。"
  }
];
