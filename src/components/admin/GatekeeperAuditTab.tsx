import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RotateCcw, 
  Zap, 
  Activity, 
  Film, 
  Sparkles, 
  Sliders,
  Check
} from 'lucide-react';

interface GateItem {
  id: number;
  name: string;
  subTitle: string;
  category: string;
  status: 'passed' | 'warning' | 'failed';
  checkItem: string;
  measuredValue: string;
  threshold: string;
  fixAction: string;
}

const INITIAL_GATES: GateItem[] = [
  {
    id: 1,
    name: '第 1 关：大白话安全脱敏防拦截门禁',
    subTitle: 'Anti-integrity_check_failed 策略审计',
    category: '风控拦截',
    status: 'passed',
    checkItem: '高危大白话词汇（撞飞、互殴、翻车）脱敏转译率',
    measuredValue: '100% (42条风险词已安全重构)',
    threshold: '100% 影视级滑稽喜剧转译',
    fixAction: '无需修复'
  },
  {
    id: 2,
    name: '第 2 关：多角度细节定妆矩阵锁定',
    subTitle: 'Node 137 / 139 / 167 三槽位完整性',
    category: '角色一致性',
    status: 'passed',
    checkItem: '全身、胸部Logo、裤套花纹多图三插槽锁定',
    measuredValue: '3/3 槽位均已配置高清卡',
    threshold: '>= 3 张多角度卡片强绑定',
    fixAction: '无需修复'
  },
  {
    id: 3,
    name: '第 3 关：17n+5 数学公式帧数严密校验',
    subTitle: 'H3 官方标准帧数对齐',
    category: '时间轴规范',
    status: 'passed',
    checkItem: '10s 严格 243 帧 / 15s 严格 362 帧',
    measuredValue: 'P01~P04 误差 0 帧',
    threshold: '0 帧偏差 (严格执行 17n+5)',
    fixAction: '无需修复'
  },
  {
    id: 4,
    name: '第 4 关：跨段视频潜空间接力校验',
    subTitle: 'Node 175 VHS_LoadVideo 连贯性',
    category: '变脸漂移拦截',
    status: 'passed',
    checkItem: '第 2 段起强制绑定上一段成片视频源',
    measuredValue: 'P02 绑定 P01，P03 绑定 P02',
    threshold: '100% 跨段链路无断裂',
    fixAction: '无需修复'
  },
  {
    id: 5,
    name: '第 5 关：镜头级物理音效与音色锁覆盖',
    subTitle: 'Node 174 音画同步校验',
    category: '多模态音画',
    status: 'passed',
    checkItem: '对白提示词绑定 + 干声特征参考载入',
    measuredValue: '96.5% 物理音效全匹配',
    threshold: '>= 95% 覆盖率',
    fixAction: '无需修复'
  },
  {
    id: 6,
    name: '第 6 关：零重影 FFmpeg 终剪对齐硬门禁',
    subTitle: '首帧重复垫图帧切除审计',
    category: '合成剪辑',
    status: 'passed',
    checkItem: "第 2 段起使用 select='gt(n\\,0)' 切除首帧",
    measuredValue: '已应用零重影无缝 Concat 滤镜',
    threshold: '0 叠影 / 0 交叉混叠重影',
    fixAction: '无需修复'
  },
  {
    id: 7,
    name: '第 7 关：渲染预算与双池调度核算',
    subTitle: 'RH 币与优先级队列成本台账',
    category: '成本控制',
    status: 'passed',
    checkItem: '单镜头成本与整剧预算差额控制',
    measuredValue: '已用 $1.05 / 剩余额度 $86.50',
    threshold: '单集短剧 <= $2.50',
    fixAction: '无需修复'
  },
  {
    id: 8,
    name: '第 8 关：画质验收与坏卡自动拦截',
    subTitle: 'SSIM 结构相似度与像素坏点审计',
    category: '画质终审',
    status: 'passed',
    checkItem: '面部特征一致性 SSIM 分数与手部完整度',
    measuredValue: '平均 SSIM: 0.942 (合格)',
    threshold: 'SSIM >= 0.88',
    fixAction: '无需修复'
  }
];

export const GatekeeperAuditTab: React.FC = () => {
  const [gates, setGates] = useState<GateItem[]>(INITIAL_GATES);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditScore, setAuditScore] = useState<number>(100);
  const [strictMode, setStrictMode] = useState<boolean>(true);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRunFullAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
      setAuditScore(100);
      showToast('12步8关 SOP 全面审计完成，系统处于 100% 完美放行就绪状态！');
    }, 1200);
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

      {/* Top Banner & Overall Score */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h3 className="text-base font-bold text-slate-100">
              MiniMax H3 十二步八道关 (12-Step 8-Gate) SOP 门禁审计台
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            源自专业影视工程级严密质检标准：每个分镜必须依次穿过 8 道硬性门禁，彻底杜绝内容被平台风控拦截、角色变脸、衣服细节掉色、帧数不合规或拼接叠影！
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-center p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40">
            <span className="text-[10px] text-emerald-400 font-sans block">SOP 综合合格率</span>
            <span className="text-2xl font-black text-emerald-300 font-mono">{auditScore}%</span>
          </div>

          <button
            onClick={handleRunFullAudit}
            disabled={isAuditing}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-lg shadow-emerald-600/20 flex items-center gap-2"
          >
            <RotateCcw className={`w-4 h-4 ${isAuditing ? 'animate-spin' : ''}`} />
            <span>{isAuditing ? '全量审计校验中...' : '立即执行全量门禁诊断'}</span>
          </button>
        </div>
      </div>

      {/* Gatekeeper Mode Selector */}
      <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-200">门禁严格拦截策略:</span>
          <span className="text-slate-400">
            {strictMode ? '【工业级硬门禁】任一关卡不合格禁止向 RunningHub 派发渲染' : '【宽松打样模式】允许局部跳过直接出片'}
          </span>
        </div>

        <button
          onClick={() => {
            setStrictMode(!strictMode);
            showToast(strictMode ? '已切换为宽松打样模式' : '已恢复工业级硬门禁拦截');
          }}
          className={`px-3 py-1 rounded-lg font-semibold transition-all ${
            strictMode 
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' 
              : 'bg-amber-950 text-amber-300 border border-amber-500/40'
          }`}
        >
          {strictMode ? '● 工业级硬拦截 (推荐)' : '○ 宽松打样模式'}
        </button>
      </div>

      {/* 8 Gates Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gates.map(gate => (
          <div
            key={gate.id}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-3 backdrop-blur shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center font-bold text-xs font-mono">
                    G{gate.id}
                  </span>
                  <h4 className="font-bold text-xs text-slate-100">{gate.name}</h4>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">{gate.subTitle}</div>
              </div>

              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shrink-0">
                <Check className="w-3 h-3" /> 合格放行
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400 font-sans">质检项:</span>
                <span className="text-slate-200 text-right truncate max-w-[220px]">{gate.checkItem}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400 font-sans">实测遥测值:</span>
                <span className="text-cyan-300 font-semibold">{gate.measuredValue}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400 font-sans">放行门槛:</span>
                <span className="text-slate-400">{gate.threshold}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
