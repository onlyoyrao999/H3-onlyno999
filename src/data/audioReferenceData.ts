/**
 * Audio Reference & Consistency Specifications
 * Solves:
 * 1. Character Timbre Inconsistency (角色音色漂移 / 换嗓子)
 * 2. Cross-Segment BGM Discontinuity (每段独立生成导致接缝配乐跳变)
 * 3. Room Acoustics Drift (空间混响突变)
 * 4. RunningHub Node 34 / ComfyUI Audio Reference binding
 */

export interface SpeakerAudioProfile {
  speakerId: 'S1' | 'S2' | 'S3';
  name: string;
  role: string;
  timbreDescription: string;
  pitchHz: number; // Fundamental frequency for Web Audio preview
  formantColor: string; // e.g., 'Warm Baritone', 'Crisp Mezzo-Soprano'
  refAudioFileName: string;
  voiceprintHash: string;
  sampleDialogue: string;
  speakingRate: string;
  waveformPoints: number[];
  runningHubNodeMapping: {
    nodeId: string;
    fieldName: string;
    nodeType: string;
    desc: string;
  };
}

export const SPEAKER_AUDIO_PROFILES: SpeakerAudioProfile[] = [
  {
    speakerId: 'S1',
    name: '顾沉 (男主 / 顾氏总裁)',
    role: '冷酷果决 · 掌权者',
    timbreDescription: '低沉沉稳男中音，共鸣腔在胸腔与咽喉，气声极少，咬字刚劲断句果断，冷峻威压感。',
    pitchHz: 120.0,
    formantColor: 'Resonant Low Baritone (胸腔共鸣低男中音)',
    refAudioFileName: 'ref_voice_s1_gu_chen_baritone.wav',
    voiceprintHash: 'vp_s1_98a72f0b4d1c3e8e',
    sampleDialogue: '从今天起，见她如见我。谁敢动她分毫，就是跟我顾沉过不去。',
    speakingRate: '中缓 (约 3.2 字/秒，重音后微停顿)',
    waveformPoints: [15, 28, 45, 78, 62, 85, 95, 70, 52, 38, 20, 42, 68, 88, 75, 40, 22, 12],
    runningHubNodeMapping: {
      nodeId: '34',
      fieldName: 'audio',
      nodeType: 'LoadAudio',
      desc: 'S1 专属音色参考干声切片，接入 ComfyUI 音色锁死条件'
    }
  },
  {
    speakerId: 'S2',
    name: '林清晚 (女主 / 豪门千金)',
    role: '清冷坚韧 · 优雅克制',
    timbreDescription: '清澈细腻女中高音，音质如冷玉微润，吐字清晰柔中带刺，不卑不亢的从容感。',
    pitchHz: 235.0,
    formantColor: 'Crisp Lyric Mezzo-Soprano (明亮清透女声)',
    refAudioFileName: 'ref_voice_s2_lin_qingwan_soprano.wav',
    voiceprintHash: 'vp_s2_63e14a88bc5f2091',
    sampleDialogue: '顾夫人当年亲手给的请柬，赵小姐若有疑虑，大可亲自去问。',
    speakingRate: '沉着均匀 (约 3.6 字/秒，音量稳定)',
    waveformPoints: [22, 38, 55, 65, 82, 74, 90, 85, 60, 48, 35, 52, 70, 80, 65, 45, 30, 18],
    runningHubNodeMapping: {
      nodeId: '34',
      fieldName: 'audio',
      nodeType: 'LoadAudio',
      desc: 'S2 专属音色参考干声切片，跨段复用保证不换嗓'
    }
  },
  {
    speakerId: 'S3',
    name: '赵美琳 (女配 / 挑衅千金)',
    role: '娇横傲慢 · 锋芒毕露',
    timbreDescription: '明亮偏高女声，带轻微尾音上扬与齿音锋利感，语速偏快，充满挑衅与嘲讽张力。',
    pitchHz: 285.0,
    formantColor: 'Sharp High Treble (高亢锐利女声)',
    refAudioFileName: 'ref_voice_s3_zhao_meilin_sharp.wav',
    voiceprintHash: 'vp_s3_27d891901a55f7bc',
    sampleDialogue: '林清晚，你以为顾家这道门，是你想进就能进的？',
    speakingRate: '轻快逼人 (约 4.2 字/秒，尾音微扬)',
    waveformPoints: [30, 48, 70, 88, 92, 85, 78, 95, 88, 70, 55, 62, 85, 90, 72, 50, 32, 20],
    runningHubNodeMapping: {
      nodeId: '34',
      fieldName: 'audio',
      nodeType: 'LoadAudio',
      desc: 'S3 专属音色参考干声切片，确保嘲讽音色始终如一'
    }
  }
];

