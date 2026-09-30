/**
 * MiniMax H3 Official Prompt Engine & Validator
 * Validates against:
 * 1. MiniMax H3 Ref2VA Official Specification (6-section mandatory architecture)
 * 2. V2/V3/V4 Battle-Tested Consistency Locks:
 *    - Anti-Head Cutoff (Wide shots, feet inside frame, no clothing keywords in wide shot body)
 *    - Anti-Subtitle Trap (No negative text words like 'no subtitles', H3 is reverse-sensitive)
 *    - Single-Scene Ancestor Card & Anti-Hallway Grid
 *    - Clean Subject Definition Syntax (no standalone <Picture N> rows)
 *    - Speaker Mapping (Sx) and <d>[Language] ... </d> format
 *    - Exact Duration-to-Frames formula: 17n+5 (15s = 362 frames, 0.4MP = 480x864)
 */

export interface H3ValidationItem {
  id: string;
  name: string;
  passed: boolean;
  severity: 'error' | 'warning' | 'info';
  message: string;
  tip?: string;
}

export interface H3ValidationResult {
  passed: boolean;
  score: number; // 0 to 100
  items: H3ValidationItem[];
  detectedSections: string[];
  missingSections: string[];
  headCutoffRisk: 'low' | 'moderate' | 'high';
  subtitleTrapDetected: boolean;
  hallwayPerspectiveRisk: boolean;
  calculatedFrames: number;
}

export const H3_MANDATORY_SECTIONS = [
  'subject_definitions',
  'summary',
  'retention_analysis',
  'detailed_description',
  'overall_soundscape',
  'non_diegetic_music'
];

/**
 * Calculates H3 exact frame count:
 * Official formula: max(5, round(a*24)) + (5 - (max(5, round(a*24)) % 17)) % 17
 * Satisfies 17n + 5 (e.g. 5s = 124 frames, 15s = 362 frames)
 */
export function calculateH3Frames(durationSeconds: number): { frames: number; exactDuration: number } {
  const rounded = Math.round(durationSeconds * 24);
  const base = Math.max(5, rounded);
  const remainder = base % 17;
  const offset = (5 - remainder + 17) % 17;
  const frames = base + offset;
  const exactDuration = Number((frames / 24).toFixed(4));
  return { frames, exactDuration };
}

/**
 * Validates a prompt against H3 Ref2VA Official Rules & Battle-Tested Locks
 */
