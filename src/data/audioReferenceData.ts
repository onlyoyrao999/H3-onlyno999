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
  genreTarget: 'short_drama' | 'mv' | 'commercial';
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
    id: 'bgm_mv_rainy_neon',
    name: '雨夜街灯 · 电子氛围慢摇母带 (Continuous Vocal & Instrument)',
    key: 'C 小调 (C Minor)',
    bpm: 85,
    durationSeconds: 32.0,
    genreTarget: 'mv',
    description: '采用双轨分离架构：ComfyUI 仅注入干声驱动口型；后期强制压入无损全曲母带，前奏与间奏 100% 伴奏贯穿。',
    stemTracks: [
      { name: 'Analog Synth Pad (复古合成器铺底)', levelDbfs: -16.0, description: '全曲温暖氛围基石' },
      { name: 'Electric Guitar Muted Plucks (吉他轻扫)', levelDbfs: -20.0, description: '节奏点缀' },
      { name: 'Electronic Kick & Snare (电子鼓点)', levelDbfs: -14.0, description: '节拍基准' }
    ],
    afadeSeamPoints: []
  }
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
