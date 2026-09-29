/**
 * MiniMax H3 智能时长自动规划与动态切分引擎
 * 针对用户自然语言指令（如 "生成20秒短片", "做个30秒广告", "来个1分钟短剧"）
 * 自动适配 MiniMax H3 官方底模原生 10.0s (243帧) 与 15.0s (362帧) 硬件规格，
 * 实现零感知自动切换与跨段接力切分！
 */

export interface SegmentPlanItem {
  segmentIndex: number;
  duration: 10 | 15;
  frames: number; // 243 or 362
  role: string;
  tailFramePadRequired: boolean; // 是否需要抽取尾帧作为下一段的 ref_image_0 / ref_image_1
  refVideoPrevRequired: boolean; // 是否需要挂载上一段视频到 Node 175 (VHS_LoadVideo)
  startTime: number;
  endTime: number;
  notes: string;
}

export interface DurationPartitionPlan {
  totalTargetSeconds: number;
  actualTotalSeconds: number;
  segmentCount: number;
  segmentUnit: '10s_only' | '15s_only' | 'hybrid';
  genreRecommendation: 'commercial' | 'short_drama' | 'mv';
  summary: string;
  segments: SegmentPlanItem[];
  ffmpegStitchCommand: string;
}

/**
 * 从用户任意自然语言中提取目标秒数
 * 例："生成20秒的短片" -> 20
 *     "来一个30秒广告" -> 30
 *     "搞个1分钟竖屏短剧" -> 60
 *     "45s video" -> 45
 */
export function extractDurationFromPrompt(prompt: string): number {
  if (!prompt) return 15;

  // 1. 匹配几分钟
  const minuteMatch = prompt.match(/(\d+(?:\.\d+)?)\s*(?:分钟|分|mins?|minutes?)/i);
  if (minuteMatch) {
    const mins = parseFloat(minuteMatch[1]);
    return Math.round(mins * 60);
  }

  // 2. 匹配具体秒数
  const secondMatch = prompt.match(/(\d+(?:\.\d+)?)\s*(?:秒钟|秒|s|sec|seconds?)/i);
  if (secondMatch) {
    return Math.round(parseFloat(secondMatch[1]));
  }

  // 3. 语义推断
  if (prompt.includes('短剧') || prompt.includes('一集') || prompt.includes('剧集')) {
    return 60; // 默认 1 分钟短剧
  }
  if (prompt.includes('广告') || prompt.includes('宣传片')) {
    return 15;
  }
  if (prompt.includes('mv') || prompt.includes('音乐视频')) {
    return 30;
  }

  // 默认返回 15 秒（微短剧标准单段）
  return 15;
}

/**
 * 智能规划：将用户指定的任意总时长拆解为最优的 10s / 15s 序列
 */
