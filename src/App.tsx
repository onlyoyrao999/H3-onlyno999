import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { PipelineOverviewTab } from './components/PipelineOverviewTab';
import { H3PromptLabTab } from './components/H3PromptLabTab';
import { ThreeWorkflowAssetStudio } from './components/ThreeWorkflowAssetStudio';
import { AudioConsistencyStudioTab } from './components/AudioConsistencyStudioTab';
import { TimelineBeatTab } from './components/TimelineBeatTab';
import { StoryboardStudioTab } from './components/StoryboardStudioTab';
import { RunningHubDispatchTab } from './components/RunningHubDispatchTab';
import { AlgorithmLabTab } from './components/AlgorithmLabTab';
import { CostLedgerTab } from './components/CostLedgerTab';
import { SkillSpecModal } from './components/SkillSpecModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { DEMO_STORYBOARD, StoryboardShot } from './data/mockPipelineData';
import { ProductionGenre, PRODUCTION_GENRES } from './data/h3PipelineData';
import { validateGate6 } from './utils/pipelineValidators';

export function App() {
  const [currentMode, setCurrentMode] = useState<'admin' | 'studio'>('admin');
  const [genre, setGenre] = useState<ProductionGenre>('short_drama');
  const [activeTab, setActiveTab] = useState<string>('prompt_lab'); // Open directly into the requested H3 prompt lab
  const [hasProtagonist, setHasProtagonist] = useState<boolean>(true);
  const [storyboard, setStoryboard] = useState<StoryboardShot[]>(DEMO_STORYBOARD);
  const [isSpecModalOpen, setIsSpecModalOpen] = useState<boolean>(false);

  const currentGenreMeta = PRODUCTION_GENRES[genre];
  const masterDuration = currentGenreMeta.defaultDuration;

  // Compute metrics
  const gate6Result = useMemo(() => {
    return validateGate6(storyboard, 32.0);
  }, [storyboard]);

  const totalCost = useMemo(() => {
    return storyboard.reduce((sum, s) => sum + s.costUsd, 0) + (genre === 'short_drama' ? 1.4 : 0);
  }, [storyboard, genre]);

  const totalDuration = useMemo(() => {
    return genre === 'short_drama' ? 60.33 : genre === 'commercial' ? 15.08 : storyboard.reduce((sum, s) => sum + s.duration, 0);
  }, [storyboard, genre]);

  const handleToggleProtagonist = () => {
    setHasProtagonist(prev => !prev);
  };

  const handleRerollShot = (shotId: string) => {
    setStoryboard(prev => prev.map(s => {
      if (s.id === shotId) {
        return {
          ...s,
          costUsd: s.costUsd + 0.35,
          pool: 'priority_paid',
          fingerprint: 'reroll_' + Math.random().toString(36).substring(2, 8),
          lagMs: Math.round((Math.random() * 30 - 15) * 10) / 10,
          correlation: Math.round((0.85 + Math.random() * 0.1) * 100) / 100
        };
      }
      return s;
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navigation & Status Bar */}
      <Header
        genre={genre}
        onSelectGenre={setGenre}
        hasProtagonist={hasProtagonist}
        onToggleProtagonist={handleToggleProtagonist}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSpecModal={() => setIsSpecModalOpen(true)}
        totalCost={totalCost}
        totalDuration={totalDuration}
        gate6Passed={gate6Result.passed}
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentMode === 'admin' ? (
          <AdminDashboard onSwitchToStudio={() => setCurrentMode('studio')} />
        ) : (
          <>
            {activeTab === 'overview' && (
              <PipelineOverviewTab onJumpToTab={(tab) => setActiveTab(tab)} />
            )}

            {activeTab === 'prompt_lab' && (
              <H3PromptLabTab onJumpToDispatch={() => setActiveTab('runninghub')} />
            )}

            {activeTab === 'asset_studio' && (
              <ThreeWorkflowAssetStudio />
            )}

            {activeTab === 'audio_studio' && (
              <AudioConsistencyStudioTab />
            )}

            {activeTab === 'timeline' && (
              <TimelineBeatTab genre={genre} />
            )}

            {activeTab === 'storyboard' && (
              <StoryboardStudioTab
                storyboard={storyboard}
                onUpdateStoryboard={setStoryboard}
                hasProtagonist={hasProtagonist}
                masterDuration={32.0}
                onJumpToRunningHub={(_shotId) => setActiveTab('runninghub')}
              />
            )}

            {activeTab === 'runninghub' && (
              <RunningHubDispatchTab
                storyboard={storyboard}
                onUpdateStoryboard={setStoryboard}
              />
            )}

            {activeTab === 'algorithms' && (
              <AlgorithmLabTab />
            )}

            {activeTab === 'ledger' && (
              <CostLedgerTab
                storyboard={storyboard}
                onRerollShot={handleRerollShot}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>H3-AUTO-PIPELINE (V2.2) · MiniMax H3 官流终极版智能管控后台与全自动 SOP 工作台</span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>MiniMax H3 官方 Ref2VA 规范</span>
            <span>·</span>
            <span>三角度多细节定妆矩阵</span>
            <span>·</span>
            <span className="text-cyan-400 font-semibold">RunningHub 云端出片</span>
          </div>
        </div>
      </footer>

      {/* Skill Specifications and Code Modal */}
      <SkillSpecModal
        isOpen={isSpecModalOpen}
        onClose={() => setIsSpecModalOpen(false)}
      />
    </div>
  );
}

export default App;
