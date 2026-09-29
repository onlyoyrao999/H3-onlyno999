import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Trash2, 
  Eye, 
  Terminal, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Video, 
  Layers, 
  Cpu, 
  ExternalLink, 
  Plus, 
  Filter,
  Film,
  Download,
  Maximize2
} from 'lucide-react';
import { H3TaskItem, INITIAL_TASKS } from '../../data/adminConfigData';

export const TaskQueueMonitorTab: React.FC = () => {
  const [tasks, setTasks] = useState<H3TaskItem[]>(INITIAL_TASKS);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<H3TaskItem | null>(tasks[0]);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState<boolean>(false);
  const [isLogFullscreen, setIsLogFullscreen] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // New task form state
  const [newShotId, setNewShotId] = useState('P05');
  const [newTitle, setNewTitle] = useState('铁蛋与老乡田埂挥手道别');
  const [newGenre, setNewGenre] = useState<'short_drama' | 'mv' | 'commercial'>('short_drama');
  const [newDuration, setNewDuration] = useState<number>(10.0);
  const [newParentShot, setNewParentShot] = useState<string>('P04');
  const [newPrompt, setNewPrompt] = useState('中景跟随镜头，铁蛋站在金黄色麦田尽头，红色花布裤套随风摆动，向镜头滑稽有力地挥动铁手，表情屏显现笑脸Emoji...');

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredTasks = tasks.filter(t => {
    if (statusFilter === 'all') return true;
    return t.status === statusFilter;
  });

  const handleCreateTask = () => {
    const frames = Math.round(newDuration * 24.16); // 17n+5 approximation
    const newTask: H3TaskItem = {
      id: `t-${Date.now().toString().slice(-4)}`,
      taskUuid: `rh-job-${Math.floor(100000 + Math.random() * 900000)}-${newShotId.toLowerCase()}`,
      shotId: newShotId,
      title: newTitle,
      genre: newGenre,
      duration: newDuration,
      frames: newDuration === 10 ? 243 : 362,
      aspectRatio: '9:16',
      status: 'queued',
      progress: 0,
      refVideoParentShotId: newParentShot || undefined,
      refImagesCount: 3,
      workerNode: 'GPU-Cluster-US-A100-10',
      costCoins: 35,
      costUsd: 0.35,
      createdAt: new Date().toLocaleTimeString(),
      elapsedSeconds: 0,
      logs: [
        `[${new Date().toLocaleTimeString()}] 任务已进入 H3 调度池，等待分配执行节点...`,
        `[${new Date().toLocaleTimeString()}] 预分配 Node 175 视频继承源: ${newParentShot || '无 (首镜头)'}`,
        `[${new Date().toLocaleTimeString()}] 严格遵循 17n+5 公式锁定 ${newDuration === 10 ? 243 : 362} 帧`
      ]
    };

    setTasks(prev => [newTask, ...prev]);
    setSelectedTask(newTask);
    setIsNewTaskModalOpen(false);
    showToast(`新分镜 ${newShotId} 渲染任务已成功派发至调度队列`);
  };

  const handleSimulateProgress = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        if (t.status === 'completed') return t;
        const newProgress = Math.min(100, t.progress + 30);
        const newStatus = newProgress >= 100 ? 'completed' : 'running';
        const updatedLogs = [...t.logs, `[${new Date().toLocaleTimeString()}] 推理进度推进至 ${newProgress}%...`];
        if (newProgress >= 100) {
          updatedLogs.push(`[${new Date().toLocaleTimeString()}] 视频合成完毕！已触发多角度三细节抽卡接力机。`);
        }
        return {
          ...t,
          progress: newProgress,
          status: newStatus,
          logs: updatedLogs,
          outputVideoUrl: newProgress >= 100 ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' : t.outputVideoUrl
        };
      }
      return t;
    }));
    showToast('任务推理模拟已推进');
  };

  const handleCancelTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'failed', logs: [...t.logs, '[!] 调度员已手动终止任务'] } : t));
    showToast('任务已中断');
  };

  const handleRerunTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { 
      ...t, 
      status: 'running', 
      progress: 15,
      logs: [...t.logs, `[${new Date().toLocaleTimeString()}] 重新唤醒并派发至可用空闲 GPU 算力集群...`] 
    } : t));
    showToast('任务已重新触发排队');
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

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">状态过滤:</span>
          {(['all', 'queued', 'running', 'completed', 'failed'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st === 'all' ? '全部任务' : st === 'queued' ? '排队中' : st === 'running' ? '渲染中' : st === 'completed' ? '已完成' : '失败'}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsNewTaskModalOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-600/20 flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>派发新分镜渲染任务</span>
        </button>
      </div>

      {/* Main Grid: Tasks Table on Left, Live Telemetry & Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Task Queue Table (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>实时任务调度队列 ({filteredTasks.length})</span>
              </h3>
              <span className="text-[11px] text-slate-400">点击列表项查看实时控制台与三角度抽卡</span>
            </div>

            <div className="divide-y divide-slate-800/80 max-h-[580px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
              {filteredTasks.map(t => {
                const isSelected = selectedTask?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTask(t)}
                    className={`p-4 transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-cyan-950/40 border-l-4 border-l-cyan-500' 
                        : 'hover:bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            {t.shotId}
                          </span>
                          <span className="text-xs font-semibold text-slate-100">{t.title}</span>
                          {t.refVideoParentShotId && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                              <Video className="w-3 h-3" />
                              <span>接力 {t.refVideoParentShotId}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                          <span>{t.duration}s ({t.frames}f)</span>
                          <span>·</span>
                          <span>画幅: {t.aspectRatio}</span>
                          <span>·</span>
                          <span>算力: {t.workerNode}</span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="shrink-0 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          t.status === 'completed'
                            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                            : t.status === 'running'
                            ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300 animate-pulse'
                            : t.status === 'queued'
                            ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                            : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                        }`}>
                          {t.status === 'completed' ? '✓ 渲染完成' : t.status === 'running' ? `● 推理中 ${t.progress}%` : t.status === 'queued' ? '○ 排队中' : '✕ 异常'}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1 font-mono">${t.costUsd.toFixed(2)}</div>
                      </div>
                    </div>

                    {/* Progress Bar for Running/Completed */}
                    <div className="mt-3">
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            t.status === 'completed'
                              ? 'bg-emerald-500'
                              : t.status === 'failed'
                              ? 'bg-rose-500'
                              : 'bg-cyan-500'
                          }`}
                          style={{ width: `${t.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Task Detail, Live Terminal & Extracted Keyframes (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedTask ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl space-y-4 p-5 backdrop-blur">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-cyan-500 text-slate-950">
                      {selectedTask.shotId}
                    </span>
                    <h4 className="text-xs font-bold text-slate-200">{selectedTask.title}</h4>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">UUID: {selectedTask.taskUuid}</div>
                </div>

                <div className="flex items-center gap-1.5">
                  {selectedTask.status === 'running' && (
                    <button
                      onClick={() => handleSimulateProgress(selectedTask.id)}
                      className="p-1.5 rounded-lg bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 border border-cyan-500/40 text-xs"
                      title="模拟推进渲染进度"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {selectedTask.status === 'queued' && (
                    <button
                      onClick={() => handleSimulateProgress(selectedTask.id)}
                      className="px-2 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" /> 立即唤醒
                    </button>
                  )}
                  <button
                    onClick={() => handleRerunTask(selectedTask.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs"
                    title="重新排队"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleCancelTask(selectedTask.id)}
                    className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/40 text-xs"
                    title="终止任务"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Video Preview if Completed */}
              {selectedTask.outputVideoUrl && selectedTask.status === 'completed' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-cyan-400" />
                      <span>H3 官流终极版成片渲染结果</span>
                    </span>
                    <a
                      href={selectedTask.outputVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <Download className="w-3 h-3" /> 下载 MP4
                    </a>
                  </div>
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-[9/16] max-h-56 mx-auto border border-slate-800 shadow-inner">
                    <video
                      src={selectedTask.outputVideoUrl}
                      controls
                      loop
                      muted
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Multi-angle Detail Keyframe Extractor Matrix (Core Feature!) */}
              <div className="space-y-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>三角度多细节定妆矩阵 (防止变脸/衣服细节丢失)</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">100% 连贯接力</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  当前镜头渲染完成后，系统自动抽取的 3 张多角度细节图，将无缝灌入下一分镜的 Node 137, 139, 167：
                </p>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="rounded-lg bg-slate-900 border border-slate-800 p-1.5 text-center">
                    <div className="aspect-square rounded bg-slate-950 overflow-hidden mb-1 border border-slate-800">
                      <img 
                        src={selectedTask.extractedKeyframes?.fullBodyUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80"} 
                        alt="Full Body" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-[10px] font-mono text-cyan-300 block font-bold">&lt;Picture 1&gt;</span>
                    <span className="text-[9px] text-slate-400 block truncate">全身定妆卡</span>
                  </div>

                  <div className="rounded-lg bg-slate-900 border border-slate-800 p-1.5 text-center">
                    <div className="aspect-square rounded bg-slate-950 overflow-hidden mb-1 border border-slate-800">
                      <img 
                        src={selectedTask.extractedKeyframes?.upperDetailUrl || "https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=200&q=80"} 
                        alt="Upper Detail" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-[10px] font-mono text-blue-300 block font-bold">&lt;Picture 2&gt;</span>
                    <span className="text-[9px] text-slate-400 block truncate">胸口标识特写</span>
                  </div>

                  <div className="rounded-lg bg-slate-900 border border-slate-800 p-1.5 text-center">
                    <div className="aspect-square rounded bg-slate-950 overflow-hidden mb-1 border border-slate-800">
                      <img 
                        src={selectedTask.extractedKeyframes?.lowerDetailUrl || "https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=200&q=80"} 
                        alt="Lower Detail" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-[10px] font-mono text-purple-300 block font-bold">&lt;Picture 3&gt;</span>
                    <span className="text-[9px] text-slate-400 block truncate">下半身裤套细节</span>
                  </div>
                </div>
              </div>

              {/* Terminal Logs Window */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>执行终端日志 (Node-by-Node Telemetry)</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{selectedTask.logs.length} 条记录</span>
                </div>

                <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 font-mono text-[11px] text-slate-300 max-h-44 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
                  {selectedTask.logs.map((lg, idx) => (
                    <div key={idx} className="leading-relaxed">
                      <span className="text-cyan-500 font-bold">&gt;</span> {lg}
                    </div>
                  ))}
                  <div className="text-emerald-400 animate-pulse">● 监听中...</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 rounded-2xl border border-dashed border-slate-800 flex items-center justify-center text-xs text-slate-500">
              请在左侧选择一个任务以查看其详细遥测信息
            </div>
          )}
        </div>
      </div>

      {/* New Task Modal */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>派发新分镜至 MiniMax H3 官方出片流</span>
              </h3>
              <button 
                onClick={() => setIsNewTaskModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">分镜编号 (Shot ID)</label>
                  <input
                    type="text"
                    value={newShotId}
                    onChange={(e) => setNewShotId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">影视题材</label>
                  <select
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="short_drama">竖版短剧 (9:16)</option>
                    <option value="mv">音乐 MV (16:9)</option>
                    <option value="commercial">商业广告 (16:9 / 9:16)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">镜头标题</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">生成时长 (17n+5 公式)</label>
                  <select
                    value={newDuration}
                    onChange={(e) => setNewDuration(parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  >
                    <option value={10.0}>10.0 秒 (严格 243 帧)</option>
                    <option value={15.0}>15.0 秒 (严格 362 帧)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">🎬 跨段接力父视频 (Node 175)</label>
                  <select
                    value={newParentShot}
                    onChange={(e) => setNewParentShot(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">无 (第一镜头·冷启动)</option>
                    <option value="P01">接力 P01 (清晨拔葱成片)</option>
                    <option value="P02">接力 P02 (戏耍大黄成片)</option>
                    <option value="P03">接力 P03 (独轮车狂奔)</option>
                    <option value="P04">接力 P04 (夕阳大合照)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">提示词内容 (自动脱敏与格式编排)</label>
                <textarea
                  rows={3}
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsNewTaskModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                取消
              </button>
              <button
                onClick={handleCreateTask}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white flex items-center gap-1.5 shadow-md"
              >
                <Play className="w-3.5 h-3.5" />
                <span>立即派发并排队</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
