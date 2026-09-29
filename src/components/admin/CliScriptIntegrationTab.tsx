import React, { useState } from 'react';
import { 
  Terminal, 
  Copy, 
  Check, 
  Download, 
  Code, 
  Play, 
  FileText, 
  CheckCircle, 
  Video, 
  Layers, 
  Cpu 
} from 'lucide-react';

export const CliScriptIntegrationTab: React.FC = () => {
  const [selectedShot, setSelectedShot] = useState<'P01' | 'P02' | 'concat'>('P01');
  const [apiKeyInput, setApiKeyInput] = useState<string>('YOUR_RUNNINGHUB_API_KEY');
  const [durationInput, setDurationInput] = useState<number>(10.0);
  const [copied, setCopied] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const p01Command = `# 1. 生成第 1 段 (P01) - 使用多图参考矩阵与提示词：
python3 rh_h3.py \\
  --shot P01 \\
  --duration ${durationInput.toFixed(1)} \\
  --ref-image-0 "workspace/tiedan_character_full.png" \\
  --ref-image-1 "workspace/tiedan_chest_detail.png" \\
  --ref-image-2 "workspace/tiedan_legs_detail.png" \\
  --prompt "铁蛋在菜地拔葱，语调欢快，动作充满弹性节奏感..." \\
  --api-key "${apiKeyInput}"`;

  const p02Command = `# 2. 生成第 2 段 (P02) - 直接将 P01 成片作为视频参考 (Node 175) 连贯接力：
python3 rh_h3.py \\
  --shot P02 \\
  --duration ${durationInput.toFixed(1)} \\
  --ref-video "workspace/tiedan_p01.mp4" \\
  --prompt "承接上一段，铁蛋在木桥上与大黄欢快追逐打闹，喜剧动作跳跃..." \\
  --api-key "${apiKeyInput}"`;

  const concatCommand = `# 3. 多段 FFmpeg 零重影无缝终剪脚本 (Zero-Ghosting Seamless Concat Engine)
# 彻底解决每 10 秒接缝处的重影与叠影（禁用视频淡化混合，自动切除第 2 段起的第 0 帧重复垫图帧）：
ffmpeg -y -v error \\
 -i P01_10s.mp4 -i P02_10s.mp4 -i P03_10s.mp4 -i P04_10s.mp4 -i master_bgm.wav \\
 -filter_complex " \\
   [0:v]setpts=PTS-STARTPTS[v0];[0:a]asetpts=PTS-STARTPTS[a0]; \\
   [1:v]select='gt(n\\\\,0)',setpts=PTS-STARTPTS[v1];[1:a]asetpts=PTS-STARTPTS[a1]; \\
   [2:v]select='gt(n\\\\,0)',setpts=PTS-STARTPTS[v2];[2:a]asetpts=PTS-STARTPTS[a2]; \\
   [3:v]select='gt(n\\\\,0)',setpts=PTS-STARTPTS[v3];[3:a]asetpts=PTS-STARTPTS[a3]; \\
   [v0][v1][v2][v3]concat=n=4:v=1:a=0[vconcat]; \\
   [a0][a1][a2][a3]concat=n=4:v=0:a=1[adialogue]; \\
   [4:a]volume=0.45[abgm]; \\
   [adialogue][abgm]amix=inputs=2:duration=first:dropout_transition=2[aout]" \\
 -map "[vconcat]" -map "[aout]" -c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p \\
 -c:a aac -b:a 192k -movflags +faststart 成片_零重影无缝短剧.mp4`;

  const currentCommand = selectedShot === 'P01' ? p01Command : selectedShot === 'P02' ? p02Command : concatCommand;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('CLI 调度命令行已复制至剪贴板');
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
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <span>CLI 命令行调度器与 Python (rh_h3.py) 脚本集成中台</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            提供与本地终端、CI/CD 自动化流水线及云端 GPU 任务调度器完全一致的 Python CLI 脚本调用命令与零重影终剪命令。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/rh_h3.py"
            download="rh_h3.py"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>下载 rh_h3.py 脚本</span>
          </a>
        </div>
      </div>

      {/* Parameters & Tab Switcher */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedShot('P01')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              selectedShot === 'P01' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            镜头 1 (P01) 多图定妆直出
          </button>
          <button
            onClick={() => setSelectedShot('P02')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              selectedShot === 'P02' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            镜头 2 (P02) 视频参考接力
          </button>
          <button
            onClick={() => setSelectedShot('concat')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              selectedShot === 'concat' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            FFmpeg 零重影无缝短剧终剪
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">时长:</span>
            <select
              value={durationInput}
              onChange={(e) => setDurationInput(parseFloat(e.target.value))}
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono"
            >
              <option value={10.0}>10.0s (243帧)</option>
              <option value={15.0}>15.0s (362帧)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">API Key:</span>
            <input
              type="text"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono w-44"
            />
          </div>
        </div>
      </div>

      {/* Code Display Terminal */}
      <div className="relative rounded-2xl border border-slate-800 bg-slate-950 p-5 font-mono text-xs overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            <span className="text-slate-400 text-[11px] ml-2">bash / zsh terminal execution</span>
          </div>

          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '已复制命令' : '复制终端命令行'}</span>
          </button>
        </div>

        <pre className="text-cyan-300 leading-relaxed overflow-x-auto p-2 scrollbar-thin scrollbar-thumb-slate-800">
          {currentCommand}
        </pre>
      </div>

      {/* Highlights Description */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1.5">
          <div className="font-bold text-slate-200 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>三角度多细节定妆矩阵</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            使用 `--ref-image-0`、`--ref-image-1`、`--ref-image-2` 分别传入全身骨架、胸口特写与下半身细节，保证每一镜服装纹样 100% 留存。
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1.5">
          <div className="font-bold text-slate-200 flex items-center gap-1.5">
            <Video className="w-4 h-4 text-indigo-400" />
            <span>跨段视频参考接力</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            在 P02 使用 `--ref-video "workspace/tiedan_p01.mp4"` 直接注入 Node 175，利用潜在运动特征双通道接力，彻底消灭角色变脸漂移。
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1.5">
          <div className="font-bold text-slate-200 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>零重影无缝终剪切除</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            FFmpeg 脚本自动应用 `select='gt(n,0)'` 剔除后续分镜的第 0 帧重复垫图帧，并以 0.45 混音音量与对白完美契合。
          </p>
        </div>
      </div>
    </div>
  );
};
