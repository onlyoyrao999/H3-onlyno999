import React, { useState, useMemo } from 'react';
import {
  Sparkles, ShieldCheck, AlertCircle, CheckCircle2, Copy, Check, ArrowRight,
  RefreshCw, BookOpen, ExternalLink, HelpCircle, VolumeX, EyeOff, MicOff, Ban, Sliders,
  Film, Smartphone, Monitor, Square, Tv, Compass, FileText, CheckCheck, Play, Clock,
  Swords, Shield, Zap, Flame, Crosshair
} from 'lucide-react';
import {
  AspectRatioType,
  ASPECT_RATIO_CONFIGS,
  DEMO_DRAMA_SEGMENTS,
  DramaSegmentShot,
  ProductionGenre,
  PRODUCTION_GENRES
} from '../data/h3PipelineData';
import {
  validateH3Prompt,
  convertAwesomeSeedanceToH3,
  H3ValidationResult,
  FORBIDDEN_WORDS_LEXICON,
  buildCompliantNegativePrompt,
  applySuppressionToPrompt,
  STORY_ARCHETYPES,
  StoryArchetype
} from '../utils/h3PromptEngine';
import { SPEAKER_AUDIO_PROFILES } from '../data/audioReferenceData';
import { planDurationPartition, extractDurationFromPrompt } from '../utils/durationAutoPlanner';

interface H3PromptLabTabProps {
  onJumpToDispatch?: () => void;
}

