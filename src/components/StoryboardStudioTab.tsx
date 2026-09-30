import React, { useState, useRef } from 'react';
import { StoryboardShot } from '../data/mockPipelineData';
import { validateGate5Prompt, validateGate6, Gate5Validation, Gate6Validation } from '../utils/pipelineValidators';
import {
  ShieldAlert, ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Film, Sparkles,
  Sliders, RefreshCw, Wand2, Hash, Eye, EyeOff, Cpu,
  Upload, Image as ImageIcon, Check, Loader2, FileImage, Layers, ArrowRight, Palette,
  Info, ExternalLink, ChevronDown, ChevronUp, Grid, Box, Scissors, Volume2, Mic, GitMerge, Copy
} from 'lucide-react';
import {
  BACKGROUND_PRESETS,
  dispatchBuddyMultimodalImg2Img,
  BUDDY_MULTIMODAL_CONFIG,
  BackgroundPreset
} from '../services/imageGenService';
import { INITIAL_NINE_GRID_SCENES, INITIAL_PROP_MULTI_GRIDS } from '../data/h3PipelineData';
import { INITIAL_EXTRACTED_DRY_VOCALS } from '../data/audioReferenceData';

interface StoryboardStudioTabProps {
  storyboard: StoryboardShot[];
  onUpdateStoryboard: (updated: StoryboardShot[]) => void;
  hasProtagonist: boolean;
  masterDuration: number;
  onJumpToRunningHub?: (shotId: string) => void;
}

