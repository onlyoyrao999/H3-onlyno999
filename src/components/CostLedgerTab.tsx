import React, { useState } from 'react';
import { StoryboardShot } from '../data/mockPipelineData';
import { DollarSign, Cpu, Clock, CheckCircle2, RotateCw, AlertOctagon, ShieldCheck, Zap } from 'lucide-react';

interface CostLedgerTabProps {
  storyboard: StoryboardShot[];
  onRerollShot: (shotId: string) => void;
}

export const CostLedgerTab: React.FC<CostLedgerTabProps> = ({ storyboard, onRerollShot }) => {
  const [budgetCap, setBudgetCap] = useState<number>(25.0);
  const [autoFallback, setAutoFallback] = useState<boolean>(true);
  const [dualPoolEnabled, setDualPoolEnabled] = useState<boolean>(true);

  const totalCost = storyboard.reduce((acc, s) => acc + s.costUsd, 0);
  const totalDuration = storyboard.reduce((acc, s) => acc + s.duration, 0);
  const totalRenderSec = storyboard.length * 28.4; // simulated generation time
  const remainingBudget = Math.max(0, budgetCap - totalCost);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
      {/* Top Banner with 3 KPI Big Numbers */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs border border-emerald-500/30">
                双池调度与成本台账 (Gate 7/8 台账)
              </span>
              <span className="text-xs text-slate-400">总览页最上方三项指标：成片秒数、机器跑时、已花费用</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">钱花在哪查得到 · 逐段留痕审计</h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">预算上限: ${budgetCap.toFixed(2)} USD</span>
          </div>
        </div>

        {/* 3 Main Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>成片总时长 (Total Length)</span>
            </div>
            <div className="text-2xl font-black text-white font-mono mt-2">
              {totalDuration.toFixed(1)} 秒
            </div>
            <div className="text-[11px] text-slate-400 mt-1">各段严格贴合帧网格</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>机器总运行耗时 (Wall Clock)</span>
            </div>
            <div className="text-2xl font-black text-indigo-300 font-mono mt-2">
              {Math.floor(totalRenderSec / 60)}分 {Math.floor(totalRenderSec % 60)}秒
            </div>
            <div className="text-[11px] text-slate-400 mt-1">多路并发与断点续跑承接</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>算力总消费 (Billed Cost)</span>
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-2">
              ${totalCost.toFixed(2)} / ${budgetCap.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">剩余可用额度: ${remainingBudget.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Triple Switch Controls (Iron Rule D) */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>铁律 D：三个独立开关，互不推定</span>
            </h3>
            <p className="text-xs text-slate-400">给你 key 不等于同意花钱，真钱封顶与账号降级严格解耦控制</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-200">双池并行调度 (Dual Pool)</div>
              <div className="text-[11px] text-slate-400 mt-0.5">普通镜走免费池，重抽走优先付费池</div>
            </div>
            <input
              type="checkbox"
              checked={dualPoolEnabled}
              onChange={(e) => setDualPoolEnabled(e.target.checked)}
              className="w-4 h-4 accent-cyan-400 cursor-pointer"
            />
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-200">账号自动降级 (Fallback)</div>
              <div className="text-[11px] text-slate-400 mt-0.5">当优先池网络偶发故障自动降至备用节点</div>
            </div>
            <input
              type="checkbox"
              checked={autoFallback}
              onChange={(e) => setAutoFallback(e.target.checked)}
              className="w-4 h-4 accent-cyan-400 cursor-pointer"
            />
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-200">真钱硬封顶 (Budget Cap)</div>
              <div className="text-[11px] text-slate-400 mt-0.5">消费达到 ${budgetCap} 立即挂起，严禁超支</div>
            </div>
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Shot-by-Shot Ledger Table */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">逐镜算力成本台账 (Shot-by-Shot Ledger)</h3>
          <span className="text-xs font-mono text-slate-400">零依赖解耦，支持单段重抽</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-700 uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">镜头编号</th>
                <th className="px-4 py-3">景别 & 口型</th>
                <th className="px-4 py-3">窗口秒数</th>
                <th className="px-4 py-3">调度算力池</th>
                <th className="px-4 py-3">单镜消耗</th>
                <th className="px-4 py-3">生成状态</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 text-slate-200">
              {storyboard.map((shot) => (
                <tr key={shot.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-4 py-3 font-bold text-cyan-400">
                    #{shot.index.toString().padStart(2, '0')}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 mr-2">
                      {shot.shotScale}
                    </span>
                    {shot.isLipSync ? (
                      <span className="text-emerald-400 font-sans font-semibold text-[11px]">口型对齐</span>
                    ) : (
                      <span className="text-slate-400 font-sans text-[11px]">空镜/静音</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {shot.duration.toFixed(2)}s [{shot.start.toFixed(1)}s - {shot.end.toFixed(1)}s]
                  </td>
                  <td className="px-4 py-3">
                    {shot.pool === 'priority_paid' ? (
                      <div>
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                          RunningHub 优先池
                        </span>
                        <div className="text-[9px] text-slate-500 mt-0.5 font-mono">ID: 2100506281638457345</div>
                      </div>
                    ) : (
                      <div>
                        <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-300 text-[10px]">
                          RunningHub 社区池
                        </span>
                        <div className="text-[9px] text-slate-500 mt-0.5 font-mono">Minimax H3 Turbo</div>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-bold text-emerald-400">
                    ${shot.costUsd.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>已落盘</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onRerollShot(shot.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 transition text-[11px]"
                      title="独立重抽本镜头，各段零依赖，不影响其余片段"
                    >
                      <RotateCw className="w-3 h-3" />
                      <span>重抽卡</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
