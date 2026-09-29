import React, { useState } from 'react';
import { 
  Key, 
  Cpu, 
  DollarSign, 
  Activity, 
  Globe, 
  ShieldCheck, 
  CheckCircle, 
  Save, 
  RefreshCw, 
  ExternalLink, 
  Zap, 
  Coins, 
  Lock, 
  Eye, 
  EyeOff,
  BellRing
} from 'lucide-react';
import { INITIAL_HEALTH } from '../../data/adminConfigData';

export const ApiQuotaManagerTab: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('rh_live_key_999888777666');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [baseUrl, setBaseUrl] = useState<string>('https://www.runninghub.cn');
  const [workflowId, setWorkflowId] = useState<string>('2104734128657756162');
  const [inviteCode, setInviteCode] = useState<string>('rh-v1221');
  const [webhookUrl, setWebhookUrl] = useState<string>('https://api.my-studio.run.app/v1/h3-webhook');
  const [maxConcurrency, setMaxConcurrency] = useState<number>(4);
  const [timeoutSeconds, setTimeoutSeconds] = useState<number>(600);
  const [pingMs, setPingMs] = useState<number>(42);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handlePing = () => {
    setIsPinging(true);
    setTimeout(() => {
      const simulatedPing = Math.floor(35 + Math.random() * 25);
      setPingMs(simulatedPing);
      setIsPinging(false);
      showToast(`RunningHub API 链路连通正常，网络延迟: ${simulatedPing}ms`);
    }, 800);
  };

  const handleSaveConfigs = () => {
    showToast('API 凭据与并发配额参数已成功持久化至系统配置');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-cyan-600/90 text-white text-xs font-medium shadow-xl border border-cyan-400 backdrop-blur flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-300" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Health & Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: API Ping */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 backdrop-blur">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>API 网关连通性</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-100 font-mono">{pingMs}</span>
            <span className="text-xs text-slate-400 font-mono">ms (在线)</span>
          </div>
          <button
            onClick={handlePing}
            disabled={isPinging}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
          >
            <RefreshCw className={`w-3 h-3 ${isPinging ? 'animate-spin' : ''}`} />
            <span>{isPinging ? '测速中...' : '测试连通性'}</span>
          </button>
        </div>

        {/* Card 2: Remaining Coins */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 backdrop-blur">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>RunningHub 币余额</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-300 font-mono">8,650</span>
            <span className="text-xs text-slate-400 font-mono">RH 币</span>
          </div>
          <div className="text-[11px] text-slate-400">
            折合约 <span className="text-emerald-400 font-semibold font-mono">$86.50 USD</span>
          </div>
        </div>

        {/* Card 3: Today's Consumption */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 backdrop-blur">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>今日渲染帧数</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-cyan-300 font-mono">11,664</span>
            <span className="text-xs text-slate-400 font-mono">帧 (48镜头)</span>
          </div>
          <div className="text-[11px] text-slate-400">
            平均每镜头 <span className="text-slate-200 font-mono">243 帧 (10s)</span>
          </div>
        </div>

        {/* Card 4: Official Invite Code */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-indigo-500/40 space-y-2 backdrop-blur">
          <div className="flex items-center justify-between text-xs text-indigo-300">
            <span>官方赠送码 (送1000币)</span>
            <Zap className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-white font-mono">{inviteCode}</span>
          </div>
          <a
            href="https://www.runninghub.cn/post/2104734128657756162/?inviteCode=rh-v1221"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
          >
            <span>直接前往 RH 领取</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* API Configuration Form */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Key className="w-5 h-5 text-cyan-400" />
              <span>RunningHub OpenAPI 与 MiniMax H3 凭据配置</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              配置调度器 `rh_h3.py` 与前端工作流直通 RunningHub 云端出片集群的通讯密钥与路由
            </p>
          </div>

          <button
            onClick={handleSaveConfigs}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>保存配置变更</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* API Key */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>RunningHub API Key (RUNNINGHUB_API_KEY)</span>
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="在此填入 RH 个人中心获取的 API 密钥"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 font-mono focus:outline-none focus:border-cyan-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              在 RunningHub 官网【个人中心】➔【API 密钥管理】中获取
            </p>
          </div>

          {/* Workflow ID */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span>H3 官流终极版 Workflow ID</span>
            </label>
            <input
              type="text"
              value={workflowId}
              onChange={(e) => setWorkflowId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-cyan-300 font-mono font-bold focus:outline-none focus:border-cyan-500"
            />
            <p className="text-[11px] text-slate-500">
              官方权威工作流：<span className="text-slate-400 font-mono">2104734128657756162</span> (支持视频参考与多图矩阵)
            </p>
          </div>

          {/* Base URL */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>RunningHub OpenAPI 端点 (Base URL)</span>
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Webhook Callback */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <BellRing className="w-3.5 h-3.5 text-amber-400" />
              <span>任务渲染完成通知回调 (Webhook URL)</span>
            </label>
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Concurrency Limit */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold">最大并行 GPU 渲染路数</label>
            <select
              value={maxConcurrency}
              onChange={(e) => setMaxConcurrency(parseInt(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value={1}>1 路 (单任务顺序执行，适合低余额测试)</option>
              <option value={2}>2 路 (双任务并行)</option>
              <option value={4}>4 路 (推荐商业出片，快速成剧)</option>
              <option value={8}>8 路 (算力集群企业级并行)</option>
            </select>
          </div>

          {/* Timeout */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold">单分镜推理超时时间 (秒)</label>
            <input
              type="number"
              value={timeoutSeconds}
              onChange={(e) => setTimeoutSeconds(parseInt(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Cost Matrix Info Table */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>RunningHub 计费台账费率基准表</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px]">10 秒短剧分镜 (243帧)</span>
              <div className="text-base font-bold text-slate-100 font-mono">35 RH币 <span className="text-xs font-normal text-slate-400">($0.35)</span></div>
              <span className="text-[10px] text-emerald-400">已含多图矩阵与视频参考运算</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px]">15 秒长分镜 (362帧)</span>
              <div className="text-base font-bold text-slate-100 font-mono">52 RH币 <span className="text-xs font-normal text-slate-400">($0.52)</span></div>
              <span className="text-[10px] text-cyan-400">适合完整对白与复杂武打镜头</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px]">三细节自动抽卡与零重影终剪</span>
              <div className="text-base font-bold text-emerald-300 font-mono">免费 <span className="text-xs font-normal text-slate-400">(0 币)</span></div>
              <span className="text-[10px] text-slate-400">由本地轻量级算法与 FFmpeg 驱动</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