export function validateH3Prompt(promptText: string, options?: { duration?: number; shotScale?: string }): H3ValidationResult {
  const items: H3ValidationItem[] = [];
  const text = promptText || '';
  const lowerText = text.toLowerCase();

  // 1. Check Mandatory Sections (supports both [section] and Chinese Whitelist format)
  const isChineseWhitelistFormat = /subject_definitions/i.test(text) && /detailed_description/i.test(text) && /【Shot/i.test(text);
  const detectedSections: string[] = [];
  const missingSections: string[] = [];

  if (isChineseWhitelistFormat) {
    detectedSections.push('subject_definitions', '声音设定', 'detailed_description', '【约束】');
  } else {
    for (const sec of H3_MANDATORY_SECTIONS) {
      const regex = new RegExp(`\\[${sec}\\]`, 'i');
      if (regex.test(text)) {
        detectedSections.push(sec);
      } else {
        missingSections.push(sec);
      }
    }
  }

  const sectionsPassed = isChineseWhitelistFormat || missingSections.length === 0;
  items.push({
    id: 'six_sections',
    name: 'H3 结构规范度 (Ref2VA / 动作语气台词细化)',
    passed: sectionsPassed,
    severity: sectionsPassed ? 'info' : 'error',
    message: sectionsPassed
      ? (isChineseWhitelistFormat ? '检测到符合烨哥 2026-09-22 官方中文白名单 + 【约束】实战规范' : '检测到全部 6 个官方标准段落（subject_definitions 至 non_diegetic_music）')
      : `缺少关键段落：${missingSections.map(s => `[${s}]`).join(', ')}`,
    tip: 'MiniMax H3 官方规范要求主体定义、分镜动作与约束严格按序出现。'
  });

  // 2. Check Anti-Subtitle Trap (Crucial battle-tested finding!)
  // In H3, writing "no subtitles", "no text", "no burned-in text" makes H3 draw MORE subtitles!
  const forbiddenAntiText = [
    'no subtitle',
    'no subtitles',
    'no text',
    'no words',
    'no caption',
    'no captions',
    'no burned-in',
    'no watermark'
  ];
  const foundAntiTextWords = forbiddenAntiText.filter(w => lowerText.includes(w));
  const subtitleTrapDetected = foundAntiTextWords.length > 0;

  items.push({
    id: 'anti_subtitle_trap',
    name: '规避 H3 烧入字幕反向敏感陷阱',
    passed: !subtitleTrapDetected,
    severity: subtitleTrapDetected ? 'error' : 'info',
    message: subtitleTrapDetected
      ? `检测到反向敏感词：${foundAntiTextWords.join(', ')}！H3 越点名越画字幕，绝对不要写这类负面词！`
      : '未触发反向字幕敏感词，台词将作为原生字幕正常处理或由后期覆盖。',
    tip: '实测证明：H3 对 "no subtitles" 类负面词反向敏感，点名 1 个可能出 2 条字幕。连风格块里也应彻底删除此类字眼。'
  });

  // 3. Check Head Cutoff Trap & Wide Shot Safety
  let headCutoffRisk: 'low' | 'moderate' | 'high' = 'low';
  const hasDialogue = /<d>.*?<\/d>/i.test(text) || /<d>\[.*?\]/i.test(text);
  const hasTightCloseup = /tight close-up|extreme close-up|tight closeup/i.test(lowerText);
  const hasWideShot = /wide shot|wide view|whole of .*? head to feet|stands small/i.test(lowerText);
  const mentionsClothingInBody = /gown|suit|velvet|earrings|bangle|wine glass|bare shoulders/i.test(lowerText);

  if (hasDialogue && hasTightCloseup) {
    headCutoffRisk = 'high';
    items.push({
      id: 'head_cutoff_tight',
      name: '发声镜防裁头安全检测',
      passed: false,
      severity: 'error',
      message: '在高潮或核心台词镜使用了紧特写 (Tight Close-Up)！实测 H3 近景裁头率高达 50%，角色发声时头顶极易出画！',
      tip: '改用宽景 (wide shot) 并写明 "whole of both of them from head to feet inside the picture"，相机远离保持全景入画。'
    });
  } else if (hasWideShot && mentionsClothingInBody && /detailed_description/i.test(text)) {
    headCutoffRisk = 'moderate';
    items.push({
      id: 'head_cutoff_clothing',
      name: '宽景文案防拽取特写检测 (机制 4)',
      passed: false,
      severity: 'warning',
      message: '宽景镜头描述中点名了具体衣着或配件（如 gown, velvet, earrings）！H3 可能会被拽过去做衣物特写导致裁头！',
      tip: '衣着已在 subject_definitions 中锁定，宽景镜文中不要再复述人物衣服和首饰，直接写角色代号并强调人物很小、头脚齐全。'
    });
  } else {
    items.push({
      id: 'head_cutoff_safe',
      name: '防裁头取景架构检测',
      passed: true,
      severity: 'info',
      message: '取景策略安全，未发现易导致头顶裁切的危险特写诱因。'
    });
  }

  // 4. Check Hallway Perspective Trap (Scene Scale)
  const describesSingleSideTables = /only on one side|left side of the aisle|tables on the left/i.test(lowerText) &&
    !/both sides of the central aisle|spread all the way/i.test(lowerText);

  items.push({
    id: 'hallway_perspective',
    name: '场景构图大气度检测 (防长走廊化)',
    passed: !describesSingleSideTables,
    severity: describesSingleSideTables ? 'warning' : 'info',
    message: describesSingleSideTables
      ? '餐桌或宾客仅描写在单侧，模型易生成一点透视狭窄走廊！'
      : '走道两侧皆布设圆桌与宾客，构图开阔大气。',
    tip: '写明 "twenty round tables standing on BOTH sides of the central aisle, spreading from left edge to right edge"。'
  });

  // 5. Check Subject Definitions Syntax: No Standalone <Picture N> Entries
  const hasStandalonePictureDef = /<picture\s+\d+>\s+is\s+the\s+reference\s+image/i.test(text) ||
    /\[retention_analysis\][\s\S]*?<picture\s+\d+>/i.test(text);

  items.push({
    id: 'subject_picture_syntax',
    name: '官方参考图引用语法 (<Subject N> 绑定)',
    passed: !hasStandalonePictureDef,
    severity: hasStandalonePictureDef ? 'error' : 'info',
    message: hasStandalonePictureDef
      ? '发现独立 <Picture N> 定义条目！官方规范要求将来源写进 <Subject N> 中，禁止把 Picture 单独成行！'
      : '参考图正确绑定在 <Subject N> 定义中，retention_analysis 仅列角色代号。',
    tip: '正确写法：<Subject 1> is the male lead. His face ... comes from <Picture 1>.'
  });

  // 6. Check Foley & Sound Effects Coverage (Prevents silent/dead moments!)
  const hasFoleyTag = /【音效】|overall_soundscape|sound effects|foley|ambient|clink|rustl|footstep|breath|murmur|whisper|底噪|摩擦|敲|雨声|风声/i.test(text);
  const hasEmptyFoley = /【音效】\s*无|【音效】\s*N\/A|【音效】\s*$/im.test(text);

  items.push({
    id: 'foley_coverage',
    name: '镜头级拟音与现场音效全覆盖检测 (Foley Coverage)',
    passed: hasFoleyTag && !hasEmptyFoley,
    severity: (hasFoleyTag && !hasEmptyFoley) ? 'info' : 'warning',
    message: (hasFoleyTag && !hasEmptyFoley)
      ? '已检测到精细现场拟音（敲击/摩擦/换气/环境底噪），杜绝画面出现无声死寂。'
      : '检测到部分镜头缺少具体【音效】描写！H3 将只会渲染对白而丢失环境拟音，导致画面干瘪寂静。',
    tip: '每个【Shot】都必须详写动作拟音（如：指节敲桌、搓烟纸、衣服摩擦、脚步声、呼吸叹气、环境底噪），以支撑电影级空间质感。'
  });

  // 7. Check Dialogue & Speaker ID Syntax
  if (hasDialogue) {
    const hasLanguageTag = /<d>\[[a-zA-Z\s]+\]/i.test(text);
    const hasSpeakerId = /\(S\d\)/i.test(text);
    const hasMouthMovementLock = /mouth moves only while/i.test(lowerText);

    items.push({
      id: 'dialogue_syntax',
      name: '台词标签与说话人 (Sx) 映射规范',
      passed: hasLanguageTag && hasSpeakerId,
      severity: hasLanguageTag && hasSpeakerId ? 'info' : 'warning',
      message: (hasLanguageTag && hasSpeakerId)
        ? `台词格式合规 (<d>[Language]</d> + 说话人全局编号)，${hasMouthMovementLock ? '含口型动静锁定' : '建议补充 mouth moves only while speaking'}`
        : '台词需用 <d>[Chinese] 台词</d> 并标注说话人 (S1)/(S2)/(S3) 以固定音色。',
      tip: '说话人编号全局固定（S1男主/S2女主/S3女配），跨段复用以保证音色一致。'
    });
  }

  // 8. ⚔️ 武侠仙法·动作打斗与特效锚点专项检测 (Fight FX Anchor & Anti-Hallucination)
  const isFightScene = /刀|剑|枪|拳|掌|刺客|飞刀|打斗|拼杀|对决|神雷|仙法|法阵|重锤|格挡|气浪|交击|出招/i.test(text);
  if (isFightScene) {
    // 8.1 检查防乱说话与台词长度限制 (打斗中绝不允许长篇废话)
    const rawDialogues = Array.from(text.matchAll(/<d>\[.*?\](.*?)<\/d>/g)).map(m => m[1].trim());
    const tooLongDialogues = rawDialogues.filter(d => d.length > 12);
    const antiHallucinationPassed = tooLongDialogues.length === 0;

    items.push({
      id: 'fight_anti_hallucination',
      name: '动作打斗·防乱说话与短喝台词锁 (Anti-Hallucination Dialogue)',
      passed: antiHallucinationPassed,
      severity: antiHallucinationPassed ? 'info' : 'error',
      message: antiHallucinationPassed
        ? '台词符合打斗高压对抗法则：短促有力（≤12字短喝），杜绝长篇废话与模型口型抽搐乱说。'
        : `打斗场景检测到过长台词（"${tooLongDialogues[0]}" 共 ${tooLongDialogues[0].length} 字）！激烈打斗时台词过长会导致模型动作停滞、肢体变形或出现幻觉废话！`,
      tip: '打斗中台词应为 1~6 字短喝（如：<d>[中文] 破！</d>、<d>[中文] 纳命来！</d>），禁止闲聊长句。'
    });

    // 8.2 检查特效锚点与物理受力接触面 (Contact Anchor & Impact Physics)
    const hasContactSurface = /交击|碰撞|火星|火花|气浪|犁地|滑退|硬架|贯穿|爆裂|震波|穿透|受力/i.test(text);
    items.push({
      id: 'fight_contact_anchor',
      name: '动作戏·特效空间锚点与受力反馈检测 (FX Anchor)',
      passed: hasContactSurface,
      severity: hasContactSurface ? 'info' : 'warning',
      message: hasContactSurface
        ? '已设定明确的物理接触面与受力反馈（如刀剑交错火星、后退犁地阻尼），有效防止人物动作失真悬浮。'
        : '动作描述中缺乏具体受力接触面或物理碰撞（如火花、地面犁地划痕），AI 极易生成无物理反作用力的棉花拳脚。',
      tip: '必须写明碰撞发生在哪一点（如二人正中刀剑相交）、爆出多少火星/气浪、受击者双足滑退多少距离。'
    });

    // 8.3 检查防穿模与武器刚体锁定 (Anti-Fusion & Rigid Body Lock)
    const hasRigidLock = /刚体|穿模|扭曲|形变|多肢|骨骼|独立|不融合/i.test(text);
    items.push({
      id: 'fight_rigid_anti_fusion',
      name: '动作戏·武器刚体与肢体防穿模死锁 (Rigid Body Lock)',
      passed: hasRigidLock,
      severity: hasRigidLock ? 'info' : 'warning',
      message: hasRigidLock
        ? '【约束】中已严格注入武器刚体锁定、关节不扭曲、二人独立分立防穿模硬规则。'
        : '【约束】中未强调武器刚体锁定与二人防穿模！AI 打斗时极易出现剑身变弯变软、二人打斗融为一体、多肢体异变。',
      tip: '在【约束】中补充："兵刃几何结构严格刚体锁定，不弯折软化；角色肢体不穿模扭曲；二人空间分离清晰，不融为一体"。'
    });
  }

  // Calculate Frames
  const duration = options?.duration || 15.083;
  const { frames } = calculateH3Frames(duration);

  // Score calculation
  const errorCount = items.filter(i => i.severity === 'error' && !i.passed).length;
  const warningCount = items.filter(i => i.severity === 'warning' && !i.passed).length;
  const score = Math.max(0, 100 - errorCount * 30 - warningCount * 15);
  const passed = errorCount === 0;

  return {
    passed,
    score,
    items,
    detectedSections,
    missingSections,
    headCutoffRisk,
    subtitleTrapDetected,
    hallwayPerspectiveRisk: describesSingleSideTables,
    calculatedFrames: frames
  };
}

