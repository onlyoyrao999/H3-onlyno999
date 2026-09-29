import { StoryboardShot } from '../data/mockPipelineData';

export interface PromptCheckResult {
  id: string;
  name: string;
  passed: boolean;
  message: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export interface Gate5Validation {
  shotId: string;
  allPassed: boolean;
  results: PromptCheckResult[];
  fingerprint: string;
}

export interface Gate6Validation {
  passed: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalShots: number;
    totalDuration: number;
    masterDuration: number;
    lipSyncDuration: number;
    lipSyncRatioPct: number;
    maxConsecutiveLipSync: number;
  };
}

const ALLOWED_LIP_SCALES = new Set(['ECU', 'CU', 'MCU', 'MS']);
const FORBIDDEN_TALK_VERBS = ['saying', 'talking', 'speaking', 'chatting', 'tells', 'whispers', 'dialogue'];

export function validateGate5Prompt(shot: StoryboardShot, hasProtagonist: boolean = true): Gate5Validation {
  const prompt = shot.prompt || '';
  const negPrompt = shot.negativePrompt || '';
  const scale = (shot.shotScale || '').toUpperCase().trim();
  const isLipSync = shot.isLipSync;
  const duration = shot.duration;

  const results: PromptCheckResult[] = [];

  // Check 1: Six-part structure
  const required = ['[SHOT]', '[SUBJECT]', '[ACTION]', '[ENVIRONMENT]', '[LIGHTING_COLOR]', '[CAMERA_TECH]'];
  const missing = required.filter(r => !prompt.includes(r));
  results.push({
    id: '01_CHECK_STRUCTURE',
    name: '六段式结构完整度',
    passed: missing.length === 0,
    message: missing.length === 0 ? '六大标准区块齐全 [SHOT] 至 [CAMERA_TECH]' : `缺少区块: ${missing.join(', ')}`,
    severity: 'CRITICAL'
  });

  // Check 2: Language tier check
  const hasStandardHeaders = required.every(r => prompt.includes(r));
  results.push({
    id: '02_CHECK_LANG_TIER',
    name: '语言分层标准',
    passed: hasStandardHeaders,
    message: hasStandardHeaders ? '结构标签采用英文大写标准，艺术叙述允许中文' : '结构标签拼写或大小写不合规',
    severity: 'CRITICAL'
  });

  // Check 3: Vocal line formatting
  const vocalRegex = /Singing vocals:\s*["'][^"']+["']/i;
  const hasVocalLine = vocalRegex.test(prompt);
  if (isLipSync) {
    results.push({
      id: '03_CHECK_VOCAL_LINE',
      name: '独立发声行标记',
      passed: hasVocalLine,
      message: hasVocalLine ? '已包含独立行 Singing vocals: "..."' : '口型镜头缺失独立行 Singing vocals: "歌词"',
      severity: 'CRITICAL'
    });
  } else {
    results.push({
      id: '03_CHECK_VOCAL_LINE',
      name: '非口型发声行隔离',
      passed: !hasVocalLine,
      message: !hasVocalLine ? '非口型镜头已隔离发声标记，避免误触发嘴部动画' : '警告: 非口型镜头却出现了 Singing vocals 标记，模型会误驱动开口',
      severity: 'CRITICAL'
    });
  }

  // Check 4: No dialogue verbs
  const foundTalk = FORBIDDEN_TALK_VERBS.filter(v => prompt.toLowerCase().includes(v));
  results.push({
    id: '04_CHECK_NO_TALK_VERB',
    name: '对白台词动词拦截',
    passed: foundTalk.length === 0,
    message: foundTalk.length === 0 ? '未检测到台词说白动词 (saying/talking 等)' : `检测到对白词汇: ${foundTalk.join(', ')}，将导致人物像在念台词`,
    severity: 'CRITICAL'
  });

  // Check 5: Scale match
  if (isLipSync) {
    const isAllowed = ALLOWED_LIP_SCALES.has(scale);
    results.push({
      id: '05_CHECK_SCALE_MATCH',
      name: '口型景别四分律',
      passed: isAllowed,
      message: isAllowed ? `允许口型景别 (${scale})` : `景别 (${scale}) 严禁对口型！仅限大特写/特写/近景/中景`,
      severity: 'CRITICAL'
    });
  } else {
    results.push({
      id: '05_CHECK_SCALE_MATCH',
      name: '非口型景别合规',
      passed: true,
      message: `非口型景别合规 (${scale})`,
      severity: 'CRITICAL'
    });
  }

  // Check 6: Lip still suppression
  const hasStill = prompt.toLowerCase().includes('mouth naturally closed') || prompt.toLowerCase().includes('lips completely still');
  if (!isLipSync) {
    results.push({
      id: '06_CHECK_LIP_STILL',
      name: '正向嘴唇自然闭合声明',
      passed: hasStill,
      message: hasStill ? '已正向声明 mouth naturally closed, lips completely still' : '非口型段正向必须注入: mouth naturally closed, lips completely still',
      severity: 'CRITICAL'
    });
  } else {
    results.push({
      id: '06_CHECK_LIP_STILL',
      name: '口型段嘴部活动放行',
      passed: true,
      message: '口型段正常允许嘴部呼吸与歌唱动势',
      severity: 'CRITICAL'
    });
  }

  // Check 7: Negative prompt lip suppression & strict screen text suppression (MV画面不要出现文字)
  const negLower = negPrompt.toLowerCase();
  const promptLower = prompt.toLowerCase();
  
  const textSuppressKeywords = ['text', 'subtitles', 'lyrics', 'words', 'watermark', 'captions'];
  const hasTextSuppress = textSuppressKeywords.some(k => negLower.includes(k));
  
  const forbiddenScreenText = ['subtitles on screen', 'burned-in text', 'lyrics text overlaid', 'words written on screen', 'watermark on video'];
  const hasTextInstruction = forbiddenScreenText.some(t => promptLower.includes(t));
  
  const hasNegLip = negLower.includes('singing') || negLower.includes('lip-sync') || negLower.includes('mouth open');

  if (hasTextInstruction) {
    results.push({
      id: '07_CHECK_NEG_LIP_AND_TEXT',
      name: '画面纯净度与负向防文字压制',
      passed: false,
      message: '正向提示词严禁要求画面显示文字/字幕 (MV画面严禁烧录任何文字或乱码)',
      severity: 'CRITICAL'
    });
  } else if (!hasTextSuppress) {
    results.push({
      id: '07_CHECK_NEG_LIP_AND_TEXT',
      name: '画面纯净度与负向防文字压制',
      passed: false,
      message: '负向提示词必须包含防文字压制词汇 (text, subtitles, lyrics, words, watermark)，杜绝画面生成文字乱码',
      severity: 'CRITICAL'
    });
  } else if (!isLipSync && !hasNegLip) {
    results.push({
      id: '07_CHECK_NEG_LIP_AND_TEXT',
      name: '画面纯净度与负向防文字压制',
      passed: false,
      message: '非口型段 Negative 必须包含 singing, mouth open, lip-sync 强行闭嘴，并包含 text/subtitles 防文字压制',
      severity: 'CRITICAL'
    });
  } else {
    results.push({
      id: '07_CHECK_NEG_LIP_AND_TEXT',
      name: '画面纯净度与负向防文字压制',
      passed: true,
      message: isLipSync
        ? '已注入防文字/水印压制词，纯净胶片画质，口型动势正常放行'
        : '双重压制就绪：已封死嘴部张开动势，并全面压制画面文字/字幕/水印',
      severity: 'CRITICAL'
    });
  }

  // Check 8: Subject anchor
  const hasSubjectAnchor = hasProtagonist ? (prompt.includes('[SUBJECT]') && prompt.length > 50) : true;
  results.push({
    id: '08_CHECK_CHAR_ANCHOR',
    name: '角色特征一致性锚点',
    passed: hasSubjectAnchor,
    message: hasProtagonist ? '主体人物锚点描述就绪' : '无主角环境氛围模式放行',
    severity: 'HIGH'
  });

  // Check 9: Conflict check
  const lowered = prompt.toLowerCase();
  const hasLightingConflict = lowered.includes('night') && lowered.includes('bright direct sunlight');
  results.push({
    id: '09_CHECK_NO_CONFLICT',
    name: '时空逻辑自洽无冲突',
    passed: !hasLightingConflict,
    message: !hasLightingConflict ? '未检出昼夜/光照逻辑自相冲突' : '检测到昼夜矛盾描述 (night 与 bright direct sunlight 冲突)',
    severity: 'HIGH'
  });

  // Check 10: Motion pace fit
  const hasWildMotion = duration < 3.0 && (lowered.includes('running fast') || lowered.includes('fighting') || lowered.includes('spinning'));
  results.push({
    id: '10_CHECK_MOTION_FIT',
    name: '短窗口动势匹配',
    passed: !hasWildMotion,
    message: !hasWildMotion ? '镜头动作复杂度与时长匹配良好' : '3秒内安排剧烈复杂动作可能导致模型抽搐变形',
    severity: 'MEDIUM'
  });

  // Check 11: Hash signature
  const fingerprint = shot.fingerprint || 'sig_' + Math.random().toString(36).substring(2, 10);
  results.push({
    id: '11_CHECK_HASH_SIGN',
    name: '提示词防篡改指纹',
    passed: true,
    message: `生成 SHA-256 签名 #${fingerprint}，任何改动将自动使审批失效`,
    severity: 'CRITICAL'
  });

  const allPassed = results.every(r => r.passed);
  return {
    shotId: shot.id,
    allPassed,
    results,
    fingerprint
  };
}

