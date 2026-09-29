/**
 * MiniMax H3 Multi-Genre Video Pipeline Data & Specification
 * Unifies:
 * - 🎵 Music Video (MV)
 * - 🎭 Short Drama (竖版短剧 15s×4段/8段)
 * - 🎬 Commercials (商业广告)
 * Grounded in:
 * - MiniMax H3 Official Prompting Rules (Ref2VA / T2VA)
 * - "一分大神" Three-Workflow Production Pipeline (Qwen T2I -> Qwen Edit -> H3 Ref2VA)
 * - Anti-trap Consistency Locks (Anti-head-cutoff, anti-hallway, anti-subtitle trap)
 */

export type ProductionGenre = 'mv' | 'short_drama' | 'commercial';

export type AspectRatioType = '16:9' | '9:16' | '21:9' | '1:1' | '4:3' | '3:4';

export interface AspectRatioConfig {
  id: AspectRatioType;
  label: string;
  name: string;
  comfyValue: string; // The exact ComfyUI ResolutionSelector enum string
  image1MpRes: string; // 1.0 MP for Qwen T2I/Edit (multiple of 32)
  video04MpRes: string; // 0.4 MP for H3 Video (multiple of 32)
  orientation: 'horizontal' | 'vertical' | 'square';
  description: string;
}

export const ASPECT_RATIO_CONFIGS: Record<AspectRatioType, AspectRatioConfig> = {
  '16:9': {
    id: '16:9',
    label: '16:9',
    name: '16:9 横屏电影/广告/MV',
    comfyValue: '16:9 (Widescreen)',
    image1MpRes: '1376×768',
    video04MpRes: '864×480',
    orientation: 'horizontal',
    description: '标准宽屏 · 横屏短剧 · 商业大片 · 音乐 MV · YouTube · B站'
  },
  '9:16': {
    id: '9:16',
    label: '9:16',
    name: '9:16 竖屏微短剧',
    comfyValue: '9:16 (Portrait Widescreen)',
    image1MpRes: '768×1376',
    video04MpRes: '480×864',
    orientation: 'vertical',
    description: '竖屏短剧 · 抖音 · 视频号 · 快手 · TikTok 沉浸画幅'
  },
  '21:9': {
    id: '21:9',
    label: '21:9',
    name: '21:9 宽银幕大片',
    comfyValue: '21:9 (Ultrawide)',
    image1MpRes: '1536×672',
    video04MpRes: '960×416',
    orientation: 'horizontal',
    description: '变形宽银幕 (Cinemascope) · 电影感震撼横屏'
  },
  '1:1': {
    id: '1:1',
    label: '1:1',
    name: '1:1 正方形画幅',
    comfyValue: '1:1 (Square)',
    image1MpRes: '1024×1024',
    video04MpRes: '640×640',
    orientation: 'square',
    description: '社交媒体 / 动态相册 / 方形封面'
  },
  '4:3': {
    id: '4:3',
    label: '4:3',
    name: '4:3 复古电视',
    comfyValue: '4:3 (Standard)',
    image1MpRes: '1184×896',
    video04MpRes: '736×544',
    orientation: 'horizontal',
    description: '复古胶片感 · 早期电视画幅'
  },
  '3:4': {
    id: '3:4',
    label: '3:4',
    name: '3:4 竖向标准',
    comfyValue: '3:4 (Portrait Standard)',
    image1MpRes: '896×1184',
    video04MpRes: '544×736',
    orientation: 'vertical',
    description: '经典肖像画幅 · 小红书卡片'
  }
};

export interface GenreMeta {
  id: ProductionGenre;
  name: string;
  tagline: string;
  badge: string;
  description: string;
  defaultDuration: number; // in seconds
  segmentCount: number;
  frameFormula: string;
  keyFeature: string;
}

export const PRODUCTION_GENRES: Record<ProductionGenre, GenreMeta> = {
  short_drama: {
    id: 'short_drama',
    name: '🎭 竖版短剧 (Short Drama)',
    tagline: '15秒/362帧分段 · 霸道总裁/爽剧 · 说话人音色锁 · 宽景防裁头',
    badge: 'H3 官方 Ref2VA 规范',
    description: '四段/八段竖版 9:16 多机位对白短剧。通过三张同源场景合成卡锁定宾客与服装，结合 <d>[Chinese]</d> 与全局 (Sx) 映射实现角色一致性。',
    defaultDuration: 60.33,
    segmentCount: 4,
    frameFormula: '17n+5 (15s = 362 帧, 4段 = 60.33s, 8段 = 120.67s)',
    keyFeature: '防裁头宽景 + 宾客同源锁 + 0.35s 音频淡接拼片'
  },
  mv: {
    id: 'mv',
    name: '🎵 音乐 MV (Music Video)',
    tagline: '时间轴强制对齐 · 45% 节制口型率 · 伴奏底轨贯穿保活',
    badge: '12步8关 SOP',
    description: '一首歌 + 一张图，从歌词时间戳到双轨合成。只有特写中景开口唱，间奏/空镜强制闭嘴，消除模型累积漂移。',
    defaultDuration: 32.0,
    segmentCount: 7,
    frameFormula: '自研帧网格时长向上贴合 (24fps PTS cut)',
    keyFeature: '音频包络对齐三验 + 母带原声双轨重贴'
  },
  commercial: {
    id: 'commercial',
    name: '🎬 商业广告 (Commercials / Ads)',
    tagline: '15秒/30秒高能节奏 · 品牌视觉焦点 · 质感与微距特写',
    badge: '高保真影视级',
    description: '以极速钩子 (Hook)、痛点共鸣、产品核心机制与品牌 Slogan 为轴心的商业级分镜，严格约束材质光影与无水印。',
    defaultDuration: 15.083,
    segmentCount: 4,
    frameFormula: '17n+5 (15s = 362 帧)',
    keyFeature: '电影级光影反差 + 0 乱码字 + 动作动势匹配'
  }
};

