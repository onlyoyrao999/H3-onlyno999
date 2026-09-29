import React, { useState } from 'react';
import { 
  Cpu, 
  Layers, 
  Settings, 
  FileCode, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  RefreshCw, 
  ArrowRight, 
  Video, 
  Image as ImageIcon, 
  Music, 
  Type, 
  Film,
  Download,
  Copy,
  Check
} from 'lucide-react';
import { 
  H3ModelConfig, 
  NodeMappingItem, 
  INITIAL_H3_MODELS, 
  INITIAL_NODE_MAPPINGS 
} from '../../data/adminConfigData';
import RAW_WORKFLOW_JSON from '../../data/runninghubWorkflowConfig.json';
import H3_DIRECTOR_WORKFLOW from '../../data/h3DirectorWorkflowConfig.json';

export const ModelNodeConfigTab: React.FC = () => {
  const [models, setModels] = useState<H3ModelConfig[]>(INITIAL_H3_MODELS);
  const [nodeMappings, setNodeMappings] = useState<NodeMappingItem[]>(INITIAL_NODE_MAPPINGS);
  const [activeSubTab, setActiveSubTab] = useState<'topology' | 'nodes' | 'models' | 'workflow_json'>('topology');
  
  // Node mapping edit modal/state
  const [editingNode, setEditingNode] = useState<NodeMappingItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // JSON viewer state
  const [selectedJsonWorkflow, setSelectedJsonWorkflow] = useState<'official_h3' | 'director_comfy'>('official_h3');
  const [copiedJson, setCopiedJson] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleToggleModelStatus = (id: string) => {
    setModels(prev => prev.map(m => {
      if (m.id === id) {
        const nextStatus = m.status === 'active' ? 'standby' : 'active';
        return { ...m, status: nextStatus };
      }
      return m;
    }));
    showToast('模型激活状态已更新');
  };

  const handleSetDefaultModel = (id: string) => {
    setModels(prev => prev.map(m => ({
      ...m,
      isDefault: m.id === id
    })));
    showToast('默认推理基模已切换');
  };

  const handleSaveNodeEdit = () => {
    if (!editingNode) return;
    setNodeMappings(prev => prev.map(n => n.id === editingNode.id ? editingNode : n));
    setEditingNode(null);
    showToast(`节点 Node ${editingNode.nodeId} 参数配置已保存`);
  };

  const filteredNodes = nodeMappings.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          n.nodeId.includes(searchTerm) || 
                          n.nodeType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          n.fieldName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || n.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const currentWorkflowData = selectedJsonWorkflow === 'official_h3' ? H3_DIRECTOR_WORKFLOW : RAW_WORKFLOW_JSON;
  const jsonString = JSON.stringify(currentWorkflowData, null, 2);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
    showToast('工作流 JSON 规范已复制至剪贴板');
  };

  const handleDownloadJson = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedJsonWorkflow}_config.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('JSON 模板已成功下载');
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

      {/* Sub navigation bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-2 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveSubTab('topology')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeSubTab === 'topology'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4 text-cyan-300" />
            <span>可视节点拓扑流</span>
          </button>

          <button
            onClick={() => setActiveSubTab('nodes')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeSubTab === 'nodes'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Settings className="w-4 h-4 text-cyan-300" />
            <span>RunningHub 节点映射表 ({nodeMappings.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('models')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeSubTab === 'models'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Cpu className="w-4 h-4 text-cyan-300" />
            <span>H3 官方模型权重 ({models.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('workflow_json')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeSubTab === 'workflow_json'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileCode className="w-4 h-4 text-cyan-300" />
            <span>工作流 JSON 模板源</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 pr-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>官流终极版 ID: <code className="text-cyan-400 font-mono">2104734128657756162</code></span>
        </div>
      </div>

      {/* 1. VISUAL NODE TOPOLOGY FLOW */}
      {activeSubTab === 'topology' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-400" />
                  <span>MiniMax H3 官流终极版核心架构拓扑图</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  双通道接力体系：上游多图定妆矩阵 + 前段视频潜空间 ➔ 核心出片总控 ➔ 17n+5公式帧数演算 ➔ 24fps 纯净合成
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" /> 节点链路已锁定 (Node 136 枢纽)
                </span>
              </div>
            </div>

            {/* Interactive Visual Graph */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 relative">
              {/* Column 1: Multi-Modal Inputs */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-cyan-400 tracking-wider uppercase flex items-center gap-1.5 pb-1 border-b border-cyan-500/30">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>多模态参考输入矩阵</span>
                </div>

                {/* Node 137 */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-cyan-500/40 hover:border-cyan-400 transition-all shadow-sm">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">Node 137</span>
                    <span className="text-[10px] text-emerald-400 font-mono">ref_image_0</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200">&lt;Picture 1&gt; 主角全身定妆卡</div>
                  <div className="text-[11px] text-slate-400 mt-1">锁骨架、整体比例与服饰全局色系</div>
                </div>

                {/* Node 139 */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-700 hover:border-cyan-500/40 transition-all shadow-sm">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">Node 139</span>
                    <span className="text-[10px] text-blue-400 font-mono">ref_image_1</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200">&lt;Picture 2&gt; 胸口标识特写卡</div>
                  <div className="text-[11px] text-slate-400 mt-1">锁胸部Emoji表情屏与铁蛋Logo</div>
                </div>

                {/* Node 167 */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-700 hover:border-cyan-500/40 transition-all shadow-sm">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">Node 167</span>
                    <span className="text-[10px] text-purple-400 font-mono">ref_image_2</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200">&lt;Picture 3&gt; 下半身裤套细节卡</div>
                  <div className="text-[11px] text-slate-400 mt-1">锁大花布保暖裤套与解放胶鞋</div>
                </div>

                {/* Node 175 */}
                <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/50 hover:border-indigo-400 transition-all shadow-sm">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300 font-bold">Node 175</span>
                    <span className="text-[10px] text-indigo-300 font-mono font-bold">ref_video_0</span>
                  </div>
                  <div className="text-xs font-semibold text-indigo-200 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-indigo-400" />
                    <span>🎬 视频参考接力通道</span>
                  </div>
                  <div className="text-[11px] text-indigo-300/80 mt-1">接收上一段成片视频，彻底根治角色变脸！</div>
                </div>

                {/* Node 174 */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-700 hover:border-cyan-500/40 transition-all shadow-sm">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">Node 174</span>
                    <span className="text-[10px] text-amber-400 font-mono">audio</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-amber-400" />
                    <span>音频参考音色锁 (LoadAudio)</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">干声特征绑定与环境音画同步</div>
                </div>
              </div>

              {/* Column 2: Prompt & Timers */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-purple-400 tracking-wider uppercase flex items-center gap-1.5 pb-1 border-b border-purple-500/30">
                  <Type className="w-3.5 h-3.5" />
                  <span>提示词与数学公式控制</span>
                </div>

                {/* Node 138 */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-purple-500/40 hover:border-purple-400 transition-all shadow-sm">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">Node 138</span>
                    <span className="text-[10px] text-purple-400 font-mono">PrimitiveMultiline</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200">六段式规范提示词</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    景别/光影/主体定妆/物理动作/环境音效/画质参数，安全脱敏过滤
                  </div>
                </div>

                {/* Node 132 & 131 */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-700 hover:border-purple-500/40 transition-all shadow-sm">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-bold">Node 132 / 131</span>
                    <span className="text-[10px] text-cyan-400 font-mono">17n+5</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200">17n+5 帧数控制器</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    10.0s ➔ 严格锁定 243 帧；15.0s ➔ 严格锁定 362 帧
                  </div>
                </div>

                {/* Node 115 */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-700 hover:border-purple-500/40 transition-all shadow-sm">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-bold">Node 115</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Resolution</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200">分辨率画幅选择器</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    9:16 (736×1280 竖屏短剧) / 16:9 (1280×736 横屏MV)
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-dashed border-slate-800 text-[11px] text-slate-400">
                  💡 <span className="text-slate-300 font-semibold">白名单规则</span>：杜绝变脸漂移的关键是将 Node 137/139/167 的多角度卡，在 Node 138 提示词中以 &lt;Picture 1&gt; ~ &lt;Picture 3&gt; 精准引述。
                </div>
              </div>

              {/* Column 3: Core Inference Hub */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-amber-400 tracking-wider uppercase flex items-center gap-1.5 pb-1 border-b border-amber-500/30">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>核心推理与出片枢纽</span>
                </div>

                {/* Node 136 - THE CORE */}
                <div className="p-4 rounded-xl bg-gradient-to-b from-cyan-950/60 to-slate-950/80 border-2 border-cyan-500 shadow-lg shadow-cyan-500/10">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyan-500 text-slate-950 font-black">Node 136</span>
                    <span className="text-[11px] text-cyan-300 font-semibold">CORE HUB</span>
                  </div>
                  <div className="text-sm font-bold text-white">MiniMaxH3ReferenceToVideo</div>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    MiniMax H3 官方视频参考扩散引擎。汇聚所有多模态输入，基于 3D 潜空间进行时空连贯渲染。
                  </p>
                  <div className="mt-3 pt-3 border-t border-cyan-500/30 space-y-1.5 text-[11px] text-slate-400">
                    <div className="flex justify-between">
                      <span>精度:</span>
                      <span className="text-cyan-300 font-mono">INT8-ConvRot</span>
                    </div>
                    <div className="flex justify-between">
                      <span>采样器:</span>
                      <span className="text-slate-200">Ref2VA UniPC / Euler</span>
                    </div>
                    <div className="flex justify-between">
                      <span>显存需求:</span>
                      <span className="text-amber-300 font-mono">16GB - 24GB</span>
                    </div>
                  </div>
                </div>

                {/* LoRA & SageAttention */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-700 hover:border-amber-500/40 transition-all shadow-sm">
                  <div className="text-xs font-semibold text-slate-200">加速补丁层 (LoRA & Attention)</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    PatchSageAttentionKJ (降低50%显存开销) + Turbo 8-step LoRA
                  </div>
                </div>
              </div>

              {/* Column 4: Output & Auto Slicing */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-emerald-400 tracking-wider uppercase flex items-center gap-1.5 pb-1 border-b border-emerald-500/30">
                  <Film className="w-3.5 h-3.5" />
                  <span>音画合成与自动抽卡闭环</span>
                </div>

                {/* Node 148 */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-emerald-500/40 hover:border-emerald-400 transition-all shadow-sm">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">Node 148</span>
                    <span className="text-[10px] text-emerald-400 font-mono">SaveVideo</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200">VHS_VideoCombine (成片导出)</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    输出标准 24fps H.264 MP4 视频，音频无损混音
                  </div>
                </div>

                {/* Auto Keyframe Extractor Matrix */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-cyan-500/30 hover:border-cyan-400 transition-all shadow-sm">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">Auto Extractor</span>
                    <span className="text-[10px] text-cyan-300 font-mono">3-Slot Matrix</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200">多角度细节抽卡接力机</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    自动从成片第 240 帧提取 3 张细节卡：全身、胸口标识、裤套特写，自动存为下一段的 &lt;Picture 1~3&gt;
                  </div>
                </div>

                {/* FFmpeg Seamless Concat */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-700 text-xs">
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>零重影无缝短剧终剪</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    自动切除第 2 段起第 0 帧重复垫图帧，实现电影级大连贯！
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. NODE MAPPINGS TABLE */}
      {activeSubTab === 'nodes' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索 Node ID / 节点类型 / 字段名..."
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-64"
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="all">全部分类 ({nodeMappings.length})</option>
                <option value="core">核心总控 (core)</option>
                <option value="video_chain">视频接力 (video_chain)</option>
                <option value="multi_image">多图矩阵 (multi_image)</option>
                <option value="prompt">提示词 (prompt)</option>
                <option value="timeline">时间轴/帧数 (timeline)</option>
                <option value="audio">音频 (audio)</option>
                <option value="export">导出合成 (export)</option>
              </select>
            </div>
            <div className="text-xs text-slate-400">
              共配置 <span className="text-cyan-400 font-mono font-bold">{filteredNodes.length}</span> 个关键挂载节点
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono">
                <tr>
                  <th className="py-3 px-4">Node ID</th>
                  <th className="py-3 px-4">节点名称 & 功能</th>
                  <th className="py-3 px-4">节点类名 (Type)</th>
                  <th className="py-3 px-4">挂载字段 (Field)</th>
                  <th className="py-3 px-4">分类</th>
                  <th className="py-3 px-4">状态</th>
                  <th className="py-3 px-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredNodes.map(node => (
                  <tr key={node.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-bold">
                        Node {node.nodeId}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-sans font-semibold text-slate-200">{node.title}</div>
                      <div className="font-sans text-[11px] text-slate-400 max-w-sm truncate">{node.desc}</div>
                    </td>
                    <td className="py-3 px-4 text-purple-300">{node.nodeType}</td>
                    <td className="py-3 px-4 text-emerald-300 font-semibold">{node.fieldName}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-sans bg-slate-800 text-slate-300 border border-slate-700">
                        {node.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1 text-[11px] font-sans text-emerald-400">
                        <CheckCircle className="w-3.5 h-3.5" /> 正常同步
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setEditingNode(node)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-sans text-xs border border-slate-700 flex items-center gap-1 ml-auto"
                      >
                        <Edit3 className="w-3 h-3 text-cyan-400" />
                        <span>配置</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. MODELS LIST */}
      {activeSubTab === 'models' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {models.map(model => (
              <div 
                key={model.id}
                className={`p-5 rounded-2xl border transition-all ${
                  model.isDefault 
                    ? 'bg-slate-900/80 border-cyan-500/60 shadow-lg shadow-cyan-500/10' 
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-100">{model.name}</h4>
                      {model.isDefault && (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/40">
                          默认出片基模
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-mono">
                      <span>版本: {model.version}</span>
                      <span>·</span>
                      <span className="uppercase text-amber-300">{model.precision}</span>
                      <span>·</span>
                      <span>显存: {model.vramRequiredGb} GB</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    model.status === 'active' 
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}>
                    {model.status === 'active' ? '● 运行中' : '○ 备用'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  {model.description}
                </p>

                <div className="mt-4 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 font-mono text-[11px] text-slate-400 flex items-center justify-between">
                  <span className="truncate max-w-xs">{model.weightFile}</span>
                  <span className="text-cyan-400 shrink-0">Safetensors</span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleToggleModelStatus(model.id)}
                    className="text-slate-400 hover:text-slate-200 flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{model.status === 'active' ? '设为备用' : '激活基模'}</span>
                  </button>

                  {!model.isDefault && (
                    <button
                      onClick={() => handleSetDefaultModel(model.id)}
                      className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 font-semibold"
                    >
                      设为主力基模
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. WORKFLOW JSON INSPECTOR */}
      {activeSubTab === 'workflow_json' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">选择工作流模板:</span>
              <button
                onClick={() => setSelectedJsonWorkflow('official_h3')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedJsonWorkflow === 'official_h3'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                H3 官流终极版 (h3_director_workflow.json)
              </button>
              <button
                onClick={() => setSelectedJsonWorkflow('director_comfy')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedJsonWorkflow === 'director_comfy'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                ComfyUI 导演全流程 (runninghubWorkflowConfig.json)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyJson}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5"
              >
                {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedJson ? '已复制' : '复制 JSON'}</span>
              </button>
              <button
                onClick={handleDownloadJson}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>导出模板</span>
              </button>
            </div>
          </div>

          <div className="relative rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs overflow-hidden">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80 text-[11px] text-slate-400">
              <span>节点数据: <span className="text-cyan-400 font-bold">{Object.keys(currentWorkflowData).length} 个顶层对象</span></span>
              <span>格式: 标准 ComfyUI / RunningHub OpenAPI 格式</span>
            </div>
            <pre className="max-h-96 overflow-y-auto text-slate-300 leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
              {jsonString.slice(0, 15000)}
              {jsonString.length > 15000 && '\n\n... [数据较长，已省略后续内容，可点击上方按钮完整导出] ...'}
            </pre>
          </div>
        </div>
      )}

      {/* Node Mapping Edit Modal */}
      {editingNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Settings className="w-4 h-4 text-cyan-400" />
                <span>配置节点 Node {editingNode.nodeId}</span>
              </h3>
              <button 
                onClick={() => setEditingNode(null)}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">节点名称</label>
                <input
                  type="text"
                  value={editingNode.title}
                  onChange={(e) => setEditingNode({ ...editingNode, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Node ID (ComfyUI)</label>
                  <input
                    type="text"
                    value={editingNode.nodeId}
                    onChange={(e) => setEditingNode({ ...editingNode, nodeId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">字段名称 (fieldName)</label>
                  <input
                    type="text"
                    value={editingNode.fieldName}
                    onChange={(e) => setEditingNode({ ...editingNode, fieldName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">节点类名 (nodeType)</label>
                <input
                  type="text"
                  value={editingNode.nodeType}
                  onChange={(e) => setEditingNode({ ...editingNode, nodeType: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">描述说明</label>
                <textarea
                  rows={2}
                  value={editingNode.desc}
                  onChange={(e) => setEditingNode({ ...editingNode, desc: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEditingNode(null)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                取消
              </button>
              <button
                onClick={handleSaveNodeEdit}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>保存配置</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
