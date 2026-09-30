import React, { useState } from 'react';
import { GATES_DATA, SIX_IRON_RULES_LIST, GateDefinition } from '../data/mockPipelineData';
import { PRODUCTION_GENRES } from '../data/h3PipelineData';
import { ShieldAlert, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, ExternalLink, Cpu, Sparkles, Layers, Wand2, Film } from 'lucide-react';

interface PipelineOverviewTabProps {
  onJumpToTab: (tabId: string) => void;
}

export const PipelineOverviewTab: React.FC<PipelineOverviewTabProps> = ({ onJumpToTab }) => {
  const [selectedGate, setSelectedGate] = useState<GateDefinition>(GATES_DATA[4]); // Default to Gate 5 (Prompt hard gate)

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6 px-4">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-700/80 p-6 md:p-8 shadow-2xl">
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SOP 标准作业程序 · 严密工程流程 × H3 官方规范 × 影视短剧/动作打斗/广告</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            全自动视频生成平台与实战工作台 <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-300">H3-AUTO-PIPELINE V2.2</span>
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            AI 做视频最容易翻车的从来不是画面不够炫，而是<strong className="text-amber-300">「嘴和音对不上」</strong>、<strong className="text-amber-300">「近景对白裁头」</strong>、
            <strong className="text-amber-300">「反向文字词越写越烧字幕」</strong>与<strong className="text-amber-300">「跨段换嗓子与空间漂移」</strong>。
            本流水线确立<strong>首发九宫格空间图锁定、新道具多宫格入库、第 1 段干声提取与无限跨段调取</strong>，
            统一采用 <strong>MiniMax-H3 官方 Ref2VA 规范</strong>与<strong>三卡同源合成中台</strong>，直通 <strong>RunningHub 云端出片</strong>。
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => onJumpToTab('prompt_lab')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
            >
              <Wand2 className="w-4 h-4" />
              <span>H3 官方提示词工坊 (避坑转换)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onJumpToTab('asset_studio')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
            >
              <Layers className="w-4 h-4" />
              <span>三工作流资产中台 (去影棚底)</span>
            </button>

            <button
              onClick={() => onJumpToTab('runninghub')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>RunningHub 云端出片 & FFmpeg 拼片</span>
            </button>
          </div>
        </div>

        {/* Decorative Grid Pattern */}
        <div className="absolute right-0 top-0 w-96 h-full opacity-10 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      {/* Three Production Genre Tracks Card Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Film className="w-5 h-5 text-indigo-400" />
              <span>三大题材生产模式：一套工程纪律，多维内容扩展</span>
            </h2>
            <p className="text-xs text-slate-400">顶部可直接一键切换不同题材形态的时间轴、分镜表与参数体系</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.values(PRODUCTION_GENRES).map((genre) => (
            <div
              key={genre.id}
              className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 hover:border-cyan-500/40 transition-all space-y-2 shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{genre.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                    {genre.badge}
                  </span>
                </div>
                <div className="text-xs text-cyan-400 font-medium">{genre.tagline}</div>
                <p className="text-xs text-slate-400 leading-relaxed">{genre.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-500 space-y-1">
                <div>时长规格: <span className="text-slate-300">{genre.defaultDuration}s ({genre.segmentCount}段)</span></div>
                <div>关键机制: <span className="text-emerald-400">{genre.keyFeature}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Six Iron Rules Bar */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>六条不可动摇铁律：它凭什么对得上、不翻车</span>
            </h2>
            <p className="text-xs text-slate-400">流水线底层代码严格强制执行的铁则，除非用户明确要求修改，否则不可逾越</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SIX_IRON_RULES_LIST.map(rule => (
            <div
              key={rule.code}
              className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4 hover:border-cyan-500/50 transition-all shadow-sm"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <span className="w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center border border-cyan-500/30">
                  {rule.code}
                </span>
                <h3 className="text-sm font-semibold text-slate-100">{rule.title}</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">{rule.rule}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Eight HTML Gates Pipeline Architecture */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <span>八道审核关卡全链架构 (8 Gates Matrix)</span>
            </h2>
            <p className="text-xs text-slate-400">全部步骤落成可视化页面，逐段可看可改。第 5、6 关为前置硬门禁，未全绿一段视频都不会提交。</p>
          </div>
        </div>

        {/* Gates Progress Tracker */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-6">
          {GATES_DATA.map((gate) => {
            const isSelected = selectedGate.id === gate.id;
            return (
              <button
                key={gate.id}
                onClick={() => setSelectedGate(gate)}
                className={`p-3 rounded-xl text-left border transition-all relative ${
                  isSelected
                    ? 'bg-cyan-950/50 border-cyan-500 text-white shadow-md shadow-cyan-500/10'
                    : 'bg-slate-800/50 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                {gate.isHardBarrier && (
                  <span className="absolute -top-2 -right-1 px-1.5 py-0.2 rounded bg-red-500 text-white text-[9px] font-bold shadow">
                    硬门禁
                  </span>
                )}
                <div className="text-[10px] text-slate-400 font-mono">STEP {gate.stepIndex}</div>
                <div className="text-xs font-bold mt-1 line-clamp-1">{gate.shortName}</div>
                <div className="text-[10px] text-cyan-400/80 mt-1">{gate.phase}</div>
              </button>
            );
          })}
        </div>

        {/* Selected Gate Deep-Dive Inspector */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold font-mono">
                  GATE {selectedGate.id} · {selectedGate.phase}
                </span>
                {selectedGate.isHardBarrier && (
                  <span className="px-2.5 py-1 rounded-md bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>核心硬门禁 (未过关严禁提交算力)</span>
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-white mt-2">{selectedGate.name}</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">{selectedGate.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 font-mono">
                模式: {selectedGate.reviewMode}
              </span>
            </div>
          </div>

          <div className="mt-5">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              核心执行指标与机器自检项 (Machine Checklist)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {selectedGate.keyChecks.map((check, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/60 text-xs text-slate-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{check}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
