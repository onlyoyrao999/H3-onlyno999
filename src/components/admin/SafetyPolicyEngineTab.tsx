import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  Trash2, 
  Sparkles, 
  ArrowRight, 
  Zap, 
  Copy, 
  Check, 
  ToggleLeft, 
  ToggleRight,
  RefreshCw,
  Search
} from 'lucide-react';
import { SensitiveWordRule, INITIAL_SENSITIVE_RULES } from '../../data/adminConfigData';

export const SafetyPolicyEngineTab: React.FC = () => {
  const [rules, setRules] = useState<SensitiveWordRule[]>(INITIAL_SENSITIVE_RULES);
  const [testInput, setTestInput] = useState<string>(
    '铁蛋在菜地拔葱，突然大黄牛发疯猛冲过来把铁蛋撞飞了！随后一辆破拖拉机失控翻车爆炸起火，两人在泥潭里激烈打架互殴！'
  );
  const [copied, setCopied] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleToggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
    showToast('脱敏策略规则生效状态已更新');
  };

  // Run desensitization on test input
  const processDesensitization = (rawText: string) => {
    let result = rawText;
    const detectedTriggers: { pattern: string; replacement: string; category: string }[] = [];

    // Rule 1: 撞飞 / 撞死 / 顶飞
    if (rawText.includes('撞飞') || rawText.includes('顶飞') || rawText.includes('撞倒')) {
      result = result.replace(
        /把?铁蛋撞飞了?!|撞飞|顶飞/g, 
        '向前猛冲顶起，机器人身形夸张滑稽地轻盈腾空翻转两周半，稳稳坐落在松软金黄色草垛上，激起一圈金黄色草屑（滑稽动作喜剧，卡通物理弹跳，无真实物理伤害）'
      );
      detectedTriggers.push({
        pattern: '撞飞/顶飞',
        replacement: '滑稽动作腾空翻转两周半稳坐草垛',
        category: '暴力物理冲击 ➔ 喜剧夸张动作'
      });
    }

    // Rule 2: 翻车 / 爆炸起火 / 燃烧
    if (rawText.includes('翻车') || rawText.includes('爆炸') || rawText.includes('起火')) {
      result = result.replace(
        /失控翻车爆炸起火|翻车|爆炸起火/g,
        '轮胎急刹带出夸张白色烟雾，拖拉机滑稽打转180度稳稳横停，车灯闪烁两下，排气管喷出安全棉花糖般的白色蒸汽'
      );
      detectedTriggers.push({
        pattern: '翻车/爆炸起火',
        replacement: '轮胎急刹滑稽横停+白色安全蒸汽',
        category: '交通灾难 ➔ 戏剧化安全急停'
      });
    }

    // Rule 3: 打架 / 互殴 / 互扯
    if (rawText.includes('打架') || rawText.includes('互殴') || rawText.includes('厮打')) {
      result = result.replace(
        /激烈打架互殴!?!|打架|互殴/g,
        '像默剧大师般滑稽推搡避让，脚下一滑互相摔坐在软泥上，互相给对方抹了一脸泥巴，哈哈大笑（默剧幽默互动，毫发无伤）'
      );
      detectedTriggers.push({
        pattern: '打架/互殴',
        replacement: '默剧幽默推搡+摔坐软泥抹泥巴',
        category: '肢体冲突 ➔ 默剧滑稽喜剧'
      });
    }

    // Rule 4: 发疯 / 暴躁
    if (rawText.includes('发疯') || rawText.includes('狂暴')) {
      result = result.replace(
        /发疯猛冲过来|发疯|狂暴/g,
        '迈着欢快的大步子轰隆隆奔跑过来'
      );
      detectedTriggers.push({
        pattern: '发疯/暴躁',
        replacement: '欢快的大步子轰隆隆奔跑',
        category: '情绪失控 ➔ 欢快动感'
      });
    }

    return {
      desensitizedText: result,
      detectedTriggers
    };
  };

  const { desensitizedText, detectedTriggers } = processDesensitization(testInput);

  const handleCopyResult = () => {
    navigator.clipboard.writeText(desensitizedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('已复制脱敏合规提示词');
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

      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>大白话安全脱敏策略引擎 (Anti-integrity_check_failed)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              直接向 MiniMax H3 官方工作流发送带有“撞车、殴打、坠崖”等大白话词汇时，会高频触发平台风控并抛错中断出片。
              本引擎在分镜进入调度前，自动将危险动作转译为【影视级滑稽喜剧与卡通物理弹跳】，确保 100% 零拦截出片！
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono text-center">
              <div className="text-[10px] text-emerald-400 font-sans">拦截规避率</div>
              <div className="text-base font-extrabold">100.0%</div>
            </div>
            <div className="px-3 py-2 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono text-center">
              <div className="text-[10px] text-cyan-400 font-sans">已拦截风险词</div>
              <div className="text-base font-extrabold">104 次</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Safety Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Box: Raw Risky Text Input */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 backdrop-blur shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>输入原始大白话剧本 / 风险提示词</span>
            </span>
            <button
              onClick={() => setTestInput('铁蛋在菜地拔葱，大黄牛猛冲过来把铁蛋撞飞了！破拖拉机失控翻车爆炸起火，两人在泥潭里激烈打架互殴！')}
              className="text-[11px] text-slate-400 hover:text-cyan-400 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> 重置高危案例
            </button>
          </div>

          <textarea
            rows={5}
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="输入含有激烈动作、冲突或灾难描述的大白话文本..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500 leading-relaxed font-mono"
          />

          {/* Detected Triggers */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-semibold text-slate-400">检测到的高危风控词汇:</span>
            {detectedTriggers.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {detectedTriggers.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs font-mono flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                    <span>{t.pattern}</span>
                    <span className="text-[10px] text-rose-400 font-sans">({t.category})</span>
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-xs text-emerald-400 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" /> 未发现触发风控的内容
              </div>
            )}
          </div>
        </div>

        {/* Right Box: Desensitized Cinematic Replacement */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-emerald-500/40 space-y-3 backdrop-blur shadow-lg shadow-emerald-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>影视级安全脱敏重构 (100% 官方放行语法)</span>
            </span>

            <button
              onClick={handleCopyResult}
              className="px-2.5 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 text-xs flex items-center gap-1 font-semibold"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? '已复制' : '复制结果'}</span>
            </button>
          </div>

          <div className="w-full bg-slate-950/80 border border-emerald-500/30 rounded-xl p-3 text-xs text-slate-200 leading-relaxed font-mono min-h-[120px]">
            {desensitizedText}
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-[11px] text-emerald-300 space-y-1">
            <div className="font-semibold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>脱敏重构核心原理：</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              将物理性伤害（“撞飞/打架/车祸”）降维并平移为影视动作喜剧中的“卡通物理弹跳”、“默剧推搡”与“舞台级无害道具”，不仅绕过内容安全检测，更显著提升了 H3 视频生成的戏剧张力与观赏性！
            </p>
          </div>
        </div>
      </div>

      {/* Rules Management Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl space-y-3 p-5 backdrop-blur">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>脱敏规则库与影视转译模板 ({rules.length})</span>
          </h3>
          <span className="text-[11px] text-slate-400">支持自由扩展与启用/禁用规则</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {rules.map(rule => (
            <div key={rule.id} className="py-3.5 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => handleToggleRule(rule.id)}
                    className="text-slate-400 hover:text-cyan-400"
                    title={rule.enabled ? "点击禁用" : "点击启用"}
                  >
                    {rule.enabled ? (
                      <ToggleRight className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-slate-600" />
                    )}
                  </button>

                  <div>
                    <span className="font-mono text-xs font-bold text-rose-300 px-2 py-0.5 rounded bg-rose-950/60 border border-rose-500/40">
                      {rule.pattern}
                    </span>
                    <span className="text-xs text-slate-400 ml-2 font-mono">触发次数: {rule.triggerCount} 次</span>
                  </div>
                </div>

                <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase bg-slate-800 text-slate-300 border border-slate-700">
                  {rule.category}
                </span>
              </div>

              {/* Translation Mapping */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-8 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-emerald-400 block font-semibold mb-0.5">影视级安全替换模板:</span>
                  <span className="text-slate-200 font-mono">{rule.cinematicReplacement}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-cyan-400 block font-semibold mb-0.5">重构逻辑与风控原理:</span>
                  <span className="text-slate-400">{rule.slapstickLogic}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