/**
 * Drama Beat / Script Item
 */
export interface DramaBeat {
  id: string;
  segmentIndex: number; // 1 to 4 or 8
  shotInSegment: number; // 1 to 4
  shotScale: 'Wide' | 'Medium' | 'MCU' | 'Reaction-Cut';
  speakerId?: 'S1' | 'S2' | 'S3';
  speakerName?: string;
  dialogue?: string;
  cameraMovement: string;
  antiCutoffStrategy: string;
  isOffScreen?: boolean;
}

/**
 * Three-Workflow Asset Cards (Qwen T2I -> Edit -> H3 Ref2VA)
 */
export interface AssetCard {
  id: string;
  title: string;
  role: 'character' | 'scene_ancestor' | 'composite_ref';
  targetSubject: string;
  prompt: string;
  rulesApplied: string[];
  dimensions: string;
  pixelAudit: {
    greyPercent: number; // must be < 3%
    euclideanDistance: number; // must be < 15
    headCutoffRisk: 'low' | 'moderate' | 'high';
    bottomFloorBandPct: number; // e.g., 6% to 15%
  };
  previewUrl: string;
}

export const DRAMA_ASSET_CARDS: AssetCard[] = [
  {
    id: 'card_scene_ancestor',
    title: '母本场景卡：豪门水晶宴会厅',
    role: 'scene_ancestor',
    targetSubject: '<Subject 4> 宴会厅与宾客',
    dimensions: '768×1376 (9:16 1.0MP)',
    rulesApplied: [
      '第一招：作为所有合成图的唯一母本，从源头消灭影棚底污染',
      '走道两侧各排列圆桌 (5列4排共20张)，杜绝走廊化小气构图',
      '宾客 8 位分三簇虚化排列走道两侧，人数/服装/朝向全部写明'
    ],
    pixelAudit: {
      greyPercent: 0.8,
      euclideanDistance: 0.0,
      headCutoffRisk: 'low',
      bottomFloorBandPct: 18.0
    },
    prompt: 'A wide opulent grand ballroom with five tiered crystal chandeliers down the centre ceiling, dark polished marble floor reflecting warm amber illumination. One narrow central aisle no wider than one table runs straight down the middle. A field of about twenty ivory-draped round tables arranged five columns wide and four rows deep spread across both sides of the aisle from the left to right edges. Eight blurred dinner guests in elegant black-tie suits and evening gowns sit grouped on both sides in soft focus. Very tall dark double doors stand far in the deep background. No signs, no exit lights.',
    previewUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="360" height="640" viewBox="0 0 360 640"><defs><linearGradient id="hallBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="%231a1510"/><stop offset="60%" stop-color="%23261e16"/><stop offset="100%" stop-color="%230d0b09"/></linearGradient><radialGradient id="chandelier" cx="50%" cy="15%" r="40%"><stop offset="0%" stop-color="%23fef08a" stop-opacity="0.9"/><stop offset="40%" stop-color="%23f59e0b" stop-opacity="0.5"/><stop offset="100%" stop-color="%23000000" stop-opacity="0"/></radialGradient></defs><rect width="360" height="640" fill="url(%23hallBg)"/><circle cx="180" cy="80" r="90" fill="url(%23chandelier)"/><path d="M150 240 L210 240 L240 640 L120 640 Z" fill="%231c1917" stroke="%23f59e0b" stroke-opacity="0.2" stroke-width="1"/><ellipse cx="70" cy="380" rx="35" ry="18" fill="%23451a03" stroke="%23d97706" stroke-width="1"/><ellipse cx="290" cy="380" rx="35" ry="18" fill="%23451a03" stroke="%23d97706" stroke-width="1"/><ellipse cx="60" cy="480" rx="42" ry="22" fill="%2378350f" stroke="%23d97706" stroke-width="1"/><ellipse cx="300" cy="480" rx="42" ry="22" fill="%2378350f" stroke="%23d97706" stroke-width="1"/><rect x="165" y="190" width="30" height="60" fill="%23292524" stroke="%23fbbf24" stroke-width="1"/><text x="180" y="60" fill="%23fde047" font-size="12" font-family="sans-serif" text-anchor="middle" font-weight="bold">母本场景卡 (同源锚点)</text></svg>'
  },
  {
    id: 'card_comp_s1',
    title: '合成参考图 1：男主顾总裁 × 宴会厅',
    role: 'composite_ref',
    targetSubject: '<Subject 1> 男主 (S1 顾总裁)',
    dimensions: '576×1024 (Qwen Edit 输出)',
    rulesApplied: [
      '全身构图：头顶距顶边 6%，鞋底距底边 92%，鞋下留地面',
      '完全去除影棚背景与布光，融入宴会厅暖调金光与反射',
      '黑色牛津皮鞋清晰可见，身体转 20° 脸朝镜头'
    ],
    pixelAudit: {
      greyPercent: 1.2,
      euclideanDistance: 8.4,
      headCutoffRisk: 'low',
      bottomFloorBandPct: 8.5
    },
    prompt: '<image1> 是宴会厅画布，<image2> 是男主立绘。将 <image2> 中的男主置于 <image1> 的中央走道上，全身站立，鞋底离画面底部有空地地面，完全清除原影棚底色，继承宴会厅暖色琥珀色主光与高光。',
    previewUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="360" height="640" viewBox="0 0 360 640"><rect width="360" height="640" fill="%231a1510"/><ellipse cx="180" cy="580" rx="55" ry="12" fill="%230f0d0a"/><rect x="155" y="160" width="50" height="70" rx="10" fill="%23f1f5f9"/><rect x="145" y="230" width="70" height="180" rx="8" fill="%230f172a"/><rect x="150" y="410" width="28" height="150" fill="%23020617"/><rect x="182" y="410" width="28" height="150" fill="%23020617"/><ellipse cx="164" cy="565" rx="12" ry="6" fill="%23000000"/><ellipse cx="196" cy="565" rx="12" ry="6" fill="%23000000"/><circle cx="180" cy="115" r="28" fill="%23fcd34d"/><text x="180" y="50" fill="%2338bdf8" font-size="12" font-family="sans-serif" text-anchor="middle" font-weight="bold">男主合成卡 (含地面/鞋子)</text><text x="180" y="615" fill="%2310b981" font-size="10" font-family="sans-serif" text-anchor="middle">鞋底离底边 8.5% (通过)</text></svg>'
  },
  {
    id: 'card_comp_s2',
    title: '合成参考图 2：女主林清晚 × 宴会厅',
    role: 'composite_ref',
    targetSubject: '<Subject 2> 女主 (S2 林清晚)',
    dimensions: '576×1024 (Qwen Edit 输出)',
    rulesApplied: [
      '发型长度硬锁定：过胸长直黑发，严禁短发/卷发/盘发漂移',
      '全身站姿：酒红丝绒长裙，裙摆下露鞋尖与地面，严禁拉到底边',
      '净脸无瑕，五官面部微表情冷峻克制'
    ],
    pixelAudit: {
      greyPercent: 1.5,
      euclideanDistance: 9.1,
      headCutoffRisk: 'low',
      bottomFloorBandPct: 7.8
    },
    prompt: '<image1> 是宴会厅画布，<image2> 是女主立绘。全身站立于走道左侧，长发垂至胸下，酒红丝绒晚礼服下缘留出鞋履与地面，完全去除影棚灰底，重合宴会厅光线。',
    previewUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="360" height="640" viewBox="0 0 360 640"><rect width="360" height="640" fill="%231c1712"/><ellipse cx="180" cy="580" rx="50" ry="10" fill="%230f0d0a"/><circle cx="180" cy="118" r="26" fill="%23fed7aa"/><path d="M160 120 Q150 200 155 240 M200 120 Q210 200 205 240" stroke="%2318181b" stroke-width="8"/><path d="M160 210 L200 210 L218 555 L142 555 Z" fill="%23881337"/><ellipse cx="170" cy="562" rx="10" ry="4" fill="%234c0519"/><ellipse cx="190" cy="562" rx="10" ry="4" fill="%234c0519"/><text x="180" y="50" fill="%23f43f5e" font-size="12" font-family="sans-serif" text-anchor="middle" font-weight="bold">女主合成卡 (发长/身位锁)</text><text x="180" y="615" fill="%2310b981" font-size="10" font-family="sans-serif" text-anchor="middle">发长过胸 · 鞋底留空 7.8%</text></svg>'
  },
  {
    id: 'card_comp_s3',
    title: '合成参考图 3：女配赵美琳 × 宴会厅',
    role: 'composite_ref',
    targetSubject: '<Subject 3> 女配 (S3 赵美琳)',
    dimensions: '576×1024 (Qwen Edit 输出)',
    rulesApplied: [
      '全身站姿：深蓝缎面修身西装，身材挺拔',
      '手持香槟杯位置居胸前，不遮挡下颌线',
      '清除灰底，环境光匹配宴会厅右侧'
    ],
    pixelAudit: {
      greyPercent: 1.1,
      euclideanDistance: 7.9,
      headCutoffRisk: 'low',
      bottomFloorBandPct: 9.0
    },
    prompt: '<image1> 为画布，<image2> 为女配立绘。全身站于走道右侧，香槟杯高度固定，去除影棚背景，融入宴会厅冷暖侧逆光。',
    previewUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="360" height="640" viewBox="0 0 360 640"><rect width="360" height="640" fill="%23191512"/><ellipse cx="180" cy="580" rx="48" ry="10" fill="%230f0d0a"/><rect x="150" y="210" width="60" height="190" rx="6" fill="%231e3a8a"/><rect x="152" y="400" width="26" height="160" fill="%23172554"/><rect x="182" y="400" width="26" height="160" fill="%23172554"/><circle cx="180" cy="115" r="25" fill="%23ffedd5"/><text x="180" y="50" fill="%2360a5fa" font-size="12" font-family="sans-serif" text-anchor="middle" font-weight="bold">女配合成卡 (S3 全局映射)</text><text x="180" y="615" fill="%2310b981" font-size="10" font-family="sans-serif" text-anchor="middle">中性灰占比 1.1% (极净)</text></svg>'
  }
];