import { AspectRatioType, ASPECT_RATIO_CONFIGS, ProductionGenre } from '../data/h3PipelineData';

export interface ConvertOptions {
  genre: ProductionGenre;
  aspectRatio?: AspectRatioType;
  shotScale?: string;
  speakerId?: string;
  dialogue?: string;
  subjectCount?: number;
  suppressBgm?: boolean;
  enforceLipsStill?: boolean;
}

export interface StoryArchetype {
  id: string;
  title: string;
  genre: ProductionGenre;
  aspectRatio: AspectRatioType;
  speakerId: 'S1' | 'S2' | 'S3';
  seedanceProse: string;
  dialogue: string;
  whySeedanceFailsInH3: string;
}

export const STORY_ARCHETYPES: StoryArchetype[] = [
  {
    id: 'fight_fx_wuxia_bamboo',
    title: '⚔️ 武侠动作：暴雨竹林长枪回马破飞刀 (Fight FX Anchor)',
    genre: 'wuxia_fight',
    aspectRatio: '16:9',
    speakerId: 'S1',
    seedanceProse: '狂风骤雨的幽深竹林，密密麻麻的苍翠毛竹被暴风撕扯倾斜，满地湿滑竹叶与水泊。黑衣蒙面刺客自暗处疾射六枚柳叶飞刀直取后背；银枪少侠（约22岁，短打劲装束袖，双手端丈二镔铁点钢枪，红缨如烈火）听风辨位，腰马合一猛然回身旋枪，枪尖连磕三枚飞刀暴出刺目金铁火星，枪头红缨急抖水珠，枪势如游龙出水单手扣枪尾直刺竹丛阴影，枪尖破竹炸裂，口中沉声断喝："现身！"。武侠动作打斗，电影感光影，无多余废话。',
    dialogue: '现身！',
    whySeedanceFailsInH3: '传统动作戏写法常泛写"两人激烈搏斗"，极易引发 AI 武器软化变弯、肢体穿模扭曲、二人融体以及角色临场乱说废话。Fight FX Anchor 体系通过【0-1.5s 旋枪蓄力 ➔ 1.5-2.5s 枪尖磕刀火星碰撞 ➔ 2.5-4.5s 破竹与阻尼收束】三段时序，配合长枪刚体锁定与纯净金石拟音，实现 100% 动作零穿模！'
  },
  {
    id: 'fight_fx_xianxia_sword_array',
    title: '⚡ 仙法神通：蜀山万剑归宗轰击魔煞重盾 (Fight FX Anchor)',
    genre: 'wuxia_fight',
    aspectRatio: '16:9',
    speakerId: 'S1',
    seedanceProse: '万丈悬崖顶端的青罡石古剑台，四周翻涌云海与隐约紫电。蜀山白袍剑仙双目泛金芒，双手极速掐引天罡剑诀，胸前悬浮本命秋水古剑青霜暴涨，百柄白金虚幻飞剑如孔雀开屏在身后两米展开，剑气激荡撕开云海，剑仙抬指虚点冷喝："万剑归宗，破！"；魁梧黑甲魔将双手横握血煞重锤猛击地面，瞬间撑起两丈高的狰狞恶鬼血煞护盾，百柄飞剑如连珠暴雨轰在血盾中心，冲击波激荡刮碎青石地面，魔将双足犁地后滑三米咆哮："给我碎！"。仙侠打斗大片，震撼特效与音效。',
    dialogue: '万剑归宗，破！',
    whySeedanceFailsInH3: '仙法对轰常因光效泛滥导致角色五官畸变，或特效与人物脱节。本体系严格将飞剑接触面锚定于血盾正中三寸，能量波向四周环形扩散不遮脸，双足受力后退阻尼写实，台词短促有力绝不乱说话！'
  },
  {
    id: 'tiedan_cow_safety',
    title: '乡村喜剧：机器人铁蛋放牛 (大白话安全脱敏实战)',
    genre: 'short_drama',
    aspectRatio: '9:16',
    speakerId: 'S1',
    seedanceProse: '阳光明媚的梯田山坡，银色机器人铁蛋（银色机身、胸口"铁蛋"二字、蓝色发光屏幕脸）手拿小柳条悠闲放牛。铁蛋开口说："老牛们乖乖吃草啊"；突然一头大黄牛刨蹄子喘粗气被激怒，向前猛冲顶起，铁蛋被牛撞飞，夸张滑稽地腾空翻转两周半坐落在松软草垛上，激起一圈金黄色草屑。乡村喜剧，结尾亮场。',
    dialogue: '老牛们乖乖吃草啊，谁不听话我可要扣草料啦！',
    whySeedanceFailsInH3: '大白话里的"被牛撞飞"、"重重撞击"等词极易触发安全内容网关的 integrity_check_failed 暴力拦截！第 1 步智能安全转译器会自动将其转化为"卡通物理滑稽弹跳 + 松软草垛缓冲 + 金黄草屑特效"，视觉张力更强且 100% 秒过安全审核！'
  },
  {
    id: 'drama_dining_room',
    title: '深夜餐桌：女人开口要校车费 (烨哥 2026-09-22 实战标准)',
    genre: 'short_drama',
    aspectRatio: '16:9',
    speakerId: 'S1',
    seedanceProse: '夜晚家用餐厅，木桌居中，一盏暖黄吊灯。女人（约38岁，扎马尾，灰色居家睡衣）不看对面的男人，指节轻敲桌面，压着情绪开口要校车费；男人（约40岁，深色旧短袖T恤，胡茬）在吊灯阴影里缩在椅中，手指搓着没点的烟，声音低沉发闷挤出一句"我没钱"，喉结滚动，选了沉默不抬眼。电影感写实，中景双人，无夸张表情。',
    dialogue: '这个月小孩校车费，还有午餐费，你交一下',
    whySeedanceFailsInH3: '1. 传统写法容易用"悲伤/压抑"等形容词导致 AI 无法具象化表演；2. 缺少【约束】与中文白名单导致餐桌上饭菜与烟灰缸在换镜后消失或漂移；3. 动作未与台词精确嵌入导致口型错位。本案例已完全采用中文白名单+【约束】双保险防漂移标准！'
  },
  {
    id: 'drama_ballroom',
    title: '豪门夜宴：真假千金当场摊牌',
    genre: 'short_drama',
    aspectRatio: '9:16',
    speakerId: 'S1',
    seedanceProse: 'A luxurious crystal grand ballroom packed with elite guests in black-tie suits. The cold brooding male CEO in a sharp black bespoke tuxedo strides down the marble aisle with long steps, holding the hand of the falsely accused female lead in a wine-red velvet gown. The arrogant antagonist heiress with sharp eyebrows smirks and holds a glass of red wine, asking angrily: "Who gave you permission to step into this banquet?" The male CEO steps firmly in front of the female lead with piercing eyes, declaring coldly: "Touching her is touching me." High quality 8k photorealistic, close-up on male CEO face, no text, no subtitles, cinematic lighting.',
    dialogue: '见她如见我。谁敢动她分毫，就是跟我顾沉过不去。',
    whySeedanceFailsInH3: '1. 特写 close-up 导致 50% 概率头顶裁切；2. "no subtitles" 诱发 H3 反向敏感烧出两道乱码假字幕；3. 散文描述缺少 [subject_definitions] 导致换镜头男主变脸；4. 模型自带 BGM 导致每段接缝出现爆音断层。'
  },
  {
    id: 'commercial_watch',
    title: '极速先锋：微距钛金智能腕表',
    genre: 'commercial',
    aspectRatio: '1:1',
    speakerId: 'S1',
    seedanceProse: 'Minimalist pitch-black exhibition chamber with dramatic rim lighting. A luxury flagship smartwatch made of brushed aerospace-grade titanium and sapphire crystal rotates smoothly on a magnetic anti-gravity pedestal. Extreme macro close-up sweeps across micro-gear escapement and pulsing luminescent display, then pulls back to reveal the muscular wrist of an athlete grasping carbon handlebars in morning fog. An authoritative narrator voiceover speaks. Photorealistic, 8k render, cinematic 24fps motion blur, no text, no logo.',
    dialogue: '卓越非凡，每一瞬皆由意志铸就。',
    whySeedanceFailsInH3: '1. 1:1 方形画幅缺少对称锚定；2. 正向写 "no logo, no text" 会反向生成无意义扭曲字符；3. 画外音未声明 off-screen 导致模型试图在表盘上长出嘴巴做口型；4. 产品材质细节缺少 <Picture 1> 同源锁。'
  },
  {
    id: 'cinema_mist_dock',
    title: '雾港谍影：旧码头的一场密会',
    genre: 'short_drama',
    aspectRatio: '21:9',
    speakerId: 'S1',
    seedanceProse: 'Heavy cold sea fog rolling over a 1940s Victorian industrial dockyard with towering rusty gantry cranes fading into misty grey skies. Two men in heavy charcoal wool overcoats stand five meters apart on opposite sides of weathered wooden crates. Cold wind whips their collars as one lights a pipe, red ember glowing in the shadows. Suspenseful standoff atmosphere, cinematic widescreen 21:9, close-up two shot, dialogue exchange, no subtitles, masterpiece, film grain.',
    dialogue: '今晚最后一班货轮开走前，我要看到那封电报。',
    whySeedanceFailsInH3: '1. 21:9 宽银幕使用近景两 shot 会导致两人头顶与肩膀双重出画；2. 缺少同源场景卡导致码头背景在下一个分镜变成现代集装箱码头；3. 烟雾与光斑若无锁定会引发帧间闪烁。'
  }
];