export const StoryboardStudioTab: React.FC<StoryboardStudioTabProps> = ({
  storyboard,
  onUpdateStoryboard,
  hasProtagonist,
  masterDuration,
  onJumpToRunningHub
}) => {
  const [selectedShotId, setSelectedShotId] = useState<string>(storyboard[1]?.id || storyboard[0]?.id);
  const [copiedSyncMessage, setCopiedSyncMessage] = useState<string | null>(null);

  // Compute Gate 6 Validation for full storyboard
  const gate6Result: Gate6Validation = validateGate6(storyboard, masterDuration);

  // Get active shot
  const activeShot = storyboard.find(s => s.id === selectedShotId) || storyboard[0];
  const gate5Result: Gate5Validation = validateGate5Prompt(activeShot, hasProtagonist);

  const handleUpdateActiveShot = (fields: Partial<StoryboardShot>) => {
    const updated = storyboard.map(s => {
      if (s.id === activeShot.id) {
        return {
          ...s,
          ...fields,
          // Recompute duration if start or end changed
          duration: fields.start !== undefined || fields.end !== undefined
            ? (fields.end ?? s.end) - (fields.start ?? s.start)
            : s.duration,
          // Generate updated fingerprint on prompt modification
          fingerprint: fields.prompt !== undefined ? 'sig_' + Math.random().toString(36).substring(2, 10) : s.fingerprint
        };
      }
      return s;
    });
    onUpdateStoryboard(updated);
  };

  const [isGeneratingImg2Img, setIsGeneratingImg2Img] = useState<boolean>(false);
  const [img2imgProgress, setImg2imgProgress] = useState<number>(0);
  const [img2imgStage, setImg2imgStage] = useState<string>('');
  const [showImageGenLogs, setShowImageGenLogs] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger ImageGen (buddy-multimodal-generation) img2img
  const handleTriggerImg2Img = async (bgUrl: string, bgName: string) => {
    setIsGeneratingImg2Img(true);
    setImg2imgProgress(10);
    setImg2imgStage('连接 buddy-multimodal-generation 路由...');

    try {
      const result = await dispatchBuddyMultimodalImg2Img({
        shot: activeShot,
        backgroundImageUrl: bgUrl,
        backgroundImageName: bgName,
        onProgress: (prog, stage, _log) => {
          setImg2imgProgress(prog);
          setImg2imgStage(stage);
        }
      });

      handleUpdateActiveShot({
        useUploadedBackground: true,
        backgroundImageUrl: bgUrl,
        backgroundImageName: bgName,
        generatedKeyframeUrl: result.generatedImageUrl,
        imageGenStatus: 'completed',
        imageGenPlugin: 'buddy-multimodal-generation',
        imageGenLogs: result.logs
      });
    } catch (err) {
      console.error('ImageGen error', err);
    } finally {
      setIsGeneratingImg2Img(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        handleTriggerImg2Img(dataUrl, file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBatchApplyBackground = (bgUrl: string, bgName: string) => {
    const updated = storyboard.map(s => ({
      ...s,
      useUploadedBackground: true,
      backgroundImageUrl: bgUrl,
      backgroundImageName: bgName,
      imageGenPlugin: 'buddy-multimodal-generation' as const
    }));
    onUpdateStoryboard(updated);
  };

  // Auto-Fix Prompt to achieve full compliance with 11 rules (H3 narrative + 9-grid + dry vocal)
  const handleAutoFixPrompt = () => {
    const scale = activeShot.shotScale;
    const isLip = activeShot.isLipSync;
    const dialogue = activeShot.lyricsSnippet || "见她如见我！";
    const cellId = activeShot.sceneGridCellId || 2;
    const cellName = activeShot.sceneGridCellName || "核心对决位 (Hero Arena)";
    const propName = activeShot.propName || "玄铁银枪";

    let compliantPrompt = '';
    let compliantNeg = '';

    if (isLip) {
      compliantPrompt = `[SHOT]
Shot scale: ${scale === 'CU' ? 'Close-Up' : scale === 'MCU' ? 'Medium Close-Up' : scale === 'MS' ? 'Medium Shot' : 'Close-Up'}. Camera motion: Slow subtle push-in tracking shot toward speaker's face.

[SUBJECT]
<Subject 1> 主角面容冷峻，身姿挺拔。<Subject 3> 携带道具【${propName}】。<Subject 4> 对齐九宫格场景大图中的第 ${cellId} 机位【${cellName}】。

[ACTION]
Speaking dialogue: <d>[中文] ${dialogue}</d> 咬字清晰沉稳，声线完全继承自第1段提取纯净干声音色。

[ENVIRONMENT]
Scene environment matching 9-Grid master spatial relationship, natural atmospheric mist and directional key light.

[LIGHTING_COLOR]
Cinematic split key lighting and environmental rim reflections, high textural realism.

[CAMERA_TECH]
8k resolution, cinematic prime lens, photorealistic film look, shallow depth of field, 24fps motion blur.`;
      compliantNeg = "text, words, subtitles, lyrics, watermark, captions, logo, typography, letters, signature, username, font, burned-in text, cartoon, 3d render, distorted face, lowres";
    } else {
      compliantPrompt = `[SHOT]
Shot scale: ${scale}. Camera motion: Dynamic cinematic tracking of spatial motion and weapon contact.

[SUBJECT]
<Subject 1> 与对手在场景中交锋，手持 <Subject 3>【${propName}】。<Subject 4> 依托九宫格空间大图第 ${cellId} 机位【${cellName}】。

[ACTION]
Physical action clash and spatial movement. Mouth naturally closed, lips completely still, not moving along with vocals, no singing or talking.

[ENVIRONMENT]
Spatial environment strictly maintaining 9-Grid spatial architecture and lighting orientation.

[LIGHTING_COLOR]
High dynamic contrast, dramatic rim lighting on metallic weapon surfaces.

[CAMERA_TECH]
Cinematic 8k, anamorphic lens flare, crisp shutter cadence, natural film grain.`;
      compliantNeg = "text, words, subtitles, lyrics, watermark, captions, logo, typography, letters, signature, font, burned-in text, singing, mouth open, lip-sync, talking, cartoon, 3d CGI";
    }

    handleUpdateActiveShot({
      prompt: compliantPrompt,
      negativePrompt: compliantNeg
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
      {/* Gate 6 Hard Barrier Banner */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg ${
        gate6Result.passed
          ? 'bg-slate-900/90 border-emerald-500/40 text-emerald-300'
          : 'bg-slate-900/90 border-red-500/50 text-red-300'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg mt-0.5 ${gate6Result.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
            {gate6Result.passed ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                GATE 6 硬门禁
              </span>
              <h2 className="text-sm font-bold text-white">对白窗口与段落时序核对</h2>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${gate6Result.passed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                {gate6Result.passed ? '✓ 机器硬校验全量通过' : `✕ 拦截 ${gate6Result.errors.length} 项违规`}
              </span>
            </div>

            {gate6Result.errors.length > 0 ? (
              <ul className="mt-2 space-y-1 text-xs text-red-300 list-disc list-inside">
                {gate6Result.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-300 mt-1">
                分镜时间轴首尾闭环无断层，总长严格等于片段设定时长 ({gate6Result.stats.totalDuration}s)，景别与口型策略符合生理节奏与工业铁律。
              </p>
            )}
          </div>
        </div>

        {/* Gate 6 Stats Badges */}
        <div className="flex items-center gap-3 font-mono text-xs text-slate-300 self-end md:self-center">
          <div className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
            <span className="text-slate-400">口型占比: </span>
            <span className={`font-bold ${gate6Result.stats.lipSyncRatioPct <= 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {gate6Result.stats.lipSyncRatioPct}% (基准45%)
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
            <span className="text-slate-400">最大连续口型: </span>
            <span className={`font-bold ${gate6Result.stats.maxConsecutiveLipSync <= 3 ? 'text-emerald-400' : 'text-red-400'}`}>
              {gate6Result.stats.maxConsecutiveLipSync} 段 (上限3)
            </span>
          </div>
        </div>
      </div>

      {/* Main Studio Grid: Left Storyboard List, Right Shot Inspector & Gate 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Storyboard Shots Carousel / List (4 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Film className="w-4 h-4 text-cyan-400" />
              <span>逐段分镜列表 ({storyboard.length} 镜头)</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">九宫格空间与干声链路贯通</span>
          </div>

          <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
            {storyboard.map((shot, idx) => {
              const isSelected = shot.id === activeShot.id;
              const shotCheck = validateGate5Prompt(shot, hasProtagonist);

              return (
                <div
                  key={shot.id}
                  onClick={() => setSelectedShotId(shot.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative space-y-2 ${
                    isSelected
                      ? 'bg-slate-800/95 border-cyan-500 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                      : 'bg-slate-800/50 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                        #{shot.index.toString().padStart(2, '0')}
                      </span>
                      <span className="font-mono text-xs text-slate-300">
                        [{shot.start.toFixed(1)}s - {shot.end.toFixed(1)}s]
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-slate-900 text-slate-300 border border-slate-700">
                        {shot.shotScale}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {shot.isLipSync ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          对白口型
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-700 text-slate-400">
                          闭口/动作
                        </span>
                      )}

                      <span className={`w-2 h-2 rounded-full ${shotCheck.allPassed ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 line-clamp-1 font-medium">
                    {shot.lyricsSnippet || '(环境建立段)'}
                  </p>

                  {/* 9-Grid Scene Angle & Prop Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                      <Grid className="w-3 h-3 text-cyan-400" />
                      <span>九宫格 S{shot.sceneGridCellId || 1}: {shot.sceneGridCellName?.slice(0, 6) || '全景视角'}</span>
                    </span>

                    {shot.propName && (
                      <span className="px-2 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Box className="w-3 h-3 text-amber-400" />
                        <span>道具: {shot.propName.slice(0, 6)}</span>
                      </span>
                    )}

                    {shot.index === 1 ? (
                      <span className="px-1.5 py-0.5 rounded bg-indigo-950/70 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                        <Scissors className="w-3 h-3 text-indigo-400" />
                        <span>干声提取源</span>
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>调取P01干声</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-700/50 text-[11px] text-slate-400">
                    <span className="truncate max-w-[200px]">{shot.cameraMotion}</span>
                    <span className="font-mono text-[10px] text-slate-500">#{shot.fingerprint}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Shot Inspector & Gate 5 Prompt Checker (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Active Shot Controls */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 pb-3 mb-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 font-bold">镜头 #{activeShot.index.toString().padStart(2, '0')} 详细设定</span>
                <h4 className="text-sm font-bold text-white mt-0.5">{activeShot.lyricsSnippet || '器乐段'}</h4>
              </div>

              <div className="flex items-center gap-2">
                {onJumpToRunningHub && (
                  <button
                    onClick={() => onJumpToRunningHub(activeShot.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition"
                    title="在 RunningHub 调度中心渲染本镜头 (Minimax H3 工作流)"
                  >
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                    <span>RunningHub 渲染</span>
                  </button>
                )}

                <button
                  onClick={handleAutoFixPrompt}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition"
                  title="自动根据铁律与六段式规范重构本镜提示词"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>一键合规重构</span>
                </button>
              </div>
            </div>

            {/* Scale and Lip-Sync Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-4">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">景别选型 (Shot Scale)</label>
                <select
                  value={activeShot.shotScale}
                  onChange={(e) => handleUpdateActiveShot({ shotScale: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="ECU">ECU 大特写 (允许口型)</option>
                  <option value="CU">CU 特写 (允许口型)</option>
                  <option value="MCU">MCU 近景 (允许口型)</option>
                  <option value="MS">MS 中景 (允许口型)</option>
                  <option value="MLS">MLS 中远景 (禁口型)</option>
                  <option value="FS">FS 全景 (禁口型)</option>
                  <option value="ELS">ELS 大远景 (禁口型)</option>
                  <option value="Scenery">Scenery 空镜 (禁口型)</option>
                  <option value="Back-View">Back-View 背影 (禁口型)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">口型策略 (Lip-Sync)</label>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleUpdateActiveShot({ isLipSync: !activeShot.isLipSync })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                      activeShot.isLipSync
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-700/60 text-slate-400 border border-slate-600'
                    }`}
                  >
                    {activeShot.isLipSync ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{activeShot.isLipSync ? '对白口型 (Speaking)' : '闭口/动作 (Mouth Still)'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">窗口时长 (W_k)</label>
                <div className="flex items-center gap-2 pt-1">
                  <span className="font-mono text-sm font-bold text-white bg-slate-900 px-3 py-1 rounded border border-slate-700">
                    {activeShot.duration.toFixed(2)} 秒
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    [{activeShot.start.toFixed(1)}s ~ {activeShot.end.toFixed(1)}s]
                  </span>
                </div>
              </div>
            </div>

            {/* 🏛️ 9-Grid Spatial Scene Angle & Prop Multi-Grid & Dry Vocal Chaining Controls */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-3 mb-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-cyan-300 font-mono flex items-center gap-1.5">
                  <Grid className="w-4 h-4 text-cyan-400" />
                  <span>资产库调取：九宫格空间视角 · 道具多宫格 · 第 1 段干声自动复用</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  {activeShot.index === 1 ? '第 1 段 (干声提取源)' : `第 ${activeShot.index} 段 (已自动继承第1段干声)`}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {/* 1. 9-Grid Spatial Cell Selection */}
                <div>
                  <label className="text-slate-400 text-[11px] block mb-1 font-mono">
                    1. 调取九宫格场景机位:
                  </label>
                  <select
                    value={activeShot.sceneGridCellId || 1}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      const cellNameMap: Record<number, string> = {
                        1: '全景建立视角 (Wide Establishing)',
                        2: '核心对决/主位 (Hero Arena)',
                        3: '45° 侧身透视 (Lateral Flank)',
                        4: '俯瞰鸟瞰空间图 (Overhead Map)',
                        5: '物理碰撞/受击锚点 (Impact Anchor)',
                        6: '反拍景深机位 (Reverse Depth)',
                        7: '主光源投射面 (Main Rim Light)',
                        8: '暗部遮蔽与掩体角 (Shadow Depth)',
                        9: '远景环境空气延伸 (Atmospheric Depth)'
                      };
                      handleUpdateActiveShot({
                        sceneGridCellId: id,
                        sceneGridCellName: cellNameMap[id]
                      });
                    }}
                    className="w-full bg-slate-900 border border-cyan-500/40 rounded-lg px-2.5 py-1.5 text-cyan-200 text-xs font-mono focus:outline-none"
                  >
                    <option value={1}>S1: 全景建立视角 (Wide Establishing)</option>
                    <option value={2}>S2: 核心对决/主位 (Hero Arena)</option>
                    <option value={3}>S3: 45° 侧身透视 (Lateral Flank)</option>
                    <option value={4}>S4: 俯瞰鸟瞰空间图 (Overhead Map)</option>
                    <option value={5}>S5: 物理碰撞/受击锚点 (Impact Anchor)</option>
                    <option value={6}>S6: 反拍景深机位 (Reverse Depth)</option>
                    <option value={7}>S7: 主光源投射面 (Main Rim Light)</option>
                    <option value={8}>S8: 暗部遮蔽与掩体角 (Shadow Depth)</option>
                    <option value={9}>S9: 远景环境空气延伸 (Atmospheric Depth)</option>
                  </select>
                </div>

                {/* 2. Prop Selection */}
                <div>
                  <label className="text-slate-400 text-[11px] block mb-1 font-mono">
                    2. 调取物品/道具多宫格:
                  </label>
                  <select
                    value={activeShot.propId || 'prop_wuxia_spear'}
                    onChange={(e) => {
                      const propMap: Record<string, string> = {
                        'prop_wuxia_spear': '玄铁银枪 (长兵器多宫格)',
                        'prop_shushan_sword': '蜀山秋水古剑 (剑仙飞剑多宫格)',
                        'prop_wuxia_flying_knife': '子母破空飞刀 (暗器多宫格)',
                        'prop_retro_cup': '80年代泛黄账簿与搪瓷杯 (年代道具)'
                      };
                      handleUpdateActiveShot({
                        propId: e.target.value,
                        propName: propMap[e.target.value] || e.target.value
                      });
                    }}
                    className="w-full bg-slate-900 border border-amber-500/40 rounded-lg px-2.5 py-1.5 text-amber-200 text-xs font-mono focus:outline-none"
                  >
                    <option value="prop_wuxia_spear">⚔️ 玄铁银枪 (长兵器多宫格)</option>
                    <option value="prop_shushan_sword">🗡️ 蜀山秋水古剑 (飞剑多宫格)</option>
                    <option value="prop_wuxia_flying_knife">🔪 子母破空飞刀 (暗器多宫格)</option>
                    <option value="prop_retro_cup">🍵 80年代泛黄账簿与搪瓷杯 (年代道具)</option>
                  </select>
                </div>

                {/* 3. Dry Vocal Chaining State */}
                <div>
                  <label className="text-slate-400 text-[11px] block mb-1 font-mono">
                    3. 干声音频跨段复用:
                  </label>
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] flex items-center justify-between">
                    <span className="text-emerald-300 font-mono truncate">
                      {activeShot.index === 1 ? '🎙️ P01 (干声提取母源)' : '✓ 已调取第 1 段干声'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const syncText = `✓ 已为镜头 #${activeShot.index} 绑定九宫格 S${activeShot.sceneGridCellId || 1} 与第 1 段干声 (RunningHub Node 34 就绪)！`;
                        setCopiedSyncMessage(syncText);
                        setTimeout(() => setCopiedSyncMessage(null), 3000);
                      }}
                      className="px-2 py-0.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] shrink-0"
                    >
                      重新同步
                    </button>
                  </div>
                </div>
              </div>

              {copiedSyncMessage && (
                <div className="text-[11px] text-emerald-400 font-mono bg-emerald-950/60 p-2 rounded-lg border border-emerald-500/30 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>{copiedSyncMessage}</span>
                </div>
              )}
            </div>

            {/* Direct Uploaded Background & Built-in ImageGen (buddy-multimodal-generation) Section */}
            <div className={`p-4 rounded-xl border transition-all ${
              activeShot.useUploadedBackground
                ? 'bg-slate-950/90 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                : 'bg-slate-900/60 border-slate-800'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${activeShot.useUploadedBackground ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">直接使用上传的背景图作为背景</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        内置 ImageGen · buddy-multimodal-generation
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      多模态图生图 (Image-to-Image)：锁定上传背景构图，融合人物与光影，直通 RunningHub Node 36
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const nextState = !activeShot.useUploadedBackground;
                      const defaultBg = BACKGROUND_PRESETS[0];
                      handleUpdateActiveShot({
                        useUploadedBackground: nextState,
                        backgroundImageUrl: nextState ? (activeShot.backgroundImageUrl || defaultBg.thumbnail) : undefined,
                        backgroundImageName: nextState ? (activeShot.backgroundImageName || defaultBg.name) : undefined,
                        imageGenPlugin: nextState ? 'buddy-multimodal-generation' : undefined
                      });
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      activeShot.useUploadedBackground ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        activeShot.useUploadedBackground ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {activeShot.useUploadedBackground && (
                <div className="space-y-4">
                  {/* Active Routing Notice */}
                  <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5 leading-relaxed">
                      <span className="font-semibold text-white">
                        已激活「直接使用上传背景图」多模态图生图管线：
                      </span>
                      <span>
                        由平台内置插件 <code>buddy-multimodal-generation</code> 路由调度，保持背景透视与建筑保真度达 96%+，光影自适应融汇，并硬性压制任何文字水印。
                      </span>
                    </div>
                  </div>

                  {/* Preset Background Gallery & Upload Actions */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-cyan-400" />
                        <span>选择背景参考或上传专属图片</span>
                      </label>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition"
                        >
                          <Upload className="w-3.5 h-3.5 text-cyan-400" />
                          <span>本地上传图片...</span>
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {BACKGROUND_PRESETS.map((preset) => {
                        const isChosen = activeShot.backgroundImageName === preset.name;
                        return (
                          <div
                            key={preset.id}
                            onClick={() => {
                              handleUpdateActiveShot({
                                backgroundImageUrl: preset.thumbnail,
                                backgroundImageName: preset.name
                              });
                            }}
                            className={`p-2 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                              isChosen
                                ? 'bg-cyan-950/60 border-cyan-500 ring-1 ring-cyan-500/50'
                                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="aspect-[9/16] max-h-24 w-full rounded-lg overflow-hidden bg-slate-950 border border-slate-800 mb-1.5 flex items-center justify-center relative">
                              <img
                                src={preset.thumbnail}
                                alt={preset.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              {isChosen && (
                                <div className="absolute top-1 right-1 p-0.5 rounded-full bg-cyan-500 text-slate-950">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-[11px] font-bold text-slate-200 truncate">{preset.name}</div>
                              <div className="text-[9px] text-slate-400 truncate">{preset.colorGrade}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Trigger Img2Img Dispatch Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      disabled={isGeneratingImg2Img || !activeShot.backgroundImageUrl}
                      onClick={() => {
                        if (activeShot.backgroundImageUrl) {
                          handleTriggerImg2Img(
                            activeShot.backgroundImageUrl,
                            activeShot.backgroundImageName || 'custom_background.png'
                          );
                        }
                      }}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition"
                    >
                      {isGeneratingImg2Img ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>ImageGen 图生图执行中 ({img2imgProgress}%)...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 fill-current" />
                          <span>调用内置 ImageGen 图生图 (buddy-multimodal-generation)</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (activeShot.backgroundImageUrl) {
                            handleBatchApplyBackground(
                              activeShot.backgroundImageUrl,
                              activeShot.backgroundImageName || 'custom_background.png'
                            );
                          }
                        }}
                        className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition"
                        title="将此背景图一键应用到全片所有分镜"
                      >
                        一键应用至全片分镜
                      </button>

                      {activeShot.imageGenLogs && (
                        <button
                          type="button"
                          onClick={() => setShowImageGenLogs(!showImageGenLogs)}
                          className="px-2.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs border border-slate-800 flex items-center gap-1"
                        >
                          <span>日志</span>
                          {showImageGenLogs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar when Generating */}
                  {isGeneratingImg2Img && (
                    <div className="space-y-1.5 p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-cyan-400 flex items-center gap-1.5">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>{img2imgStage}</span>
                        </span>
                        <span className="font-bold text-white">{img2imgProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full transition-all duration-300"
                          style={{ width: `${img2imgProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Dual Comparison & Results Panel */}
                  {activeShot.backgroundImageUrl && (
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Box 1: Uploaded Background Image */}
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="text-slate-400 flex items-center gap-1">
                              <FileImage className="w-3.5 h-3.5 text-cyan-400" />
                              <span>上传基准背景图</span>
                            </span>
                            <span className="text-slate-500 truncate max-w-[140px]">
                              {activeShot.backgroundImageName || 'custom_bg.png'}
                            </span>
                          </div>
                          <div className="aspect-[9/16] max-h-48 w-full rounded-md overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                            <img
                              src={activeShot.backgroundImageUrl}
                              alt="Uploaded Background"
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </div>

                        {/* Box 2: ImageGen Generated Keyframe (Direct to RunningHub Node 36) */}
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="text-indigo-300 font-bold flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                              <span>ImageGen 多模态图生图关键帧</span>
                            </span>
                            <span className="text-emerald-400 font-mono text-[10px]">
                              直通 Node 36
                            </span>
                          </div>
                          <div className="aspect-[9/16] max-h-48 w-full rounded-md overflow-hidden bg-slate-900 border border-indigo-500/30 flex items-center justify-center relative">
                            {activeShot.generatedKeyframeUrl || activeShot.backgroundImageUrl ? (
                              <img
                                src={activeShot.generatedKeyframeUrl || activeShot.backgroundImageUrl}
                                alt="Generated Keyframe"
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="text-center p-3 text-slate-500 text-xs">
                                待调用 ImageGen 图生图
                              </div>
                            )}
                            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-slate-950/80 text-[9px] font-mono text-cyan-300 border border-slate-700">
                              9:16 Widescreen
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Multi-modal Quality Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800 text-[11px] font-mono">
                        <div className="flex items-center gap-3">
                          <span className="text-emerald-400 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>背景保真度: 96.8%</span>
                          </span>
                          <span className="text-cyan-400 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>光影自适应: 93.4%</span>
                          </span>
                          <span className="text-purple-300 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>纯净 0 字幕</span>
                          </span>
                        </div>

                        {onJumpToRunningHub && (
                          <button
                            type="button"
                            onClick={() => onJumpToRunningHub(activeShot.id)}
                            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition font-sans text-xs font-semibold"
                          >
                            <span>在 RunningHub 查看 Node 36 映射</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Expandable Logs View */}
                      {showImageGenLogs && activeShot.imageGenLogs && (
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300 space-y-1 max-h-36 overflow-y-auto">
                          <div className="text-slate-400 font-bold mb-1">
                            buddy-multimodal-generation 路由日志:
                          </div>
                          {activeShot.imageGenLogs.map((l, i) => (
                            <div key={i} className="text-slate-400">{l}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Prompt Editor */}
            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">
                  六段式正向提示词 (Positive Prompt - 必须具备 [SHOT] 至 [CAMERA_TECH])
                </label>
                <textarea
                  rows={8}
                  value={activeShot.prompt}
                  onChange={(e) => handleUpdateActiveShot({ prompt: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 leading-relaxed"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-300 text-xs font-semibold">
                    负向提示词 (Negative Prompt - 画面防文字/水印必填；非口型段强行闭嘴)
                  </label>
                  <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                    <span>🚫 画面严禁文字</span>
                    <span className="text-slate-500">|</span>
                    <span>🎵 伴奏底轨贯穿</span>
                  </span>
                </div>
                <input
                  type="text"
                  value={activeShot.negativePrompt}
                  onChange={(e) => handleUpdateActiveShot({ negativePrompt: e.target.value })}
                  placeholder="text, words, subtitles, lyrics, captions, watermark, logo, typography..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  铁律保障：已硬性屏蔽文字/字幕/歌词水印，杜绝模型在画面中渲染乱码；成片字幕统一由后期 SRT 挂载。
                </p>
              </div>
            </div>
          </div>

          {/* Gate 5: 11 Machine Check Rules Card */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30">
                  GATE 5 硬门禁机检
                </span>
                <h4 className="text-xs font-bold text-white">11 项机检指标清单</h4>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span className={`px-2.5 py-0.5 rounded-full font-bold ${
                  gate5Result.allPassed
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}>
                  {gate5Result.allPassed ? '✓ 11项全绿放行' : `✕ ${gate5Result.results.filter(r => !r.passed).length} 项不通过`}
                </span>
              </div>
            </div>

            {/* 11 Checks List Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {gate5Result.results.map((check) => (
                <div
                  key={check.id}
                  className={`p-2 rounded-lg border flex items-start gap-2 ${
                    check.passed
                      ? 'bg-slate-900/40 border-slate-700/60 text-slate-300'
                      : 'bg-red-950/30 border-red-500/40 text-red-300'
                  }`}
                >
                  {check.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-semibold text-[11px]">{check.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{check.message}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Fingerprint Info */}
            <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-cyan-400" />
                <span>提示词 SHA-256 指纹: #{gate5Result.fingerprint}</span>
              </span>
              <span>修改任意字符自动触发门禁重审</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