/**
 * Short Drama Segment Demo (15s = 362 frames each, 4 segments = 60.33s)
 */
export interface DramaSegmentShot {
  id: string;
  segmentIndex: number;
  shotIndex: number;
  duration: number; // in seconds (e.g. 15.083 for full segment)
  framesCount: number; // 362
  shotScale: string;
  speakerId: 'S1' | 'S2' | 'S3' | 'None';
  speakerLabel: string;
  dialogueSnippet: string;
  seedancePromptExample: string;
  seedanceFlaw: string;
  h3Ref2vaPrompt: string;
  headCutoffCheck: {
    passed: boolean;
    reason: string;
  };
  subtitleRiskCheck: {
    hasForbiddenAntiSubtitleWord: boolean;
    reason: string;
  };
  status: 'approved' | 'completed' | 'generating';
  costUsd: number;
}

export const DEMO_DRAMA_SEGMENTS: DramaSegmentShot[] = [
  {
    id: 'drama_seg_01',
    segmentIndex: 1,
    shotIndex: 1,
    duration: 15.083,
    framesCount: 362,
    shotScale: 'Wide & Mediums (4 Shots in Seg 1)',
    speakerId: 'S3',
    speakerLabel: 'S3 赵美琳 (嘲讽挑衅)',
    dialogueSnippet: '林清晚，你以为顾家这道门，是你想进就能进的？',
    seedancePromptExample: `A beautiful rich woman saying to another woman: "林清晚，你以为顾家这道门是你想进就能进的？" in a luxury ballroom. Close up on her face, angry expression, highly detailed, photorealistic 8k, no text, no subtitles, cinematic.`,
    seedanceFlaw: '缺少六段式结构与角色锚定；使用禁词 saying 导致乱口型；正向写 "no subtitles" 触发 H3 反向敏感必画字幕；近景 Close Up 在 H3 必定裁掉头顶！',
    h3Ref2vaPrompt: `[subject_definitions]
<Subject 1> is the male lead. His face, lean athletic build, black wool three-piece bespoke tuxedo, crisp spread-collar white dress shirt and black silk bow tie come from <Picture 1>, and <Picture 1> also carries the ballroom he stands in. Smooth skin across cheeks and chin with no stubble of any kind.
<Subject 2> is the female lead. Her face, slender frame, wine-red velvet evening gown, and straight black hair hanging clearly well past her chest come from <Picture 2>.
<Subject 3> is the wealthy antagonist woman. Her face, sharp arched eyebrows, dark navy satin tailored trouser suit come from <Picture 3>.
<Subject 4> is the grand banquet ballroom with five tiered crystal chandeliers down the centre axis and twenty ivory-draped round tables arranged on both sides of a single narrow marble aisle.

[summary]
Inside the opulent ballroom, <Subject 3> confronts <Subject 2> beside the marble aisle, questioning her right to attend, while <Subject 1> observes coldly from the shadows.

[retention_analysis]
<Subject 1>, <Subject 2>, <Subject 3> and <Subject 4> are preserved from <Picture 1>, <Picture 2> and <Picture 3>.

[detailed_description]
The grade is locked and identical in every shot: the same exposure, contrast curve and warm amber highlight from the first shot to the last. No two shots repeat the same framing.
[Shot 1] The shot opens on a wide shot of <Subject 4> from the far side at chest height, the ivory-draped tables spread across both sides of the frame. <Subject 2> (S2) and <Subject 3> (S3) stand small in the aisle in lower middle of the frame, the whole of both of them from head to feet inside the picture. <Subject 3> (S3) raises her chin slightly, her mouth moves only while she speaks: <d>[Chinese] 林清晚，你以为顾家这道门，是你想进就能进的？</d>
[Shot 2] The shot cuts to a medium two-shot from the right side at shoulder height. <Subject 2> (S2) stands calm and poised, looking straight into the lens.
[Shot 3] The shot cuts to a low-angle wide view showing the towering double doors behind them.
[Shot 4] The shot cuts to a silent reaction shot of <Subject 2> (S2) raising her eyes calmly, lips completely closed and still, not speaking. The camera stays far back and never comes any closer to anybody.

[overall_soundscape]
Muffled murmur of background ballroom guests, subtle clink of champagne flutes on distant tables.

[non_diegetic_music]
A low tense cello drone building with subtle staccato string pizzicato.`,
    headCutoffCheck: {
      passed: true,
      reason: '宽景明确注明 "whole of both of them from head to feet inside the picture"，无衣物过度描写，防裁头机制完全生效。'
    },
    subtitleRiskCheck: {
      hasForbiddenAntiSubtitleWord: false,
      reason: '未包含 "no subtitles / no text" 等反向敏感词，符合 H3 原生字幕规范。'
    },
    status: 'completed',
    costUsd: 0.35
  },
  {
    id: 'drama_seg_02',
    segmentIndex: 2,
    shotIndex: 2,
    duration: 15.083,
    framesCount: 362,
    shotScale: 'Wide & Reaction Cross (4 Shots in Seg 2)',
    speakerId: 'S2',
    speakerLabel: 'S2 林清晚 (沉着反击)',
    dialogueSnippet: '顾夫人当年亲手给的请柬，赵小姐若有疑虑，大可亲自去问。',
    seedancePromptExample: `The girl in red dress turns around and says: "顾夫人当年亲手给的请柬，赵小姐若有疑虑大可亲自去问。" Medium close-up, angry face, masterpiece, high quality, no watermark, 4k.`,
    seedanceFlaw: '缺少 <Subject N> 绑定导致第二段女主换脸；turns around 诱发背对镜头假对白；Medium close-up 导致 50% 躯干特写裁头；未标明口型同步约束。',
    h3Ref2vaPrompt: `[subject_definitions]
<Subject 1> is the male lead. His face and black bespoke tuxedo come from <Picture 1>.
<Subject 2> is the female lead. Her face, wine-red velvet gown, and straight black hair hanging past her chest come from <Picture 2>.
<Subject 3> is the antagonist woman in dark navy satin suit from <Picture 3>.
<Subject 4> is the grand banquet ballroom with twenty round tables on both sides of the narrow marble aisle.

[summary]
<Subject 2> calmly displays her formal invitation card, speaking with quiet dignity, while <Subject 3> steps backward in irritation.

[retention_analysis]
<Subject 1>, <Subject 2>, <Subject 3> and <Subject 4> are preserved from <Picture 1>, <Picture 2> and <Picture 3>.

[detailed_description]
The grade is locked and identical in every shot: the same exposure and color temperature.
[Shot 1] The shot cuts to a wide profile view across the marble aisle at chest level. <Subject 2> (S2) stands tall on the left, holding a gold-edged embossed card. Her mouth moves only while she speaks: <d>[Chinese] 顾夫人当年亲手给的请柬，赵小姐若有疑虑，大可亲自去问。</d>
[Shot 2] The shot cuts to a frontal view of <Subject 3> (S3) taken from four paces away at eye height, her expression tightening in disbelief.
[Shot 3] The shot cuts to a lateral tracking shot down the row of dining tables showing blurred guests turning their heads.
[Shot 4] The shot cuts to a wide reaction shot from the ballroom entrance. <Subject 2> remains motionless and composed. The camera stays far back and never ends on a nearer framing.

[overall_soundscape]
Sudden hush among nearby guests, faint breath intake.

[non_diegetic_music]
A sudden sharp high violin tremolo resolving into an ominous descending bass note.`,
    headCutoffCheck: {
      passed: true,
      reason: '对白镜设定在胸位宽侧视，保持四步安全机位距离，杜绝近景裁头。'
    },
    subtitleRiskCheck: {
      hasForbiddenAntiSubtitleWord: false,
      reason: '机检无敏感词。'
    },
    status: 'completed',
    costUsd: 0.35
  },
  {
    id: 'drama_seg_03',
    segmentIndex: 3,
    shotIndex: 3,
    duration: 15.083,
    framesCount: 362,
    shotScale: 'Doorway & Wide Push (4 Shots in Seg 3)',
    speakerId: 'S1',
    speakerLabel: 'S1 顾总裁 (霸道入场)',
    dialogueSnippet: '赵小姐对我顾家的家事，似乎比我本人更有兴致？',
    seedancePromptExample: `A cool CEO man opens the door and walks into the hall. He says: "赵小姐对我顾家的家事似乎比我本人更有兴致？" Tight close-up on his cold eyes, dark atmosphere, photorealistic, best quality.`,
    seedanceFlaw: '把大门打开绑在动词上导致门完全无法显现；紧特写 Tight Close-up 直接裁切掉整个头顶只剩衬衫领口；缺少对白标签 <d> 与说话人编号。',
    h3Ref2vaPrompt: `[subject_definitions]
<Subject 1> is the male lead. His face, tall stature, black bespoke tuxedo and white spread-collar shirt come from <Picture 1>.
<Subject 2> is the female lead in wine-red gown from <Picture 2>.
<Subject 3> is the antagonist in navy suit from <Picture 3>.
<Subject 4> is the grand ballroom with chandeliers and the tall double doors at the aisle end.

[summary]
The grand double doors stand ajar as <Subject 1> steps into the ballroom with cold authority, silencing the room.

[retention_analysis]
<Subject 1>, <Subject 2>, <Subject 3> and <Subject 4> are preserved from <Picture 1>, <Picture 2> and <Picture 3>.

[detailed_description]
The grade is locked and identical in every shot.
[Shot 1] A medium shot looking down the aisle from partway along it: the very tall dark double doors stand large in the frame, slightly ajar from the first frame, warm bright vertical backlight pouring through. <Subject 1> (S1) stands upright with his whole height from head to feet inside the glowing doorway.
[Shot 2] The shot cuts to a wide shot as <Subject 1> (S1) walks forward along the marble aisle. His mouth moves only while he speaks: <d>[Chinese] 赵小姐对我顾家的家事，似乎比我本人更有兴致？</d>
[Shot 3] The shot cuts to a wide reaction shot showing <Subject 3> (S3) freezing in place, her glass trembling.
[Shot 4] The shot cuts to a wide tableau framing all three subjects in spatial hierarchy. The camera stays far back for this whole shot and never comes any closer.

[overall_soundscape]
Firm rhythmic leather Oxford shoe footsteps echoing on polished marble, dead silence across the hall.

[non_diegetic_music]
A grand cinematic French horn chord swelling with deep sub-bass pulse.`,
    headCutoffCheck: {
      passed: true,
      reason: '门从第一帧就设定为大主体微开；男主入场全身在光门内，宽景步态推进零裁头。'
    },
    subtitleRiskCheck: {
      hasForbiddenAntiSubtitleWord: false,
      reason: '纯净英文结构 + 规范 <d> 台词标签。'
    },
    status: 'completed',
    costUsd: 0.35
  },
  {
    id: 'drama_seg_04',
    segmentIndex: 4,
    shotIndex: 4,
    duration: 15.083,
    framesCount: 362,
    shotScale: 'Climax Confrontation (4 Shots in Seg 4)',
    speakerId: 'S1',
    speakerLabel: 'S1 顾总裁 (宣示主权)',
    dialogueSnippet: '从今天起，见她如见我。谁敢动她分毫，就是跟我顾沉过不去。',
    seedancePromptExample: `The handsome CEO hugs the girl and says: "从今天起，见她如见我。谁敢动她分毫，就是跟我顾沉过不去。" Intimate close up on their faces, romantic drama, masterpiece, 8k, no text.`,
    seedanceFlaw: '亲密动作描述 "hugs the girl / intimate close up" 会诱发 H3 现场镜头往上猛推，直接将头顶全部裁出画面（本段为全片高潮宣言，裁头即全片报废！）。必须改用宽景双人位！',
    h3Ref2vaPrompt: `[subject_definitions]
<Subject 1> is the male lead from <Picture 1>.
<Subject 2> is the female lead from <Picture 2>.
<Subject 3> is the antagonist from <Picture 3>.
<Subject 4> is the grand ballroom from <Picture 1>.

[summary]
<Subject 1> steps beside <Subject 2>, making a definitive declaration to the entire gathering, solidifying their alliance.

[retention_analysis]
<Subject 1>, <Subject 2>, <Subject 3> and <Subject 4> are preserved from <Picture 1>, <Picture 2> and <Picture 3>.

[detailed_description]
The grade is locked and identical in every shot: the same exposure and warm highlight.
[Shot 1] The shot cuts to a wide shot of <Subject 4> taken from the far side of the room at chest height, the ivory-draped tables spread across both sides. <Subject 1> (S1) and <Subject 2> (S2) stand small side-by-side in the lower middle of the frame, the whole of both of them from head to feet inside the picture. <Subject 1> (S1) faces forward, his mouth moves only while he speaks: <d>[Chinese] 从今天起，见她如见我。谁敢动她分毫，就是跟我顾沉过不去。</d>
[Shot 2] The shot cuts to a wide reverse angle over the sea of dining tables, guests frozen in awe.
[Shot 3] The shot cuts to <Subject 3> (S3) standing small on the far right of the aisle, turning pale.
[Shot 4] The shot cuts to a final wide cinematic freeze. The camera stays far back for this whole shot and never comes any closer to anybody: it does not push in, the distance does not change from the first frame to the last.

[overall_soundscape]
Audible collective gasp across the hall, glasses clinking softly on tables.

[non_diegetic_music]
Heavy triumphant orchestral brass swell reaching sustained crescendo.`,
    headCutoffCheck: {
      passed: true,
      reason: '高潮宣言镜彻底摒弃亲密特写，采用宽景双人位全头全脚入画 + 段末硬锁远离相机，100% 免疫高潮裁头事故。'
    },
    subtitleRiskCheck: {
      hasForbiddenAntiSubtitleWord: false,
      reason: '放行合规。'
    },
    status: 'completed',
    costUsd: 0.35
  }
];