export const H3PromptLabTab: React.FC<H3PromptLabTabProps> = ({ onJumpToDispatch }) => {
  // Step & Mode State
  const [activeStep, setActiveStep] = useState<'step1_seedance' | 'step2_h3_ref2va' | 'step3_negative_shield'>('step1_seedance');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('16:9');
  const [targetGenre, setTargetGenre] = useState<ProductionGenre>('wuxia_fight');
  const [selectedArchetype, setSelectedArchetype] = useState<StoryArchetype>(STORY_ARCHETYPES[0]);
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<'S1' | 'S2' | 'S3'>('S1');

  // Input & Output
  const [customStoryInput, setCustomStoryInput] = useState<string>(STORY_ARCHETYPES[0].seedanceProse);
  const [customDialogue, setCustomDialogue] = useState<string>(STORY_ARCHETYPES[0].dialogue);
  const [convertedOutput, setConvertedOutput] = useState<string>(() => {
    return convertAwesomeSeedanceToH3(STORY_ARCHETYPES[0].seedanceProse, {
      genre: STORY_ARCHETYPES[0].genre,
      aspectRatio: '9:16',
      speakerId: 'S1',
      dialogue: STORY_ARCHETYPES[0].dialogue,
      suppressBgm: true,
      enforceLipsStill: false
    });
  });

  const [validationResult, setValidationResult] = useState<H3ValidationResult>(() => {
    const initialPrompt = convertAwesomeSeedanceToH3(STORY_ARCHETYPES[0].seedanceProse, {
      genre: STORY_ARCHETYPES[0].genre,
      aspectRatio: '9:16',
      speakerId: 'S1',
      dialogue: STORY_ARCHETYPES[0].dialogue,
      suppressBgm: true,
      enforceLipsStill: false
    });
    return validateH3Prompt(initialPrompt);
  });

  // Suppression Switches (User Request: 静止出现, 背景音乐, 字幕 · 纯净对白禁止提示词)
  const [suppressBgm, setSuppressBgm] = useState<boolean>(true); // 默认静止/禁用模型自带 BGM
  const [suppressScreenText, setSuppressScreenText] = useState<boolean>(true); // 默认禁止出现字幕与文字
  const [enforceLipsStill, setEnforceLipsStill] = useState<boolean>(false); // 强制嘴唇绝对静止闭合

  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [copiedNegative, setCopiedNegative] = useState<boolean>(false);

  // User Natural Language Target Duration (e.g. 20s, 30s, 60s) & Auto-Partition Plan
  const [targetDurationSeconds, setTargetDurationSeconds] = useState<number>(30);
  const durationPartitionPlan = useMemo(() => {
    return planDurationPartition(targetDurationSeconds);
  }, [targetDurationSeconds]);

  const currentArConfig = ASPECT_RATIO_CONFIGS[aspectRatio] || ASPECT_RATIO_CONFIGS['9:16'];
  const currentSpeaker = SPEAKER_AUDIO_PROFILES.find(s => s.speakerId === selectedSpeakerId) || SPEAKER_AUDIO_PROFILES[0];

  const currentNegativePrompt = buildCompliantNegativePrompt({
    isLipSync: !enforceLipsStill,
    suppressBgm: suppressBgm
  });

  // Handle Preset Selection
  const handleSelectArchetype = (arch: StoryArchetype) => {
    setSelectedArchetype(arch);
    setTargetGenre(arch.genre);
    setAspectRatio(arch.aspectRatio);
    setSelectedSpeakerId(arch.speakerId);
    setCustomStoryInput(arch.seedanceProse);
    setCustomDialogue(arch.dialogue);

    const converted = convertAwesomeSeedanceToH3(arch.seedanceProse, {
      genre: arch.genre,
      aspectRatio: arch.aspectRatio,
      speakerId: arch.speakerId,
      dialogue: arch.dialogue,
      suppressBgm,
      enforceLipsStill
    });
    setConvertedOutput(converted);
    setValidationResult(validateH3Prompt(converted));
  };

  // Run Conversion from Awesome-Seedance to MiniMax H3
  const handleRunConversion = () => {
    const converted = convertAwesomeSeedanceToH3(customStoryInput, {
      genre: targetGenre,
      aspectRatio,
      speakerId: selectedSpeakerId,
      dialogue: customDialogue,
      suppressBgm,
      enforceLipsStill
    });

    setConvertedOutput(converted);
    setValidationResult(validateH3Prompt(converted));
    setActiveStep('step2_h3_ref2va');
  };

  // Re-apply suppressions to output
  const handleApplySuppression = (newBgm: boolean, newLips: boolean) => {
    setSuppressBgm(newBgm);
    setEnforceLipsStill(newLips);

    const converted = convertAwesomeSeedanceToH3(customStoryInput, {
      genre: targetGenre,
      aspectRatio,
      speakerId: selectedSpeakerId,
      dialogue: customDialogue,
      suppressBgm: newBgm,
      enforceLipsStill: newLips
    });

    setConvertedOutput(converted);
    setValidationResult(validateH3Prompt(converted));
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(convertedOutput);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyNegative = () => {
    navigator.clipboard.writeText(currentNegativePrompt);
    setCopiedNegative(true);
    setTimeout(() => setCopiedNegative(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header and Core Mission Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-semibold border border-cyan-500/30">
                SOP 两段式规划器
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
                Awesome-Seedance 故事 ➔ MiniMax H3 官方转译
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
                全画幅比例支持
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Sparkles className="w-6 h-6 text-cyan-400" />
              <span>H3 官方 Ref2VA 提示词工坊与故事架构中台</span>
            </h1>
            {/* 3-Skill Ironclad Pipeline Visualizer */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Skill 1 (焊死) 创意句子/分镜</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-semibold">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>Skill 2 (焊死) H3官方六段式转译</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 font-semibold">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                <span>Skill 3 (插拔可换) 云端一键图片/视频接口</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              <strong>前两步绝对焊死</strong>：创意句子必须经由 Skill 1 输出结构，严禁跳步；Skill 2 强制转译为 H3 官方认的六段式并锁死零字幕；
              <strong>第三步为通用插拔管道</strong>：可根据需要随时更换 RunningHub、Qwen-Image 或自建 ComfyUI 云端一键生图接口。
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <a
              href="https://github.com/onlyoyrao999/awesome-seedance"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Seedance 故事库</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
            <a
              href="https://github.com/onlyoyrao999/MiniMax-H3"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-950 hover:bg-cyan-900 text-cyan-200 border border-cyan-500/40 transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>MiniMax-H3 官方规范</span>
              <ExternalLink className="w-3 h-3 text-cyan-400" />
            </a>
          </div>
        </div>

        {/* Global Aspect Ratio Selector Bar */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white font-mono uppercase">
                画幅比例契约 (Aspect Ratio Specification)
              </span>
              <span className="text-[10px] text-slate-400">
                （不只有竖屏！使用 Skill 时一律明确声明比例与分辨率）
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
              <span>当前: {currentArConfig.name}</span>
              <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-[10px]">
                {currentArConfig.comfyValue}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {(Object.keys(ASPECT_RATIO_CONFIGS) as AspectRatioType[]).map((arKey) => {
              const cfg = ASPECT_RATIO_CONFIGS[arKey];
              const isSelected = aspectRatio === arKey;
              return (
                <button
                  key={arKey}
                  onClick={() => {
                    setAspectRatio(arKey);
                    // auto re-convert
                    const converted = convertAwesomeSeedanceToH3(customStoryInput, {
                      genre: targetGenre,
                      aspectRatio: arKey,
                      speakerId: selectedSpeakerId,
                      dialogue: customDialogue,
                      suppressBgm,
                      enforceLipsStill
                    });
                    setConvertedOutput(converted);
                    setValidationResult(validateH3Prompt(converted));
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all relative ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 ring-1 ring-cyan-500/40 shadow-md'
                      : 'bg-slate-900 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-mono">{cfg.label}</span>
                    <span className="text-[10px] text-slate-400">
                      {cfg.orientation === 'vertical' ? '竖屏' : cfg.orientation === 'horizontal' ? '横屏' : '方形'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-1">
                    文生图: {cfg.image1MpRes}
                  </div>
                  <div className="text-[10px] text-cyan-400/90 font-mono truncate">
                    H3视频: {cfg.video04MpRes}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Natural Language Duration Auto-Partition Chaining Bar */}
        <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/40 space-y-3 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-white font-mono uppercase">
                指令时长智能自适应解析与分段规划器 (Auto-Duration Partition Engine)
              </span>
              <span className="text-[10px] text-indigo-300 bg-indigo-950/70 px-2 py-0.5 rounded border border-indigo-500/30">
                零感知自适应 10s / 15s 官流规格
              </span>
            </div>
            <div className="text-xs font-mono text-slate-400">
              用户指令: <span className="text-cyan-300 font-bold">"{targetDurationSeconds} 秒短片"</span> ➔ 实际总长: <span className="text-purple-300 font-bold">{durationPartitionPlan.actualTotalSeconds} 秒</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400">常见用户指令直选:</span>
            {[
              { label: '10秒广告 (1段)', sec: 10 },
              { label: '15秒标准 (1段)', sec: 15 },
              { label: '20秒短片 (2段×10s)', sec: 20 },
              { label: '30秒高能 (2段×15s)', sec: 30 },
              { label: '45秒叙事 (3段×15s)', sec: 45 },
              { label: '60秒微短剧 (4段×15s)', sec: 60 }
            ].map(pill => (
              <button
                key={pill.sec}
                type="button"
                onClick={() => setTargetDurationSeconds(pill.sec)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all ${
                  targetDurationSeconds === pill.sec
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-md ring-1 ring-indigo-400'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-850 hover:text-white'
                }`}
              >
                {pill.label}
              </button>
            ))}

            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-[11px] text-slate-400 font-mono">自定义秒数:</span>
              <input
                type="number"
                min="5"
                max="300"
                value={targetDurationSeconds}
                onChange={(e) => setTargetDurationSeconds(Math.max(5, parseInt(e.target.value) || 15))}
                className="w-16 bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs font-mono text-cyan-300 text-center focus:outline-none focus:border-cyan-500"
              />
              <span className="text-xs text-slate-400">秒</span>
            </div>
          </div>

          {/* Detailed Chaining Visualization */}
          <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="text-xs text-slate-200 font-medium flex items-center justify-between">
              <span>{durationPartitionPlan.summary}</span>
              <span className="text-[11px] font-mono text-emerald-400">
                ✅ 自动编排完成（{durationPartitionPlan.segmentCount} 个执行阶段）
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
              {durationPartitionPlan.segments.map((seg) => (
                <div
                  key={seg.segmentIndex}
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/90 space-y-1 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="font-bold text-cyan-300">分段 #{seg.segmentIndex}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      {seg.duration}.0s ({seg.frames} 帧)
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-medium truncate">{seg.role}</div>
                  <div className="text-[10px] text-slate-400 leading-tight">
                    {seg.tailFramePadRequired ? (
                      <span className="text-amber-400">📸 截取第 {seg.frames} 尾帧垫图 ➔ 传给下一段</span>
                    ) : (
                      <span className="text-emerald-400">🎬 终极成片收尾段</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Two-Stage Workflow Steps Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveStep('step1_seedance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
            activeStep === 'step1_seedance'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-amber-500/30 text-amber-300 flex items-center justify-center text-[10px] font-mono">1</span>
          <span>阶段一：Awesome-Seedance 故事/剧本构思</span>
        </button>

        <button
          onClick={() => setActiveStep('step2_h3_ref2va')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
            activeStep === 'step2_h3_ref2va'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-cyan-500/30 text-cyan-300 flex items-center justify-center text-[10px] font-mono">2</span>
          <span>阶段二：MiniMax H3 官方 Ref2VA 规范转译</span>
        </button>

        <button
          onClick={() => setActiveStep('step3_negative_shield')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
            activeStep === 'step3_negative_shield'
              ? 'bg-red-500/20 text-red-300 border-red-500/50 shadow-sm'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-red-500/30 text-red-300 flex items-center justify-center text-[10px] font-mono">3</span>
          <span>阶段三：H3 负向护盾 (静止/防乱说话/背景音乐/纯净度)</span>
        </button>
      </div>

      {/* STEP 1: Awesome-Seedance Narrative & Story Archetypes */}
      {activeStep === 'step1_seedance' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>阶段一：调用 Awesome-Seedance 设计故事戏剧弧光与镜头散文</span>
              </h2>
              <p className="text-xs text-slate-400">
                先用 Seedance 的自然叙事力自由设计冲突、人物情感与世界观。随后通过转译器消除导致 H3 崩脸、裁头和乱码字幕的硬伤。
              </p>
            </div>
            <span className="text-xs font-mono text-amber-400/80 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
              自由创作 ➔ 严密规整
            </span>
          </div>

          {/* Mode & Genre Switcher Bar */}
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-950 border border-slate-800 flex-wrap">
            <span className="text-xs font-bold text-slate-400 px-2 font-mono">选择题材/模式:</span>
            {[
              { id: 'wuxia_fight' as ProductionGenre, label: '⚔️ 武侠仙法·动作打斗 (Fight FX Anchor)', badge: '官方固化 Skill' },
              { id: 'short_drama' as ProductionGenre, label: '🎭 竖版短剧 (Short Drama)', badge: '15s×4段' },
              { id: 'commercial' as ProductionGenre, label: '🎬 商业广告 (Commercials)', badge: '微距质感' }
            ].map(m => {
              const isActive = targetGenre === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setTargetGenre(m.id);
                    const matchingArch = STORY_ARCHETYPES.find(a => a.genre === m.id) || STORY_ARCHETYPES[0];
                    handleSelectArchetype(matchingArch);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white shadow-md ring-1 ring-amber-400/50'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  <span>{m.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isActive ? 'bg-black/30 text-amber-200' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {m.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Dedicated Fight FX Anchor Prompter Solidified Skill Banner */}
          {targetGenre === 'wuxia_fight' && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-red-950/30 to-slate-950 border border-amber-500/50 space-y-3 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/30 pb-2">
                <div className="flex items-center gap-2">
                  <Swords className="w-5 h-5 text-amber-400 animate-pulse" />
                  <span className="text-sm font-bold text-white font-mono">
                    ⚔️ 动作打斗戏·武侠仙法·特效锚点系统 (Fight FX Anchor Prompter)
                  </span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40 font-semibold font-mono">
                    Skill 已官方固化
                  </span>
                </div>
                <span className="text-xs text-amber-300/80 font-mono">
                  杜绝穿模 · 武器刚体锁 · 严禁乱说话
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-black/40 border border-amber-500/20 space-y-1">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>特效锚点三段时序 (3-Stage FX)</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    [0~1.5s 蓄力发力] ➔ [1.5~2.5s 接触碰撞火花/光爆] ➔ [2.5~4.5s 犁地后退阻尼]，绝不写空洞形容词。
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-black/40 border border-red-500/20 space-y-1">
                  <div className="font-bold text-red-300 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-red-400" />
                    <span>防乱说话短喝台词锁 (Anti-Hallucination)</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    打斗高危状态，台词严限短促战吼（≤6字，如破！斩！纳命来！），音效清除背景音乐，防止模型胡言乱语。
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-black/40 border border-cyan-500/20 space-y-1">
                  <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                    <span>武器刚体与抗穿模 (Rigid Body Lock)</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    长剑/长刀/长枪几何线条刚体锁死不变软，二人空间分离独立，火花气浪不污染面部。
                  </p>
                </div>
              </div>

              {/* Quick Insertion Anchor Tags */}
              <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-amber-500/20 text-xs">
                <span className="text-slate-400 font-mono text-[11px]">快捷插入招式锚点:</span>
                {[
                  { label: '🗡️ 万剑归宗剑流', text: '胸前秋水古剑青霜暴涨，百柄白金虚幻飞剑如孔雀开屏在身后两米展开，剑气激荡撕开云海狂涌向前，' },
                  { label: '⚔️ 枪尖回马磕飞刀', text: '腰马合一猛然回身旋枪，枪尖在身侧一米处连磕三枚飞刀暴出刺目金铁火星，借回身之势直刺阴影，' },
                  { label: '⚡ 紫霄神雷掌心雷', text: '右手五指紧握，指缝间压抑不住地喷射出耀目炽白电芒，空气充斥焦糊味，猛然推出掌心雷，' },
                  { label: '🛡️ 护体罡气涟漪', text: '周身升起凝厚淡金琉璃护罩，表面流淌八卦符篆微光，受到轰击泛起剧烈金色涟漪随后龟裂爆碎，' },
                  { label: '🥋 刀剑硬架火花', text: '短刀与长枪硬撞爆出一团刺目金石火星，震散周身暴雨，双足在青石板向后倒滑三尺犁出深深泥槽，' }
                ].map(tag => (
                  <button
                    key={tag.label}
                    type="button"
                    onClick={() => {
                      setCustomStoryInput(prev => prev + tag.text);
                    }}
                    className="px-2 py-1 rounded bg-amber-500/20 text-amber-200 border border-amber-500/30 hover:bg-amber-500/30 text-[11px] font-mono transition"
                  >
                    + {tag.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Archetype Quick-Select Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {STORY_ARCHETYPES.filter(a => targetGenre === 'wuxia_fight' ? (a.genre === 'wuxia_fight' || a.id.includes('tiedan') || a.id.includes('dining')) : true).map((arch) => {
              const isSelected = selectedArchetype.id === arch.id;
              return (
                <div
                  key={arch.id}
                  onClick={() => handleSelectArchetype(arch)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'bg-amber-950/30 border-amber-500/60 ring-1 ring-amber-500/40 shadow-lg'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{arch.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {arch.aspectRatio}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">
                    {arch.seedanceProse}
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800">
                    <span>题材: {arch.genre}</span>
                    <span className="text-amber-400 font-semibold">载入并测试 ➔</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Seedance Story Editor & Why It Fails in H3 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-300 font-mono flex items-center gap-1.5">
                    <span>Awesome-Seedance 故事/剧本散文 (输入可自由修改)</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    包含角色动作、环境描写、台词与镜头
                  </span>
                </div>

                <textarea
                  value={customStoryInput}
                  onChange={(e) => setCustomStoryInput(e.target.value)}
                  rows={6}
                  className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-amber-500/50 resize-y"
                  placeholder="在此输入任意自然语言视频提示词或故事剧本..."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      核心台词 (注入 &lt;d&gt; 标签，汉字书写):
                    </label>
                    <input
                      type="text"
                      value={customDialogue}
                      onChange={(e) => setCustomDialogue(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500/50"
                      placeholder="台词内容..."
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      主讲说话人音色绑定:
                    </label>
                    <div className="flex items-center gap-2">
                      {(['S1', 'S2', 'S3'] as const).map((sId) => (
                        <button
                          key={sId}
                          onClick={() => setSelectedSpeakerId(sId)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition border ${
                            selectedSpeakerId === sId
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          ({sId})
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <span className="text-xs text-slate-400">
                    准备就绪后，执行 H3 官方规范转译 ➔
                  </span>
                  <button
                    onClick={handleRunConversion}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-600 to-cyan-600 hover:from-amber-500 hover:to-cyan-500 text-white shadow-lg transition-all"
                  >
                    <span>一键转译为 MiniMax H3 官方 Ref2VA</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Diagnostic Panel: Why Seedance Direct Execution Fails */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 space-y-3">
                <div className="flex items-center gap-2 text-red-400 font-bold text-xs font-mono">
                  <AlertCircle className="w-4 h-4" />
                  <span>为什么这段 Seedance 散文绝对不能直接喂给 H3？</span>
                </div>

                <p className="text-[11px] text-red-200/90 leading-relaxed">
                  {selectedArchetype.whySeedanceFailsInH3}
                </p>

                <div className="space-y-2 pt-2 border-t border-red-500/20 text-[11px] text-slate-300">
                  <div className="flex items-start gap-2">
                    <span className="text-red-400 font-bold">1. 裁头风险:</span>
                    <span>散文中的 close-up 在 H3 会造成相机向斜上方推移，头顶出画只剩身子。</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-400 font-bold">2. 反向字幕:</span>
                    <span>正向出现 "no text, no subtitles"，H3 越点名越反向烧出两行乱码伪字幕。</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-400 font-bold">3. 散乱配乐:</span>
                    <span>若不剥离模型配乐，各段自带 BGM 会在切片接缝处发生爆音与调性断裂。</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: MiniMax H3 Official Ref2VA Transpilation Result */}
      {activeStep === 'step2_h3_ref2va' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <span>阶段二：MiniMax H3 官方 Ref2VA 六段式转译成果与硬门禁拦截</span>
              </h2>
              <p className="text-xs text-slate-400">
                已注入官方六段式架构、宽景全身防裁头锁定、(Sx) 说话人绑定、&lt;d&gt; 台词标签、以及画幅比例参数。
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyPrompt}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow transition"
              >
                {copiedPrompt ? <CheckCheck className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPrompt ? '已复制 Ref2VA' : '复制官方 Prompt'}</span>
              </button>

              {onJumpToDispatch && (
                <button
                  onClick={onJumpToDispatch}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow transition"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>前往 RH 云端出片 ➔</span>
                </button>
              )}
            </div>
          </div>

          {/* Validation Score Bar */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-mono font-bold text-lg">
                {validationResult.score}
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>H3 官方门禁合规评分:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                    validationResult.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {validationResult.passed ? '100% 满分通过' : '有警报项'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  检测到段落: {validationResult.detectedSections.length} / 6 | 裁头风险: {validationResult.headCutoffRisk} | 换算帧数: {validationResult.calculatedFrames} 帧
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span>画幅: <strong className="text-cyan-400">{currentArConfig.label}</strong></span>
              <span>·</span>
              <span>主讲人: <strong className="text-emerald-400">({selectedSpeakerId}) {currentSpeaker.name}</strong></span>
              <span>·</span>
              <span>BGM 剥离: <strong className={suppressBgm ? 'text-purple-400' : 'text-slate-500'}>{suppressBgm ? '已静止' : '放行'}</strong></span>
            </div>
          </div>

          {/* Prompt Display and Section Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-4">
              {/* Fight FX Physical Audit Card when action scene */}
              {(targetGenre === 'wuxia_fight' || /刀|剑|枪|拳|掌|刺客|飞刀|打斗|拼杀|对决|神雷|仙法/i.test(convertedOutput)) && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-black border border-amber-500/40 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold font-mono">
                    <span className="text-amber-300 flex items-center gap-1.5">
                      <Swords className="w-4 h-4 text-amber-400" />
                      <span>⚔️ Fight FX Anchor 动作戏物理与防乱说话核查:</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      防穿模 · 防变软 · 防乱说话生效中
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                    <div className="p-2 rounded bg-black/40 border border-slate-800 space-y-0.5">
                      <div className="text-slate-400">空间接触锚点</div>
                      <div className="text-amber-300 font-bold flex items-center gap-1">
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>锁定碰撞面</span>
                      </div>
                    </div>

                    <div className="p-2 rounded bg-black/40 border border-slate-800 space-y-0.5">
                      <div className="text-slate-400">防乱说话门禁</div>
                      <div className="text-emerald-300 font-bold flex items-center gap-1">
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>短促战吼(≤6字)</span>
                      </div>
                    </div>

                    <div className="p-2 rounded bg-black/40 border border-slate-800 space-y-0.5">
                      <div className="text-slate-400">武器几何刚体</div>
                      <div className="text-cyan-300 font-bold flex items-center gap-1">
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>锁死不弯软</span>
                      </div>
                    </div>

                    <div className="p-2 rounded bg-black/40 border border-slate-800 space-y-0.5">
                      <div className="text-slate-400">动作物理拟音</div>
                      <div className="text-purple-300 font-bold flex items-center gap-1">
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>金石拟音/禁BGM</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-slate-800">
                  <span>MiniMax H3 官方 Ref2VA 规范文本 (完全可出片):</span>
                  <span className="text-cyan-400">满足 17n+5 与 6-section 标准</span>
                </div>

                <div className="p-4 rounded-lg bg-black/80 font-mono text-xs text-slate-200 leading-relaxed border border-slate-800/80 max-h-[500px] overflow-y-auto whitespace-pre-wrap select-text">
                  {convertedOutput}
                </div>
              </div>
            </div>

            {/* Checklist & Gate Auditing Items */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>六道核心硬规拦截清单</span>
                </h3>

                <div className="space-y-2">
                  {validationResult.items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                        item.passed
                          ? 'bg-slate-950/60 border-slate-800 text-slate-300'
                          : item.severity === 'error'
                          ? 'bg-red-950/30 border-red-500/40 text-red-200'
                          : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5">
                          {item.passed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                          )}
                          <span>{item.name}</span>
                        </span>
                        <span className="text-[10px] font-mono">
                          {item.passed ? 'PASS' : 'WARN'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {item.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: H3 Negative Constraints & Suppression Shield */}
      {activeStep === 'step3_negative_shield' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Ban className="w-5 h-5 text-red-400" />
                <span>阶段三：H3 负向禁令护盾 (静止出现 · 背景音乐 · 字幕 · 负向提示词词库)</span>
              </h2>
              <p className="text-xs text-slate-400">
                严格锁定负向词库：杜绝模型乱加自带 BGM 导致拼片断层、杜绝画面乱码伪字幕、杜绝无声镜头乱动嘴、杜绝打斗戏乱说话。
              </p>
            </div>
          </div>

          {/* 4 Interactive Suppression Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Control 1: Suppress BGM */}
            <div
              onClick={() => handleApplySuppression(!suppressBgm, enforceLipsStill)}
              className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                suppressBgm
                  ? 'bg-purple-950/30 border-purple-500/60 ring-1 ring-purple-500/30 shadow-lg'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <VolumeX className="w-4 h-4 text-purple-400" />
                  <span>1. 静止/禁止出现背景音乐</span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  suppressBgm ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-500'
                }`}>
                  {suppressBgm ? '已开启压制' : '已关闭'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                将 <code>[non_diegetic_music]</code> 强制设为 <strong>None</strong>，在 Negative 中加入 <code>background music, noisy score...</code>，为后期无损全曲 Master BGM 铺底让路。
              </p>
            </div>

            {/* Control 2: Suppress Screen Text - 硬门禁锁死 */}
            <div
              onClick={() => setSuppressScreenText(true)}
              className="p-4 rounded-xl border transition-all cursor-pointer space-y-3 bg-red-950/40 border-red-500/80 ring-2 ring-red-500/40 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <EyeOff className="w-4 h-4 text-red-400" />
                  <span>2. 【硬门禁】严禁生成字幕</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-red-500/30 text-red-200 border border-red-500/50">
                  纯净 0 字幕
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                <strong>双向彻底杜绝：</strong>正向提示词绝不提“no subtitles”类反向敏感词，负向词库强制注入 <code>subtitles, lyrics, captions...</code>。
              </p>
            </div>

            {/* Control 3: Enforce Mouth Still */}
            <div
              onClick={() => handleApplySuppression(suppressBgm, !enforceLipsStill)}
              className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                enforceLipsStill
                  ? 'bg-cyan-950/30 border-cyan-500/60 ring-1 ring-cyan-500/30 shadow-lg'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <MicOff className="w-4 h-4 text-cyan-400" />
                  <span>3. 嘴唇静止 / 禁止开口</span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  enforceLipsStill ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-500'
                }`}>
                  {enforceLipsStill ? '强制闭嘴' : '正常发声'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                非对白镜强制注入 <code>mouth naturally closed, lips completely still</code>，负向压制 <code>singing, mouth open</code>。
              </p>
            </div>

            {/* Control 4: Character Surface Purity - 永久硬门禁锁死 */}
            <div
              className="p-4 rounded-xl border transition-all cursor-pointer space-y-3 bg-emerald-950/40 border-emerald-500/80 ring-2 ring-emerald-500/40 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>4. 【硬门禁】机体/服装防涂鸦锁</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-500/50">
                  绝缘防杂质
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                <strong>防环境注意力外溢：</strong>坚决杜绝背景霓虹在腰部冒出 M 标、大腿长出挂件、衣服冒出印花。正向锚定 <code>pristine solid finish</code>，负向压制 <code>stickers, decals, waist logo, body graffiti, hanging charms</code>。
              </p>
            </div>
          </div>

          {/* Compiled Compliant Negative Prompt Display */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-200 font-mono">
                  全量编译出的合规 Negative Prompt (直接粘贴至 ComfyUI / API)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  {currentNegativePrompt.split(',').length} 项禁令特征
                </span>
              </div>

              <button
                onClick={handleCopyNegative}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                {copiedNegative ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedNegative ? '已复制 Negative' : '复制 Negative Prompt'}</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-black/90 font-mono text-xs text-slate-300 leading-relaxed border border-slate-800/80 max-h-36 overflow-y-auto select-text">
              {currentNegativePrompt}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 text-[11px] font-mono text-slate-400">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-red-400 font-bold">画面纯净与字幕禁用:</span>
                <p className="text-slate-500 text-[10px] truncate">subtitles, captions, text, lyrics, watermark...</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-purple-400 font-bold">配乐防杂音与断层:</span>
                <p className="text-slate-500 text-[10px] truncate">background music, noisy score, bgm, humming...</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-cyan-400 font-bold">嘴唇静止与非口型控制:</span>
                <p className="text-slate-500 text-[10px] truncate">singing, mouth open, lip-sync, talking...</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-emerald-400 font-bold">机甲/服装防涂鸦防贴纸:</span>
                <p className="text-slate-500 text-[10px] truncate">stickers, decals, waist logo, hanging charms, graffiti...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
