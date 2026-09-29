import React, { useState, useEffect, useRef } from 'react';
import { DEMO_LYRICS, LyricLine } from '../data/mockPipelineData';
import { DEMO_DRAMA_SEGMENTS } from '../data/h3PipelineData';
import { ProductionGenre } from '../data/h3PipelineData';
import {
  Play, Pause, RotateCcw, Check, Volume2, VolumeX, ShieldCheck,
  Music, Mic, Radio, Sparkles, Layers, Sliders, MessageSquare, Clock, ArrowRight, UserCheck
} from 'lucide-react';

interface TimelineBeatTabProps {
  genre: ProductionGenre;
}

export const TimelineBeatTab: React.FC<TimelineBeatTabProps> = ({ genre }) => {
  // MV Mode Audio State
  const [lyrics, setLyrics] = useState<LyricLine[]>(DEMO_LYRICS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0.0);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [bgmContinuityMode, setBgmContinuityMode] = useState(true);

  // Drama Mode Segment Selection
  const [selectedDramaSegIndex, setSelectedDramaSegIndex] = useState(1);

  // Web Audio Context & Node Refs for MV Mode
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const bgmOscNodesRef = useRef<OscillatorNode[]>([]);
  const vocalOscRef = useRef<OscillatorNode | null>(null);

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

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.18, ctx.currentTime);
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(750, ctx.currentTime);
      filter.connect(masterGain);

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

  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      startWebAudio();
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const maxDur = genre === 'short_drama' ? 60.33 : 32.0;
          if (prev >= maxDur) {
            setIsPlaying(false);
            stopWebAudio();
            return 0.0;
          }
          return prev + 0.1;
        });
      }, 100);
    } else {
      stopWebAudio();
      if (interval) clearInterval(interval);
    }
    return () => {
      stopWebAudio();
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, isAudioEnabled, genre]);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
      
      {/* Genre-Specific Top Banner */}
      {genre === 'short_drama' ? (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-semibold border border-cyan-500/30">
                短剧时间轴 · 15.083s / 362帧 标准分段
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30">
                每段 3 句发声 + 1 镜无台词反应
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              <span>竖版短剧台词节拍表与说话人 (Sx) 映射 (60.33s 成片)</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-3xl">
              总时长严格遵循 H3 帧数公式 17n+5 (4段 × 362帧 = 1448帧 = 60.33秒)。
              每段前 3 镜分配紧凑对白，第 4 镜强制保留无台词静音反应镜，为段间 0.35s 音频淡接预留安全接缝。
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs text-slate-300">
            <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-500">成片总段数</div>
              <div className="text-sm font-bold text-cyan-400">4 段 (1448 帧)</div>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-500">固定说话人</div>
              <div className="text-sm font-bold text-emerald-400">S1/S2/S3</div>
            </div>
          </div>
        </div>
      ) : genre === 'commercial' ? (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/60 to-slate-900 border border-purple-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-xs font-semibold border border-purple-500/30">
                商业广告节拍轴 · 15.083s 黄金节奏
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-medium border border-amber-500/30">
                Hook → 痛点 → 核心解法 → Slogan
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <span>15秒商业大片节奏节拍分配表 (362 帧)</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-3xl">
              0-3s 极速宏观视觉钩子，3-7s 痛点共鸣与质感，7-12s 产品陀飞轮机构微距，12-15s 品牌权威画外音 Slogan。
            </p>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-semibold border border-cyan-500/30">
                关 1 歌词时间轴与母带对齐
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30">
                全曲伴奏底轨贯穿保活
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Music className="w-5 h-5 text-cyan-400" />
              <span>音乐 MV 官方歌词与时间戳毫秒对齐表 (32.0s 母带)</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-3xl">
              ASR 与官方歌词双向纠偏，歌词行首尾毫秒时间戳死死固化。前奏、间奏、尾奏由伴奏 100% 贯穿流淌，杜绝静音断层。
            </p>
          </div>

          {/* Web Audio Synthesizer Control */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-lg transition-all ${
                isPlaying ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-cyan-600 hover:bg-cyan-500 text-white'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? '暂停伴奏试听' : '播放伴奏与时间轴'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content by Genre */}
      {genre === 'short_drama' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {DEMO_DRAMA_SEGMENTS.map((seg) => {
              const isSelected = selectedDramaSegIndex === seg.segmentIndex;
              return (
                <div
                  key={seg.id}
                  onClick={() => setSelectedDramaSegIndex(seg.segmentIndex)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/60 ring-1 ring-cyan-500/30 shadow-lg'
                      : 'bg-slate-900/50 border-slate-800 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      段落 #{seg.segmentIndex} (15.083s)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 font-mono text-slate-300">
                      {seg.framesCount} 帧
                    </span>
                  </div>

                  <div>
                    <div className="text-[11px] font-bold text-slate-400 font-mono">发声角色:</div>
                    <div className="text-xs font-bold text-slate-200 mt-0.5">{seg.speakerLabel}</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-300 italic">
                    "{seg.dialogueSnippet}"
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>4 镜头组合</span>
                    <span className="text-emerald-400">含 0.35s 接缝</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Segment Detailed Breakdown */}
          {(() => {
            const curSeg = DEMO_DRAMA_SEGMENTS[selectedDramaSegIndex - 1] || DEMO_DRAMA_SEGMENTS[0];
            return (
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">第 {curSeg.segmentIndex} 段四镜时序展开</span>
                    <span className="text-xs font-mono text-cyan-400">({curSeg.shotScale})</span>
                  </div>
                  <span className="text-xs text-emerald-400 font-mono font-semibold">
                    防裁头核验: {curSeg.headCutoffCheck.passed ? '✓ 安全宽景' : '✕ 待整改'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                    <div className="text-[10px] font-mono text-slate-400">[Shot 1] 0.0s - 4.5s (主发声)</div>
                    <div className="text-xs font-bold text-slate-200">宽景双人机位 (全身入画)</div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      &lt;d&gt;[Chinese] "{curSeg.dialogueSnippet}"&lt;/d&gt;
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                    <div className="text-[10px] font-mono text-slate-400">[Shot 2] 4.5s - 8.2s (倾听反应)</div>
                    <div className="text-xs font-bold text-slate-200">中景双人反拍 (4步距离)</div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      面部紧绷微表情，嘴唇完全闭合不说话。
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                    <div className="text-[10px] font-mono text-slate-400">[Shot 3] 8.2s - 12.0s (空间群像)</div>
                    <div className="text-xs font-bold text-slate-200">横向推轨 (两侧餐桌与宾客)</div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      宾客窃窃私语，低音提琴 drone 铺底。
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/20 space-y-1">
                    <div className="text-[10px] font-mono text-emerald-400">[Shot 4] 12.0s - 15.08s (淡接接缝)</div>
                    <div className="text-xs font-bold text-emerald-300">定格全景 (相机绝不靠近)</div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      末段静默 0.35s，预留 ffmpeg afade 淡接空间。
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      ) : genre === 'commercial' ? (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-sm font-bold text-white">CHRONOS PRESTIGE · 曜石陀飞轮 15 秒极速节拍</span>
            <span className="text-xs font-mono text-purple-400">17n+5 = 362 帧</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-mono text-purple-400">0.0s - 3.2s · 视觉 Hook</span>
              <h4 className="text-xs font-bold text-slate-200">陀飞轮擒纵轮微距超高速</h4>
              <p className="text-[11px] text-slate-400">金属刻面冷光掠过，红宝石轴承反光，微秒级精密心跳声。</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-mono text-purple-400">3.2s - 7.5s · 佩戴仪式</span>
              <h4 className="text-xs font-bold text-slate-200">羊绒袖口扣合 deployant 扣</h4>
              <p className="text-[11px] text-slate-400">雨夜落地窗背景虚化，沉稳手部动作，清脆机械咬合声。</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-mono text-purple-400">7.5s - 11.8s · 空间与质感</span>
              <h4 className="text-xs font-bold text-slate-200">高空雨夜豪宅侧身定格</h4>
              <p className="text-[11px] text-slate-400">雨丝划过全景玻璃幕墙，深沉合成器音符下潜。</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-purple-500/30 space-y-1.5">
              <span className="text-[10px] font-mono text-purple-300">11.8s - 15.08s · 品牌 CTA</span>
              <h4 className="text-xs font-bold text-purple-200">手腕翻转面向镜头 + Slogan</h4>
              <p className="text-[11px] text-slate-400">&lt;d&gt;[Chinese] 恒久流转，分秒皆为传奇。&lt;/d&gt;</p>
            </div>
          </div>
        </div>
      ) : (
        /* MV Mode: Traditional Lyric Lines Timeline */
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span>全曲进度: {currentTime.toFixed(1)}s / 32.0s</span>
              <span>{isPlaying ? '伴奏流淌中 (D minor pad)' : '就绪'}</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-100"
                style={{ width: `${(currentTime / 32.0) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-2">
            {lyrics.map((line) => {
              const isCurrent = currentTime >= line.start && currentTime < line.end;
              return (
                <div
                  key={line.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                    isCurrent
                      ? 'bg-cyan-500/10 border-cyan-500/50 shadow-md'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-500 w-16">
                      {line.start.toFixed(1)}s - {line.end.toFixed(1)}s
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold ${
                      line.isInstrumental
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}>
                      {line.type.toUpperCase()}
                    </span>
                    <span className={`text-xs ${isCurrent ? 'font-bold text-white' : 'text-slate-300'}`}>
                      {line.text}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                    <span>置信度: {(line.confidence * 100).toFixed(0)}%</span>
                    {line.isInstrumental && (
                      <span className="text-purple-400">(伴奏铺底 · 强制闭嘴)</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