/**
 * Commercial Demo (15s = 362 frames)
 */
export const DEMO_COMMERCIAL_SEGMENT = {
  id: 'comm_seg_01',
  duration: 15.083,
  framesCount: 362,
  brandName: 'CHRONOS PRESTIGE',
  productName: '曜石陀飞轮机械腕表 (Tourbillon Luxury Watch)',
  slogan: '恒久流转，分秒皆为传奇。',
  h3Ref2vaPrompt: `[subject_definitions]
<Subject 1> is the luxury tourbillon wristwatch featuring an obsidian black sunburst dial, rose-gold titanium casing, and intricate exposed mechanical gears coming from <Picture 1>.
<Subject 2> is the elegant gentleman in a dark charcoal cashmere blazer with French cuffs.
<Subject 3> is the sleek modern penthouse study overlooking a rainy skyline at night.

[summary]
An executive fastens the timepiece in a rainy penthouse, admiring its tourbillon movement before stepping into the night.

[retention_analysis]
<Subject 1>, <Subject 2> and <Subject 3> are preserved from <Picture 1>.

[detailed_description]
The grade is locked and identical in every shot: cinematic high-contrast low-key lighting with tungsten highlights on metallic facets.
[Shot 1] Extreme macro tracking shot sweeping over the skeleton tourbillon escapement wheel pulsing with micro-second precision, light glinting off diamond bearings.
[Shot 2] Cut to a medium shot at table height: <Subject 2> fastening the rose-gold deployant clasp around his left wrist, moving smoothly.
[Shot 3] Cut to a wide cinematic shot of the rainy floor-to-ceiling glass wall, city lights shimmering in deep bokeh.
[Shot 4] Cut to an authoritative medium view: <Subject 2> turns his wrist toward camera, the watch dial catching an exquisite edge light. He speaks calmly: <d>[Chinese] 恒久流转，分秒皆为传奇。</d> The camera stays locked and pristine to the final frame.

[overall_soundscape]
Crisp rhythmic ticking of mechanical tourbillon gear train, gentle rain patter against panoramic glass.

[non_diegetic_music]
A luxurious modern cinematic synth pulse with deep sub-bass and crisp acoustic percussion crescendo.`
};

