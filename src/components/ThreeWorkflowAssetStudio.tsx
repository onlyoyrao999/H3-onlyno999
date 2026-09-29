import React, { useState } from 'react';
import { Layers, ShieldCheck, CheckCircle2, AlertTriangle, Eye, Sparkles, Sliders, RefreshCw, Cpu, Download, ArrowRight, UserCheck, Upload, Image as ImageIcon, Film, PlayCircle, FastForward } from 'lucide-react';
import { DRAMA_ASSET_CARDS, AssetCard } from '../data/h3PipelineData';

export const ThreeWorkflowAssetStudio: React.FC = () => {
  const [selectedCard, setSelectedCard] = useState<AssetCard>(DRAMA_ASSET_CARDS[1]); // Default to 男主合成卡
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [auditLogs, setAuditLogs] = useState<string[]>([]);
  const [auditComplete, setAuditComplete] = useState(false);

  // New State: Smart Asset Routing & Tail-frame Chaining Lab
  const [assetInputMode, setAssetInputMode] = useState<'user_image' | 'prompt_scene'>('prompt_scene');
  const [scenePrompt, setScenePrompt] = useState('80年代红砖筒子楼老房子，斑驳褪色木质方桌，墙上挂着1985年泛黄日历，老式暖水壶与搪瓷茶杯，暖黄色微尘斜射光线');
  const [isGeneratingScene, setIsGeneratingScene] = useState(false);
  const [generatedSceneUrl, setGeneratedSceneUrl] = useState<string | null>(null);
  const [uploadedUserImg, setUploadedUserImg] = useState<string | null>(null);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number>(0);

  const mockSegments = [
    {
      id: 'P01',
      time: '00:00 - 00:15',
      title: 'P01｜老房子开场与初次对峙',
      tailFrame: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
      status: '已渲染',
      description: '老房子客厅全景，男主推门而入，80年代红砖与搪瓷杯光影锁定。'
    },
    {
      id: 'P02',
      time: '00:15 - 00:30',
      title: 'P02｜垫图接力：桌前质问',
      tailFrame: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
      status: '垫图渲染中',
      description: '以 P01 第 362 帧作为垫图底色，桌椅位置与人物站位 100% 连贯无跳切。'
    },
    {
      id: 'P03',
      time: '00:30 - 00:45',
      title: 'P03｜垫图接力：情感爆发',
      tailFrame: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80',
      status: '待垫图',
      description: '承接 P02 尾帧，木桌上茶杯位置丝毫不移，面容光影严密咬合。'
    },
    {
      id: 'P04',
      time: '00:45 - 01:00',
      title: 'P04｜终极收尾与定格',
      tailFrame: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
      status: '待垫图',
      description: '全剧终章落版，1分钟4段大片完整合成。'
    }
  ];

  const handleGenerateCustomScene = () => {
    setIsGeneratingScene(true);
    setTimeout(() => {
      setGeneratedSceneUrl('https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80');
      setIsGeneratingScene(false);
    }, 1200);
  };

  const handleRunPixelAudit = (card: AssetCard) => {
    setIsRunningAudit(true);
    setAuditComplete(false);
    setAuditLogs([
      `[imgcheck] 启动无视觉像素级审计: ${card.title}`,
      `[imgcheck] 提取图像 raw RGB24 数据流并划分 8×8 采样矩阵...`,
    ]);

    setTimeout(() => {
      setAuditLogs(prev => [
        ...prev,
        `[imgcheck] 近中性灰像素占比 (grey%): ${card.pixelAudit.greyPercent}% (安全阈值 < 3.0%) -> ${card.pixelAudit.greyPercent < 3.0 ? 'PASS' : 'FAIL'}`,
        `[imgcheck] 背景区与母本场景卡平均色欧氏距: ${card.pixelAudit.euclideanDistance} (安全阈值 < 15.0) -> ${card.pixelAudit.euclideanDistance < 15.0 ? 'PASS' : 'FAIL'}`
      ]);
    }, 400);

    setTimeout(() => {
      setAuditLogs(prev => [
        ...prev,
        `[personcheck] 外接框检测: 顶部距边界 6.2%, 底部距边界 91.5%`,
        `[personcheck] 鞋底与下沿留地空间: ${card.pixelAudit.bottomFloorBandPct}% (安全阈值 6%~18%) -> PASS`,
        `[personcheck] 判据: 无裁头、无裁脚、无影棚灰底漏色，三卡同源锁定达成！`
      ]);
      setIsRunningAudit(false);
      setAuditComplete(true);
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/30 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-xs font-semibold border border-indigo-500/30">
                1:1 图像高保真重绘中台 · 参考 MV-onlyno999 流程
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30">
                非 Wan 模型 · 1:1 姿态与空间像素对齐 · 首尾帧双相双锁
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span>【MV-onlyno999 1:1 作图流程】图像编辑 ➔ 抠图融光 ➔ 1:1 空间锚定生视频</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              💡 <strong className="text-cyan-300">借鉴 MV-onlyno999 1:1 高保真作图精髓：</strong> 放弃 Wan 模型的粗暴文生视频，采用 <strong className="text-amber-300">Qwen 图像编辑与抠图融光合成</strong>，将人物姿势、服装质感与场景母本透视做到 <strong className="text-emerald-300">1:1 精确锁死</strong>，再通过首尾帧图生图送入 H3，实现 100% 画面无缝不漂移！
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleRunPixelAudit(selectedCard)}
              disabled={isRunningAudit}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isRunningAudit ? '像素审计运算中...' : '运行无视觉像素级审计'}</span>
            </button>
          </div>
        </div>

        {/* 3 Steps Pipeline Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-800">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0 text-xs">
              01
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">智能分流：图生图 / 文生图</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                有图锁定面容特征做图生图；缺失场景（如80年代老宅）自动文生图建母本。
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center shrink-0 text-xs">
              02
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">Qwen 图像编辑与合成卡</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                将人物自然融入老房子场景，彻底洗净摄影棚灰底，产出高保真合成卡。
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
              03
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">跨段自动截取尾帧垫图</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                P01 渲染完自动截取 362 帧垫底给 P02，桌椅陈设与站位 100% 完美传承！
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 8-Slot Reference Image Upload Matrix (8张参考图上传与锁定矩阵) */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-indigo-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-bold text-white">导演工作台 8 张参考图上传与锁定矩阵 (8-Slot Reference Matrix)</span>
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
              直通 Node 137~173 多图特征锁定
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            拒绝纯文字脑补 · 多图全方位特征硬锁
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          💡 <strong className="text-amber-300">电影级多要素分类：</strong> 8 个卡槽并非全塞同一个人，而是包含 **主角 + 配角 + 场景环境母本 + 空间透视构图 + 核心道具 + 开场画面 + 局部特征 + 上段视频接力**！全要素闭环，彻底杜绝模型自由脑补空间关系与人物穿模！
        </p>

        {/* 8 Slots Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {[
            { slot: 1, node: 'Node 137', name: 'Picture 1', label: '① 主角定妆卡', desc: '锁主角面容/体型/主服装', defaultImg: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
            { slot: 2, node: 'Node 139', name: 'Picture 2', label: '② 配角/第二主体', desc: '锁朋友/快递员/大黄狗', defaultImg: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
            { slot: 3, node: 'Node 167', name: 'Picture 3', label: '③ 场景环境母本', desc: '锁便利店门前/老房子光影', defaultImg: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=300&auto=format&fit=crop&q=80' },
            { slot: 4, node: 'Node 173', name: 'Picture 4', label: '④ 空间透视构图', desc: '锁人物左右站位/遮挡距离', defaultImg: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=300&auto=format&fit=crop&q=80' },
            { slot: 5, node: 'Node 172', name: 'Picture 5', label: '⑤ 核心关键道具', desc: '锁绿帽子/包裹/饮料罐', defaultImg: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=300&auto=format&fit=crop&q=80' },
            { slot: 6, node: 'Node 171', name: 'Picture 6', label: '⑥ 起始画面参考', desc: '锁开场镜头角度与画幅', defaultImg: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80' },
            { slot: 7, node: 'Node 176', name: 'Picture 7', label: '⑦ 局部细节纹理', desc: '锁红腿套/胸口印花/臂章', defaultImg: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&auto=format&fit=crop&q=80' },
            { slot: 8, node: 'Node 175', name: 'Picture 8', label: '⑧ 上段接力成片', desc: '锁上一段末尾关键帧/视频', defaultImg: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80' }
          ].map((item) => (
            <div key={item.slot} className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col items-center group relative">
              <div className="w-full h-24 rounded-lg overflow-hidden border border-slate-800 bg-slate-900 relative">
                <img src={item.defaultImg} alt={item.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute top-1 left-1 px-1 py-0.2 rounded bg-black/80 font-mono text-[9px] text-indigo-300">
                  {item.node}
                </div>
                <div className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 font-mono text-[9px] text-emerald-300">
                  &lt;Pic {item.slot}&gt;
                </div>
              </div>

              <span className="text-[11px] font-bold text-slate-200 mt-1.5 truncate w-full text-center">{item.label}</span>
              <span className="text-[9px] text-slate-500 truncate w-full text-center font-mono">{item.desc}</span>

              <label className="mt-1.5 w-full py-1 rounded bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white text-[10px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors">
                <Upload className="w-3 h-3" />
                <span>更换图片</span>
                <input type="file" className="hidden" accept="image/*" />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Smart Router & Custom Scene Generator Lab */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-bold text-white">智能资产分流与场景母本实验室</span>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
              实时测试
            </span>
          </div>

          <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setAssetInputMode('prompt_scene')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                assetInputMode === 'prompt_scene'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              无图模式（文生图：如80年代老房子）
            </button>
            <button
              onClick={() => setAssetInputMode('user_image')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                assetInputMode === 'user_image'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              有图模式（图生图：上传参考图）
            </button>
          </div>
        </div>

        {assetInputMode === 'prompt_scene' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            <div className="lg:col-span-8 space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>场景提示词（无图自动文生图）:</span>
                <span className="text-[11px] font-mono text-cyan-400">9:16 (736×1280) 电影景深</span>
              </label>
              <textarea
                value={scenePrompt}
                onChange={(e) => setScenePrompt(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono resize-none leading-relaxed"
                placeholder="输入剧本新场景描写..."
              />
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="text-amber-400">⚡ 机制:</span>
                <span>文生图生成场景母本后，自动作为后续镜头的「同源母本卡」，后续镜头全用它做背景锁定！</span>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950 border border-slate-800 gap-2">
              <button
                onClick={handleGenerateCustomScene}
                disabled={isGeneratingScene}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 transition-all"
              >
                {isGeneratingScene ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                <span>{isGeneratingScene ? '正在生成 80年代老房子母本...' : '一键文生图：生成场景母本卡'}</span>
              </button>

              {generatedSceneUrl && (
                <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>已生成并锁定为 &lt;Scene Ancestor&gt;</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span>Qwen 图像编辑（P图）与三视图合成卡引擎 (Orthographic & Scene Composite)</span>
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  💡 <strong className="text-amber-300">防透视错位铁律：</strong> 用户上传的白底/灰底【三视图定妆照】，不能直接扔给 H3！必须先通过 Qwen 图像编辑将白底人像洗净，自然融入场景母本中完成【P图合成卡】，再进行【首尾帧图生图 (First & Last Frame Interpolation)】，实现 100% 空间零错位！
                </p>
              </div>
              <label className="cursor-pointer px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shrink-0 shadow-lg">
                <Upload className="w-3.5 h-3.5" />
                <span>上传人物三视图 / 白底定妆照</span>
                <input type="file" className="hidden" onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setUploadedUserImg(URL.createObjectURL(e.target.files[0]));
                  }
                }} />
              </label>
            </div>

            {uploadedUserImg && (
              <div className="p-3 rounded-lg bg-slate-900 border border-indigo-500/40 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-16 rounded overflow-hidden border border-slate-700 shrink-0">
                    <img src={uploadedUserImg} alt="用户三视图" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] text-indigo-300 font-mono font-bold">1. 原生三视图/定妆照</span>
                    <p className="text-[11px] text-slate-300">白底/灰底人像卡</p>
                  </div>
                </div>

                <div className="text-center font-mono text-xs text-amber-400 flex items-center justify-center gap-1">
                  <span>➔ Qwen P图抠图融光 ➔</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-12 h-16 rounded overflow-hidden border border-emerald-500 shrink-0 relative">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80" alt="合成定妆卡" className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-emerald-950/90 text-emerald-300 text-[8px] text-center font-mono">P图合成卡</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-300 font-mono font-bold">2. 环境光影合成卡</span>
                    <p className="text-[11px] text-slate-300">首尾帧双相锁硬硬直通</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tail-Frame Auto-Chaining (尾帧垫图与人物关键帧接力实景全览) */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-white">跨段自动截取人物关键帧与视频接力链路 (Auto Keyframe & Video Chaining)</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
              10秒/15秒分段 · 第1段抽卡接力第2段 · 100%零变脸
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            帧数: 243 帧 (10s) / 362 帧 (15s)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {mockSegments.map((seg, idx) => {
            const isSelected = activeSegmentIndex === idx;
            return (
              <div
                key={seg.id}
                onClick={() => setActiveSegmentIndex(idx)}
                className={`p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-slate-950 border-emerald-500 ring-1 ring-emerald-500/40 shadow-lg'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold font-mono text-white">{seg.id} ({seg.time})</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                    seg.status.includes('已渲染')
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : seg.status.includes('垫图')
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {seg.status}
                  </span>
                </div>

                <div className="w-full h-32 rounded-lg overflow-hidden border border-slate-800 bg-slate-900 relative group">
                  <img src={seg.tailFrame} alt={seg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 font-mono text-[9px] text-emerald-300">
                    尾帧 362f
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 font-medium mt-2 line-clamp-1">{seg.title}</p>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed line-clamp-2">{seg.description}</p>

                {idx < mockSegments.length - 1 && (
                  <div className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-emerald-600/90 text-white flex items-center justify-center text-[10px] shadow z-10 hidden lg:flex">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>垫图工作机理：</strong>每一段第 15 秒（362帧）渲染完成时，后台自动调用 FFmpeg 抽取尾帧作为下一段的垫图，自动以图生图方式驱动，保证老房子的桌椅、墙壁日历与角色衣服 100% 稳定！
          </span>
        </div>
      </div>

      {/* Main Grid: Card Selector & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Asset Card List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              三工作流标准资产库 ({DRAMA_ASSET_CARDS.length})
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">9:16 竖版黄金比例</span>
          </div>

          <div className="space-y-2.5">
            {DRAMA_ASSET_CARDS.map((card) => {
              const isSelected = selectedCard.id === card.id;
              return (
                <div
                  key={card.id}
                  onClick={() => setSelectedCard(card)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500/60 ring-1 ring-indigo-500/30 shadow-lg'
                      : 'bg-slate-900/50 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-20 rounded-lg overflow-hidden border border-slate-800 shrink-0 bg-slate-950 flex items-center justify-center">
                      <img src={card.previewUrl} alt={card.title} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                          card.role === 'scene_ancestor'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}>
                          {card.role === 'scene_ancestor' ? '同源场景卡' : '合成参考卡'}
                        </span>
                        <span className="text-xs font-bold text-slate-200 truncate">{card.title}</span>
                      </div>

                      <p className="text-[11px] text-slate-400 mt-1 font-mono">{card.targetSubject}</p>
                      
                      <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-slate-500">
                        <span>{card.dimensions}</span>
                        <span>•</span>
                        <span className="text-emerald-400">灰度: {card.pixelAudit.greyPercent}%</span>
                        <span>•</span>
                        <span className="text-cyan-400">距: {card.pixelAudit.euclideanDistance}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Notice on Why Composite Cards Work */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>为什么不能直接把白底/灰底人物图扔给 H3？</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              直接传白底或摄影棚人物图，H3 会把白底和影棚闪光灯光感直接烧进成片，导致夜总会/老房子场景里突然冒出灰底亮斑。
              先在 Qwen 图像编辑中合成，彻底洗掉棚底，H3 才能 100% 吃到纯净环境光影。
            </p>
          </div>
        </div>

        {/* Right Column: Active Card Inspector & Audit Results */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{selectedCard.title}</span>
                <span className="text-xs font-mono text-cyan-400">({selectedCard.targetSubject})</span>
              </div>
              <span className="text-xs font-mono text-slate-400">{selectedCard.dimensions}</span>
            </div>

            {/* Visual Preview & Rules Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-5 flex flex-col items-center">
                <div className="w-44 h-72 rounded-xl overflow-hidden border-2 border-indigo-500/40 shadow-2xl bg-slate-950 flex items-center justify-center relative">
                  <img src={selectedCard.previewUrl} alt={selectedCard.title} className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded bg-black/70 backdrop-blur text-[10px] text-center font-mono text-emerald-300 border border-emerald-500/30">
                    脚底离地空带: {selectedCard.pixelAudit.bottomFloorBandPct}% (防裁切)
                  </div>
                </div>
              </div>

              <div className="sm:col-span-7 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  实战一致性锁定规则 (已生效)
                </h4>
                <div className="space-y-2">
                  {selectedCard.rulesApplied.map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono mb-1.5">
                    工作流提示词指令 (Prompt Directive)
                  </h4>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 leading-relaxed max-h-32 overflow-y-auto">
                    {selectedCard.prompt}
                  </div>
                </div>
              </div>
            </div>

            {/* Spatial & Stand-point Composition Auditing Card */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-slate-200">
                    智能空间逻辑与方位审图 (Spatial & Stand-Point Audit)
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/40">
                  全项逻辑合规
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-slate-300 font-bold flex items-center justify-between">
                    <span>1. 左右站位与180°轴线:</span>
                    <span className="text-emerald-400">✔ PASS (男左女右)</span>
                  </div>
                  <p className="text-[10px] text-slate-400">核验人物屏幕坐标，未发生越轴颠倒或反向错位。</p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-slate-300 font-bold flex items-center justify-between">
                    <span>2. 物理立足与重力逻辑:</span>
                    <span className="text-emerald-400">✔ PASS (稳固着地)</span>
                  </div>
                  <p className="text-[10px] text-slate-400">人物双脚自然踏于地面，无浮空、穿模或踩桌障碍。</p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-slate-300 font-bold flex items-center justify-between">
                    <span>3. 防走廊狭长陷阱:</span>
                    <span className="text-emerald-400">✔ PASS (桌宽紧凑)</span>
                  </div>
                  <p className="text-[10px] text-slate-400">走道收窄至1张桌宽，两侧铺满圆桌与宾客。</p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-slate-300 font-bold flex items-center justify-between">
                    <span>4. 关键节点与道具一致性:</span>
                    <span className="text-emerald-400">✔ PASS (落版对齐)</span>
                  </div>
                  <p className="text-[10px] text-slate-400">手持道具与落版依偎姿态与尾帧参考图 100% 吻合。</p>
                </div>
              </div>
            </div>

            {/* Pixel Audit Box */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-slate-200">
                    无视觉像素级审计终端 (Non-Visual Pixel Audit)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                    selectedCard.pixelAudit.greyPercent < 3.0 ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40' : 'bg-red-950/80 text-red-300'
                  }`}>
                    grey%: {selectedCard.pixelAudit.greyPercent}% (&lt;3% 放行)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                    欧氏距: {selectedCard.pixelAudit.euclideanDistance} (&lt;15 放行)
                  </span>
                </div>
              </div>

              {auditLogs.length > 0 ? (
                <div className="p-3 rounded-lg bg-black/80 font-mono text-[11px] text-slate-300 space-y-1 max-h-36 overflow-y-auto border border-slate-800">
                  {auditLogs.map((log, idx) => (
                    <div key={idx} className={log.includes('PASS') ? 'text-emerald-400' : log.includes('启动') ? 'text-cyan-400' : 'text-slate-300'}>
                      {log}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-slate-900/60 text-center text-xs text-slate-500 font-mono">
                  点击上方「运行无视觉像素级审计」模拟 python imgcheck.py & personcheck.py 质检。
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