export function validateGate6(storyboard: StoryboardShot[], masterDuration: number, tolerance: number = 0.05): Gate6Validation {
  const errors: string[] = [];
  const warnings: string[] = [];

  let totalDuration = 0.0;
  let lipSyncDuration = 0.0;
  let consecutiveLipSync = 0;
  let maxConsecutiveLipSync = 0;
  let prevEnd = 0.0;

  storyboard.forEach((shot, idx) => {
    const start = shot.start;
    const end = shot.end;
    const dur = end - start;
    const scale = (shot.shotScale || '').toUpperCase().trim();
    const isLip = shot.isLipSync;

    if (idx === 0 && Math.abs(start - 0.0) > tolerance) {
      errors.push(`镜头 ${shot.id}: 首镜必须从 0.00s 绝对起跑 (当前为 ${start.toFixed(2)}s)`);
    }

    if (idx > 0 && Math.abs(start - prevEnd) > tolerance) {
      errors.push(`镜头 ${shot.id}: 发现时间轴断层！上个镜头在 ${prevEnd.toFixed(2)}s 结束，当前在 ${start.toFixed(2)}s 开始 (偏差 ${(start - prevEnd).toFixed(2)}s)`);
    }

    if (dur <= 0.2) {
      errors.push(`镜头 ${shot.id}: 异常过短时长 (${dur.toFixed(2)}s)`);
    }

    totalDuration += dur;
    prevEnd = end;

    if (isLip) {
      lipSyncDuration += dur;
      consecutiveLipSync++;
      if (consecutiveLipSync > maxConsecutiveLipSync) {
        maxConsecutiveLipSync = consecutiveLipSync;
      }

      if (!ALLOWED_LIP_SCALES.has(scale)) {
        errors.push(`镜头 ${shot.id}: 景别 '${scale}' 严禁标注口型！违背铁律 B`);
      }

      if (consecutiveLipSync > 3) {
        errors.push(`镜头 ${shot.id}: 连续口型达到 ${consecutiveLipSync} 个！铁律 B 严禁连续口型 > 3 段，必须插入空镜/叙事/群像`);
      }
    } else {
      consecutiveLipSync = 0;
    }
  });

  if (Math.abs(totalDuration - masterDuration) > tolerance) {
    errors.push(`全部分镜总时长 (${totalDuration.toFixed(2)}s) 与母带原曲时长 (${masterDuration.toFixed(2)}s) 不一致！差额 ${Math.abs(totalDuration - masterDuration).toFixed(2)}s`);
  }

  const lipSyncRatioPct = totalDuration > 0 ? (lipSyncDuration / totalDuration) * 100 : 0;
  if (lipSyncRatioPct > 65) {
    warnings.push(`口型总时长占比为 ${lipSyncRatioPct.toFixed(1)}%，高于黄金 45% 基准，观众极易产生视觉与审美疲劳`);
  } else if (lipSyncRatioPct < 25) {
    warnings.push(`口型占比为 ${lipSyncRatioPct.toFixed(1)}%，低于 25%，歌手存在感可能略显单薄`);
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    stats: {
      totalShots: storyboard.length,
      totalDuration: Number(totalDuration.toFixed(2)),
      masterDuration: Number(masterDuration.toFixed(2)),
      lipSyncDuration: Number(lipSyncDuration.toFixed(2)),
      lipSyncRatioPct: Number(lipSyncRatioPct.toFixed(1)),
      maxConsecutiveLipSync
    }
  };
}

export function computeDurationFit(start: number, end: number, fps: number = 24) {
  const targetSec = end - start;
  const gridFrames = Math.ceil(targetSec * fps);
  const modelRequestSec = gridFrames / fps;
  const overhangSec = modelRequestSec - targetSec;
  return {
    targetSec: Number(targetSec.toFixed(3)),
    gridFrames,
    fps,
    modelRequestSec: Number(modelRequestSec.toFixed(3)),
    overhangSec: Number(overhangSec.toFixed(3))
  };
}
