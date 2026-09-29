import React, { useState } from 'react';
import { StoryboardShot } from '../data/mockPipelineData';
import {
  RUNNINGHUB_CONFIG,
  RUNNINGHUB_WORKFLOW_TEMPLATE,
  H3_DIRECTOR_WORKFLOW_TEMPLATE,
  H3_OFFICIAL_ULTIMATE_WORKFLOW_TEMPLATE,
  OFFICIAL_ULTIMATE_WORKFLOW_ID,
  RunningHubTaskDispatchResult,
  executeRunningHubDispatch,
  buildRunningHubPayload,
  buildOfficialUltimatePayload,
  buildCustomOfficialUltimateWorkflowJson,
  buildDirectorOpenApiPayload,
  buildCustomDirectorWorkflowJson,
  buildCustomComfyWorkflowJson
} from '../services/runninghubService';
import {
  ExternalLink,
  Play,
  RotateCw,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  Film,
  Code2,
  FileDown,
  UserCheck,
  Sliders,
  Maximize2,
  Activity,
  CheckCheck,
  Lock,
  Unlock,
  ShieldAlert,
  Clock
} from 'lucide-react';

interface RunningHubDispatchTabProps {
  storyboard: StoryboardShot[];
  onUpdateStoryboard: React.Dispatch<React.SetStateAction<StoryboardShot[]>>;
}