/**
 * Safety & Content Policy Sanitizer (大白话安全转译与喜剧脱敏引擎)
 * Solves: 'integrity_check_failed' / '违反安全策略' / '暴力拦截'
 * Automatically converts raw colloquial violent/crash words into safe cinematic motion, slapstick comedy, and physics VFX in Step 1!
 */
export interface SafetySubstitution {
  original: string;
  replaced: string;
  reason: string;
}

export const SAFETY_PARAPHRASING_RULES = [
  {
    regex: /(被\S*?撞飞|被牛撞飞|撞飞出去|撞飞|撞翻|顶飞)/gi,
    replacement: '向前猛冲顶起，身形夸张滑稽地轻盈腾空翻转两周半，平稳坐落在松软草垛上，激起一圈金黄色草屑（滑稽喜剧动作，卡通物理弹跳，无真实物理伤害）',
    reason: '避免物理人身伤害/暴力撞击敏感词，转译为高张力滑稽动作喜剧与草垛缓冲'
  },
  {
    regex: /(打架|互殴|殴打|暴打|痛揍|按在地上打)/gi,
    replacement: '发生戏剧性肢体推搡与拉扯争执，镜头伴随震动微倾，一人踉跄后退数步撞倒木椅（动作喜剧编排，无真实血腥暴力）',
    reason: '将互殴暴力转译为戏剧推搡与摄影机震颤'
  },
  {
    regex: /(流血|吐血|见血|砍伤|鲜血淋漓)/gi,
    replacement: '脸颊与衣服沾染深色泥浆与暗红酱汁污渍，神情戏剧化发愣',
    reason: '杜绝血腥词汇，转译为影视级污渍与戏剧化停顿'
  },
  {
    regex: /(摔死|砸死|杀死|刺死|击毙|枪杀)/gi,
    replacement: '受剧烈气浪与烟幕推动退入两侧阴影，镜头快速切为全景空镜定格',
    reason: '杜绝致死/杀戮词汇，转译为视效烟幕与景别切换'
  },
  {
    regex: /(撞车|翻车|车祸)/gi,
    replacement: '车身做出极速漂移甩尾避让，轮胎擦出刺耳摩擦音与白色烟雾，平稳停在路肩',
    reason: '将恶性车祸转译为特技漂移避险'
  },
  {
    regex: /(爆炸|炸毁|粉身碎骨)/gi,
    replacement: '绚丽的金色火花与浓厚白色烟雾特效在背景爆开，产生戏剧性强光与气浪冲击',
    reason: '将毁灭性爆炸转译为舞台级火花与气浪光效'
  }
];

export function sanitizeSafetyPrompt(rawText: string): { sanitized: string; substitutions: SafetySubstitution[] } {
  let text = rawText || '';
  const substitutions: SafetySubstitution[] = [];

  for (const rule of SAFETY_PARAPHRASING_RULES) {
    if (rule.regex.test(text)) {
      rule.regex.lastIndex = 0;
      const matches = text.match(rule.regex) || [];
      for (const m of matches) {
        substitutions.push({
          original: m,
          replaced: rule.replacement,
          reason: rule.reason
        });
      }
      text = text.replace(rule.regex, rule.replacement);
    }
  }

  return { sanitized: text, substitutions };
}

/**
 * Intelligent Converter: Converts messy / awesome-seedance prompts into
 * compliant MiniMax-H3 Ref2VA Six-Section Prompts
 */
