import React from 'react';
import { Sparkles, ShieldCheck, Film, DollarSign, Clock, Users, UserX, BookOpen, Cpu, ExternalLink, Layers, Wand2, Mic, Settings, LayoutDashboard } from 'lucide-react';
import { ProductionGenre, PRODUCTION_GENRES } from '../data/h3PipelineData';

interface HeaderProps {
  genre: ProductionGenre;
  onSelectGenre: (genre: ProductionGenre) => void;
  hasProtagonist: boolean;
  onToggleProtagonist: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenSpecModal: () => void;
  totalCost: number;
  totalDuration: number;
  gate6Passed: boolean;
  currentMode: 'studio' | 'admin';
  onSelectMode: (mode: 'studio' | 'admin') => void;
}

export const Header: React.FC<HeaderProps> = ({
  genre,
  onSelectGenre,
  hasProtagonist,
  onToggleProtagonist,
  activeTab,
  onSelectTab,
  onOpenSpecModal,
  totalCost,
  totalDuration,
  gate6Passed,
  currentMode,
  onSelectMode
}) => {
  const currentGenreMeta = PRODUCTION_GENRES[genre];

  return (
    <header className="bg-slate-900/95 backdrop-blur border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Bar: Brand, Mode Switcher, Actions */}
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo and Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-wider text-slate-100 font-mono">MiniMax H3</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                  官流终极版 V2.2
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">多图矩阵 · 视频潜空间接力 · 安全脱敏 · 零重影终剪</p>
            </div>
          </div>

          {/* DUAL MODE SWITCHER: Studio Workbench vs Admin Console */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
            <button
              onClick={() => onSelectMode('studio')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentMode === 'studio'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>🎬 制作工作台</span>
            </button>

            <button
              onClick={() => onSelectMode('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentMode === 'admin'
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>⚙️ 后台管理系统</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="hidden xl:flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>时长: {totalDuration.toFixed(1)}s</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>成本: ${totalCost.toFixed(2)}</span>
            </div>
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs ${
              gate6Passed ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{gate6Passed ? '门禁全放行' : '待复核'}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              onClick={onToggleProtagonist}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                hasProtagonist
                  ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                  : 'bg-purple-950/40 text-purple-300 border-purple-500/40 hover:bg-purple-900/40'
              }`}
              title={hasProtagonist ? "当前为【有主角/固定角色模式】" : "当前为【无主角/纯环境氛围模式】"}
            >
              {hasProtagonist ? <Users className="w-3.5 h-3.5 text-cyan-400" /> : <UserX className="w-3.5 h-3.5 text-purple-400" />}
              <span className="hidden sm:inline">{hasProtagonist ? '角色一致锁' : '无主角氛围'}</span>
            </button>

            <a
              href="https://www.runninghub.cn"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-500/30 transition-all"
              title="打开 RunningHub 平台 (www.runninghub.cn)"
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">RunningHub</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            <button
              onClick={onOpenSpecModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-sm transition-all"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>SOP 规范 & 脚本</span>
            </button>
          </div>

        </div>

        {/* Navigation Tabs - Only shown when in Studio mode */}
        {currentMode === 'studio' && (
          <div className="flex items-center gap-1.5 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/80 text-xs">
            {/* Genre selector integrated inline */}
            <div className="flex items-center gap-1 mr-2 pr-2 border-r border-slate-800 shrink-0">
              {(['short_drama', 'mv', 'commercial'] as const).map((g) => {
                const meta = PRODUCTION_GENRES[g];
                const isSelected = genre === g;
                return (
                  <button
                    key={g}
                    onClick={() => onSelectGenre(g)}
                    className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                      isSelected
                        ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{meta.name}</span>
                  </button>
                );
              })}
            </div>

            {[
              { id: 'overview', label: '12步8关全景', icon: Sparkles },
              { id: 'prompt_lab', label: 'H3 提示词工坊与避坑', icon: Wand2, badge: '官方 Ref2VA' },
              { id: 'asset_studio', label: '三工作流资产中台', icon: Layers, badge: '去影棚底' },
              { id: 'audio_studio', label: '音频参考与音色锁', icon: Mic, badge: '音色一致' },
              { id: 'timeline', label: genre === 'mv' ? '歌词时间轴 (关 1)' : genre === 'short_drama' ? '短剧台词节拍表' : '广告分镜节拍', icon: Clock },
              { id: 'storyboard', label: '分镜设计与硬门禁', icon: Film, badge: '硬门禁' },
              { id: 'runninghub', label: 'RunningHub 云端出片', icon: Cpu, badge: 'RH 出片' },
              { id: 'algorithms', label: '17n+5换算与像素审计', icon: ShieldCheck },
              { id: 'ledger', label: '双池与成本台账', icon: DollarSign },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
