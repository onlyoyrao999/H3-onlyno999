import React, { useState, useEffect, useRef } from 'react';
import { DEMO_LYRICS, LyricLine } from '../data/mockPipelineData';
import {
  Play, Pause, RotateCcw, Check, Volume2, VolumeX, ShieldCheck,
  Music, Mic, Radio, Sparkles, Layers, Sliders
} from 'lucide-react';

export const LyricTimelineTab: React.FC = () => {
  const [lyrics, setLyrics] = useState<LyricLine[]>(DEMO_LYRICS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0.0);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [bgmContinuityMode, setBgmContinuityMode] = useState(true);

  // Web Audio Context & Node Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const bgmOscNodesRef = useRef<OscillatorNode[]>([]);
  const vocalOscRef = useRef<OscillatorNode | null>(null);

  // Stop all active web audio oscillators
  const stopWebAudio = () => {
    bgmOscNodesRef.current.forEach(osc => {
      try { osc.stop(); osc.disconnect(); } catch (_) {}
    });
    bgmOscNodesRef.current = [];

    if (vocalOscRef.current) {
      try { vocalOscRef.current.stop(); vocalOscRef.current.disconnect(); } catch (_) {}
      vocalOscRef.current = null;
    }
  };

  // Start continuous Web Audio BGM Synthesizer
  const startWebAudio = () => {
    if (!isAudioEnabled) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioCtxClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      stopWebAudio();

      // Master Gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.18, ctx.currentTime);
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      // Filter for warm cinematic ambient sound
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(750, ctx.currentTime);
      filter.connect(masterGain);

      // Warm continuous chord pad: D minor 9 (146.8Hz, 220Hz, 261.6Hz, 329.6Hz)
      // This BGM plays continuously across ALL sections (Intro, Verse, Interlude, Chorus, Outro)
      const frequencies = [146.83, 220.0, 261.63, 329.63];
      const oscs: OscillatorNode[] = [];

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(idx === 0 ? 0.35 : 0.2, ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(filter);

        osc.start();
        oscs.push(osc);
      });
      bgmOscNodesRef.current = oscs;
    } catch (e) {
      console.warn("Web Audio not supported or blocked by browser policy:", e);
    }
  };

  // Playback timer simulation
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      startWebAudio();
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= 32.0) {
            setIsPlaying(false);
            stopWebAudio();
            return 0.0;
          }
          return prev + 0.1;
        });
      }, 100);
    } else {
      stopWebAudio();
    }
    return () => {
      clearInterval(interval);
      stopWebAudio();
    };
  }, [isPlaying, isAudioEnabled]);

  const activeLine = lyrics.find(l => currentTime >= l.start && currentTime < l.end);
  const isInstrumentalNow = activeLine?.isInstrumental ?? true;

  const handleUpdateText = (id: string, newText: string) => {
    setLyrics(prev => prev.map(l => l.id === id ? { ...l, text: newText, confidence: 1.0 } : l));
  };

  const handleTogglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
      {/* Top Banner & Control Strip */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold text-xs border border-cyan-500/30">
              GATE 1 审查台
            </span>
            <h2 className="text-base font-bold text-white">歌词提取、母带伴奏保活与强制对齐</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            铁律 A 核心准则：全曲伴奏底轨 100% 持续流动，非歌声段（前奏/间奏/尾奏）绝不静音死寂；画面严禁烧录文字。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition ${
              isAudioEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="网页音频合成器开关"
          >
            {isAudioEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            <span>{isAudioEnabled ? '伴奏合成器开启' : '伴奏合成器静音'}</span>
          </button>

          <button
            onClick={handleTogglePlay}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-cyan-500/20"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? '暂停全曲试听' : '播放母带试听 (伴奏保活)'}</span>
          </button>

          <button
            onClick={() => { setIsPlaying(false); stopWebAudio(); setCurrentTime(0.0); }}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition"
            title="重置播放头至 00:00"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Two Core Guarantees Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Guarantee 1: Continuous BGM */}
        <div className="bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/30 rounded-xl p-4 flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/20 text-cyan-400 mt-0.5">
            <Music className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wide">
                全曲伴奏底轨贯穿保活 (BGM Continuity: Active)
              </h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                100% 杜绝静音
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              前奏 (0~4.5s)、间奏 (13.5~17.8s)、尾奏 (27.2~32s) 及换气呼吸口，<strong>母带伴奏乐器 100% 持续演奏</strong>。人声切片仅作为 ComfyUI 口型驱动条件，成片绝无瞬间失声死寂。
            </p>
          </div>
        </div>

        {/* Guarantee 2: Zero Screen Text */}
        <div className="bg-gradient-to-r from-purple-950/40 to-slate-900 border border-purple-500/30 rounded-xl p-4 flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-purple-500/20 text-purple-400 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wide">
                MV 画面纯净铁律 (Zero Screen Text Guaranteed)
              </h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                纯净胶片画质
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              正向禁止索要文字；负向强制注入 <code className="text-purple-300 font-mono text-[11px]">text, words, subtitles, lyrics, watermark</code>，杜绝模型在画面中浮现扭曲乱码或伪字幕。字幕统一后期挂载。
            </p>
          </div>
        </div>
      </div>

      {/* Audio Waveform & Real-Time Dual-Track Monitor */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>母带总轨时间轴: {currentTime.toFixed(2)}s / 32.00s</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400">无损母带立体声 · 44.1kHz / 24bit WAV</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px]">
              伴奏底轨全程保活
            </span>
          </div>
        </div>

        {/* Waveform Bar Track */}
        <div className="relative h-24 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center px-3">
          {/* Section Marker Labels on Timeline */}
          <div className="absolute top-1 left-3 right-3 flex justify-between text-[10px] font-mono text-slate-500 z-0 pointer-events-none">
            <span>0.0s [前奏伴奏]</span>
            <span>4.5s [主歌人声]</span>
            <span>13.5s [间奏Solo]</span>
            <span>17.8s [副歌人声]</span>
            <span>27.2s [尾奏淡出]</span>
            <span>32.0s</span>
          </div>

          {/* Simulated Waveform Bars */}
          <div className="w-full h-16 flex items-center justify-between gap-1 opacity-80 pt-3">
            {Array.from({ length: 70 }).map((_, i) => {
              const barTime = (i / 70) * 32.0;
              const isPast = currentTime >= barTime;
              const barActive = Math.abs(currentTime - barTime) < 0.6;
              // BGM is always active (at least 25% height everywhere!), vocal peaks higher
              const baseBgmHeight = Math.sin(i * 0.3) * 20 + 35;
              const vocalBoost = (barTime >= 4.5 && barTime <= 13.5) || (barTime >= 17.8 && barTime <= 27.2) ? 35 : 0;
              const heightPct = Math.min(95, Math.max(20, baseBgmHeight + vocalBoost));

              return (
                <div
                  key={i}
                  style={{ height: `${heightPct}%` }}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    barActive
                      ? 'bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.8)] scale-y-110'
                      : isPast
                        ? 'bg-cyan-500/70'
                        : 'bg-slate-700/60'
                  }`}
                />
              );
            })}
          </div>

          {/* Scrub cursor line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 shadow-[0_0_10px_rgba(239,68,68,0.9)]"
            style={{ left: `${(currentTime / 32.0) * 100}%` }}
          >
            <div className="w-3 h-3 rounded-full bg-red-500 -ml-1.5 -mt-1 shadow-lg ring-2 ring-red-300" />
          </div>
        </div>

        {/* Real-time Dual-Track Status Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {/* Track 1: Master BGM Status */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-2.5 h-2.5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-cyan-400" />
                  <span>母带器乐伴奏贯穿轨 (Master BGM)</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {isPlaying ? '🎵 伴奏持续流淌中 · 100% 贯穿绝无静音' : '⏸ 待命 · 伴奏保活就绪'}
                </div>
              </div>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
              持续常响 (No Silence)
            </span>
          </div>

          {/* Track 2: Vocal Stems Status */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-2.5 h-2.5 rounded-full ${!isInstrumentalNow && isPlaying ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-purple-400" />
                  <span>人声干声切片轨 (Isolated Vocal Stems)</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {!isInstrumentalNow
                    ? '🎤 人声演唱进行中 · 特征驱动口型'
                    : '⏸ 器乐演奏段 · 人声静音闭嘴，伴奏平稳铺底'}
                </div>
              </div>
            </div>
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded border font-semibold ${
              !isInstrumentalNow
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
            }`}>
              {!isInstrumentalNow ? '歌声驱动中' : '纯器乐过渡'}
            </span>
          </div>
        </div>

        {/* Currently Active Lyric Line Highlight */}
        <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold border border-cyan-500/30">
              当前时间窗: {activeLine ? `${activeLine.start.toFixed(1)}s - ${activeLine.end.toFixed(1)}s` : '0.0s'}
            </span>
            <span className="text-sm font-bold text-white tracking-wide">
              {activeLine ? activeLine.text : '等待播放或切入下一段...'}
            </span>
          </div>

          <div>
            {activeLine?.isInstrumental ? (
              <span className="text-xs px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5" />
                <span>器乐段落 · 伴奏保活 · 画面纯净无文字</span>
              </span>
            ) : (
              <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>对齐置信度: {activeLine ? `${(activeLine.confidence * 100).toFixed(0)}%` : '100%'}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Lyrics Timestamp Editor & Verification Table */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>逐行歌词与时间轴基准表 (LRC + JSON 导出轨)</span>
              <span className="text-[11px] font-normal text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                双轨伴奏铺底全贯通
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              铁律 A：歌词一行不能少，切点强制吸附行尾；间奏必须显式成行保留，伴奏不休止。
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-700 self-start sm:self-auto">
            共 {lyrics.length} 行切片
          </span>
        </div>

        <div className="divide-y divide-slate-700/60">
          {lyrics.map((line) => {
            const isActive = activeLine?.id === line.id;
            return (
              <div
                key={line.id}
                className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  isActive ? 'bg-cyan-950/50 border-l-4 border-l-cyan-500' : 'hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono px-2 py-1 rounded bg-slate-900 text-slate-300 border border-slate-700">
                    [{line.start.toFixed(2)}s - {line.end.toFixed(2)}s]
                  </span>
                  <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${
                    line.isInstrumental
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {line.type}
                  </span>
                  <input
                    type="text"
                    value={line.text}
                    onChange={(e) => handleUpdateText(line.id, e.target.value)}
                    className="bg-transparent border-b border-transparent hover:border-slate-600 focus:border-cyan-500 focus:outline-none text-xs text-slate-100 font-medium px-1 py-0.5 max-w-md w-full sm:w-80"
                  />
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="flex items-center gap-1.5 text-xs">
                    {line.isInstrumental ? (
                      <span className="text-[11px] font-mono text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
                        伴奏保活轨
                      </span>
                    ) : (
                      <>
                        <span className="text-slate-400">对齐置信度:</span>
                        <span className={`font-mono font-semibold ${line.confidence >= 0.95 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {(line.confidence * 100).toFixed(0)}%
                        </span>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setCurrentTime(line.start);
                      setIsPlaying(true);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition"
                    title="定位并播放此段 (伴奏保活)"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