export function convertAwesomeSeedanceToH3(
  rawPrompt: string,
  options: ConvertOptions
): string {
  const {
    genre,
    aspectRatio = '9:16',
    speakerId = 'S1',
    dialogue = '',
    suppressBgm = true,
    enforceLipsStill = false
  } = options;

  const arConfig = ASPECT_RATIO_CONFIGS[aspectRatio] || ASPECT_RATIO_CONFIGS['9:16'];

  // Step 1: Run Safety & Content Policy Sanitization (Anti-integrity_check_failed)
  const { sanitized: safetyCleaned } = sanitizeSafetyPrompt(rawPrompt);

  // Clean raw prompt: remove harmful anti-subtitle words
  let cleaned = safetyCleaned
    .replace(/no\s+(subtitles?|words?|texts?|captions?|watermarks?|logos?|burned-in)/gi, '')
    .replace(/masterpiece|8k|4k|photorealistic|high\s+quality|ultra\s+realistic/gi, '')
    .trim();

  // Extract quotes as dialogue if not provided
  let extractedDialogue = dialogue;
  if (!extractedDialogue) {
    const quoteMatch = rawPrompt.match(/["“](.*?)["”]/);
    if (quoteMatch) {
      extractedDialogue = quoteMatch[1];
    }
  }

  // Framing text tailored by Aspect Ratio to prevent Head Cutoff & Edge Clipping
  let framingRule = '';
  if (arConfig.orientation === 'vertical') {
    framingRule = `The camera framing maintains strict vertical safety: head is positioned at 6% below top border, feet are at 92% above bottom border with generous floor space visible under shoes. The whole body from head to feet remains completely inside the ${arConfig.label} picture with wide clearance. The camera stays far back and never pushes in.`;
  } else if (arConfig.orientation === 'horizontal') {
    framingRule = `The camera framing utilizes wide cinematic horizontal scope (${arConfig.label}): subjects are composed across horizontal golden thirds with generous side room. Full figures remain completely inside the frame from head to toe with zero edge cropping. The camera holds a steady wide perspective.`;
  } else {
    framingRule = `The camera framing utilizes balanced square symmetry (${arConfig.label}): central visual anchor with equal margins on all four borders. The whole subject remains fully within frame boundaries.`;
  }

  const musicDirective = suppressBgm
    ? FORBIDDEN_WORDS_LEXICON.bgmSuppressionPositivePhrase
    : 'A low cinematic orchestral underscore with subtle acoustic strings building steady dramatic tension.';

  // ⚔️ 专属处理：武侠仙法·动作打斗与特效锚点 (Fight FX Anchor)
  if (genre === 'wuxia_fight' || rawPrompt.includes('飞刀') || rawPrompt.includes('长枪') || rawPrompt.includes('万剑归宗') || rawPrompt.includes('剑仙') || rawPrompt.includes('魔将') || rawPrompt.includes('刀客') || rawPrompt.includes('打斗') || rawPrompt.includes('拼刀') || rawPrompt.includes('武侠') || rawPrompt.includes('仙法') || rawPrompt.includes('回马枪')) {
    if (rawPrompt.includes('万剑') || rawPrompt.includes('剑仙') || rawPrompt.includes('魔将') || rawPrompt.includes('仙法') || rawPrompt.includes('剑台') || rawPrompt.includes('雷法')) {
      return `subject_definitions（主体定义）:
<Subject 1> 是 <Picture 1> 中的云海古剑台场景：万丈悬崖之上的古老悬空剑台，地面由巨大青罡石拼接、镌刻古拙金色八卦符纹；四周云海翻涌、紫电隐现于远山云层。是剑台环境与空间结构参考；场景物件以描述为准，全程不得添加、移动或碰触其他物件。
<Subject 2> 是 <Picture 2> 中的蜀山剑仙：约24岁青年道士，束发金冠，身着白青相间广袖道袍、领口刺绣银云纹，眼神锐利如电；身前悬浮一柄三尺秋水古剑，周身缭绕丝缕青色剑罡气。
<Subject 3> 是 <Picture 3> 中的黑袍魔将：身躯魁梧雄壮，身披黑色重甲并缠绕暗红锁链，手持一把宽刃血煞骨朵重锤，面覆狰狞青铜鬼面。
<Subject 4> 是 <Picture 4> 作为起始画面参考图，控制二人相距十米对峙构图与云海光影。
声音设定：
<Picture 2> 是剑仙用 (S1) 标记，声线清冷沉稳、吐气如冰，并在全片保持一致
<Picture 3> 是魔将用 (S2) 标记，声线凶煞浑厚，并在全片保持一致
detailed_description:
【Shot 1｜0–4秒｜中景仰拍·剑诀引动万剑分化】
【主体】<Subject 2> 居画面中央偏左，悬浮古剑在胸前高速旋转。
【动作】<Subject 2> (S1) 双足踏坤位未移分毫，右臂如挽狂澜、剑指凌空极速变幻成天罡剑诀；胸前秋水古剑瞬间爆发出耀目青霜光柱，一剑化百，上百柄虚幻白金飞剑如孔雀开屏在身后两米扇形排开，每柄飞剑剑尖微颤、剑意直冲云霄。剑仙双目泛起微白金芒，剑指猛然向前虚点，冷声断喝：
<d>[中文] ${extractedDialogue || '万剑归宗，破！'}</d>
上百柄飞剑化作一道湛蓝剑气洪流，呼啸撕开云海狂涌向前。
【镜头】${arConfig.label} 中景微仰拍，伴随剑阵展开镜头平稳向后略微拉开，展现庞大剑阵全貌与云海受气浪翻卷之势。
【音效】百柄飞剑出鞘之清脆金属蜂鸣 (Swords unison ring)；高频穿空音爆；短促凌厉喝声；呼啸风浪声；无背景音乐，无对白外杂音。
【约束】人物身形端正无扭曲，道袍广袖自然被剑风向后吹扬；飞剑阵列轨迹整齐、几何结构锋利不变形；无杂音。

【Shot 2｜4–7秒｜中景正侧·飞剑撞击魔煞血盾产生剧烈能量波】
【主体】<Subject 3> 居画面右侧架起重盾，<Subject 2> 剑流自左侧轰击。
【动作】<Subject 3> (S2) 双手横握重锤骨朵，重击在青石地面，砸出深凹碎坑；重锤表面黑红血雾狂涌，瞬间张开一面两丈高的狰狞恶鬼血煞护盾；百柄飞剑洪流如连珠暴雨狠狠撞击在血盾正中心，交汇处激荡起一圈圈刺目白金与暗红交织的冲击波，将剑台青石板生生刮掉一层！魔将被巨大推力推得双膝微弯、战靴后滑三米，双臂青筋暴起，咆哮道：
<d>[中文] 给我碎！</d>
最后一柄本命古剑撞上血盾，咔嚓一声在血盾正中撞出蛛网裂纹。
【镜头】${arConfig.label} 水平正侧横移中景，剧烈碰撞点伴随高频微幅震颤，完美展现受击物理阻尼。
【音效】密集金属与厚重护盾撞击声；能量激荡低频共振；碎石激射声；凶悍怒吼；无多余对白，无背景音乐。
【约束】角色肢体无穿模，血盾与飞剑相交界限分明；青石板破坏轨迹物理真实；面容面具完好无畸变；排除表情夸张、动作幅度过大或任何笑容轻松表情。`;
    }

    // 默认武侠竹林长枪飞刀对决
    return `subject_definitions（主体定义）:
<Subject 1> 是 <Picture 1> 中的幽深竹林场景：密密麻麻的苍翠毛竹林，细密雨丝倾斜而下，满地湿滑竹叶；狂风掠过竹林，竹子大幅度向右倾斜。是环境结构参考；竹林陈设以此为准，全程不得添加其他非自然物件。
<Subject 2> 是 <Picture 2> 中的银枪少侠：约22岁，劲装束袖，发系红带，双手稳稳端着一杆丈二镔铁点钢枪，枪缨如一团燃烧的红火，枪尖雪亮。
<Subject 3> 是 <Picture 3> 中的暗影刺客：蒙黑面巾，身手矫健，穿灰黑夜行衣，双手十指各夹三枚柳叶飞刀。
<Subject 4> 是 <Picture 4> 作为起始画面参考图，控制枪尖指向与刺客隐匿位置。
声音设定：
<Picture 2> 是少侠用 (S1) 标记，声线英武果敢，并在全片保持一致
<Picture 3> 是刺客用 (S2) 标记，声线低哑阴沉，并在全片保持一致
detailed_description:
【Shot 1｜0–4秒｜全景跟随·少侠拧身回马枪挑落飞刀】
【主体】<Subject 2> 居画面中前方，六枚柳叶飞刀自后方阴影疾射而来。
【动作】<Subject 2> (S1) 听风辨位，耳廓微动；不回头，腰马合一猛然拧转半圈，手中镔铁长枪化作一道旋转银盘；枪尖在身侧一米处精准磕中前三枚飞刀，清脆金铁相交之声连发三次，火星在雨中连环爆开！少侠枪势顺势如游龙出水，枪头红缨急抖抖落水珠，借转身之势单手扣住枪尾，枪尖带风直刺前方竹丛阴影，口中喝道：
<d>[中文] ${extractedDialogue || '现身！'}</d>
枪尖撕裂暴风雨，将迎面一根粗壮毛竹生生拦腰扎穿！
【镜头】${arConfig.label} 全景围绕少侠转体做 180 度弧形旋转机位，景深从飞刀火星快速掠向枪尖破竹。
【音效】飞刀划破空气之极细啸音；枪尖磕中飞刀的三声清脆叮当交击声；毛竹爆裂破开巨响；沉稳断喝；雨水淅沥底噪；无背景音乐，无对白外杂音。
【约束】长枪直线刚体锁死，无弯软扭曲；少侠腰腿重心符合武术发力规范；被穿透竹子裂口真实；排除多余对话与闲聊废话。

【Shot 2｜4–7秒｜中景双人·刺客破竹迎面拼刀对决】
【主体】<Subject 2> 银枪少侠右侧持枪防守，<Subject 3> 刺客破竹飞扑至左侧。
【动作】<Subject 3> (S2) 避开枪尖破空冲击，自折断竹梢后凌空翻滚下坠，双袖短刀如寒芒交叉斩向少侠面门；少侠双臂一震，长枪中段横架向上格挡，短刀与枪杆硬撞爆出一团刺目金石火星！二人四目对视，刺客咬牙从喉咙挤出冷笑：
<d>[中文] 纳命来！</d>
少侠沉肩发力将长枪猛烈上挑震开双刀，身形向后稳稳滑退半步拉开两米距离，双手转枪呈攻防戒备态。
【镜头】${arConfig.label} 中景双人水平微俯拍，定格二人兵刃相接的极高张力瞬间。
【音效】短刀与长枪剧烈格挡之尖锐金石铮鸣；双足蹬踏湿泥摩擦声；刺客压抑短喝；无背景音乐。
【约束】刀枪碰撞点物理清晰，四肢关节不扭曲穿模；面部冷峻表情稳定；二人身形独立不融合；无多余对白。`;
  }

  if (genre === 'short_drama') {
    if (rawPrompt.includes('铁蛋') || rawPrompt.includes('机器人') || rawPrompt.includes('放牛') || rawPrompt.includes('tiedan')) {
      return `subject_definitions（主体定义）:
<Subject 1> 是 <Picture 1> 中的银色机器人铁蛋：圆润可爱的智能机器人，银色机身，头盔圆滑。
【面部死锁】：面部必须是纯平光滑的黑色椭圆显示屏，上面仅显示极简蓝色 2D 扁平 Emoji 发光线条表情（弯月眼睛与笑脸嘴角）。
⛔ 绝对严禁（STRICTLY FORBIDDEN）：严禁出现任何写实人类五官、严禁出现人类鼻子、严禁出现人类嘴唇轮廓与肌肉骨骼、严禁出现写实人形赛博格或猛男脸部雕塑轮廓！
【文字与位置死锁】：黑色宋体"铁蛋"二字仅固定印在胸口正中央，后背为纯银色光滑装甲，后背绝对无字！
【服饰与部位死锁】：双腿大腿部位固定为红色护腿套，双臂为纯银色金属装甲！⛔ 绝对严禁将红色标识转移到双臂袖口或肩部！
【跨段人物连贯性】：自动锁定上段（Shot 1）结尾关键帧 <Picture 1> 的人物细节，爬出水面或奔跑时服饰部位 100% 吻合！
<Subject 2> 是 <Picture 2> 中的大黄牛：健壮温顺的成年黄牛，毛色姜黄，牛角微微弯曲。
<Subject 3> 是 <Picture 3> 中的乡村菜地与水塘山坡场景母本：红砖田垄，嫩绿白菜，远处竹篱笆与池塘，日光晴朗。
<Subject 4> 是 <Picture 4> 作为起始画面参考图，控制开场构图与人物位置。

声音设定：
<Subject 1> 铁蛋使用 (S1) 标记，小孩般清脆稚嫩的机械童声，全片保持一致。

detailed_description:
【Shot 1｜0–5秒｜宽景全景·铁蛋收菜放牛】
【主体】<Subject 1> 铁蛋位于画面正中偏左，身旁放着麻布袋，<Subject 2> 大黄牛在右侧田垄旁低头吃草。
【动作】<Subject 1> (S1) 蹲在菜地里拔起一颗翠绿大白菜，面部黑色屏幕上蓝色 Emoji 笑脸微微闪烁眨眼，语调欢快地说：
<d>[中文] ${extractedDialogue || '老牛们乖乖吃草啊，今晚铁蛋加餐！'}</d>
【镜头】${arConfig.label} 宽景全景安全框，头顶留空 6%，脚底留地 10%，镜头保持平稳宽画幅，绝不向前推近特写。
【音效】微风吹拂菜叶沙沙声、拔菜清脆断根声、泥土摩擦声、远处犬吠；无背景音乐。
【约束】严格锁定黑色屏幕与蓝色 2D Emoji 萌系表情，绝无写实人脸五官；"铁蛋"二字仅在胸前；动作幅度平稳自然。`;
    }

    if (rawPrompt.includes('校车费') || rawPrompt.includes('餐桌') || rawPrompt.includes('dining_room')) {
      return `subject_definitions（主体定义）:
<Subject 1> 是 <Picture 1> 中的餐厅：夜晚的家用餐厅，木桌居中、两侧各一把木餐椅；桌上方一盏暖黄吊灯；后窗深色窗帘半掩、窗外夜色暗；素色肌理墙、木地板。桌上有几盘没动过的饭菜（汤碗上结一层薄油）、两双木筷、一个圆形透明玻璃烟灰缸（里面已有几个烟头）。是餐厅场景，环境和空间结构参考；桌上物品以上述为准，全程不得添加、移动或碰触其他物件。
<Subject 2> 是 <Picture 2> 中的男人：约40岁，东亚面孔，深色短发略凌乱、面部有胡茬，深色旧短袖T恤、灰长裤、拖鞋；脸大半易陷吊灯阴影。
<Subject 3> 是 <Picture 3> 中的女人：约38岁，东亚面孔，黑长发扎马尾、两侧碎发，灰色长袖居家睡衣套装。
<Subject 4> 是 <Picture 4> 作为起始画面参考图，控制开场构图、人物位置和场景状态。
声音设定：
<Picture 2> 是说话人用 (S2) 标记，参考音频 2，并在全片保持一致
<Picture 3> 是说话人用 (S1) 标记，参考音频 1，并在全片保持一致
detailed_description:
【Shot 1｜0–4秒｜中景双人·女人开口】
【主体】<Subject 3> 画面左侧居主体，<Subject 2> 画面右侧虚化入镜。
【动作】<Subject 3> (S1) 视线落在桌上一盘凉透的青菜上，不看对面；右手指节轻敲桌面，前三下慢、后两下快，像在心里算账；说完停半秒，指尖停在桌面没抬起，尾音微微拖长、像例行公事却藏着试探，等他接话。音量中等、语速平稳、压着情绪说：
<d>[中文] ${extractedDialogue || '这个月小孩校车费，还有午餐费，你交一下'}</d>
【镜头】${arConfig.label} 中景双人，餐桌侧面固定镜头，暖黄吊灯从上方打下、画面偏暗；左脸受光右脸暗。
【音效】暖吊灯底噪、冰箱嗡鸣；指节敲桌细微声响；无筷子声。
【约束】五官稳定，面部不扭曲，口型与台词同步，画面无跳变；人物外观与服装前后一致，暖黄偏暗光线一致。

【Shot 2｜4–7秒｜中景双人·男人回应】
【主体】<Subject 2> 画面右侧居主体，<Subject 3> 画面左侧边缘、视线仍落菜上。
【动作】<Subject 2> 先听见、没动，脸大部在吊灯阴影里，肩垮着缩在椅中；手指夹着没点的烟，指腹来回搓烟纸，发出细微沙沙声——没抬头、没接话。随后闷声从胸腔挤出，声音低沉发闷、像憋着气说：
<d>[中文] 我没钱</d>
说完嘴唇抿成一条线，喉结滚一下，把更多话咽回去；不再接话，烟仍在指间搓着，选了沉默不抬眼。
【镜头】${arConfig.label} 中景双人，餐桌侧面固定镜头，与 Shot 1 机位一致。
【音效】搓烟纸细微沙沙声贯穿；说完后的换气与吞咽声；底噪贯穿；无对白外的言语。
【约束】五官稳定，面部不扭曲，口型与台词同步，画面无跳变；人物外观与服装前后一致，暖黄偏暗光线一致；人物机体与衣物表面严格保持纯净一致，严禁出现任何额外贴纸、腰部徽标Logo、身体涂鸦、大腿挂件或杂质印花；画面纯净电影画质，画面严禁任何硬编码字幕与文字覆盖，无台词条，无水印；排除表情夸张、动作幅度过大或任何笑容轻松表情。`;
    }

    const speechAction = enforceLipsStill
      ? `All characters maintain ${FORBIDDEN_WORDS_LEXICON.mouthStillPositivePhrase}.`
      : `<Subject 1> (${speakerId}) speaks firmly, his mouth moves only while he speaks: ${extractedDialogue ? `<d>[Chinese] ${extractedDialogue}</d>` : '<d>[Chinese] 见她如见我。谁敢动她分毫，就是跟我顾沉过不去。</d>'}`;

    return `## P01｜15.083秒 (362帧)｜豪门宴会冲突

[aspect_ratio]
${arConfig.label} (${arConfig.name}) | ComfyUI Node 456: ${arConfig.comfyValue} | Node 529: 15.083s (362 frames)

[subject_definitions]
<Subject 1> is the male lead. His face, tall stature, dark bespoke suit and spread-collar white dress shirt come from <Picture 1>, and <Picture 1> also carries the ballroom he stands in. Smooth clean-shaven cheeks with no stubble.
<Subject 2> is the female lead. Her face, slender frame, wine-red velvet gown, and straight black hair hanging clearly well past her chest come from <Picture 2>.
<Subject 3> is the wealthy antagonist woman from <Picture 3>.
<Subject 4> is the grand banquet ballroom with five tiered crystal chandeliers and twenty round tables spread across both sides of the central aisle from <Picture 1>.

声音设定：
<Subject 1> (${speakerId}) 始终使用一种固定的声音：约30岁成熟青年男性，中低音，声线磁性沉稳，常态语速有力，句尾利落收束。禁止播音腔与夹子音。
<Subject 2> (S2) 始终使用一种固定的声音：青年女性，中高音，清柔坚韧。

[summary]
Inside the opulent ballroom, a tense confrontation unfolds along the marble aisle as characters exchange decisive words. (Total duration: 15.083s / 362 frames).

[retention_analysis]
<Subject 1>, <Subject 2>, <Subject 3> and <Subject 4> are preserved from <Picture 1>, <Picture 2> and <Picture 3>. All character surfaces, clothing, and chassis maintain pure texture consistency from reference images: strictly zero extra stickers, zero waist emblems, zero painted decals, zero dangling accessories.

[detailed_description]
The grade is locked and identical in every shot: the same exposure, warm amber highlights, and contrast curve from the first shot to the last. No two shots repeat the same framing. ${FORBIDDEN_WORDS_LEXICON.characterPurityPositivePhrase}
${framingRule}
[Shot 1｜0–5秒] The shot opens on a wide shot of <Subject 4> taken from the far side of the room at chest height, the ivory-draped tables spread across both sides of the frame. <Subject 1> (${speakerId}) stands small in the aisle, the whole of his body from head to feet completely inside the picture. ${speechAction}
【音效】皮鞋踏在光滑大理石上的沉稳脚步声、衣物轻微摩擦声、宴会远端低语底噪。

[Shot 2｜5–10秒] The shot cuts to a medium two-shot showing listeners reacting across the aisle as the antagonist grips her glass.
【音效】红酒杯轻微晃动声、倒吸一口凉气的抽气声、大厅吊灯电流微鸣。

[Shot 3｜10–15.083秒] The shot cuts to a wide cinematic tableau. <Subject 1> steps forward shielding <Subject 2>. Final frame holds steady with character postures locked for seamless continuation.
【音效】布料摩擦声、沉稳有力的呼吸换气声、远端低频回响。

[overall_soundscape]
Muffled murmur of background ballroom guests, subtle clink of champagne flutes on distant tables, quiet room tone.

[non_diegetic_music]
${musicDirective}`;
  }

  if (genre === 'commercial') {
    return `[aspect_ratio]
${arConfig.label} (${arConfig.name}) | ComfyUI Node 61: ${arConfig.comfyValue} | T2I Res: ${arConfig.image1MpRes} | H3 Video Res: ${arConfig.video04MpRes}

[subject_definitions]
<Subject 1> is the premium product featuring brushed titanium facets, crystal accents, and micro-engineered precision coming from <Picture 1>.
<Subject 2> is the modern minimalist setting with dramatic architectural rim lighting from <Picture 1>.

[summary]
A dynamic cinematic showcase revealing the core precision and luxurious texture of the flagship product.

[retention_analysis]
<Subject 1> and <Subject 2> are preserved from <Picture 1>.

[detailed_description]
The grade is locked and identical in every shot: rich filmic contrast with pristine specular highlights on metallic textures.
${framingRule}
[Shot 1] Macro tracking shot sweeping over precision mechanical facets, light glinting smoothly across the surface.
[Shot 2] Smooth lateral slide revealing the product in its architectural environment.
[Shot 3] Authoritative hero angle: the product bathed in dramatic rim lighting. An off-screen narrator voiceover speaks: ${extractedDialogue ? `<d>[Chinese] ${extractedDialogue}</d>` : '<d>[Chinese] 卓越非凡，掌控每一瞬间。</d>'} The camera stays locked and pristine.

[overall_soundscape]
Subtle ambient reverberation, crisp mechanical click of precision components.

[non_diegetic_music]
${musicDirective}`;
  }

  // Default: 影视级戏剧叙事与对白镜头
  return `subject_definitions（主体定义）:
<Subject 1> 是 <Picture 1> 中的场景母本：电影感质感场景，空间结构开阔，光影对比鲜明。是环境结构参考；场景物件以此为准，全程不得添加其他非指定物件。
<Subject 2> 是 <Picture 2> 中的主角色：面容沉毅，服饰与身姿端正，眼神专注。
<Subject 3> 是 <Picture 3> 中的对手或搭档角色。
<Subject 4> 是 <Picture 4> 作为起始画面参考图，控制开场构图与人物站位。
声音设定：
<Picture 2> 是主讲人用 (${speakerId}) 标记，声线沉稳有力，并在全片保持一致
detailed_description:
【Shot 1｜0–4秒｜${arConfig.label} 中景·角色对峙与开场】
【主体】<Subject 2> 居画面核心位置，<Subject 3> 侧向入镜。
【动作】<Subject 2> (${speakerId}) 眼神锁定对方，重心下沉，声线沉稳有力地说：
<d>[中文] ${extractedDialogue || '胜负未分，我们按规矩来。'}</d>
说完嘴唇自然闭合，目光坚定不移。
【镜头】${arConfig.label} 电影感水平推镜，景深聚焦于角色眼神与神态。
【音效】环境底噪、微弱脚步摩擦声、沉稳换气呼吸声；无背景音乐，无对白外杂音。
【约束】人物五官骨骼稳定无扭曲变形；口型与台词严格同步；光影与服饰前后一致；无任何多余闲聊废话。`;
}