export function planDurationPartition(totalSeconds: number): DurationPartitionPlan {
  const target = Math.max(5, Math.round(totalSeconds));

  let segmentDurations: Array<10 | 15> = [];
  let genre: 'commercial' | 'short_drama' | 'mv' = 'short_drama';

  if (target <= 12) {
    // 10 秒档
    segmentDurations = [10];
    genre = 'commercial';
  } else if (target <= 18) {
    // 15 秒档
    segmentDurations = [15];
    genre = 'commercial';
  } else if (target <= 24) {
    // 20 秒档：2 段 × 10 秒
    segmentDurations = [10, 10];
    genre = 'commercial';
  } else if (target <= 34) {
    // 30 秒档：优先 2 段 × 15 秒（短剧/广告经典结构）
    segmentDurations = [15, 15];
    genre = 'short_drama';
  } else if (target <= 48) {
    // 45 秒档：3 段 × 15 秒
    segmentDurations = [15, 15, 15];
    genre = 'short_drama';
  } else if (target <= 65) {
    // 60 秒档（1分钟微短剧）：4 段 × 15 秒
    segmentDurations = [15, 15, 15, 15];
    genre = 'short_drama';
  } else if (target <= 95) {
    // 90 秒档：6 段 × 15 秒
    segmentDurations = [15, 15, 15, 15, 15, 15];
    genre = 'short_drama';
  } else if (target <= 125) {
    // 120 秒档（2分钟）：8 段 × 15 秒
    segmentDurations = [15, 15, 15, 15, 15, 15, 15, 15];
    genre = 'short_drama';
  } else {
    // 大于 120 秒：按 15 秒贪心分配
    const count = Math.ceil(target / 15);
    segmentDurations = Array(count).fill(15);
    genre = 'short_drama';
  }

  let currentTime = 0;
  const segments: SegmentPlanItem[] = segmentDurations.map((dur, idx) => {
    const isFirst = idx === 0;
    const isLast = idx === segmentDurations.length - 1;
    const frames = dur === 15 ? 362 : 243;
    const startTime = currentTime;
    const endTime = currentTime + dur;
    currentTime = endTime;

    let role = '';
    if (segmentDurations.length === 1) {
      role = dur === 10 ? '单段极速直出 (高能精炼)' : '单段影视长镜头 (起承转合)';
    } else {
      if (isFirst) role = `第 1 段：开篇铺垫与角色出场 (${dur}s)`;
      else if (isLast) role = `第 ${idx + 1} 段：高潮反转与定格收尾 (${dur}s)`;
      else role = `第 ${idx + 1} 段：矛盾激化与情绪推进 (${dur}s)`;
    }

    return {
      segmentIndex: idx + 1,
      duration: dur,
      frames,
      role,
      tailFramePadRequired: !isLast, // 非尾段必须抽尾帧为下一段做垫图
      refVideoPrevRequired: !isFirst, // 非首段必须接入上一段视频
      startTime,
      endTime,
      notes: isFirst
        ? `使用人物正面定妆卡 (Node 137) + 场景母本 (Node 167)`
        : `载入前段成片 (Node 175) + 自动挂载上一段第 ${segmentDurations[idx - 1] === 15 ? 362 : 243} 帧尾帧垫图`
    };
  });

  const actualTotalSeconds = segmentDurations.reduce((a, b) => a + b, 0);
  const isAll10 = segmentDurations.every(d => d === 10);
  const isAll15 = segmentDurations.every(d => d === 15);
  const segmentUnit = isAll10 ? '10s_only' : isAll15 ? '15s_only' : 'hybrid';

  const summary = segmentDurations.length === 1
    ? `用户目标 ${target} 秒 ➔ 自动切换为单段 ${segmentDurations[0]} 秒 (${segmentDurations[0] === 15 ? 362 : 243} 帧) 一键直出`
    : `用户目标 ${target} 秒 ➔ 自动规划为 ${segmentDurations.length} 段 × ${segmentDurations.join('s + ')}s (共 ${actualTotalSeconds} 秒 · 自动尾帧垫图跨段接力)`;

  // 生成零重影 FFmpeg 无缝拼接指令
  const inputs = segments.map((_, i) => `-i segment_${(i + 1).toString().padStart(2, '0')}.mp4`).join(' ');
  const filterConcats = segments.map((_, i) => (i === 0 ? `[0:v]` : `[${i}:v]select='gt(n\\,0)'[v${i}];`)).join('');
  const concatList = segments.map((_, i) => (i === 0 ? `[0:v]` : `[v${i}]`)).join('');
  const ffmpegStitchCommand = `ffmpeg ${inputs} -filter_complex "${filterConcats}${concatList}concat=n=${segments.length}:v=1:a=0[outv]" -map "[outv]" -c:v libx264 -pix_fmt yuv420p output_${target}s_master.mp4`;

  return {
    totalTargetSeconds: target,
    actualTotalSeconds,
    segmentCount: segmentDurations.length,
    segmentUnit,
    genreRecommendation: genre,
    summary,
    segments,
    ffmpegStitchCommand
  };
}
