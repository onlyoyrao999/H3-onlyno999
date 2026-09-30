import React, { useState } from 'react';
import { DEMO_DRAMA_SEGMENTS, ProductionGenre } from '../data/h3PipelineData';
import {
  ShieldCheck, MessageSquare, Clock, ArrowRight, Swords, Zap, Shield, Crosshair,
  Volume2, CheckCircle2, Film, Sparkles
} from 'lucide-react';

interface TimelineBeatTabProps {
  genre: ProductionGenre;
}

export const TimelineBeatTab: React.FC<TimelineBeatTabProps> = ({ genre }) => {
  // Drama Mode Segment Selection
  const [selectedDramaSegIndex, setSelectedDramaSegIndex] = useState(1);
  const [selectedFightBeat, setSelectedFightBeat] = useState<number>(1);

  const fightBeats = [
    {
      id: 1,
      range: '0.0s - 1.5s',
      phase: '阶段一：蓄力起手与动势建立',
      action: '少侠听风辨位，腰马合一猛然拧转半圈，手中镔铁长枪化作一道旋转银盘；脚底踏碎积水。',
      contact: '发力锚点：右腕与腰胯发力，枪尖破风形成弧形防御面',
      dialogue: '闭口发力，鼻腔轻微沉闷吐气声，无任何废话对白',
      foley: '狂风撕扯竹林声、长枪撕裂空气呜咽声、踏水爆裂声',
      antiFusion: '长枪几何刚体锁定，不弯折软化，双脚牢固抓地不悬浮'
    },
    {
      id: 2,
      range: '1.5s - 2.8s',
      phase: '阶段二：接触碰撞与金石火花爆裂',
      action: '枪尖在身侧一米处精准磕中三枚飞刀，清脆金铁相交连发三次，火星在暴雨中连环爆开！',
      contact: '接触受力点：枪尖合金碰撞柳叶飞刀刃脊，爆出三团刺目金石火星',
      dialogue: '<d>[中文] 现身！</d> (短促低喝，嘴唇仅动半秒后迅速闭合)',
      foley: '金石剧烈相撞清脆高频尖啸 (Metallic Zing)、短促暴喝；无背景音乐',
      antiFusion: '飞刀与枪尖受力反弹轨迹清晰，二人站位分立不融合'
    },
    {
      id: 3,
      range: '2.8s - 4.5s',
      phase: '阶段三：破空穿透与惯性滑退阻尼',
      action: '借转身之势单手扣住枪尾，枪尖带风直刺前方竹丛阴影，枪尖破竹炸裂，穿透毛竹！',
      contact: '物理反馈：枪尖穿透竹竿，木质纤维向外炸裂，碎屑飞溅',
      dialogue: '紧咬牙关，无任何对白',
      foley: '毛竹爆裂轰响、雨水砸在枪杆红缨声、沉重落地脚步声',
      antiFusion: '竹竿折断截面物理真实，枪杆恢复平直刚体'
    },
    {
      id: 4,
      range: '4.5s - 7.0s',
      phase: '阶段四：变招反攻与下一动抉择定格',
      action: '刺客自折断竹梢飞扑交叉斩落双刀，少侠长枪横架硬抗，双足在泥水向后滑退三尺定格对峙！',
      contact: '受力阻尼：双足在泥地上犁出两条深沟，刀枪碰撞点火花四溅',
      dialogue: '<d>[中文] 破！</d> (二人四目对视，绝无长篇废话)',
      foley: '金属剧烈刮擦声、双足犁地泥水摩擦沉闷声；现场纯拟音',
      antiFusion: '二人四肢骨骼稳定，面部冷酷微表情稳定无畸变'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
      
      {/* Genre-Specific Top Banner */}
      {genre === 'wuxia_fight' ? (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-red-950/30 to-slate-900 border border-amber-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-semibold border border-amber-500/30">
                Fight FX Anchor 时序节拍器
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 text-xs font-medium border border-red-500/30">
                三段力学时序 + 防乱说话短喝门禁
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Swords className="w-5 h-5 text-amber-400" />
              <span>动作打斗戏·特效锚点分镜节拍表 (Fight FX Anchor Beat Sheet)</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-3xl">
              动作戏的核心在于发力、碰撞与阻尼时序。打斗高压状态下，台词严格限制为短促战吼（≤6字短喝），
              音效彻底排除背景音乐与闲杂人声，防止模型说话失控与口型崩坏。
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs text-slate-300">
            <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-slate-500 text-[10px]">单招时序</div>
              <div className="font-bold text-amber-300 text-sm">3.0s~5.0s</div>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-slate-500 text-[10px]">防乱说话</div>
              <div className="font-bold text-emerald-300 text-sm">≤6字短喝</div>
            </div>
          </div>
        </div>
      ) : genre === 'short_drama' ? (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-semibold border border-cyan-500/30">
                短剧时间轴 · 15.083s / 362帧 标准分段
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30">
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
              <div className="text-slate-500 text-[10px]">成片总长</div>
              <div className="font-bold text-cyan-300 text-sm">60.33s</div>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-slate-500 text-[10px]">总帧数</div>
              <div className="font-bold text-indigo-300 text-sm">1448 帧</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-black border border-purple-500/30 shadow-xl flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-xs font-semibold border border-purple-500/30">
              商业广告 · 15.083s / 362 帧
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">商业广告高能分镜节拍表</h2>
            <p className="text-xs text-slate-400">视觉 Hook ➔ 佩戴体验 ➔ 空间质感 ➔ 品牌 CTA Slogan 快速转换。</p>
          </div>
        </div>
      )}

      {/* Main Content by Genre */}
      {genre === 'wuxia_fight' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {fightBeats.map((beat) => {
              const isSelected = selectedFightBeat === beat.id;
              return (
                <div
                  key={beat.id}
                  onClick={() => setSelectedFightBeat(beat.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'bg-amber-950/30 border-amber-500/60 ring-1 ring-amber-500/40 shadow-lg'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-400">{beat.range}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-black/40 text-amber-200 border border-amber-500/30 font-mono">
                      招式 #{beat.id}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white truncate">{beat.phase}</div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{beat.action}</p>
                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span className="text-emerald-400">物理锚点已锁定</span>
                    <span>查看详情 ➔</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Beat Inspector */}
          {(() => {
            const beat = fightBeats[selectedFightBeat - 1] || fightBeats[0];
            return (
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{beat.phase}</span>
                    <span className="text-xs font-mono text-amber-400">({beat.range})</span>
                  </div>
                  <span className="text-xs text-emerald-400 font-mono font-semibold">
                    ✓ 特效锚点三段时序满足
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-slate-400 font-mono text-[10px]">动作与动势</div>
                    <div className="text-slate-200 font-medium">{beat.action}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-slate-400 font-mono text-[10px]">空间接触面 (Contact Anchor)</div>
                    <div className="text-amber-300 font-medium">{beat.contact}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-slate-400 font-mono text-[10px]">防乱说话对白约束</div>
                    <div className="text-emerald-300 font-medium">{beat.dialogue}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-slate-400 font-mono text-[10px]">现场物理拟音 (Foley)</div>
                    <div className="text-purple-300 font-medium">{beat.foley}</div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      ) : genre === 'short_drama' ? (
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
                    <div className="text-[10px] font-mono text-slate-400">[Shot 3] 8.2s - 11.5s (对手回敬)</div>
                    <div className="text-xs font-bold text-slate-200">中景侧面单人 (防穿模)</div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      反派角色冷声接话，声音低沉发闷。
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                    <div className="text-[10px] font-mono text-slate-400">[Shot 4] 11.5s - 15.083s (收束定格)</div>
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
      ) : (
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
      )}

    </div>
  );
};