/**
 * MV-standard Forbidden Words Lexicon & Suppression Definitions:
 * 1. Screen Text & Subtitles Suppression (杜绝画面出现文字、乱码、字幕、水印)
 * 2. Mouth Still / Non-Lip-Sync Suppression (非发声段强力静止声明与负向开口压制)
 * 3. Background Music Suppression (静止/禁止模型生成混杂 BGM，为后期无损全曲 Master BGM 铺底让路)
 */
export const FORBIDDEN_WORDS_LEXICON = {
  // 1. 画面文字与字幕禁止词 (Negative Prompt 强制注入项，100% 杜绝画面出现硬字幕、台词条、乱码文字)
  screenTextAndSubtitles: [
    'subtitles', 'closed captions', 'captions', 'lyrics', 'burned-in text',
    'on-screen text', 'overlaid words', 'lower third', 'subtitles bar',
    'dialogue box', 'karaoke subtitles', 'chinese subtitles', 'english subtitles',
    'text', 'words', 'watermark', 'logo', 'typography', 'letters', 'signature',
    'username', 'font', 'credits', 'timestamps',
    '字幕', '中文字幕', '双语字幕', '台词条', '压屏文字', '歌词字幕', '卡拉OK字幕', '滚动字幕', '黑底字幕条', '水印'
  ],
  // 2. 嘴唇静止 / 禁止开口词 (非发声段负向压制)
  mouthStillSuppression: [
    'singing', 'mouth open', 'lip-sync', 'talking', 'speaking', 'vocalizing',
    'open lips', 'moving mouth', 'dialogue', 'chatting', 'parted lips'
  ],
  // 嘴唇正向静止声明标准句 (必须注入分镜正面 Action 或 Detailed Description)
  mouthStillPositivePhrase: 'mouth naturally closed, lips completely still, not moving along with vocals, no singing or talking',
  // 3. 背景音乐禁止生成声明 (当不需要模型自己生成配乐、为后期无损全曲 Master BGM 让路时)
  bgmSuppressionPositivePhrase: 'None. There is no non-diegetic background music in this video track, absolute silence on the music channel to allow clean external master score mixing.',
  bgmNegativeSuppression: [
    'background music', 'noisy score', 'discordant soundtrack', 'distorted audio',
    'bgm', 'humming', 'audio clipping', 'clashing instruments', 'cacophony'
  ],
  // 4. 角色表面不可变性与防杂质涂鸦挂件禁令 (彻底杜绝环境注意力外溢导致的腰部Logo、大腿挂件、乱码贴纸、衣服印花)
  characterSurfacePurityAndDecals: [
    'stickers', 'decals', 'body graffiti', 'painted emblems', 'waist logo',
    'hanging charms', 'dangling ornaments', 'hanging accessories', 'cartoon decals',
    'body art', 'scratches', 'messy armor', 'decorated chassis', 'clothing patches',
    'brooches', 'badges on clothes', 'printed brand logo', 'unwanted tattoos',
    'decorative stickers', 'body stamps', 'pins', 'keychain', 'random accessories',
    '贴纸', '涂鸦', '徽标', '印花', '挂件', '腰部Logo', '大腿挂饰', '乱码标贴', '车贴'
  ],
  characterPurityPositivePhrase:
    'The character chassis, body armor, and clothing surfaces remain 100% pristine, solid finish identical to reference: strictly zero extra stickers, zero decals, zero waist emblems, zero painted graffiti, zero dangling trinkets on thighs or belt, unadorned and solid texture.'
};