/**
 * Two-Stage Story Design & Compilation Presets:
 * Stage 1: Awesome-Seedance (Creative narrative planning, atmosphere, dramatic tension)
 * Stage 2: MiniMax-H3 Ref2VA (Strict 6 sections, subject retention, (Sx), <d> dialogue, 17n+5 frames)
 * Stage 3: 8 Gates Execution & RunningHub Output
 */
export interface TwoStageStoryPreset {
  id: string;
  title: string;
  aspectRatio: AspectRatioType;
  genre: ProductionGenre;
  logline: string;
  stage1SeedanceIdea: string;
  stage2H3Prompt: string;
  stage3GateStatus: {
    gate1TimeAndRatio: string;
    gate2StyleLut: string;
    gate3Assets: string;
    gate4Storyboard: string;
    gate5H3Validation: string;
    gate6DialogueWindow: string;
    gate7RunningHub: string;
    gate8AlignmentAudit: string;
  };
}

export const TWO_STAGE_STORY_PRESETS: TwoStageStoryPreset[] = [
  {
    id: 'preset_story_horizontal_wharf',
    title: '《宿命交锋 · 暴雨码头》',
    aspectRatio: '16:9',
    genre: 'short_drama',
    logline: '横屏电影感商战对决 · 暴雨夜色港口 · 两位合伙人终局谈判',
    stage1SeedanceIdea: `A cinematic dark drama scene at a rainy container shipping port at midnight.
Two business rivals in long tailored dark raincoats face each other under a towering harbor crane.
Dramatic vehicle headlights cut through the heavy volumetric downpour, casting long dark reflections across wet asphalt.
The older executive (Chen) stares coldly and says: "当年签那份协议的时候，你就该料到今天。"
The younger partner (Lu) steps forward, holding a soaked black ledger, camera pans around them dramatically, high tension, photorealistic 8k, moody cinematic noir, slow motion rain drops.`,
    stage2H3Prompt: `[subject_definitions]
<Subject 1> is the senior executive (S1 Chen). His face, silver-streaked hair, sharp weathered jawline, tailored charcoal double-breasted trench coat with wide lapels come from <Picture 1>, and <Picture 1> also carries the industrial container wharf he stands on.
<Subject 2> is the younger business partner (S2 Lu). His face, lean build, navy water-resistant overcoat and dark leather gloves come from <Picture 2>.
<Subject 3> is the industrial shipping port at midnight under heavy rain, towering orange container gantry cranes in the background, amber halogen floodlights reflecting off glistening puddles from <Picture 1>.

[summary]
At the rain-swept cargo wharf at midnight, <Subject 1> and <Subject 2> face each other between rows of towering containers for a final confrontation.

[retention_analysis]
<Subject 1>, <Subject 2> and <Subject 3> are preserved from <Picture 1> and <Picture 2>.

[detailed_description]
The grade is locked and identical in every shot: cold cyan shadows with warm amber halogen vehicle headlight flares, 16:9 widescreen composition.
[Shot 1] The shot opens on a wide cinematic shot of <Subject 3> from chest height at a distance of five paces, the container stacks and wet ground filling the wide 16:9 frame. <Subject 1> (S1) and <Subject 2> (S2) stand in the lower third of the frame, the whole of both figures from head to feet completely inside the picture. <Subject 1> (S1) speaks with calm authority, his mouth moves only while he speaks: <d>[Chinese] 当年签那份协议的时候，你就该料到会有今天。</d>
[Shot 2] The shot cuts to a medium two-shot across the wet hood of an idling black SUV, headlights illuminating rain streaks in the air.
[Shot 3] The shot cuts to a low-angle tracking shot along the puddles showing reflection of cranes.
[Shot 4] The shot cuts to a silent reaction tableau: <Subject 2> (S2) stands motionless holding the black ledger, lips completely closed and still. The camera stays far back for this whole shot and never comes any closer to anybody.

[overall_soundscape]
Heavy torrential rain drumming on shipping containers, distant foghorn echoing across dark harbor, low idling engine hum of the SUV.

[non_diegetic_music]
None. There is no non-diegetic background music in this video track, absolute silence on the music channel to allow clean external master score mixing.`,
    stage3GateStatus: {
      gate1TimeAndRatio: '关 1：16:9 (Widescreen) 864×480 (0.4MP) 帧数 362 帧 (15.083s) 严格锁定',
      gate2StyleLut: '关 2：冷青色阴影 + 卤素灯暖色反差电影色调 LUT 锁定',
      gate3Assets: '关 3：陈总与陆总双人全身立绘 + 暴雨码头同源卡派生，鞋底留空地 8.5%',
      gate4Storyboard: '关 4：4 镜横向切点，全景双人入画，杜绝单侧走廊透视',
      gate5H3Validation: '关 5：H3 官方六段式机检 100 分，无反向字幕敏感词',
      gate6DialogueWindow: '关 6：S1 发声前置，末镜静音留白 0.35s 预留 ffmpeg 淡接接缝',
      gate7RunningHub: '关 7：RunningHub Node 61 设为 16:9 (Widescreen)，Node 85 时长 15.083s',
      gate8AlignmentAudit: '关 8：双轨 Master BGM 重贴，imgcheck 灰度 0.9% (<3%) 放行'
    }
  },
  {
    id: 'preset_story_vertical_ballroom',
    title: '《豪门风云 · 宴会之夜》',
    aspectRatio: '9:16',
    genre: 'short_drama',
    logline: '竖屏霸总爽剧反转 · 水晶宴会厅 · 宣示主权绝地翻盘',
    stage1SeedanceIdea: `A luxury ballroom confrontation in a high society drama.
The arrogant socialite Zhao confronts the calm female lead Lin beside the dining tables.
The cold CEO Gu walks in wearing a tailored tuxedo, stopping everyone in their tracks.
He looks at Zhao angrily and declares: "从今天起，见她如见我。谁敢动她分毫，就是跟我顾沉过不去。"
Intimate romantic drama beats, opulent gold chandeliers, blurred guests gossiping, cinematic lighting, 8k quality.`,
    stage2H3Prompt: `[subject_definitions]
<Subject 1> is the male lead (S1 Gu Chen). His face, tall stature, black bespoke tuxedo and white spread-collar shirt come from <Picture 1>, and <Picture 1> also carries the ballroom he stands in. Smooth clean-shaven cheeks with no stubble.
<Subject 2> is the female lead (S2 Lin Qingwan). Her face, slender frame, wine-red velvet gown, and straight black hair hanging past her chest come from <Picture 2>.
<Subject 3> is the wealthy antagonist woman from <Picture 3>.
<Subject 4> is the grand banquet ballroom with twenty round tables on both sides of a narrow marble aisle from <Picture 1>.

[summary]
Inside the luxurious ballroom, <Subject 1> steps beside <Subject 2>, making a definitive declaration to the entire gathering, solidifying their alliance.

[retention_analysis]
<Subject 1>, <Subject 2>, <Subject 3> and <Subject 4> are preserved from <Picture 1>, <Picture 2> and <Picture 3>.

[detailed_description]
The grade is locked and identical in every shot: the same exposure and warm amber highlight from the first shot to the last, 9:16 portrait widescreen framing.
[Shot 1] The shot cuts to a wide shot of <Subject 4> taken from the far side of the room at chest height, the ivory-draped tables spread across both sides. <Subject 1> (S1) and <Subject 2> (S2) stand small side-by-side in the lower middle of the frame, the whole of both of them from head to feet inside the picture. <Subject 1> (S1) faces forward, his mouth moves only while he speaks: <d>[Chinese] 从今天起，见她如见我。谁敢动她分毫，就是跟我顾沉过不去。</d>
[Shot 2] The shot cuts to a wide reverse angle over the sea of dining tables, guests frozen in awe.
[Shot 3] The shot cuts to <Subject 3> (S3) standing small on the far right of the aisle, turning pale.
[Shot 4] The shot cuts to a final wide cinematic freeze. The camera stays far back for this whole shot and never comes any closer to anybody: it does not push in, the distance does not change from the first frame to the last.

[overall_soundscape]
Audible collective gasp across the hall, glasses clinking softly on tables, grand ballroom acoustic reverb.

[non_diegetic_music]
None. There is no non-diegetic background music in this video track, absolute silence on the music channel to allow clean external master score mixing.`,
    stage3GateStatus: {
      gate1TimeAndRatio: '关 1：9:16 (Portrait Widescreen) 480×864 (0.4MP) 帧数 362 帧 (15.083s)',
      gate2StyleLut: '关 2：琥珀金暖调主光 + 深邃黑高反差宴会厅色彩锁定',
      gate3Assets: '关 3：顾总裁/林清晚/赵美琳 3 卡同源派生，去白底影棚光，CROWD_KEEP 锁宾客',
      gate4Storyboard: '关 4：走道两侧 20 张圆桌大气构图，严禁走廊化',
      gate5H3Validation: '关 5：H3 官方 Ref2VA 6 段式全绿，防裁头机制完全生效',
      gate6DialogueWindow: '关 6：S1 发声时头顶全景入画，第 4 镜静音留白 0.35s',
      gate7RunningHub: '关 7：RunningHub OpenAPI v2 批量调度，Node 61 设为 9:16',
      gate8AlignmentAudit: '关 8：FFmpeg 0.35s afade 4 段无损拼接 + Master BGM 双轨压入 + AI生成角标'
    }
  }
];

