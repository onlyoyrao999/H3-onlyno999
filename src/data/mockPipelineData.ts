export interface LyricLine {
  id: string;
  start: number; // in seconds
  end: number;
  text: string;
  type: 'intro' | 'verse' | 'chorus' | 'bridge' | 'interlude' | 'outro';
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
  lyricsSnippet: string;
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
    name: "歌词提取与强制对齐",
    shortName: "关 1: 歌词对齐",
    phase: "准备阶段",
    stepIndex: 1,
    isHardBarrier: false,
    description: "ASR 语音识别负责提供时间戳，官方歌词进行词级 Levenshtein 纠偏，确立全链唯一时间基准。",
    reviewMode: "Machine + Human HTML",
    keyChecks: ["ASR 待核错字纠偏", "间奏/Solo 器乐段独立打标", "词行首尾毫秒时间戳固化"]
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
    name: "MV 分镜设计与切段",
    shortName: "关 4: 分镜设计",
    phase: "结构设计",
    stepIndex: 4,
    isHardBarrier: false,
    description: "切点严格落在歌词句尾或乐句呼吸点，严禁一词切半；分配景别、运镜方向与口型策略。",
    reviewMode: "Machine + Human HTML",
    keyChecks: ["切点严禁切断单句歌词", "运镜动势与乐句能量匹配", "初设口型与景别初审"]
  },
  {
    id: 5,
    name: "提示词派生与 11 项机检",
    shortName: "关 5: 提示词硬门禁",
    phase: "核心门禁",
    stepIndex: 5,
    isHardBarrier: true,
    description: "六段式结构 + 唱歌专用独立框架 + 嘴唇闭合正负双向压制。11 项机检全绿方可放行，计算防伪指纹。",
    reviewMode: "Machine Hard Block",
    keyChecks: [
      "1. 六段式结构完整度 [SHOT] 至 [CAMERA_TECH]",
      "2. 语言分层 (英文键名与参数，中文叙述与歌词)",
      "3. 独立行 Singing vocals: \"...\"",
      "4. 绝无 saying/talking 等对白动词",
      "5. 口型段仅限特写/中景 (ECU/CU/MCU/MS)",
      "6. 非口型段正向必须含 mouth naturally closed",
      "7. 负向必须注入 text/subtitles/lyrics/watermark 防文字压制 (MV画面严禁任何文字出现)",
      "8. 人物识别特征一致性锚点",
      "9. 无日夜/光照逻辑自相矛盾词",
      "10. 短窗口动作幅度适配度",
      "11. SHA-256 签名校验，改写自动退回"
    ]
  },
  {
    id: 6,
    name: "音乐窗口与口型核对",
    shortName: "关 6: 窗口硬门禁",
    phase: "核心门禁",
    stepIndex: 6,
    isHardBarrier: true,
    description: "窗口首尾相接无间断、时长合计严格等于全曲长、口型景别完全一致、连续对口型<=3段、全片口型率~45%。",
    reviewMode: "Machine Hard Block",
    keyChecks: [
      "分镜数学闭环: Start_i == End_{i-1}",
      "严禁任何手工四舍五入秒数",
      "总时长 ∑ == 母带音频时长",
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

export const DEMO_LYRICS: LyricLine[] = [
  { id: "lyric_01", start: 0.0, end: 4.5, text: "[前奏器乐演奏 · 雨夜街道环境音]", type: "intro", confidence: 0.99, isInstrumental: true },
  { id: "lyric_02", start: 4.5, end: 9.0, text: "夜色渐浓 街灯也渐渐熄灭", type: "verse", confidence: 0.98 },
  { id: "lyric_03", start: 9.0, end: 13.5, text: "车窗倒映着 捉摸不透的侧脸", type: "verse", confidence: 0.95 },
  { id: "lyric_04", start: 13.5, end: 17.8, text: "[电吉他轻扫与心跳底鼓过渡]", type: "interlude", confidence: 0.99, isInstrumental: true },
  { id: "lyric_05", start: 17.8, end: 22.4, text: "如果时间能在此刻冻结成碎片", type: "chorus", confidence: 0.99 },
  { id: "lyric_06", start: 22.4, end: 27.2, text: "我是否还能抓住 那未说完的誓言", type: "chorus", confidence: 0.96 },
  { id: "lyric_07", start: 27.2, end: 32.0, text: "[尾奏渐弱 · 城市远景虚化]", type: "outro", confidence: 0.99, isInstrumental: true },
];

export const DEMO_STORYBOARD: StoryboardShot[] = [
  {
    id: "shot_01",
    index: 1,
    start: 0.0,
    end: 4.5,
    duration: 4.5,
    shotScale: "ELS",
    cameraMotion: "Slow crane down over mist-draped urban skyscrapers",
    isLipSync: false,
    lyricsSnippet: "[前奏器乐演奏 · 雨夜街道环境音]",
    prompt: `[SHOT]
Shot scale: Extreme Long Shot. Camera motion: Slow high-altitude crane down drift through rain.

[SUBJECT]
Silhouetted wet city boulevard viewed from above, tiny glowing taillights flowing like rivers of ruby and amber.

[ACTION]
Vehicles crawling slowly in distant rainy haze. Mouth naturally closed, lips completely still, not moving along with vocals, no singing or talking.

[ENVIRONMENT]
A sprawling cyberpunk metropolis at 2 AM, dense skyscrapers illuminated by cyan neon signs, glistening asphalt.

[LIGHTING_COLOR]
Moody cinematic neon teal and sodium-vapor orange reflections on wet surfaces, high dynamic contrast.

[CAMERA_TECH]
8k resolution, anamorphic lens flare, photorealistic cinematic film grain, 24fps motion blur.`,
    negativePrompt: "text, words, subtitles, lyrics, captions, watermark, logo, typography, singing, mouth open, lip-sync, talking, speaking, vocalizing, open lips, bright daylight, cartoon, 3d render",
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
    cameraMotion: "Eye-level slow push-in with 50mm cinematic prime lens",
    isLipSync: true,
    lyricsSnippet: "夜色渐浓 街灯也渐渐熄灭",
    prompt: `[SHOT]
Shot scale: Close-Up. Camera motion: Slow subtle push-in tracking shot toward the vocalist's face.

[SUBJECT]
A young Asian female singer in her early 20s, delicate porcelain skin, emotive glistening dark eyes, wearing an oversized dark crimson knit scarf.

[ACTION]
Standing near a misted vintage cafe window, gazing out with deep nostalgic longing.
Singing vocals: "夜色渐浓 街灯也渐渐熄灭"

[ENVIRONMENT]
Interior of a warm dim boutique cafe, rain streaks sliding down the glass beside her, blurred city neon bokeh in backdrop.

[LIGHTING_COLOR]
Soft amber interior key light caressing her cheekbones, moody blue backlight from the wet windowpane.

[CAMERA_TECH]
Photorealistic, cinematic Kodak Vision3 color profile, shallow depth of field, natural 24fps shutter cadence.`,
    negativePrompt: "text, words, subtitles, lyrics, captions, watermark, logo, typography, cartoon, 3d render, distorted face, oversaturated, unnatural expressions, lowres",
    fingerprint: "f428c90e55b172a3",
    pool: "spot_free",
    costUsd: 0.0,
    status: "completed",
    useUploadedBackground: true,
    backgroundImageName: "rainy_neon_street.png",
    backgroundImageUrl: "data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"360\" height=\"640\" viewBox=\"0 0 360 640\"><defs><linearGradient id=\"bg\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"100%\"><stop offset=\"0%\" stop-color=\"%23090d16\"/><stop offset=\"50%\" stop-color=\"%230f172a\"/><stop offset=\"100%\" stop-color=\"%23020617\"/></linearGradient><linearGradient id=\"neonCyan\" x1=\"0%\" y1=\"0%\" x2=\"0%\" y2=\"100%\"><stop offset=\"0%\" stop-color=\"%2306b6d4\" stop-opacity=\"0.8\"/><stop offset=\"100%\" stop-color=\"%230891b2\" stop-opacity=\"0.1\"/></linearGradient><linearGradient id=\"neonAmber\" x1=\"0%\" y1=\"0%\" x2=\"0%\" y2=\"100%\"><stop offset=\"0%\" stop-color=\"%23f59e0b\" stop-opacity=\"0.8\"/><stop offset=\"100%\" stop-color=\"%23d97706\" stop-opacity=\"0.1\"/></linearGradient></defs><rect width=\"360\" height=\"640\" fill=\"url(%23bg)\"/><path d=\"M0 380 L180 320 L360 380 L360 640 L0 640 Z\" fill=\"%23020617\"/><rect x=\"20\" y=\"160\" width=\"30\" height=\"180\" fill=\"url(%23neonCyan)\" rx=\"4\"/><rect x=\"310\" y=\"140\" width=\"30\" height=\"200\" fill=\"url(%23neonAmber)\" rx=\"4\"/><line x1=\"0\" y1=\"460\" x2=\"360\" y2=\"460\" stroke=\"%2338bdf8\" stroke-opacity=\"0.3\" stroke-width=\"2\"/></svg>",
    imageGenStatus: "completed",
    imageGenPlugin: "buddy-multimodal-generation",
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
    cameraMotion: "Lateral slide along the passenger car window",
    isLipSync: true,
    lyricsSnippet: "车窗倒映着 捉摸不透的侧脸",
    prompt: `[SHOT]
Shot scale: Medium Close-Up. Camera motion: Smooth sideways tracking dolly alongside vehicle interior.

[SUBJECT]
The same female singer seated inside a vintage car, head turned three-quarters toward camera, looking at her faint reflection.

[ACTION]
Touching the cold windowpane gently with fingertips.
Singing vocals: "车窗倒映着 捉摸不透的侧脸"

[ENVIRONMENT]
Night driving through rainy expressway tunnels, abstract neon light streaks gliding across the car leather interior.

[LIGHTING_COLOR]
Chiaroscuro lighting, rhythmically shifting tunnel illumination with emerald and warm tungsten hues.

[CAMERA_TECH]
8k, cinematic anamorphic bokeh, high textural realism, authentic low-light film look.`,
    negativePrompt: "text, words, subtitles, lyrics, captions, watermark, logo, typography, deformed fingers, talking dialogue, flat lighting, CG rendering, jitter",
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
    shotScale: "Scenery",
    cameraMotion: "Macro rack focus on raindrop ripples on glass",
    isLipSync: false,
    lyricsSnippet: "[电吉他轻扫与心跳底鼓过渡]",
    prompt: `[SHOT]
Shot scale: Scenery. Camera motion: Extreme macro slow tilt down following water droplets.

[SUBJECT]
Glistening raindrops running down dark textured glass, distorting distant city traffic lights into abstract glowing circular bokeh.

[ACTION]
Natural water flow physics. Mouth naturally closed, lips completely still, not moving along with vocals, pure ambient visual.

[ENVIRONMENT]
Urban window surface at midnight during a gentle downpour, atmospheric solitude.

[LIGHTING_COLOR]
Deep sapphire blue ambient with sparkling gold specular highlights inside each falling water droplet.

[CAMERA_TECH]
Arri Alexa 65 look, ultra-sharp macro focus, buttery smooth motion blur, natural optics.`,
    negativePrompt: "text, words, subtitles, lyrics, captions, watermark, logo, typography, singing, mouth open, lip-sync, talking, speaking, human face, cartoon, digital noise",
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
    shotScale: "MS",
    cameraMotion: "Dynamic orbit shot around the singer as rain falls around her",
    isLipSync: true,
    lyricsSnippet: "如果时间能在此刻冻结成碎片",
    prompt: `[SHOT]
Shot scale: Medium Shot. Camera motion: Fluid circular 45-degree rotational orbit around the character.

[SUBJECT]
The young female vocalist holding a transparent clear umbrella, singing with powerful emotional crescendo.

[ACTION]
Singing with heartfelt passion, chest rising and falling with melodic phrasing.
Singing vocals: "如果时间能在此刻冻结成碎片"

[ENVIRONMENT]
An empty wet pedestrian bridge suspended above a neon-lit crossroad, droplets shimmering under lamplight.

[LIGHTING_COLOR]
Vibrant cinematic rim lighting, backlit rain particles creating a glowing halo, dramatic contrast.

[CAMERA_TECH]
8k cinematic mastery, 35mm master prime, volumetric fog, Kodak 5219 film grain.`,
    negativePrompt: "text, words, subtitles, lyrics, captions, watermark, logo, typography, mouth closed, speaking tone, plastic look, floating limbs, stuttering frames",
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
    cameraMotion: "Intimate handheld tremor facing the vocalist's expression",
    isLipSync: true,
    lyricsSnippet: "我是否还能抓住 那未说完的誓言",
    prompt: `[SHOT]
Shot scale: Close-Up. Camera motion: Subtle intimate handheld camera breathing motion.

[SUBJECT]
The singer looking directly into camera with soulful resonance, a solitary raindrop trailing down her cheek like a tear.

[ACTION]
Delivering the climactic lyric with gentle mouth shaping and vocal vibrato.
Singing vocals: "我是否还能抓住 那未说完的誓言"

[ENVIRONMENT]
Surrounding city lights fading into misty circular bokeh spheres, intimate focal isolation.

[LIGHTING_COLOR]
Warm golden hour glow from an unseen neon shop window warmly illuminating her expression against deep indigo night.

[CAMERA_TECH]
8k photorealistic perfection, organic camera shake, natural facial skin micro-textures.`,
    negativePrompt: "text, words, subtitles, lyrics, captions, watermark, logo, typography, talking, speech dialogue, wooden expression, low resolution, warped features",
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
    cameraMotion: "Slow pull-back revealing her silhouette vanishing into the mist",
    isLipSync: false,
    lyricsSnippet: "[尾奏渐弱 · 城市远景虚化]",
    prompt: `[SHOT]
Shot scale: Back-View. Camera motion: Slow cinematic pull-back widening the frame.

[SUBJECT]
Back of the singer walking away along the rainy bridge into the soft city haze, dark trench coat flowing.

[ACTION]
Walking serenely into the distance. Mouth naturally closed, lips completely still, not moving along with vocals, no turning around.

[ENVIRONMENT]
Wide bridge vanishing into luminous midnight mist, city skyline glowing faintly like a distant dream.

[LIGHTING_COLOR]
Cool blue and lavender nocturnal tones, soft gradient diffusion, atmospheric perspective.

[CAMERA_TECH]
Cinema-grade wide lens, pristine composition, slow shutter filmic trail.`,
    negativePrompt: "text, words, subtitles, lyrics, captions, watermark, logo, typography, singing, mouth open, lip-sync, talking, turning around, cartoon, 3d CGI",
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
    title: "音乐是唯一的时间基准（全曲伴奏贯穿保活）",
    tagline: "Music As Single Source of Truth & Continuous BGM",
    rule: "段长、切点、口型位置全部由歌词时间轴推导。严禁先画画面再去凑音乐。前奏、间奏、尾奏由母带器乐伴奏 100% 贯通铺底，绝不出现任何静音断层（没有歌曲的地方也保持伴奏流淌）。歌词一行不能少，间奏Solo必须显式成段打标。"
  },
  {
    code: "B",
    title: "只有中近景才对口型",
    tagline: "Restricted Lip-Sync Shot Scales",
    rule: "允许对口型仅限四类：大特写(ECU)、特写(CU)、近景(MCU)、中景(MS)。远景、全景、空镜、背影一律严禁开口。连续对口型<=3段，全片口型率~45%。"
  },
  {
    code: "C",
    title: "唱歌不是说台词（画面纯净铁律，严禁出现文字）",
    tagline: "Singing Is Not Dialogue & Zero Screen Text",
    rule: "发声行以 Singing vocals: \"...\" 独立成行，绝不能写成 saying/talking。MV画面严禁任何文字出现：正向禁止索要字幕文字，负向必须强行封死 text, words, subtitles, lyrics, watermark，杜绝画面出现乱码。非口型段正向强行注入 mouth naturally closed，负向必须压制 lip-sync。"
  },
  {
    code: "D",
    title: "不猜字段、不烧冤枉钱",
    tagline: "Defensive Execution",
    rule: "先拉取后端工作流节点表体检再改造，契约不过拒绝提交。共享模板清洗残留人脸音轨。母带和人物图指纹缓存只传一次。双池真钱封顶独立开关。"
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
    rule: "每支 MV 必做复盘三问。经验必须同时落到代码、文档、自检清单三处方可发版。具备自动快照和回滚防线。"
  }
];