export interface MasterBgmContinuousTrack {
  id: string;
  name: string;
  key: string;
  bpm: number;
  durationSeconds: number; // 60.33s for 4-segment drama, 120.67s for 8-segment
  genreTarget: 'wuxia_fight' | 'short_drama' | 'commercial';
  description: string;
  stemTracks: {
    name: string;
    levelDbfs: number;
    description: string;
  }[];
  afadeSeamPoints: {
    segmentTransition: string;
    seamSecond: number;
    fadeDuration: number;
    description: string;
  }[];
}

export const MASTER_BGM_TRACKS: MasterBgmContinuousTrack[] = [
  {
    id: 'bgm_drama_grand_ballroom',
    name: '豪门夜宴 · 悬疑交锋完整主题配乐 (Master BGM)',
    key: 'D 小调 (D Minor)',
    bpm: 72,
    durationSeconds: 60.33,
    genreTarget: 'short_drama',
    description: '贯穿全片 4 段的低音大提琴 (Cello Drone) 铺底与断奏弦乐 (Staccato Strings)。杜绝每段生成杂乱 BGM，后期强制整轨重贴，音画无缝呼吸。',
    stemTracks: [
      { name: 'Cello & Double Bass Drone (低音底轨)', levelDbfs: -18.0, description: '全片 60.33 秒不间断流淌，提供空间悬疑张力' },
      { name: 'Staccato Violin Accents (小提琴交锋断奏)', levelDbfs: -22.5, description: '对白停顿处切入，烘托心理博弈' },
      { name: 'Sub-Bass Tension Pulses (次低音脉冲)', levelDbfs: -24.0, description: '段落切点与男主出场重音强化' },
      { name: 'Ballroom Ambient Reverb (宴会厅空间反射)', levelDbfs: -32.0, description: '大理石地面脚步与远端香槟杯轻碰环境声' }
    ],
    afadeSeamPoints: [
      { segmentTransition: 'Seg 1 ➔ Seg 2', seamSecond: 15.083, fadeDuration: 0.35, description: 'Seg 1 尾镜留白 0.35s，Seg 2 首音平滑渐入，杜绝咔嗒爆音' },
      { segmentTransition: 'Seg 2 ➔ Seg 3', seamSecond: 30.166, fadeDuration: 0.35, description: '男主推门前段尾静音反应，转场无缝承接' },
      { segmentTransition: 'Seg 3 ➔ Seg 4', seamSecond: 45.249, fadeDuration: 0.35, description: '高潮宣言前交响管乐和弦渐起过渡' }
    ]
  },
  {
    id: 'bgm_wuxia_bamboo_fight',
    name: '竹林对决 · 古筝杀伐与战鼓低音 (Master Wuxia Score)',
    key: '羽调式 (E Minor)',
    bpm: 108,
    durationSeconds: 60.33,
    genreTarget: 'wuxia_fight',
    description: '武侠仙法打斗外挂底轨。将环境配乐控制在安全电平，保留最高纯度的金石交鸣、风爆拟音与短促战吼。',
    stemTracks: [
      { name: 'War Drum Sub-Bass (战鼓低频心跳)', levelDbfs: -20.0, description: '招式碰撞与受力滑退时重音契合' },
      { name: 'Guzheng Tremolo (古筝轮指颤音)', levelDbfs: -24.0, description: '刀光剑影高速穿梭之凛冽杀意' },
      { name: 'Wind & Rain Foley Pad (狂风雨幕拟音底轨)', levelDbfs: -18.0, description: '大自然现场风噪与水花喷溅真实感' }
    ],
    afadeSeamPoints: []
  },
];