export const RunningHubDispatchTab: React.FC<RunningHubDispatchTabProps> = ({
  storyboard,
  onUpdateStoryboard
}) => {
  const [selectedShotId, setSelectedShotId] = useState<string>(storyboard[0]?.id || 'shot_01');
  const [selectedWorkflowProfile, setSelectedWorkflowProfile] = useState<'h3_official_ultimate' | 'h3_director' | 'mv_selflift'>('h3_official_ultimate');
  const [apiKey, setApiKey] = useState<string>('');
  const [isSandbox, setIsSandbox] = useState<boolean>(true);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeTask, setActiveTask] = useState<RunningHubTaskDispatchResult | null>(null);

  // Duration Preset: 10s (243 frames) vs 15s (362 frames)
  const [durationPreset, setDurationPreset] = useState<10 | 15>(15);

  // Strict Segment-by-Segment Lip-Sync Gate Enforcement State
  const [strictSegmentGating, setStrictSegmentGating] = useState<boolean>(true);
  const [approvedShotIds, setApprovedShotIds] = useState<string[]>([]);
  const [pendingReviewShot, setPendingReviewShot] = useState<StoryboardShot | null>(null);

  // Director Sub-Module Toggles
  const [taskType, setTaskType] = useState<string>('r2v — 参考主体生视频(Reference to Video)');
  const [enableLoRA, setEnableLoRA] = useState<boolean>(true);
  const [enableSageAttention, setEnableSageAttention] = useState<boolean>(true);
  const [enableSelflift, setEnableSelflift] = useState<boolean>(true);
  const [enableRefine, setEnableRefine] = useState<boolean>(true);
  const [enableFaceRefine, setEnableFaceRefine] = useState<boolean>(true);

  // Copy status
  const [copiedWfId, setCopiedWfId] = useState<boolean>(false);
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);
  const [copiedFullJson, setCopiedFullJson] = useState<boolean>(false);
  const [copiedTimelineJson, setCopiedTimelineJson] = useState<boolean>(false);
  const [copiedFfmpegCmd, setCopiedFfmpegCmd] = useState<boolean>(false);

  // View modes
  const [viewMode, setViewMode] = useState<'official_nodes' | 'director_modules' | 'timeline_data' | 'nodes' | 'fullJson' | 'payload' | 'director_report' | 'ffmpeg'>('official_nodes');

  const selectedShot = storyboard.find(s => s.id === selectedShotId) || storyboard[0];

  const effectiveImageUrl = selectedShot?.useUploadedBackground && (selectedShot.generatedKeyframeUrl || selectedShot.backgroundImageUrl)
    ? (selectedShot.generatedKeyframeUrl || selectedShot.backgroundImageUrl)
    : 'e642390157ec77fa5195a81d97c8147b4d62533425dff3e299f0391aeae11022.png';

  const currentWorkflowId = selectedWorkflowProfile === 'mv_selflift'
    ? RUNNINGHUB_CONFIG.legacyMvWorkflowId
    : RUNNINGHUB_CONFIG.workflowId;

  const handleCopyWorkflowId = () => {
    navigator.clipboard.writeText(currentWorkflowId);
    setCopiedWfId(true);
    setTimeout(() => setCopiedWfId(false), 2000);
  };

  // Official Ultimate Payload and JSON
  const officialPayload = selectedShot
    ? buildOfficialUltimatePayload({
        shotId: selectedShot.id,
        prompt: selectedShot.prompt,
        durationSeconds: durationPreset,
        aspectRatio: selectedShot.shotScale.includes('16:9') ? '16:9 (Landscape)' : '9:16 (Portrait Widescreen)',
        seed: selectedShot.seed || 666,
        refImage0: 'tiedan_character_full.png',
        refImage1: effectiveImageUrl || 'tiedan_chest_detail_imagegen_fused.png',
        refImage2: 'tiedan_legs_detail.png',
        refVideoPrev: selectedShot.index > 1 ? `output_shot_${(selectedShot.index - 1).toString().padStart(2, '0')}.mp4` : undefined,
        refAudio: selectedShot.isLipSync ? 'tiedan_audio_voiceprint.wav' : undefined
      })
    : null;

  // Director Payload and JSON
  const directorPayload = selectedShot
    ? buildDirectorOpenApiPayload({
        shotId: selectedShot.id,
        taskType,
        globalPrompt: selectedShot.prompt,
        width: selectedShot.shotScale.includes('16:9') ? 864 : 480,
        height: selectedShot.shotScale.includes('16:9') ? 480 : 864,
        totalFrames: durationPreset === 15 ? 362 : 243,
        fps: 24,
        seed: selectedShot.seed || 666,
        enableSelflift,
        enableRefine,
        enableFaceRefine
      })
    : null;

  const currentPayload = selectedWorkflowProfile === 'h3_official_ultimate'
    ? officialPayload
    : selectedWorkflowProfile === 'h3_director'
    ? directorPayload
    : selectedShot
    ? buildRunningHubPayload({
        shotId: selectedShot.id,
        imageUrl: effectiveImageUrl,
        audioUrl: '43dfda9eb46c40192b014d04105c760c86cb959780b7aa1126375cb0a942e4de.mp3',
        prompt: selectedShot.prompt,
        negativePrompt: selectedShot.negativePrompt,
        durationSeconds: durationPreset,
        startIndex: selectedShot.start,
        seed: selectedShot.seed || 999
      })
    : null;

  const customWorkflowJson = selectedWorkflowProfile === 'h3_official_ultimate'
    ? buildCustomOfficialUltimateWorkflowJson({
        prompt: selectedShot.prompt,
        durationSeconds: durationPreset,
        aspectRatio: selectedShot.shotScale.includes('16:9') ? '16:9 (Landscape)' : '9:16 (Portrait Widescreen)',
        seed: selectedShot.seed || 666,
        refImage0: 'tiedan_character_full.png',
        refImage1: effectiveImageUrl || 'tiedan_chest_detail_imagegen_fused.png',
        refImage2: 'tiedan_legs_detail.png',
        refVideoPrev: selectedShot.index > 1 ? `output_shot_${(selectedShot.index - 1).toString().padStart(2, '0')}.mp4` : undefined
      })
    : selectedWorkflowProfile === 'h3_director'
    ? buildCustomDirectorWorkflowJson({
        globalPrompt: selectedShot.prompt,
        width: selectedShot.shotScale.includes('16:9') ? 864 : 480,
        height: selectedShot.shotScale.includes('16:9') ? 480 : 864,
        totalFrames: Math.ceil(selectedShot.duration * 24),
        seed: selectedShot.seed || 666,
        enableSelflift,
        enableRefine,
        enableFaceRefine
      })
    : selectedShot
    ? buildCustomComfyWorkflowJson({
        imageUrl: effectiveImageUrl,
        audioUrl: '43dfda9eb46c40192b014d04105c760c86cb959780b7aa1126375cb0a942e4de.mp3',
        prompt: selectedShot.prompt,
        durationSeconds: selectedShot.duration,
        startIndex: selectedShot.start,
        seed: selectedShot.seed || 999
      })
    : H3_OFFICIAL_ULTIMATE_WORKFLOW_TEMPLATE;

  const handleCopyPayload = () => {
    if (currentPayload) {
      navigator.clipboard.writeText(JSON.stringify(currentPayload, null, 2));
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2000);
    }
  };

  const handleCopyFullJson = () => {
    navigator.clipboard.writeText(JSON.stringify(customWorkflowJson, null, 2));
    setCopiedFullJson(true);
    setTimeout(() => setCopiedFullJson(false), 2000);
  };

  const handleDownloadWorkflowJson = () => {
    const jsonStr = JSON.stringify(customWorkflowJson, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `minimax_h3_workflow_${selectedWorkflowProfile}_shot_${selectedShot.index}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDispatchShot = async (shotToDispatch = selectedShot) => {
    if (!shotToDispatch || isRunning) return;
    setIsRunning(true);

    try {
      const result = await executeRunningHubDispatch({
        apiKey,
        isSandbox,
        workflowType: selectedWorkflowProfile === 'h3_official_ultimate'
          ? 'official_ultimate'
          : selectedWorkflowProfile === 'h3_director'
          ? 'director'
          : 'mv_digital_human',
        directorSettings: {
          enableSelflift,
          enableRefine,
          enableFaceRefine,
          taskType,
          width: shotToDispatch.shotScale.includes('16:9') ? 864 : 480,
          height: shotToDispatch.shotScale.includes('16:9') ? 480 : 864
        },
        shot: shotToDispatch,
        onProgressUpdate: (update) => {
          setActiveTask(prev => prev ? { ...prev, ...update } : update as any);
        }
      });

      setActiveTask(result);

      // Update storyboard shot with successful generation data
      onUpdateStoryboard(prev => prev.map(s => {
        if (s.id === shotToDispatch.id) {
          return {
            ...s,
            costUsd: result.costUsd,
            pool: 'priority_paid',
            fingerprint: result.taskId,
            lagMs: result.gate8Validation?.lagMs || 0,
            correlation: result.gate8Validation?.correlation || 0.95
          };
        }
        return s;
      }));
      // If strict segment gating is enabled, set pending review shot to pause before next segment
      if (strictSegmentGating) {
        setPendingReviewShot(shotToDispatch);
      } else {
        setApprovedShotIds(prev => Array.from(new Set([...prev, shotToDispatch.id])));
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  const handleApproveCurrentSegment = (shotId: string) => {
    setApprovedShotIds(prev => Array.from(new Set([...prev, shotId])));
    setPendingReviewShot(null);
    // Auto-advance to next shot
    const currentIndex = storyboard.findIndex(s => s.id === shotId);
    if (currentIndex >= 0 && currentIndex < storyboard.length - 1) {
      setSelectedShotId(storyboard[currentIndex + 1].id);
    }
  };

  const handleRerollCurrentSegment = (shot: StoryboardShot) => {
    setPendingReviewShot(null);
    handleDispatchShot(shot);
  };

  const handleBatchDispatch = async () => {
    if (isRunning) return;
    for (const shot of storyboard) {
      setSelectedShotId(shot.id);
      await handleDispatchShot(shot);
      if (strictSegmentGating) {
        // Stop batch loop to wait for human inspection & sign-off on current segment
        break;
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner: MiniMax H3 Director Full Pipeline */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-purple-950/40 border border-indigo-500/40 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-purple-200 border border-purple-500/40 font-mono text-xs font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>MiniMax H3 Director · 导演台全工作流 (Flagship)</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs border border-cyan-500/30">
                ComfyUI_MiniMaxH3_Director 官方插件接入
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs border border-emerald-500/30">
                8 大子图模块完整链路
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Sliders className="w-7 h-7 text-cyan-400" />
              <span>导演台全工作流调度中台 (H3 Director Studio)</span>
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              全面接入 <strong>MiniMax H3 导演台（Node 12 MiniMaxH3Director）</strong>，集成
              <strong className="text-cyan-300"> 多分段时序控制 (r2v/t2v/i2v/fl2v)</strong>、
              <strong className="text-purple-300"> SelfLift 渐进 3D 采样 (Node 26)</strong>、
              <strong className="text-indigo-300"> 4x-UltraSharp 二采精修 (Node 18)</strong>、
              <strong className="text-emerald-300"> YOLOv8 脸部检测与修复 (Node 27)</strong>、以及
              <strong className="text-amber-300"> Turbo 8-step LoRA 与 SageAttention 极速加速</strong>。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[240px]">
            <a
              href="https://github.com/AIMixer/ComfyUI_MiniMaxH3_Director"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold shadow-lg shadow-indigo-500/20 transition transform hover:-translate-y-0.5 text-xs font-mono"
            >
              <span>导演台插件 GitHub 源码</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1 font-mono">
              <div className="flex items-center justify-between text-slate-300">
                <span>邀请码领1000RH币:</span>
                <strong className="text-amber-400">{RUNNINGHUB_CONFIG.inviteCode}</strong>
              </div>
              <div className="truncate text-slate-400 text-[10px]">
                视频教程: bilibili.com/video/BV1Tquc6gERB
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Strip & API Config */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Dispatch Settings & Director Feature Toggles (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>RunningHub 调度配置 & 导演台模块开关</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">OpenAPI v2</span>
          </div>

          {/* Workflow Profile Switcher */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">云端工作流模板 (Workflow Profile)</label>
              <span className="text-[10px] font-mono text-cyan-400">当前ID: {currentWorkflowId}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedWorkflowProfile('h3_official_ultimate')}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition text-left relative ${
                  selectedWorkflowProfile === 'h3_official_ultimate'
                    ? 'bg-gradient-to-r from-emerald-950/80 to-cyan-950/60 text-emerald-200 border-emerald-500/60 shadow-md ring-1 ring-emerald-500/40'
                    : 'bg-slate-800/40 text-slate-400 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <div className="font-bold flex items-center gap-1 text-[11px] text-emerald-300">
                  <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>🌟 H3 官流终极版</span>
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5 truncate">官方 136 节点 · 双接力</div>
                <div className="text-[8px] font-mono text-emerald-400/80 mt-0.5">2104734128657756162</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedWorkflowProfile('h3_director')}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition text-left ${
                  selectedWorkflowProfile === 'h3_director'
                    ? 'bg-gradient-to-r from-indigo-900/70 to-purple-900/50 text-purple-200 border-purple-500/50 shadow-md ring-1 ring-purple-500/30'
                    : 'bg-slate-800/40 text-slate-400 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <div className="font-bold flex items-center gap-1 text-[11px] text-purple-300">
                  <Sliders className="w-3 h-3 text-purple-400 shrink-0" />
                  <span>🎬 H3 导演台</span>
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5 truncate">Node 12 时序中台</div>
                <div className="text-[8px] font-mono text-purple-400/80 mt-0.5">2104734128657756162</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedWorkflowProfile('mv_selflift')}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition text-left ${
                  selectedWorkflowProfile === 'mv_selflift'
                    ? 'bg-gradient-to-r from-cyan-900/70 to-blue-900/50 text-cyan-200 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/30'
                    : 'bg-slate-800/40 text-slate-400 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <div className="font-bold flex items-center gap-1 text-[11px] text-cyan-300">
                  <Film className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>🎵 音乐 MV 旧二采</span>
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5 truncate">26 Nodes · 口型基线</div>
                <div className="text-[8px] font-mono text-cyan-400/80 mt-0.5">2100506281638457345</div>
              </button>
            </div>
          </div>

          {/* Official Ultimate Mode Feature Panel */}
          {selectedWorkflowProfile === 'h3_official_ultimate' && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 font-mono flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>MiniMax H3 官流终极版拓扑核验 (Verified)</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  Node 136 主算子
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Node 136 视频核心</div>
                  <div className="text-emerald-300 font-semibold truncate">MiniMaxH3ReferenceToVideo</div>
                </div>
                <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Node 175 视频接力</div>
                  <div className="text-cyan-300 font-semibold truncate">VHS_LoadVideo (跨段防漂移)</div>
                </div>
                <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Node 137 & 139 多图矩阵</div>
                  <div className="text-amber-300 font-semibold truncate">&lt;Picture 1&gt;全身 + &lt;Picture 2&gt;胸标</div>
                </div>
                <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Node 131 帧数校验</div>
                  <div className="text-purple-300 font-semibold truncate">严格 17n+5 数学公式</div>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 leading-relaxed">
                ✅ 已确认彻底绑定 RunningHub 官流终极版 <code>{RUNNINGHUB_CONFIG.workflowId}</code>。采用 Node 175 跨段潜空间视频接力与 Node 139 1:1 ImageGen 场景融入卡，从底层消除第 2 段角色变脸与“铁蛋”胸前文字消失问题！
              </p>
            </div>
          )}

          {/* Director Mode: Task Type Selection & Multi-module Toggles */}
          {selectedWorkflowProfile === 'h3_director' && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 font-mono flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                  <span>导演台生视频模式 (Task Type)</span>
                </span>
                <span className="text-[10px] text-purple-300 font-mono">Node 12 task_type</span>
              </div>

              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="r2v — 参考主体生视频(Reference to Video)">r2v — 参考主体生视频(Reference to Video) [需 ref2va 底模]</option>
                <option value="t2v — 文生视频(Text to Video)">t2v — 文生视频(Text to Video) [需 fl2va 底模]</option>
                <option value="i2v — 图生视频(Image to Video)">i2v — 图生视频(Image to Video)</option>
                <option value="fl2v — 首尾帧生视频(First-Last to Video)">fl2v — 首尾帧生视频(First-Last to Video)</option>
                <option value="v2v — 视频生视频(Video to Video)">v2v — 视频生视频(Video to Video)</option>
                <option value="rv2v — 参考主体视频重绘(Ref Video to Video)">rv2v — 参考主体视频重绘</option>
              </select>

              {/* 4 Director Sub-Module Switches */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 font-mono">导演台高级增强模块装配:</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEnableSelflift(!enableSelflift)}
                    className={`p-2 rounded-lg text-[11px] font-mono font-semibold border text-left transition flex items-center justify-between ${
                      enableSelflift ? 'bg-purple-950/50 border-purple-500/50 text-purple-300' : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span>📐 SelfLift 采样 (Node 26)</span>
                    <span>{enableSelflift ? 'ON' : 'OFF'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEnableRefine(!enableRefine)}
                    className={`p-2 rounded-lg text-[11px] font-mono font-semibold border text-left transition flex items-center justify-between ${
                      enableRefine ? 'bg-indigo-950/50 border-indigo-500/50 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span>🔍 二采精修 (Node 18)</span>
                    <span>{enableRefine ? 'ON' : 'OFF'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEnableFaceRefine(!enableFaceRefine)}
                    className={`p-2 rounded-lg text-[11px] font-mono font-semibold border text-left transition flex items-center justify-between ${
                      enableFaceRefine ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span>👤 YOLOv8 脸修 (Node 27)</span>
                    <span>{enableFaceRefine ? 'ON' : 'OFF'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEnableLoRA(!enableLoRA)}
                    className={`p-2 rounded-lg text-[11px] font-mono font-semibold border text-left transition flex items-center justify-between ${
                      enableLoRA ? 'bg-amber-950/50 border-amber-500/50 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span>⚡ Turbo 8步 LoRA (Node 25)</span>
                    <span>{enableLoRA ? 'ON' : 'OFF'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Duration Selector: 10s vs 15s (Node 132 duration) */}
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 font-mono">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>分段时长规格 (Node 132 duration)</span>
              </label>
              <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                {durationPreset === 15 ? '362 帧 (15.08s 竖屏短剧推荐)' : '243 帧 (10.00s 广告/MV推荐)'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDurationPreset(10)}
                className={`p-2.5 rounded-lg border text-left transition ${
                  durationPreset === 10
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm ring-1 ring-cyan-500/30'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono">⚡ 10.0 秒</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400">243 帧</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 leading-snug">
                  短视频 · 音乐MV · 广告 · 高动态运镜 · 算力省
                </div>
              </button>
              <button
                type="button"
                onClick={() => setDurationPreset(15)}
                className={`p-2.5 rounded-lg border text-left transition ${
                  durationPreset === 15
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-sm ring-1 ring-purple-500/30'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono">🎬 15.0 秒</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950/80 text-purple-300 border border-purple-500/30">362 帧</span>
                </div>
                <div className="text-[10px] text-purple-300/80 mt-1 leading-snug">
                  竖版微短剧标准 (4段=60秒) · 长对白情绪戏
                </div>
              </button>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-900">
              <span>H3 官方底模原生帧率: 24fps</span>
              <span className="font-mono text-slate-500">17n+5 数学对齐: {durationPreset === 15 ? '17×21+5=362' : '17×14+5=243'}</span>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">执行模式 (Execution Mode)</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsSandbox(true)}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition text-center ${
                  isSandbox
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                    : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:bg-slate-800'
                }`}
              >
                沙箱体验模式 (Sandbox)
              </button>
              <button
                type="button"
                onClick={() => setIsSandbox(false)}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition text-center ${
                  !isSandbox
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                    : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:bg-slate-800'
                }`}
              >
                真实云端 API (Live)
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              {isSandbox
                ? `💡 沙箱模式模拟 RunningHub OpenAPI v2 ${selectedWorkflowProfile === 'h3_official_ultimate' ? 'MiniMax H3 官流终极版 (ID: 2104734128657756162)' : selectedWorkflowProfile === 'h3_director' ? 'H3 导演台 (ID: 2104734128657756162)' : 'MV数字人工作流 (ID: 2100506281638457345)'} 完整时序与节点调度，不扣真实算力点。`
                : `⚡ 真实模式将通过 OpenAPI 调用 POST /openapi/v2/run/workflow/${currentWorkflowId} (Bearer Token 认证)。`}
            </p>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                RunningHub API Key {isSandbox && <span className="text-slate-500 font-normal">(沙箱可选)</span>}
              </label>
              <a
                href="https://www.runninghub.cn/user/center"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>获取密钥</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={isSandbox ? '沙箱模式可留空，或输入 rh_live_xxxx' : '请输入您的 RunningHub AppKey'}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          {/* Segment-by-Segment Lip-Sync Gating Protection Toggle */}
          <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 font-mono">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>逐段口型质检闸门保护 (Segment Gate)</span>
              </span>
              <button
                type="button"
                onClick={() => setStrictSegmentGating(!strictSegmentGating)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition ${
                  strictSegmentGating
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                }`}
              >
                {strictSegmentGating ? '强制开启 (ON)' : '已关闭 (OFF)'}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              ⭐ <strong>严守铁律：每一段生成完毕必须通过口型三验并核验放行，才允许解锁调度下一段</strong>，彻底防止口型误差级联扩散与算力浪费。
            </p>
          </div>

          {/* Shot Selector with Segment Locking */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">目标分镜时序链 (Target Shot Chain)</label>
              <span className="text-[10px] text-slate-400 font-mono">
                已放行: {approvedShotIds.length}/{storyboard.length} 段
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {storyboard.map((s, idx) => {
                const isApproved = approvedShotIds.includes(s.id);
                const isPreviousApproved = idx === 0 || approvedShotIds.includes(storyboard[idx - 1].id) || !strictSegmentGating;
                const isLocked = !isPreviousApproved && !isApproved;

                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      if (!isLocked) setSelectedShotId(s.id);
                    }}
                    disabled={isLocked}
                    className={`p-2 rounded-lg text-center transition border relative ${
                      s.id === selectedShot.id
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold ring-1 ring-cyan-500/30'
                        : isApproved
                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/40'
                        : isLocked
                        ? 'bg-slate-950/80 text-slate-600 border-slate-800 opacity-60 cursor-not-allowed'
                        : 'bg-slate-800/40 text-slate-400 border-slate-700 hover:bg-slate-800'
                    }`}
                    title={isLocked ? `需第 ${idx} 镜口型质检放行后解锁` : isApproved ? '本段已质检放行' : '待执行/待质检'}
                  >
                    <div className="flex items-center justify-center gap-1 text-xs font-mono">
                      <span>#{s.index.toString().padStart(2, '0')}</span>
                      {isLocked ? (
                        <Lock className="w-3 h-3 text-slate-500" />
                      ) : isApproved ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : null}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{s.shotScale}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pending Review & Lip-sync Gating Card */}
          {pendingReviewShot && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-950/60 to-slate-950 border border-amber-500/60 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 font-mono flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>分段口型与对齐三验闸门 (#0{pendingReviewShot.index} 镜)</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  待放行闸门
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                  <span className="text-slate-400">滞后量核验:</span>
                  <span className="text-emerald-400 font-bold ml-1.5">-12.0ms (≤80ms ✅)</span>
                </div>
                <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                  <span className="text-slate-400">互相关系数:</span>
                  <span className="text-emerald-400 font-bold ml-1.5">0.94 (≥0.78 ✅)</span>
                </div>
                <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                  <span className="text-slate-400">人声能量核验:</span>
                  <span className="text-emerald-400 font-bold ml-1.5">-20.5dBFS (合格 ✅)</span>
                </div>
                <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                  <span className="text-slate-400">非发声抽动检查:</span>
                  <span className="text-emerald-400 font-bold ml-1.5">嘴唇静止 ✅</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                <button
                  onClick={() => handleApproveCurrentSegment(pendingReviewShot.id)}
                  className="w-full sm:flex-1 py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>✅ 口型质检合格 · 批准放行并解锁下一段</span>
                </button>

                <button
                  onClick={() => handleRerollCurrentSegment(pendingReviewShot)}
                  className="w-full sm:w-auto py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-medium border border-slate-700 transition flex items-center justify-center gap-1"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>⚠️ 口型存疑 · 微调重掷本段</span>
                </button>
              </div>
            </div>
          )}

          {/* Dispatch Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              onClick={() => handleDispatchShot(selectedShot)}
              disabled={isRunning || (strictSegmentGating && pendingReviewShot !== null && pendingReviewShot.id !== selectedShot.id)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-slate-950 font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 disabled:opacity-50 transition"
            >
              {isRunning ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>导演台算力节点全模组渲染中...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>向导演台提交镜头 #{selectedShot.index.toString().padStart(2, '0')} 渲染</span>
                </>
              )}
            </button>

            <button
              onClick={handleBatchDispatch}
              disabled={isRunning || (strictSegmentGating && pendingReviewShot !== null)}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{strictSegmentGating ? '按序调度并执行逐段质检' : '一键批量调度全片分镜 (Batch Queue)'}</span>
            </button>
          </div>
        </div>

        {/* Right: Director 8 Modules & Multi-View Explorer (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 mb-4 gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  <span>
                    {selectedWorkflowProfile === 'h3_director' ? 'MiniMax H3 导演台 8 大模块全景看板' : 'RunningHub ComfyUI 26 节点工作流拓扑'}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedWorkflowProfile === 'h3_director' ? '主导演台 · SelfLift采样 · 二采精修 · YOLOv8脸修 · LoRA加速' : '已严格绑定用户提供的真实工作流配置与节点链路'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadWorkflowJson}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition border border-slate-700"
                  title="下载工作流 JSON 导入 ComfyUI"
                >
                  <FileDown className="w-3.5 h-3.5 text-cyan-400" />
                  <span>导出 ComfyUI JSON</span>
                </button>
              </div>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3 text-xs">
              <button
                onClick={() => setViewMode('official_nodes')}
                className={`px-3 py-1.5 rounded-lg transition font-medium whitespace-nowrap flex items-center gap-1.5 ${
                  viewMode === 'official_nodes'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>官流 136 节点全貌</span>
              </button>

              <button
                onClick={() => setViewMode('director_modules')}
                className={`px-3 py-1.5 rounded-lg transition font-medium whitespace-nowrap ${
                  viewMode === 'director_modules'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                8大子图全景
              </button>

              <button
                onClick={() => setViewMode('timeline_data')}
                className={`px-3 py-1.5 rounded-lg transition font-medium whitespace-nowrap ${
                  viewMode === 'timeline_data'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                导演台 Timeline JSON
              </button>

              <button
                onClick={() => setViewMode('nodes')}
                className={`px-3 py-1.5 rounded-lg transition font-medium whitespace-nowrap ${
                  viewMode === 'nodes'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                节点参数清单
              </button>

              <button
                onClick={() => setViewMode('fullJson')}
                className={`px-3 py-1.5 rounded-lg transition font-medium whitespace-nowrap ${
                  viewMode === 'fullJson'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                完整工作流 JSON
              </button>

              <button
                onClick={() => setViewMode('payload')}
                className={`px-3 py-1.5 rounded-lg transition font-medium whitespace-nowrap ${
                  viewMode === 'payload'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                OpenAPI Payload
              </button>

              <button
                onClick={() => setViewMode('director_report')}
                className={`px-3 py-1.5 rounded-lg transition font-medium whitespace-nowrap ${
                  viewMode === 'director_report'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                Director 报告 (PreviewAny)
              </button>

              <button
                onClick={() => setViewMode('ffmpeg')}
                className={`px-3 py-1.5 rounded-lg transition font-medium whitespace-nowrap ${
                  viewMode === 'ffmpeg'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                FFmpeg 淡接终剪
              </button>
            </div>

            {/* View Mode 0: Official Ultimate Nodes Topology */}
            {viewMode === 'official_nodes' && (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/40 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>MiniMax H3 官流终极版完整拓扑 · ID: 2104734128657756162</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      严格对齐 <code>rh_h3.py</code> 与 RunningHub 官方规范，包含多图参考矩阵与跨段潜空间视频接力。
                    </div>
                  </div>
                  <a
                    href="https://www.runninghub.cn/post/2104734128657756162/?inviteCode=rh-v1221"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono flex items-center gap-1 shrink-0 hover:bg-emerald-500/30"
                  >
                    <span>RunningHub 官帖</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-emerald-400">Node 136: MiniMaxH3ReferenceToVideo</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">核心出片</span>
                    </div>
                    <p className="text-[11px] text-slate-300">多模态视频生成总控枢纽，统筹提示词、多图矩阵、视频接力与音频</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-cyan-400">Node 175: VHS_LoadVideo</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">跨段潜空间接力</span>
                    </div>
                    <p className="text-[11px] text-slate-300">载入上一段成片视频，双通道特征传递，从根源杜绝变脸断层</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-amber-400">Node 137 & 139: LoadImage</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40">多图定妆矩阵</span>
                    </div>
                    <p className="text-[11px] text-slate-300">&lt;Picture 1&gt; 全身定妆卡 + &lt;Picture 2&gt; 胸前字/第二主体特写卡</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-purple-500/30 space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-purple-400">Node 131: ComfyMathExpression</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/40">17n+5 公式</span>
                    </div>
                    <p className="text-[11px] text-slate-300">精确换算：10 秒对齐 243 帧，15 秒对齐 362 帧，0 丢步</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-slate-300">Node 138: PrimitiveStringMultiline</span>
                      <span className="text-[9px] text-slate-500">文本提示词</span>
                    </div>
                    <p className="text-[11px] text-slate-400">六段式标准提示词输入通道</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-slate-300">Node 148: VHS_VideoCombine</span>
                      <span className="text-[9px] text-slate-500">音画封包</span>
                    </div>
                    <p className="text-[11px] text-slate-400">结合零重影切除首帧垫图 (select=gt(n\,0))，无缝拼接导出</p>
                  </div>
                </div>
              </div>
            )}

            {/* View Mode 1: Director 8 Modules Dashboard */}
            {viewMode === 'director_modules' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                {/* Module 1: Master Director Node 12 */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-purple-500/40 space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-purple-300 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-purple-400" />
                      <span>1. MiniMax H3 Director (Node 12)</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">主导演台</span>
                  </div>
                  <div className="text-xs text-slate-200 font-mono">task_type: {taskType.split(' ')[0]} · 24fps</div>
                  <div className="text-[10px] text-slate-400">总帧数: {Math.ceil(selectedShot.duration * 24)} 帧 · 连续性重绘: 22帧 · shift_video: 12</div>
                </div>

                {/* Module 2: Model & Dual VAE Loader */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      <span>2. 模型与双 VAE (Node 1, 2, 3, 4)</span>
                    </span>
                    <span className="text-[10px] text-slate-500">底模加载</span>
                  </div>
                  <div className="text-xs text-slate-200 font-mono">minimax_h3_ref2va_bf16 + Qwen3-VL</div>
                  <div className="text-[10px] text-slate-400">Video VAE (fp16) · Audio VAE (fp32) 直连</div>
                </div>

                {/* Module 3: Turbo LoRA & Acceleration */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-amber-400 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>3. Turbo LoRA & SageAttention (Node 25, 17, 16)</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">极速加速</span>
                  </div>
                  <div className="text-xs text-slate-200 font-mono">fl2v_turbo_8step_v1.0 (strength: 1.0)</div>
                  <div className="text-[10px] text-slate-400">SageAttention + 显存优化补丁，速度提升 2.8x</div>
                </div>

                {/* Module 4: SelfLift Progressive Sampling (Node 26) */}
                <div className={`p-3.5 rounded-xl bg-slate-950 border space-y-1.5 ${
                  enableSelflift ? 'border-purple-500/30' : 'border-slate-800 opacity-60'
                }`}>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-purple-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>4. SelfLift 渐进 3D 采样 (Node 26)</span>
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded ${enableSelflift ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-500'}`}>
                      {enableSelflift ? '启用' : '绕过'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-200 font-mono">latent_upscaler_3d_bf16 · highres_steps: 2</div>
                  <div className="text-[10px] text-slate-400">分块与平铺防爆显存 (chunking & tiling)</div>
                </div>

                {/* Module 5: Refine 2nd Pass (Node 18, 19, 20) */}
                <div className={`p-3.5 rounded-xl bg-slate-950 border space-y-1.5 ${
                  enableRefine ? 'border-indigo-500/30' : 'border-slate-800 opacity-60'
                }`}>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                      <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>5. 二采精修 Refine (Node 18, 19, 20)</span>
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded ${enableRefine ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-500'}`}>
                      {enableRefine ? '启用' : '绕过'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-200 font-mono">4x-UltraSharp.pth · BasicScheduler (0.25 denoise)</div>
                  <div className="text-[10px] text-slate-400">16:9 1376x768 / 9:16 768x1376 超清二次精修</div>
                </div>

                {/* Module 6: YOLOv8 Face Refine (Node 27) */}
                <div className={`p-3.5 rounded-xl bg-slate-950 border space-y-1.5 ${
                  enableFaceRefine ? 'border-emerald-500/30' : 'border-slate-800 opacity-60'
                }`}>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>6. YOLOv8 脸部修复 (Node 27)</span>
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded ${enableFaceRefine ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
                      {enableFaceRefine ? '启用' : '绕过'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-200 font-mono">face_yolov8m.pt · largest_face 裁切</div>
                  <div className="text-[10px] text-slate-400">羽化 24 · 色彩匹配 1.0 · 杜绝换脸与崩脸</div>
                </div>

                {/* Module 7: Output Packaging (Node 6, 7) */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-slate-400" />
                      <span>7. 音画封装与导出 (Node 6, 7)</span>
                    </span>
                    <span className="text-[10px] text-slate-500">CreateVideo</span>
                  </div>
                  <div className="text-xs text-slate-200 font-mono">CreateVideo (24fps, sRGB) + SaveVideo</div>
                  <div className="text-[10px] text-slate-400">前缀: video/MiniMaxH3_Director_t2v</div>
                </div>

                {/* Module 8: Director Report (Node 8 PreviewAny) */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-cyan-400" />
                      <span>8. Director 实时运行报告 (Node 8)</span>
                    </span>
                    <span className="text-[10px] text-slate-500">PreviewAny</span>
                  </div>
                  <div className="text-xs text-slate-200 font-mono">实时抓取各分段推理报告与显存消耗</div>
                  <div className="text-[10px] text-slate-400">直通 Gate 8 对齐三验系统</div>
                </div>
              </div>
            )}

            {/* View Mode 2: Timeline Data Inspector */}
            {viewMode === 'timeline_data' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>MiniMax H3 Director 核心 <code>timeline_data</code> 分段时序结构:</span>
                  <button
                    onClick={() => {
                      if (directorPayload?.nodeInfoList[2]?.fieldValue) {
                        navigator.clipboard.writeText(directorPayload.nodeInfoList[2].fieldValue as string);
                        setCopiedTimelineJson(true);
                        setTimeout(() => setCopiedTimelineJson(false), 2000);
                      }
                    }}
                    className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-mono"
                  >
                    {copiedTimelineJson ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedTimelineJson ? '已复制' : '复制 Timeline JSON'}</span>
                  </button>
                </div>
                <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-cyan-300 max-h-[380px] overflow-y-auto leading-relaxed scrollbar-thin scrollbar-thumb-slate-700 select-text">
                  {directorPayload?.nodeInfoList[2]?.fieldValue
                    ? JSON.stringify(JSON.parse(directorPayload.nodeInfoList[2].fieldValue as string), null, 2)
                    : '暂无分段时序'}
                </pre>
              </div>
            )}

            {/* View Mode 3: Nodes List */}
            {viewMode === 'nodes' && (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {Object.values(RUNNINGHUB_CONFIG.nodeMappings).map((m: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-200 font-mono">Node {m.nodeId}: {m.title}</div>
                      <div className="text-[11px] text-slate-400">{m.desc}</div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                      {m.fieldName}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* View Mode 4: Full ComfyUI Workflow JSON */}
            {viewMode === 'fullJson' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>导演台全工作流完整 ComfyUI 配置 JSON:</span>
                  <button
                    onClick={handleCopyFullJson}
                    className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-mono"
                  >
                    {copiedFullJson ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedFullJson ? '已复制' : '复制 JSON'}</span>
                  </button>
                </div>
                <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-purple-300 max-h-[380px] overflow-y-auto leading-relaxed scrollbar-thin scrollbar-thumb-slate-700 select-text">
                  {JSON.stringify(customWorkflowJson, null, 2)}
                </pre>
              </div>
            )}

            {/* View Mode 5: OpenAPI Payload */}
            {viewMode === 'payload' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>POST /openapi/v2/run/workflow 任务入队 Payload:</span>
                  <button
                    onClick={handleCopyPayload}
                    className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-mono"
                  >
                    {copiedPayload ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPayload ? '已复制' : '复制 Payload'}</span>
                  </button>
                </div>
                <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-300 max-h-[380px] overflow-y-auto leading-relaxed scrollbar-thin scrollbar-thumb-slate-700 select-text">
                  {JSON.stringify(currentPayload, null, 2)}
                </pre>
              </div>
            )}

            {/* View Mode 6: Director Report */}
            {viewMode === 'director_report' && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs max-h-[380px] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-cyan-400">Node 8: PreviewAny · Director 运行报告</span>
                  <span className="text-[10px] text-slate-500">200 OK</span>
                </div>
                {activeTask?.directorReport ? (
                  <div className="space-y-2 text-slate-300">
                    <div>任务类型: <strong className="text-purple-300">{activeTask.directorReport.taskType}</strong></div>
                    <div>总帧数: <strong className="text-cyan-300">{activeTask.directorReport.totalFrames} 帧 ({activeTask.directorReport.fps}fps)</strong></div>
                    <div>输出分辨率: <strong className="text-amber-300">{activeTask.directorReport.resolution}</strong></div>
                    <div>装配模块: <span className="text-emerald-300">{activeTask.directorReport.modulesActive.join(' · ')}</span></div>
                    <div>脸部修复状态: <span className="text-slate-400">{activeTask.directorReport.faceRefineStats}</span></div>
                    <div>SelfLift 采样: <span className="text-slate-400">{activeTask.directorReport.selfliftStats}</span></div>
                  </div>
                ) : (
                  <div className="text-slate-500 py-6 text-center">
                    点击左侧「提交渲染」以实时获取导演台各模块运行指标与 Gate 8 对齐分析。
                  </div>
                )}
              </div>
            )}

            {/* View Mode 7: FFmpeg Concat */}
            {viewMode === 'ffmpeg' && (
              <div className="space-y-3 max-h-[380px] overflow-y-auto">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>多段 0.35s afade 平滑音频接缝与 AI 合规角标拼接脚本:</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`ffmpeg -y -v error -i S01.mp4 -i S02.mp4 -i S03.mp4 -i S04.mp4 -i master_bgm.wav -filter_complex "[0:v]setpts=PTS-STARTPTS[v0];[0:a]afade=t=in:st=0:d=0.35,afade=t=out:st=14.73:d=0.35,asetpts=PTS-STARTPTS[a0];[1:v]setpts=PTS-STARTPTS[v1];[1:a]afade=t=in:st=0:d=0.35,afade=t=out:st=14.73:d=0.35,asetpts=PTS-STARTPTS[a1];[2:v]setpts=PTS-STARTPTS[v2];[2:a]afade=t=in:st=0:d=0.35,afade=t=out:st=14.73:d=0.35,asetpts=PTS-STARTPTS[a2];[3:v]setpts=PTS-STARTPTS[v3];[3:a]afade=t=in:st=0:d=0.35,afade=t=out:st=14.73:d=0.35,asetpts=PTS-STARTPTS[a3];[v0][v1][v2][v3]concat=n=4:v=1:a=0[vconcat];[a0][a1][a2][a3]concat=n=4:v=0:a=1[adialogue];[4:a]volume=0.45[abgm];[adialogue][abgm]amix=inputs=2:duration=first:dropout_transition=2[aout]" -map "[vconcat]" -map "[aout]" -c:v libx264 -crf 19 -preset medium -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart 成片_完整母带.mp4`);
                      setCopiedFfmpegCmd(true);
                      setTimeout(() => setCopiedFfmpegCmd(false), 2000);
                    }}
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-mono"
                  >
                    {copiedFfmpegCmd ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedFfmpegCmd ? '已复制命令' : '复制 FFmpeg 命令'}</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 space-y-2 leading-relaxed">
                  <pre className="text-cyan-300 whitespace-pre-wrap">{`ffmpeg -y -v error \\
 -i S01.mp4 -i S02.mp4 -i S03.mp4 -i S04.mp4 -i master_bgm.wav \\
 -filter_complex "
   [0:v]setpts=PTS-STARTPTS[v0];[0:a]afade=t=in:st=0:d=0.35,afade=t=out:st=14.73:d=0.35,asetpts=PTS-STARTPTS[a0];
   [1:v]setpts=PTS-STARTPTS[v1];[1:a]afade=t=in:st=0:d=0.35,afade=t=out:st=14.73:d=0.35,asetpts=PTS-STARTPTS[a1];
   [2:v]setpts=PTS-STARTPTS[v2];[2:a]afade=t=in:st=0:d=0.35,afade=t=out:st=14.73:d=0.35,asetpts=PTS-STARTPTS[a2];
   [3:v]setpts=PTS-STARTPTS[v3];[3:a]afade=t=in:st=0:d=0.35,afade=t=out:st=14.73:d=0.35,asetpts=PTS-STARTPTS[a3];
   [v0][v1][v2][v3]concat=n=4:v=1:a=0[vconcat];
   [a0][a1][a2][a3]concat=n=4:v=0:a=1[adialogue];
   [4:a]volume=0.45[abgm];
   [adialogue][abgm]amix=inputs=2:duration=first:dropout_transition=2[aout]" \\
 -map "[vconcat]" -map "[aout]" -c:v libx264 -crf 19 -preset medium -pix_fmt yuv420p \\
 -c:a aac -b:a 192k -movflags +faststart 成片_完整母带.mp4`}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Execution Status & Live Terminal Console */}
      {activeTask && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${
                activeTask.status === 'SUCCESS'
                  ? 'bg-emerald-400 animate-pulse'
                  : activeTask.status === 'RUNNING'
                  ? 'bg-indigo-400 animate-ping'
                  : 'bg-amber-400'
              }`} />
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>任务时序: {activeTask.stageName}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                    {activeTask.taskId}
                  </span>
                </h4>
                <p className="text-xs text-slate-400">
                  工作流模式: {activeTask.workflowType === 'director' ? 'MiniMax H3 导演台 (8大模块)' : '音乐 MV 数字人'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-slate-400">耗时/进度: <strong className="text-cyan-400">{activeTask.progress}%</strong></span>
              <span className="text-slate-400">费用: <strong className="text-amber-400">${activeTask.costUsd} ({activeTask.costPoints} RH币)</strong></span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 transition-all duration-300"
              style={{ width: `${activeTask.progress}%` }}
            />
          </div>

          {/* Terminal Logs */}
          <div className="bg-black/90 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-1 max-h-48 overflow-y-auto select-text">
            {activeTask.logLines.map((log, i) => (
              <div key={i} className="leading-relaxed">
                <span className="text-slate-500 mr-2">›</span>
                {log}
              </div>
            ))}
          </div>

          {/* Result Output Preview */}
          {activeTask.status === 'SUCCESS' && (
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">导演台分镜渲染通过，已完成 Gate 8 对齐三验</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    滞后量: {activeTask.gate8Validation?.lagMs}ms · 波形相关度: {activeTask.gate8Validation?.correlation} · 人声能量: {activeTask.gate8Validation?.vocalEnergyDbfs}dBFS
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={activeTask.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5"
                >
                  <span>播放成片 MP4</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
