import React, { useState, useRef } from 'react';
import {
  Volume2, VolumeX, Play, Pause, ShieldCheck, Sparkles, Sliders, Mic,
  Music, Layers, Radio, CheckCircle2, AlertCircle, FileAudio, RefreshCw,
  Cpu, Copy, Check, Upload, ArrowRight, Waves, GitMerge, Scissors, Database,
  ArrowDownCircle, PlayCircle, Zap
} from 'lucide-react';
import {
  SPEAKER_AUDIO_PROFILES,
  SpeakerAudioProfile,
  MASTER_BGM_TRACKS,
  MasterBgmContinuousTrack,
  ROOM_ACOUSTIC_PRESETS,
  RoomAcousticPreset,
  INITIAL_EXTRACTED_DRY_VOCALS,
  ExtractedDryVocalAsset
} from '../data/audioReferenceData';

export const AudioConsistencyStudioTab: React.FC = () => {
  const [selectedSpeaker, setSelectedSpeaker] = useState<SpeakerAudioProfile>(SPEAKER_AUDIO_PROFILES[0]);
  const [selectedBgmTrack, setSelectedBgmTrack] = useState<MasterBgmContinuousTrack>(MASTER_BGM_TRACKS[0]);
  const [selectedAcoustics, setSelectedAcoustics] = useState<RoomAcousticPreset>(ROOM_ACOUSTIC_PRESETS[0]);
  const [activeVoicePlaying, setActiveVoicePlaying] = useState<string | null>(null);
  const [isBgmContinuousPlaying, setIsBgmContinuousPlaying] = useState<boolean>(false);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);

  // Dry Vocal Extraction States (第1段视频生成后提取干声与跨段调取)
  const [dryVocals, setDryVocals] = useState<ExtractedDryVocalAsset[]>(INITIAL_EXTRACTED_DRY_VOCALS);
  const [selectedDryVocal, setSelectedDryVocal] = useState<ExtractedDryVocalAsset>(INITIAL_EXTRACTED_DRY_VOCALS[0]);
  const [isExtractingDryVocal, setIsExtractingDryVocal] = useState<boolean>(false);
  const [dryVocalSourceSegment, setDryVocalSourceSegment] = useState<string>('P01');
  const [extractionSuccessMsg, setExtractionSuccessMsg] = useState<string | null>(null);
  const [isDryVocalPlaying, setIsDryVocalPlaying] = useState<boolean>(false);

  // Web Audio Context for Realtime Tone & Timbre Audition
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeOscNodesRef = useRef<OscillatorNode[]>([]);
  const bgmOscNodesRef = useRef<OscillatorNode[]>([]);

  const stopActiveVoice = () => {
    activeOscNodesRef.current.forEach(osc => {
      try { osc.stop(); osc.disconnect(); } catch (_) {}
    });
    activeOscNodesRef.current = [];
    setActiveVoicePlaying(null);
    setIsDryVocalPlaying(false);
  };

  const stopContinuousBgm = () => {
    bgmOscNodesRef.current.forEach(osc => {
      try { osc.stop(); osc.disconnect(); } catch (_) {}
    });
    bgmOscNodesRef.current = [];
    setIsBgmContinuousPlaying(false);
  };

  // Play Dry Vocal Stem Audition using Web Audio
  const playDryVocalAudition = (vocal: ExtractedDryVocalAsset) => {
    if (isDryVocalPlaying && selectedDryVocal.id === vocal.id) {
      stopActiveVoice();
      return;
    }

    stopActiveVoice();

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioCtxClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.25, ctx.currentTime);
      masterGain.connect(ctx.destination);

      // High-purity dry vocal simulation (crisp formant filter)
      const dryFilter = ctx.createBiquadFilter();
      dryFilter.type = 'bandpass';
      dryFilter.frequency.setValueAtTime(vocal.formants[1] || 1500, ctx.currentTime);
      dryFilter.Q.setValueAtTime(4.0, ctx.currentTime);
      dryFilter.connect(masterGain);

      const f0 = vocal.pitchHz;
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f0, ctx.currentTime);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.3, ctx.currentTime);
      osc.connect(oscGain);
      oscGain.connect(dryFilter);

      osc.start();
      activeOscNodesRef.current = [osc];
      setSelectedDryVocal(vocal);
      setIsDryVocalPlaying(true);

      setTimeout(() => {
        stopActiveVoice();
      }, 3500);
    } catch (e) {
      console.warn("Dry vocal web audio unavailable", e);
    }
  };

  // Simulate Post-Segment 1 Dry Vocal Extraction
  const handleExtractDryVocalFromP01 = () => {
    setIsExtractingDryVocal(true);
    setExtractionSuccessMsg(null);

    setTimeout(() => {
      const newVocal: ExtractedDryVocalAsset = {
        id: `dry_vocal_${dryVocalSourceSegment.toLowerCase()}_${Date.now()}`,
        sourceSegmentId: dryVocalSourceSegment,
        sourceVideoTitle: `${dryVocalSourceSegment}｜已渲染成片 (362帧/15.08s 视频提取)`,
        speakerId: 'S1',
        speakerName: 'S1 顾沉/主角 (AI分离提纯干声)',
        dialogueSnippet: '这一段的声音已被提纯为广播级纯净干声，无背景杂音。',
        extractionTime: new Date().toLocaleTimeString(),
        snrDb: 35.8,
        formants: [510, 1460, 2720],
        pitchHz: 118,
        durationSeconds: 4.5,
        audioHash: `vocal_sha256_${dryVocalSourceSegment.toLowerCase()}_${Math.random().toString(36).substring(2, 8)}`,
        dryVocalWavUrl: 'https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3',
        isMasterForChaining: true,
        chainedSegments: ['第2段 (已自动继承调取)', '第3段 (已自动继承调取)', '第4段 (已自动继承调取)', '第5~99段 (无限段落就绪)']
      };

      setDryVocals([newVocal, ...dryVocals]);
      setSelectedDryVocal(newVocal);
      setIsExtractingDryVocal(false);
      setExtractionSuccessMsg(`✓ 成功从 ${dryVocalSourceSegment} 视频提取纯净干声！信噪比 35.8dB，已自动下发至第 2 段及后续无数段落作为 LoadAudio (Node 34) 参考音色。`);
      setTimeout(() => setExtractionSuccessMsg(null), 6000);
    }, 1500);
  };

  // Play Character Timbre Audition (Fundamental + Harmonics mimicking baritone/soprano)
  const playCharacterVoiceAudition = (profile: SpeakerAudioProfile) => {
    if (activeVoicePlaying === profile.speakerId) {
      stopActiveVoice();
      return;
    }

    stopActiveVoice();

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioCtxClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.2, ctx.currentTime);
      masterGain.connect(ctx.destination);

      // Create Formant Filters simulating human vocal tract
      const formantFilter = ctx.createBiquadFilter();
      formantFilter.type = 'bandpass';
      formantFilter.frequency.setValueAtTime(profile.speakerId === 'S1' ? 450 : profile.speakerId === 'S2' ? 1200 : 2200, ctx.currentTime);
      formantFilter.Q.setValueAtTime(3.5, ctx.currentTime);
      formantFilter.connect(masterGain);

      const f0 = profile.pitchHz;
      const harmonics = [f0, f0 * 2, f0 * 3, f0 * 4];
      const oscs: OscillatorNode[] = [];

      harmonics.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx === 0 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Vocal vibrato LFO
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(4.8, ctx.currentTime);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(3.0, ctx.currentTime);
        lfo.connect(osc.frequency);
        lfo.start();

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.3 / (idx + 1), ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(formantFilter);

        osc.start();
        oscs.push(osc);
      });

      activeOscNodesRef.current = oscs;
      setActiveVoicePlaying(profile.speakerId);

      // Auto stop after 4.5 seconds
      setTimeout(() => {
        stopActiveVoice();
      }, 4500);
    } catch (e) {
      console.warn("Web audio unavailable", e);
    }
  };

  // Play Continuous Master BGM Audition (Cello Drone & Chord)
  const toggleContinuousBgm = () => {
    if (isBgmContinuousPlaying) {
      stopContinuousBgm();
      return;
    }

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioCtxClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      stopContinuousBgm();

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.18, ctx.currentTime);
      masterGain.connect(ctx.destination);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, ctx.currentTime);
      filter.connect(masterGain);

      // D Minor Pad (D2, A2, D3, F3) for Grand Ballroom Tension
      const chord = [73.42, 110.0, 146.83, 174.61];
      const oscs: OscillatorNode[] = [];

      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx === 0 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(idx === 0 ? 0.35 : 0.2, ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(filter);

        osc.start();
        oscs.push(osc);
      });

      bgmOscNodesRef.current = oscs;
      setIsBgmContinuousPlaying(true);
    } catch (e) {
      console.warn("Web audio BGM unavailable", e);
    }
  };

  const handleCopyVoiceprint = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-8">
      
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-950 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-semibold border border-cyan-500/30">
                音频参考与音画一致性系统 (Audio Reference Architecture)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30">
                角色音色锁 · 伴奏贯穿 · 0.35s 拼接接缝
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Mic className="w-6 h-6 text-cyan-400" />
              <span>三位一体音频一致性中台：人声音色 · 空间混响 · 贯穿配乐</span>
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              针对跨段「角色换嗓子」、「配乐在接缝处粗暴断裂跳变」与「空间回声忽大忽小」三大致命痛点，
              本系统确立：<strong className="text-cyan-300">① 说话人全局 (Sx) 音色指纹参考库</strong>；
              <strong className="text-emerald-300">② 全片贯穿式 Master BGM 双轨重贴</strong>；
              <strong className="text-indigo-300">③ 0.35s afade 平滑音频淡接接缝</strong>。
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={toggleContinuousBgm}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-lg ${
                isBgmContinuousPlaying
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white'
              }`}
            >
              {isBgmContinuousPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isBgmContinuousPlaying ? '停止全片贯穿配乐试听' : '试听全片贯穿 Master BGM'}</span>
            </button>
          </div>
        </div>

        {/* Decorative Wave Pattern */}
        <div className="absolute right-0 bottom-0 w-80 h-32 opacity-15 pointer-events-none flex items-end gap-1">
          {[40, 65, 30, 85, 95, 60, 45, 75, 90, 50, 65, 80, 70, 95, 40, 60, 85].map((h, i) => (
            <div key={i} className="flex-1 bg-cyan-400 rounded-t" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>

      {/* 🎙️ CORE USER REQUIREMENT: 第1段视频生成后提取声音做成干声，方便第2段及无数段落自动调取 */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-950/50 via-slate-900 to-slate-950 border-2 border-cyan-500/40 shadow-2xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-cyan-500/30">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/40">
                核心音频链路 · 必须按此执行
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                第 1 段生成 ➔ 提取干声 ➔ 第 2 段及无限跨段自动调取
              </span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <Scissors className="w-6 h-6 text-cyan-400" />
              <span>第 1 段视频声轨提取 · 纯净干声资产库与跨段自动调取中台</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-4xl leading-relaxed">
              <strong>用户指令核心机制：</strong>在第 1 段视频生成以后，立即提取里面的声音，进行 AI 伴奏/噪音分离，做成广播级纯净干声（Dry Vocal Stem）。保存入干声音色库后，<strong>第 2 段自动调取、第 3 段自动调取，甚至全剧无数个段落自动继承调取</strong>，彻底消灭跨段换嗓子、音色漂移与口型断层的行业痼疾！
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
              <span className="text-slate-400">视频源段落:</span>
              <select
                value={dryVocalSourceSegment}
                onChange={(e) => setDryVocalSourceSegment(e.target.value)}
                className="bg-transparent text-cyan-300 font-bold focus:outline-none cursor-pointer"
              >
                <option value="P01" className="bg-slate-900 text-slate-100">第 1 段 (P01) · 首发主视频</option>
                <option value="P02" className="bg-slate-900 text-slate-100">第 2 段 (P02) · 衍生片段</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleExtractDryVocalFromP01}
              disabled={isExtractingDryVocal}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg flex items-center gap-2 shrink-0 transition disabled:opacity-50"
            >
              {isExtractingDryVocal ? (
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Zap className="w-4 h-4 text-cyan-200 fill-current" />
              )}
              <span>{isExtractingDryVocal ? '正在分离背景提取纯净干声...' : '🎙️ 从第 1 段视频提取干声并入库'}</span>
            </button>
          </div>
        </div>

        {/* Success / Status Notification */}
        {extractionSuccessMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{extractionSuccessMsg}</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-500/30">
              RunningHub Node 34 实时已热更
            </span>
          </div>
        )}

        {/* Interactive Visual Chaining Graph */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <GitMerge className="w-4 h-4 text-cyan-400" />
              <span>跨段声音自动调取流向拓扑 (Cross-Segment Auto-Chaining Topology):</span>
            </span>
            <span className="text-emerald-400 font-semibold">100% 保持同一人声音色</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 items-center">
            {/* Step 1: P01 Video Generated */}
            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/50 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="font-bold text-cyan-300">① 第 1 段视频生成</span>
                <span className="text-emerald-400">✓ 已渲染成片</span>
              </div>
              <div className="text-xs font-bold text-white truncate">P01 视频伴音 (362帧)</div>
              <div className="text-[10px] text-slate-400">含原声对白与环境音</div>
            </div>

            {/* Step 2: Extract Dry Vocal */}
            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/50 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="font-bold text-indigo-300">② 提取干声分离</span>
                <span className="text-cyan-400">AI 降噪滤波</span>
              </div>
              <div className="text-xs font-bold text-white truncate">做成纯净干声 (Dry Vocal)</div>
              <div className="text-[10px] text-slate-400">信噪比 35.8dB · 消除杂音</div>
            </div>

            {/* Step 3: Segment 2 Auto-Chained */}
            <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/50 space-y-1 relative">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="font-bold text-emerald-300">③ 第 2 段 (P02)</span>
                <span className="text-emerald-400 font-bold">✓ 自动调取</span>
              </div>
              <div className="text-xs font-bold text-white truncate">自动继承 S1/S2 干声</div>
              <div className="text-[10px] text-emerald-400/90 font-mono">Node 34 自动挂载</div>
            </div>

            {/* Step 4: Segment 3 Auto-Chained */}
            <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/50 space-y-1 relative">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="font-bold text-emerald-300">④ 第 3 段 (P03)</span>
                <span className="text-emerald-400 font-bold">✓ 自动调取</span>
              </div>
              <div className="text-xs font-bold text-white truncate">同频无缝继承</div>
              <div className="text-[10px] text-emerald-400/90 font-mono">绝不出现换嗓子</div>
            </div>

            {/* Step 5: Infinite Subsequent Segments */}
            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/50 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="font-bold text-purple-300">⑤ 第 4~N 段</span>
                <span className="text-purple-300 font-bold">∞ 无限调取</span>
              </div>
              <div className="text-xs font-bold text-white truncate">全剧统一音色库</div>
              <div className="text-[10px] text-slate-400">100集短剧全局复用</div>
            </div>
          </div>
        </div>

        {/* Extracted Dry Vocal Cards Library */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200 font-mono flex items-center gap-1.5">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>当前已归档的干声资产清单 (点击可试听干声音质与查看自动调取状态):</span>
            </span>
            <span className="text-slate-400 text-[11px]">共提取 {dryVocals.length} 条纯净干声音频</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dryVocals.map((vocal) => {
              const isSelected = selectedDryVocal.id === vocal.id;
              const isPlaying = isDryVocalPlaying && selectedDryVocal.id === vocal.id;

              return (
                <div
                  key={vocal.id}
                  onClick={() => setSelectedDryVocal(vocal)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-400 ring-1 ring-cyan-500/40 shadow-lg'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {vocal.sourceSegmentId} 提取源
                      </span>
                      <span className="text-xs font-bold text-white">{vocal.speakerName}</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      信噪比 SNR: {vocal.snrDb} dB
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                    <div className="text-xs text-slate-300 font-mono italic">
                      "{vocal.dialogueSnippet}"
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                      <span>基频: ~{vocal.pitchHz}Hz</span>
                      <span>时长: {vocal.durationSeconds}s</span>
                      <span>提取时间: {vocal.extractionTime}</span>
                    </div>

                    {/* Chaining targets */}
                    <div className="pt-1.5 border-t border-slate-800/80">
                      <div className="text-[10px] font-mono text-slate-400 mb-1">自动调取已生效段落 (Auto-Chained):</div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {vocal.chainedSegments.map((seg, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 text-[10px] font-mono border border-emerald-500/30"
                          >
                            ✓ {seg}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playDryVocalAudition(vocal);
                      }}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
                        isPlaying
                          ? 'bg-amber-600 text-white'
                          : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow'
                      }`}
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      <span>{isPlaying ? '停止纯净干声试听' : '试听提取纯净干声 (无BGM)'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(vocal.audioHash);
                        setCopiedHash(true);
                        setTimeout(() => setCopiedHash(false), 2000);
                      }}
                      className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono flex items-center gap-1.5 transition"
                      title="复制声学指纹与文件名"
                    >
                      {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>复制指纹</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Module 1: Speaker Voiceprint Reference Library (人物音色参考库) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileAudio className="w-4 h-4 text-cyan-400" />
              <span>1. 角色音色参考库 (Speaker Timbre References & (Sx) 映射)</span>
            </h2>
            <p className="text-xs text-slate-400">
              全局固定 S1/S2/S3 说话人编号与音色声学指纹，保证跨段 100% 同一个人音色，绝不换嗓。
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">RunningHub Node 34 LoadAudio 直连</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SPEAKER_AUDIO_PROFILES.map((profile) => {
            const isSelected = selectedSpeaker.speakerId === profile.speakerId;
            const isPlayingThis = activeVoicePlaying === profile.speakerId;

            return (
              <div
                key={profile.speakerId}
                onClick={() => setSelectedSpeaker(profile)}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3.5 ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500/60 ring-1 ring-cyan-500/30 shadow-lg'
                    : 'bg-slate-900/50 border-slate-800 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      ({profile.speakerId})
                    </span>
                    <span className="text-xs font-bold text-white">{profile.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{profile.role}</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-2">
                  <div className="text-[11px] text-slate-300 font-sans leading-relaxed">
                    {profile.timbreDescription}
                  </div>

                  {/* Synthetic Waveform Visualizer */}
                  <div className="flex items-end gap-1 h-8 pt-1">
                    {profile.waveformPoints.map((val, idx) => (
                      <div
                        key={idx}
                        className={`flex-1 rounded-t transition-all ${
                          isPlayingThis ? 'bg-cyan-400 animate-pulse' : 'bg-slate-700'
                        }`}
                        style={{ height: `${val}%` }}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                    <span>基频: ~{profile.pitchHz}Hz</span>
                    <span>语速: {profile.speakingRate}</span>
                  </div>
                </div>

                {/* Sample Dialogue & Audition Trigger */}
                <div className="space-y-2">
                  <div className="text-[11px] text-slate-400 italic">
                    "{profile.sampleDialogue}"
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playCharacterVoiceAudition(profile);
                      }}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                        isPlayingThis
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {isPlayingThis ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      <span>{isPlayingThis ? '停止音色试听' : '试听音色基频'}</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyVoiceprint(profile.voiceprintHash);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                      title="复制音色指纹哈希"
                    >
                      {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Module 2: Continuous Master BGM & 0.35s Afade Seam Architecture */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-xs font-semibold border border-purple-500/30">
                核心音频防翻车发明
              </span>
              <span className="text-xs text-slate-400">杜绝接缝 BGM 突变爆音</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
              <Music className="w-5 h-5 text-purple-400" />
              <span>2. 跨段配乐贯穿保活与 0.35s 淡接接缝系统 (BGM Continuity Engine)</span>
            </h3>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
              基调: <strong className="text-cyan-400">{selectedBgmTrack.key}</strong>
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
              节奏: <strong className="text-emerald-400">{selectedBgmTrack.bpm} BPM</strong>
            </span>
          </div>
        </div>

        {/* Visual Seam Point Diagram (4 Segments x 15.083s) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>成片 60.33 秒 4 段音频接缝时序图:</span>
            <span className="text-indigo-400">每段尾镜留出 0.35s afade 淡接缓冲</span>
          </div>

          <div className="grid grid-cols-4 gap-2 h-16 bg-slate-950 p-2 rounded-xl border border-slate-800 relative">
            {[1, 2, 3, 4].map((seg) => (
              <div
                key={seg}
                className="h-full rounded-lg bg-slate-900 border border-slate-700/80 p-2 flex flex-col justify-between relative overflow-hidden"
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="font-bold text-cyan-300">段落 {seg} (15.08s)</span>
                  <span className="text-slate-400">362 帧</span>
                </div>
                <div className="text-[9px] text-slate-400 truncate">
                  {seg === 1 ? 'S3 挑衅台词' : seg === 2 ? 'S2 反击台词' : seg === 3 ? 'S1 推门入场' : 'S1 霸总宣示'}
                </div>
                {/* 0.35s Afade Indicator */}
                <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-indigo-500/50 to-transparent" title="0.35s 音频淡出缓冲带" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] font-mono">
            {selectedBgmTrack.afadeSeamPoints.map((seam, i) => (
              <div key={i} className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-400 space-y-0.5">
                <div className="text-emerald-400 font-bold">{seam.segmentTransition} ({seam.seamSecond}s)</div>
                <div className="text-[10px] text-slate-500">{seam.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Dual-Track Audio Architecture Explanation */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>双轨交付架构（为什么成片必须母带重贴，而不是直接用 H3 生成的配乐？）</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed text-slate-300">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <span className="font-bold text-amber-300">❌ 错误做法：直接硬切拼接</span>
              <p className="text-slate-400">
                如果 4 段直接用 <code>-c copy</code> 拼合，每段 H3 自由生成的配乐会在第 15.08s、30.16s 出现剧烈的乐器变奏、调性突变与断层，整片瞬间露馅。
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-emerald-500/30 space-y-1">
              <span className="font-bold text-emerald-300">✓ 本 SOP 做法：双轨母带重贴</span>
              <p className="text-slate-400">
                ComfyUI 仅注入干声音频驱动人物口型；成片后通过 FFmpeg 滤镜强制挂载完整 60.33 秒无损 Master BGM，全片旋律如行云流水，绝无跳变。
              </p>
            </div>
          </div>

          {/* Prompt Suppression Directives for Clean Audio */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-200 font-mono">
                  🔇 静止/禁止出现背景音乐 · H3 提示词与 Negative 编写准则
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                  纯净对白与无BGM铁律 C 深度执行
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px]">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-cyan-400 font-bold">正向 [non_diegetic_music] 声明写法:</div>
                <div className="text-slate-300">
                  None. There is no non-diegetic background music in this video track, absolute silence on the music channel to allow clean external master score mixing.
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-red-400 font-bold">Negative Prompt 背景音乐杂音禁止词:</div>
                <div className="text-slate-300">
                  background music, noisy score, discordant soundtrack, distorted audio, bgm, humming, audio clipping, clashing instruments
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Module 3: Room Acoustics & Spatial Reverberation Presets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Waves className="w-4 h-4 text-indigo-400" />
              <span>3. 空间混响与声学环境锁定 (Room Acoustics & Soundscape Lock)</span>
            </h2>
            <p className="text-xs text-slate-400">
              锁定 H3 第五段 <code>[overall_soundscape]</code>，确保全片在同一声学空间中，回声与环境杂音绝不跳跃。
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ROOM_ACOUSTIC_PRESETS.map((room) => {
            const isSelected = selectedAcoustics.id === room.id;
            return (
              <div
                key={room.id}
                onClick={() => setSelectedAcoustics(room)}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                  isSelected
                    ? 'bg-slate-900 border-indigo-500/60 ring-1 ring-indigo-500/30 shadow-lg'
                    : 'bg-slate-900/50 border-slate-800 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{room.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                    RT60: {room.rt60Seconds}s
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {room.environmentDescription}
                </p>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-300 leading-relaxed">
                  <div className="text-slate-500 font-bold mb-0.5">[overall_soundscape] 提示词指令:</div>
                  "{room.promptDirective}"
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