export interface RoomAcousticPreset {
  id: string;
  name: string;
  rt60Seconds: number; // Reverberation decay time
  earlyReflectionMs: number;
  environmentDescription: string;
  promptDirective: string;
}

export const ROOM_ACOUSTIC_PRESETS: RoomAcousticPreset[] = [
  {
    id: 'ballroom_opulent',
    name: '豪华水晶宴会厅 (Opulent Grand Ballroom)',
    rt60Seconds: 1.8,
    earlyReflectionMs: 38,
    environmentDescription: '高挑穹顶、抛光大理石地面与水晶吊灯产生的自然温暖回声，远端微弱人声杂音。',
    promptDirective: 'Muffled murmur of background ballroom guests, subtle clink of champagne flutes on distant ivory-draped tables, natural high-ceiling warm acoustic reverberation.'
  },
  {
    id: 'penthouse_rainy',
    name: '雨夜高空顶层公寓 (Rainy Penthouse)',
    rt60Seconds: 1.1,
    earlyReflectionMs: 24,
    environmentDescription: '全景玻璃幕墙雨丝轻击声，现代极简开阔空间的紧实回声。',
    promptDirective: 'Gentle rhythmic rain patter against panoramic glass wall, quiet interior luxury room tone with low-frequency rumble of midnight city.'
  },
  {
    id: 'studio_dry',
    name: '影视录音棚近场声 (Cinematic Dry Close-Up)',
    rt60Seconds: 0.4,
    earlyReflectionMs: 12,
    environmentDescription: '极度纯净的人声近场拾音，低底噪，适合商业广告画外音 (Voice-Over)。',
    promptDirective: 'Clean studio isolation, zero room echo, crisp proximity effect on spoken dialogue with rich vocal warmth.'
  }
];

export interface ExtractedDryVocalAsset {
  id: string;
  sourceSegmentId: string; // e.g. "P01"
  sourceVideoTitle: string;
  speakerId: 'S1' | 'S2' | 'S3';
  speakerName: string;
  dialogueSnippet: string;
  extractionTime: string;
  snrDb: number;
  formants: number[];
  pitchHz: number;
  durationSeconds: number;
  audioHash: string;
  dryVocalWavUrl: string;
  isMasterForChaining: boolean;
  chainedSegments: string[];
}

export const INITIAL_EXTRACTED_DRY_VOCALS: ExtractedDryVocalAsset[] = [
  {
    id: 'dry_vocal_p01_s1',
    sourceSegmentId: 'P01',
    sourceVideoTitle: 'P01｜老房子开场与初次对峙 (0~362帧)',
    speakerId: 'S1',
    speakerName: 'S1 顾沉 (男主成熟磁性干声)',
    dialogueSnippet: '见她如见我。谁敢动她分毫，就是跟我顾沉过不去。',
    extractionTime: '2026-09-30 16:50',
    snrDb: 32.8,
    formants: [480, 1420, 2650],
    pitchHz: 110,
    durationSeconds: 4.8,
    audioHash: 'vocal_sha256_s1_p01_master_7b29a1',
    dryVocalWavUrl: 'https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3',
    isMasterForChaining: true,
    chainedSegments: ['P02 (已自动继承)', 'P03 (已自动继承)', 'P04 (已自动继承)', 'P05~P99 (无限跨段调取)']
  },
  {
    id: 'dry_vocal_p01_s2_wuxia',
    sourceSegmentId: 'P01',
    sourceVideoTitle: 'P01｜暴雨竹林回马枪初交手 (0~362帧)',
    speakerId: 'S1',
    speakerName: 'S1 银枪少侠 (短喝战吼纯净干声)',
    dialogueSnippet: '<d>[中文] 现身！</d>',
    extractionTime: '2026-09-30 16:52',
    snrDb: 34.5,
    formants: [580, 1680, 2920],
    pitchHz: 135,
    durationSeconds: 1.2,
    audioHash: 'vocal_sha256_wuxia_s1_shout_9e41fc',
    dryVocalWavUrl: 'https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3',
    isMasterForChaining: true,
    chainedSegments: ['P02 (拼刀对决)', 'P03 (破竹贯穿)', 'P04 (终极定格)', '第2集~第100集 (无限调取)']
  }
];
