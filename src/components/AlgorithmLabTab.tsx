import React, { useState } from 'react';
import { computeDurationFit } from '../utils/pipelineValidators';
import { calculateH3Frames } from '../utils/h3PromptEngine';
import { ShieldCheck, Cpu, Sliders, Play, CheckCircle2, XCircle, Activity, BarChart2, Layers, Calculator, Sparkles, AlertCircle } from 'lucide-react';

export const AlgorithmLabTab: React.FC = () => {
  // Mechanism 1 State: Duration Fitting (MV legacy)
  const [targetSeconds, setTargetSeconds] = useState<number>(4.25);
  const [fps, setFps] = useState<number>(24);
  const [rawOverhangPerShot, setRawOverhangPerShot] = useState<number>(0.24);
  const shotCount = 25;

  const fitResult = computeDurationFit(0, targetSeconds, fps);
  const driftWithoutFitting = (rawOverhangPerShot * shotCount).toFixed(2);

  // Mechanism 2 State: Three-Fold Alignment Verification (Gate 8)
  const [simulatedLagMs, setSimulatedLagMs] = useState<number>(18.0);
  const [simulatedCorrelation, setSimulatedCorrelation] = useState<number>(0.89);
  const [simulatedVocalDbfs, setSimulatedVocalDbfs] = useState<number>(-22.5);

  const isLagOk = Math.abs(simulatedLagMs) <= 80.0;
  const isCorrOk = simulatedCorrelation >= 0.78;
  const isEnergyOk = simulatedVocalDbfs >= -36.0;
  const allGate8Passed = isLagOk && isCorrOk && isEnergyOk;

  // Mechanism 3 State: MiniMax H3 17n+5 Frame Calculator
  const [h3InputSeconds, setH3InputSeconds] = useState<number>(15.0);
  const h3Calc = calculateH3Frames(h3InputSeconds);

  // Mechanism 4 State: Non-Visual Pixel-Level Audit Simulator
  const [simulatedGreyPct, setSimulatedGreyPct] = useState<number>(1.2);
  const [simulatedEuclideanDist, setSimulatedEuclideanDist] = useState<number>(8.5);
  const [simulatedSubtitleBand, setSimulatedSubtitleBand] = useState<number>(64); // % height
  const [simulatedFloorBandPct, setSimulatedFloorBandPct] = useState<number>(9.5); // % floor band

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-bold text-xs border border-cyan-500/30">
            工程与数学实验室 · 四大底层机制
          </span>
          <span className="text-xs text-slate-400">解决音画漂移、时长断层、无视觉质检与 H3 帧数对齐</span>
        </div>
        <h2 className="text-xl font-extrabold text-white">自研专有数学模型与像素审计实验室</h2>
        <p className="text-xs text-slate-300 max-w-4xl leading-relaxed">
          涵盖全剧分镜的**「时长向上贴合」**与**「音频包络局部搜索对齐三验」**，
          以及 MiniMax H3 竖版短剧的**「17n+5 帧数精确计算」**与**「无视觉像素级审计 (imgcheck / personcheck / subprobe)」**。
        </p>
      </div>

      {/* Grid: 2 Columns for 4 Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Module 1: MiniMax H3 17n+5 Frame Calculator */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">H3 17n+5 帧数与时长换算器</h3>
                <p className="text-[11px] text-slate-400">H3 生成长度必须是 17n+5 帧</p>
              </div>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
              max(5, round(a*24)) + offset
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1 font-mono">
                <span>输入期望秒数:</span>
                <span className="font-bold text-cyan-400">{h3InputSeconds.toFixed(1)} 秒</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="30.0"
                step="0.5"
                value={h3InputSeconds}
                onChange={(e) => setH3InputSeconds(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="flex gap-2">
              {[5.0, 10.0, 15.0, 20.0].map(s => (
                <button
                  key={s}
                  onClick={() => setH3InputSeconds(s)}
                  className={`px-3 py-1 rounded text-xs font-mono font-bold border transition ${
                    h3InputSeconds === s
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {s}s ({calculateH3Frames(s).frames}f)
                </button>
              ))}
            </div>

            {/* Result Box */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">理论请求帧数:</span>
                <span className="text-emerald-400 font-bold text-base">{h3Calc.frames} 帧 (17 × {Math.floor((h3Calc.frames-5)/17)} + 5)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">实际落地时长 (24fps):</span>
                <span className="text-cyan-300 font-bold">{h3Calc.exactDuration} 秒</span>
              </div>
              <div className="flex justify-between text-xs border-t border-slate-800 pt-2 text-[11px] text-slate-400">
                <span>4 段总时长 (1分钟短剧):</span>
                <span className="text-slate-200">{(h3Calc.exactDuration * 4).toFixed(2)} 秒 ({h3Calc.frames * 4} 帧)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Module 2: Non-Visual Pixel-Level Audit Simulator */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">无视觉像素级审计模拟器</h3>
                <p className="text-[11px] text-slate-400">imgcheck.py & subprobe.py 纯数学验片</p>
              </div>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              纯 Python / 无视觉模型依赖
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {/* Grey% check */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">[imgcheck] 近中性灰占比 (grey%):</span>
                <span className={`font-bold ${simulatedGreyPct < 3.0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {simulatedGreyPct}% {simulatedGreyPct < 3.0 ? '(PASS < 3%)' : '(FAIL 灰底泄漏)'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500">判据：若 &gt;3% 说明 Qwen 文生图的原影棚白/灰底未被图像编辑洗净。</p>
            </div>

            {/* Euclidean distance */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">[imgcheck] 背景区与母本场景卡欧氏距:</span>
                <span className={`font-bold ${simulatedEuclideanDist < 15.0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {simulatedEuclideanDist} {simulatedEuclideanDist < 15.0 ? '(PASS < 15)' : '(WARN 色温漂移)'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500">判据：&lt;15 证明合成卡完整继承了宴会厅母本的环境色温与暗角。</p>
            </div>

            {/* Subtitle band locator */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">[subprobe] 烧入字幕行带探测:</span>
                <span className="text-cyan-400 font-bold">
                  {simulatedSubtitleBand}% 高度行带 (落在 55%~75% 区间)
                </span>
              </div>
              <p className="text-[10px] text-slate-500">实测证明 H3 烧入字幕不贴底沿，而是在中下方浮动，后期可用自定义字幕轨覆盖。</p>
            </div>
          </div>
        </div>

        {/* Module 3: 时长贴合算法 (Duration Fitting - MV Legacy) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">帧网格向上贴合算法 (Duration Fitting)</h3>
                <p className="text-[11px] text-slate-400">彻底消除 25 镜累积 6 秒音画漂移</p>
              </div>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
              ceil(W_k × FPS) + PTS Cut
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1 font-mono">
                <span>分镜理论窗口时长:</span>
                <span className="font-bold text-cyan-400">{targetSeconds.toFixed(2)}s</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="8.0"
                step="0.05"
                value={targetSeconds}
                onChange={(e) => setTargetSeconds(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">向上对齐帧数 (N_k):</span>
                <span className="text-cyan-300 font-bold">{fitResult.gridFrames} 帧</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">请求给后端的时长:</span>
                <span className="text-slate-200">{fitResult.modelRequestSec.toFixed(4)}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">落盘精确截断点 (PTS Cut):</span>
                <span className="text-emerald-400 font-bold">{fitResult.targetSec.toFixed(4)}s</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-1.5 text-[11px] text-emerald-400">
                <span>25镜累积漂移消除率:</span>
                <span>100% (漂移从 {driftWithoutFitting}s 归零)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Module 4: 音频包络对齐三验 (Gate 8 Verification) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">音频包络局部搜索对齐三验</h3>
                <p className="text-[11px] text-slate-400">关 8 核心验收硬门禁</p>
              </div>
            </div>
            <span className={`text-xs font-mono px-2.5 py-1 rounded-lg border ${
              allGate8Passed ? 'bg-emerald-950 text-emerald-300 border-emerald-500/30' : 'bg-red-950 text-red-300 border-red-500/30'
            }`}>
              {allGate8Passed ? '三实验收通过' : '门禁拦截'}
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-slate-400">指标 1: 最优时滞量 |τ|</span>
                <div className="text-[10px] text-slate-500">硬指标: ≤ 80ms</div>
              </div>
              <span className={`font-bold ${isLagOk ? 'text-emerald-400' : 'text-red-400'}`}>
                {simulatedLagMs}ms {isLagOk ? '✓' : '✕ 错位'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-slate-400">指标 2: 波形互相关度 R(τ)</span>
                <div className="text-[10px] text-slate-500">硬指标: ≥ 0.78</div>
              </div>
              <span className={`font-bold ${isCorrOk ? 'text-emerald-400' : 'text-red-400'}`}>
                {simulatedCorrelation} {isCorrOk ? '✓' : '✕ 波形失真'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-slate-400">指标 3: 人声能量判定</span>
                <div className="text-[10px] text-slate-500">硬指标: ≥ -36 dBFS</div>
              </div>
              <span className={`font-bold ${isEnergyOk ? 'text-emerald-400' : 'text-red-400'}`}>
                {simulatedVocalDbfs} dBFS {isEnergyOk ? '✓' : '✕ 静音/底噪'}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
