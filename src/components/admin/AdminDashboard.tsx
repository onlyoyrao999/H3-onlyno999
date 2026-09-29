import React, { useState } from 'react';
import { 
  Activity, 
  Cpu, 
  Layers, 
  ShieldCheck, 
  Terminal, 
  Key, 
  Coins, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Sparkles, 
  Film, 
  Settings, 
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Zap,
  Sliders,
  Play
} from 'lucide-react';
import { ModelNodeConfigTab } from './ModelNodeConfigTab';
import { TaskQueueMonitorTab } from './TaskQueueMonitorTab';
import { SubjectAssetManagerTab } from './SubjectAssetManagerTab';
import { SafetyPolicyEngineTab } from './SafetyPolicyEngineTab';
import { ApiQuotaManagerTab } from './ApiQuotaManagerTab';
import { GatekeeperAuditTab } from './GatekeeperAuditTab';
import { CliScriptIntegrationTab } from './CliScriptIntegrationTab';
import { CharacterFusionStudioTab } from './CharacterFusionStudioTab';
import { INITIAL_HEALTH } from '../../data/adminConfigData';

interface AdminDashboardProps {
  onSwitchToStudio?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSwitchToStudio }) => {
  const [activeAdminNav, setActiveAdminNav] = useState<
    'overview' | 'character_fusion' | 'topology' | 'queue' | 'assets' | 'safety' | 'api_quota' | 'audit' | 'cli'
  >('character_fusion'); // Direct default to the user requested ImageGen 1:1 fusion studio!

  const [health, setHealth] = useState(INITIAL_HEALTH);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshTelemetry = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setHealth(prev => ({
        ...prev,
        runningHubPingMs: Math.floor(35 + Math.random() * 20),
        totalTasksToday: prev.totalTasksToday + 1
      }));
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Admin Sub-bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 backdrop-blur sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Admin Navigation Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
            {[
              { id: 'character_fusion', label: '1:1角色场景融入 (ImageGen)', icon: Sparkles, badge: '防丢字·终极解法' },
              { id: 'overview', label: '运行总览仪表盘', icon: Activity },
              { id: 'topology', label: '模型与节点拓扑', icon: Layers, badge: 'Node 136' },
              { id: 'queue', label: '渲染任务调度队列', icon: Clock, badge: '实时' },
              { id: 'assets', label: '角色多角度资产库', icon: Users, badge: '三槽位' },
              { id: 'safety', label: '大白话安全脱敏', icon: ShieldCheck, badge: '防拦截' },
              { id: 'api_quota', label: 'API 凭据与配额', icon: Key },
              { id: 'audit', label: '12步8关 SOP 审计', icon: CheckCircle, badge: '100%' },
              { id: 'cli', label: 'CLI 脚本 (rh_h3.py)', icon: Terminal },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeAdminNav === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveAdminNav(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 font-mono">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Switch to Studio / Telemetry Refresh */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={handleRefreshTelemetry}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              title="刷新实时遥测指标"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            {onSwitchToStudio && (
              <button
                onClick={onSwitchToStudio}
                className="px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/40 font-semibold flex items-center gap-1.5"
              >
                <Film className="w-3.5 h-3.5" />
                <span>返回导演制作工作台</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Admin Content Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        {/* 1. OVERVIEW DASHBOARD */}
        {activeAdminNav === 'overview' && (
          <div className="space-y-6">
            {/* Hero Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 backdrop-blur shadow-2xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      MINIMAX H3 OFFICIAL V2.2
                    </span>
                    <span className="text-xs text-slate-400">RunningHub 官流终极版智能管控后台</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-100 mt-2">
                    MiniMax H3 模型全自动化后台管理系统
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                    全面接入 MiniMax H3 官方 Ref2VA / FL2VA 视频参考规范与 RunningHub OpenAPI 调度集群。
                    实现 10秒/15秒标准节拍控制、三角度多细节定妆矩阵抽卡、大白话安全脱敏与多段零重影无缝终剪！
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveAdminNav('queue')}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-600/20 flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>调度监控队列</span>
                  </button>
                  <button
                    onClick={() => setActiveAdminNav('topology')}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5"
                  >
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>节点拓扑映射</span>
                  </button>
                </div>
              </div>
            </div>

            {/* KPI Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1 backdrop-blur">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>H3 推理集群状态</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <div className="text-xl font-black text-slate-100 font-mono">就绪 (Online)</div>
                <div className="text-[11px] text-emerald-400">6 组 GPU Worker 在线</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1 backdrop-blur">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>RH API 连通延迟</span>
                  <Zap className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-xl font-black text-cyan-300 font-mono">{health.runningHubPingMs} ms</div>
                <div className="text-[11px] text-slate-400">网关链路正常</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1 backdrop-blur">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>今日生成总帧数</span>
                  <Film className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-xl font-black text-purple-300 font-mono">{health.totalFramesRendered.toLocaleString()}</div>
                <div className="text-[11px] text-slate-400">48 个镜头全部 17n+5 对齐</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1 backdrop-blur">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>安全脱敏拦截率</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xl font-black text-emerald-300 font-mono">100.0%</div>
                <div className="text-[11px] text-slate-400">0 触发内容风控中断</div>
              </div>
            </div>

            {/* Quick Navigation Cards to Sub-systems */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                onClick={() => setActiveAdminNav('topology')}
                className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer space-y-2 group"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-500/30 group-hover:scale-105 transition-transform">
                  <Layers className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-100 flex items-center justify-between">
                  <span>模型与节点拓扑管理</span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  管理 MiniMax H3 官方基座模型、Node 136 总控、Node 175 跨段接力及多图参考矩阵字段映射。
                </p>
              </div>

              <div 
                onClick={() => setActiveAdminNav('assets')}
                className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer space-y-2 group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center border border-blue-500/30 group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-100 flex items-center justify-between">
                  <span>三角度多细节定妆资产库</span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400" />
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  锁定全身、胸口Emoji与裤套花纹 3 个插槽，支持自动尾帧抽卡接力，彻底根治短剧变脸与服装缺失。
                </p>
              </div>

              <div 
                onClick={() => setActiveAdminNav('safety')}
                className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer space-y-2 group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-100 flex items-center justify-between">
                  <span>大白话安全脱敏引擎</span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  自动将剧本中的危险词（撞车、坠崖、互殴）重构为高动态动作喜剧与卡通物理弹跳，确保 100% 放行。
                </p>
              </div>
            </div>

            {/* Quick Live Queue Preview */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3 backdrop-blur">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>近期渲染流水线动态</span>
                </span>
                <button
                  onClick={() => setActiveAdminNav('queue')}
                  className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>进入完整任务控制台</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">P01 铁蛋菜地拔葱</span>
                    <span className="text-emerald-400 font-mono text-[10px]">已完成 (243f)</span>
                  </div>
                  <p className="text-[11px] text-slate-400">已抽取 3 角度细节图并注入 Node 137/139/167</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">P02 大黄戏耍铁蛋</span>
                    <span className="text-emerald-400 font-mono text-[10px]">已完成 (243f)</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Node 175 载入 P01 成片接力，变脸率 0%</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">P03 铁蛋独轮车狂奔</span>
                    <span className="text-cyan-400 font-mono text-[10px] animate-pulse">渲染中 68%</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Turbo 8-step LoRA 采样加速运行中</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 1.5 CHARACTER 1:1 SCENE FUSION (IMAGEGEN SOLUTION) */}
        {activeAdminNav === 'character_fusion' && <CharacterFusionStudioTab />}

        {/* 2. TOPOLOGY */}
        {activeAdminNav === 'topology' && <ModelNodeConfigTab />}

        {/* 3. TASK QUEUE */}
        {activeAdminNav === 'queue' && <TaskQueueMonitorTab />}

        {/* 4. ASSETS */}
        {activeAdminNav === 'assets' && <SubjectAssetManagerTab />}

        {/* 5. SAFETY */}
        {activeAdminNav === 'safety' && <SafetyPolicyEngineTab />}

        {/* 6. API QUOTA */}
        {activeAdminNav === 'api_quota' && <ApiQuotaManagerTab />}

        {/* 7. AUDIT */}
        {activeAdminNav === 'audit' && <GatekeeperAuditTab />}

        {/* 8. CLI SCRIPTS */}
        {activeAdminNav === 'cli' && <CliScriptIntegrationTab />}
      </div>
    </div>
  );
};
