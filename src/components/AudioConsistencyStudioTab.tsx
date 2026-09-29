import React, { useState, useRef } from 'react';
import {
  Volume2, VolumeX, Play, Pause, ShieldCheck, Sparkles, Sliders, Mic,
  Music, Layers, Radio, CheckCircle2, AlertCircle, FileAudio, RefreshCw,
  Cpu, Copy, Check, Upload, ArrowRight, Waves
} from 'lucide-react';
import {
  SPEAKER_AUDIO_PROFILES,
  SpeakerAudioProfile,
  MASTER_BGM_TRACKS,
  MasterBgmContinuousTrack,
  ROOM_ACOUSTIC_PRESETS,
  RoomAcousticPreset
} from '../data/audioReferenceData';

export const AudioConsistencyStudioTab: React.FC = () => {
  const [selectedSpeaker, setSelectedSpeaker] = useState<SpeakerAudioProfile>(SPEAKER_AUDIO_PROFILES[0]);
  const [selectedBgmTrack, setSelectedBgmTrack] = useState<MasterBgmContinuousTrack>(MASTER_BGM_TRACKS[0]);
  const [selectedAcoustics, setSelectedAcoustics] = useState<RoomAcousticPreset>(ROOM_ACOUSTIC_PRESETS[0]);
  const [activeVoicePlaying, setActiveVoicePlaying] = useState<string | null>(null);
  const [isBgmContinuousPlaying, setIsBgmContinuousPlaying] = useState<boolean>(false);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);

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
  };

  const stopContinuousBgm = () => {
    bgmOscNodesRef.current.forEach(osc => {
      try { osc.stop(); osc.disconnect(); } catch (_) {}
    });
    bgmOscNodesRef.current = [];
    setIsBgmContinuousPlaying(false);
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
                  MV 铁律 C 深度执行
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