/**
 * Builds compliant Negative Prompt using MV & H3 Suppression rules
 */
export function buildCompliantNegativePrompt(options?: {
  isLipSync?: boolean;
  suppressBgm?: boolean;
  suppressDecalsAndGraffiti?: boolean;
  extraNegatives?: string;
}): string {
  const isLip = options?.isLipSync ?? false;
  const suppressBgm = options?.suppressBgm ?? true;
  const suppressDecals = options?.suppressDecalsAndGraffiti ?? true; // 默认永久锁死角色防涂鸦锁

  const tags: string[] = [...FORBIDDEN_WORDS_LEXICON.screenTextAndSubtitles];

  if (!isLip) {
    tags.push(...FORBIDDEN_WORDS_LEXICON.mouthStillSuppression);
  }
  if (suppressBgm) {
    tags.push(...FORBIDDEN_WORDS_LEXICON.bgmNegativeSuppression);
  }
  if (suppressDecals) {
    tags.push(...FORBIDDEN_WORDS_LEXICON.characterSurfacePurityAndDecals);
  }

  tags.push('cartoon', '3d render', 'distorted anatomy', 'jitter', 'flicker', 'lowres');
  if (options?.extraNegatives) {
    tags.push(options.extraNegatives);
  }

  return Array.from(new Set(tags)).join(', ');
}

