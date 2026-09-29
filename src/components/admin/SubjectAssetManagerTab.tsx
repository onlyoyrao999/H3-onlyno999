import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Image as ImageIcon, 
  Music, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  Layers, 
  Sparkles, 
  Tag, 
  Film,
  Camera,
  ExternalLink,
  Save,
  RefreshCw
} from 'lucide-react';
import { CharacterAsset, INITIAL_CHARACTERS } from '../../data/adminConfigData';

export const SubjectAssetManagerTab: React.FC = () => {
  const [characters, setCharacters] = useState<CharacterAsset[]>(INITIAL_CHARACTERS);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterAsset>(characters[0]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingChar, setEditingChar] = useState<CharacterAsset | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSelectCharacter = (char: CharacterAsset) => {
    setSelectedCharacter(char);
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setEditingChar({ ...selectedCharacter });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!editingChar) return;
    setCharacters(prev => prev.map(c => c.id === editingChar.id ? editingChar : c));
    setSelectedCharacter(editingChar);
    setIsEditing(false);
    showToast(`角色【${editingChar.name}】的多角度定妆矩阵已保存`);
  };

  const handleAddAnchorTag = (tag: string) => {
    if (!editingChar || !tag.trim()) return;
    if (editingChar.promptAnchors.includes(tag.trim())) return;
    setEditingChar({
      ...editingChar,
      promptAnchors: [...editingChar.promptAnchors, tag.trim()]
    });
  };

  const handleRemoveAnchorTag = (tagToRemove: string) => {
    if (!editingChar) return;
    setEditingChar({
      ...editingChar,
      promptAnchors: editingChar.promptAnchors.filter(t => t !== tagToRemove)
    });
  };

  const handleCreateNewCharacter = () => {
    const newChar: CharacterAsset = {
      id: `c-${Date.now()}`,
      name: '新主体角色',
      codeName: `char_${Math.random().toString(36).substring(2, 7)}`,
      roleType: 'supporting',
      description: '设定角色外貌特征、代表服饰与材质...',
      promptAnchors: ['新角色面容', '特征服饰'],
      refSlots: {
        picture1_fullBody: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80',
        picture2_upperDetail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
        picture3_lowerDetail: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=80'
      },
      associatedShotsCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setCharacters(prev => [newChar, ...prev]);
    setSelectedCharacter(newChar);
    setEditingChar(newChar);
    setIsEditing(true);
    showToast('已创建新主体母本，请配置多角度卡槽');
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

      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>MiniMax H3 主体角色与多角度细节资产中台</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            彻底杜绝变脸与服装细节丢失的核心机制：将角色的【全身比例】、【胸部面容特写】与【裤套腿履细节】分置于 3 个多角度插槽，
            在生成时作为 &lt;Picture 1~3&gt; (Node 137, 139, 167) 强绑定灌入。
          </p>
        </div>

        <button
          onClick={handleCreateNewCharacter}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-600/20 flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>录入新主体/场景母本</span>
        </button>
      </div>

      {/* Grid: Character List on Left (4 cols), Detail Editor on Right (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Character List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            资产库角色主体 ({characters.length})
          </div>

          <div className="space-y-2">
            {characters.map(char => {
              const isSelected = selectedCharacter.id === char.id;
              return (
                <div
                  key={char.id}
                  onClick={() => handleSelectCharacter(char)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-700 overflow-hidden shrink-0">
                    <img 
                      src={char.refSlots.picture1_fullBody} 
                      alt={char.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-100 truncate">{char.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0">
                        {char.roleType === 'protagonist' ? '主角' : char.roleType === 'creature' ? '生物' : '场景'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">{char.codeName}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">关联出片分镜: {char.associatedShotsCount} 个</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Multi-Angle Slot Matrix & Detail Editor (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur shadow-xl space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-100">
                    {isEditing ? editingChar?.name : selectedCharacter.name}
                  </h3>
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/40">
                    {isEditing ? editingChar?.codeName : selectedCharacter.codeName}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {isEditing ? editingChar?.description : selectedCharacter.description}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5 shadow-md"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>保存定妆修改</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleStartEdit}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>编辑资产卡</span>
                  </button>
                )}
              </div>
            </div>

            {/* THE CORE: 3-SLOT MULTI-ANGLE CHARACTER MATRIX */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <span>H3 官流多角度三槽位定妆矩阵 (Multi-Detail Slots)</span>
                </span>
                <span className="text-[11px] text-cyan-300 font-mono">100% 杜绝变脸/服装漂移机制</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Slot 1: Picture 1 Full Body */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/50 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-cyan-500 text-slate-950 font-black">
                      &lt;Picture 1&gt;
                    </span>
                    <span className="text-[10px] text-cyan-300 font-mono">Node 137</span>
                  </div>
                  <div className="text-xs font-bold text-slate-200">全身定妆卡 (Full-Body)</div>
                  <div className="aspect-[3/4] rounded-lg bg-slate-900 overflow-hidden border border-slate-800 relative group">
                    <img 
                      src={isEditing ? editingChar?.refSlots.picture1_fullBody : selectedCharacter.refSlots.picture1_fullBody} 
                      alt="Full Body" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2">
                      <span className="text-[10px] text-slate-300 font-medium">锁定人物骨架比例与整体站姿</span>
                    </div>
                  </div>
                  {isEditing && (
                    <input
                      type="text"
                      value={editingChar?.refSlots.picture1_fullBody}
                      onChange={(e) => setEditingChar(prev => prev ? {
                        ...prev,
                        refSlots: { ...prev.refSlots, picture1_fullBody: e.target.value }
                      } : null)}
                      placeholder="图片 URL 或路径"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] font-mono text-slate-200"
                    />
                  )}
                </div>

                {/* Slot 2: Picture 2 Upper Body Detail */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-blue-500/50 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-blue-500 text-slate-950 font-black">
                      &lt;Picture 2&gt;
                    </span>
                    <span className="text-[10px] text-blue-300 font-mono">Node 139</span>
                  </div>
                  <div className="text-xs font-bold text-slate-200">胸口标识特写 (Upper Detail)</div>
                  <div className="aspect-[3/4] rounded-lg bg-slate-900 overflow-hidden border border-slate-800 relative group">
                    <img 
                      src={isEditing ? editingChar?.refSlots.picture2_upperDetail : selectedCharacter.refSlots.picture2_upperDetail} 
                      alt="Upper Detail" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2">
                      <span className="text-[10px] text-slate-300 font-medium">锁定“铁蛋”徽标与表情Emoji屏</span>
                    </div>
                  </div>
                  {isEditing && (
                    <input
                      type="text"
                      value={editingChar?.refSlots.picture2_upperDetail}
                      onChange={(e) => setEditingChar(prev => prev ? {
                        ...prev,
                        refSlots: { ...prev.refSlots, picture2_upperDetail: e.target.value }
                      } : null)}
                      placeholder="图片 URL 或路径"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] font-mono text-slate-200"
                    />
                  )}
                </div>

                {/* Slot 3: Picture 3 Lower Body Detail */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-purple-500/50 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-purple-500 text-slate-950 font-black">
                      &lt;Picture 3&gt;
                    </span>
                    <span className="text-[10px] text-purple-300 font-mono">Node 167</span>
                  </div>
                  <div className="text-xs font-bold text-slate-200">裤套细节特写 (Lower Detail)</div>
                  <div className="aspect-[3/4] rounded-lg bg-slate-900 overflow-hidden border border-slate-800 relative group">
                    <img 
                      src={isEditing ? editingChar?.refSlots.picture3_lowerDetail : selectedCharacter.refSlots.picture3_lowerDetail} 
                      alt="Lower Detail" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2">
                      <span className="text-[10px] text-slate-300 font-medium">锁定红色花布裤套花纹与解放鞋</span>
                    </div>
                  </div>
                  {isEditing && (
                    <input
                      type="text"
                      value={editingChar?.refSlots.picture3_lowerDetail}
                      onChange={(e) => setEditingChar(prev => prev ? {
                        ...prev,
                        refSlots: { ...prev.refSlots, picture3_lowerDetail: e.target.value }
                      } : null)}
                      placeholder="图片 URL 或路径"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] font-mono text-slate-200"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Anchor Prompt Tags */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-cyan-400" />
                <span>白名单强约束锚点 (Prompt Anchors)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                这些文本标签将在转译为六段式提示词时自动附着，强制模型在生成每一帧时校验主体特征一致性：
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {(isEditing ? editingChar?.promptAnchors : selectedCharacter.promptAnchors)?.map((tag, idx) => (
                  <span 
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-300 border border-slate-700 text-xs flex items-center gap-1.5"
                  >
                    <span>{tag}</span>
                    {isEditing && (
                      <button 
                        onClick={() => handleRemoveAnchorTag(tag)}
                        className="text-slate-400 hover:text-rose-400"
                      >
                        ✕
                      </button>
                    )}
                  </span>
                ))}

                {isEditing && (
                  <button
                    onClick={() => {
                      const tag = prompt('请输入新锚点标签 (如: 金色铜铃铛):');
                      if (tag) handleAddAnchorTag(tag);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-xs hover:bg-cyan-900"
                  >
                    + 添加新锚点
                  </button>
                )}
              </div>
            </div>

            {/* Audio Voiceprint Reference (Node 174) */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center">
                  <Music className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-200">专属音色参考库 (Node 174 LoadAudio)</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {selectedCharacter.audioVoiceprintUrl || '未绑定独立干声音色'}
                  </div>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                音色一致性锁定
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