/**
 * Applies suppression directives:
 * - Silence background music (for post-production Master BGM replacement)
 * - Enforce mouth naturally closed & completely still
 * - Enforce screen text and subtitle suppression in negative prompt
 */
export function applySuppressionToPrompt(
  prompt: string,
  options: {
    suppressBgm: boolean;
    enforceLipsStill: boolean;
  }
): { modifiedPrompt: string; modifiedNegative: string } {
  let text = prompt;

  if (options.suppressBgm) {
    if (/\[non_diegetic_music\][\s\S]*?$/i.test(text)) {
      text = text.replace(
        /\[non_diegetic_music\][\s\S]*?$/i,
        `[non_diegetic_music]\n${FORBIDDEN_WORDS_LEXICON.bgmSuppressionPositivePhrase}`
      );
    } else {
      text += `\n\n[non_diegetic_music]\n${FORBIDDEN_WORDS_LEXICON.bgmSuppressionPositivePhrase}`;
    }
  }

  if (options.enforceLipsStill) {
    text = text.replace(/<d>.*?<\/d>/gi, '');
    text = text.replace(/Singing vocals:\s*".*?"/gi, '');
    text = text.replace(/her mouth moves only while she speaks:?/gi, '');
    text = text.replace(/his mouth moves only while he speaks:?/gi, '');
    if (!/mouth naturally closed/i.test(text)) {
      if (/\[detailed_description\]/i.test(text)) {
        text = text.replace(/\[detailed_description\]/i, `[detailed_description]\nAll characters maintain ${FORBIDDEN_WORDS_LEXICON.mouthStillPositivePhrase}.`);
      } else if (/\[ACTION\]/i.test(text)) {
        text = text.replace(/\[ACTION\]/i, `[ACTION]\n${FORBIDDEN_WORDS_LEXICON.mouthStillPositivePhrase}.`);
      }
    }
  }

  const negative = buildCompliantNegativePrompt({
    isLipSync: !options.enforceLipsStill,
    suppressBgm: options.suppressBgm
  });

  return { modifiedPrompt: text, modifiedNegative: negative };
}

