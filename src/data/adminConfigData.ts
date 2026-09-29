export interface H3ModelConfig {
  id: string;
  name: string;
  version: string;
  type: 'fl2va' | 'ref2va' | 'director' | 'turbo';
  weightFile: string;
  precision: 'fp16' | 'int8' | 'nvfp4' | 'bf16';
  description: string;
  isDefault: boolean;
  status: 'active' | 'standby' | 'deprecated';
  vramRequiredGb: number;
}

export interface NodeMappingItem {
  id: string;
  nodeId: string;
  fieldName: string;
  nodeType: string;
  title: string;
  category: 'core' | 'video_chain' | 'multi_image' | 'prompt' | 'timeline' | 'audio' | 'export';
  desc: string;
  defaultValue?: string | number | boolean;
  required: boolean;
  status: 'synced' | 'warning' | 'custom';
}

export interface H3TaskItem {
  id: string;
  taskUuid: string;
  shotId: string;
  title: string;
  genre: 'short_drama' | 'mv' | 'commercial';
  duration: number; // in seconds
  frames: number; // 17n+5 formula (e.g. 243 for 10s, 362 for 15s)
  aspectRatio: '9:16' | '16:9' | '1:1';
  status: 'queued' | 'running' | 'keyframe_extracting' | 'stitching' | 'completed' | 'failed';
  progress: number; // 0 to 100
  refVideoParentShotId?: string; // Node 175 video chaining
  refImagesCount: number; // Node 137, 139, 167...
  workerNode: string;
  costCoins: number;
  costUsd: number;
  createdAt: string;
  completedAt?: string;
  elapsedSeconds: number;
  logs: string[];
  outputVideoUrl?: string;
  extractedKeyframes?: {
    fullBodyUrl: string;
    upperDetailUrl: string;
    lowerDetailUrl: string;
  };
}

export interface SensitiveWordRule {
  id: string;
  pattern: string;
  category: 'violence' | 'traffic' | 'physics_injury' | 'content_risk';
  riskLevel: 'high' | 'medium' | 'low';
  cinematicReplacement: string;
  slapstickLogic: string;
  enabled: boolean;
  triggerCount: number;
}

export interface CharacterAsset {
  id: string;
  name: string;
  codeName: string;
  roleType: 'protagonist' | 'supporting' | 'creature' | 'prop' | 'scene';
  description: string;
  promptAnchors: string[];
  refSlots: {
    picture1_fullBody: string; // ref_image_0 (Node 137)
    picture2_upperDetail: string; // ref_image_1 (Node 139)
    picture3_lowerDetail: string; // ref_image_2 (Node 167)
    picture4_extra?: string; // Node 173
  };
  audioVoiceprintUrl?: string;
  associatedShotsCount: number;
  createdAt: string;
}

export interface SystemHealthMetrics {
  inferenceCluster: 'healthy' | 'degraded' | 'offline';
  runningHubApi: 'connected' | 'latency_high' | 'disconnected';
  runningHubPingMs: number;
  activeWorkers: number;
  totalTasksToday: number;
  successRatePercent: number;
  totalFramesRendered: number;
  remainingCoins: number;
  estimatedBudgetRemainingUsd: number;
  antiIntegrityBlockRate: number; // % avoided
}

export const INITIAL_H3_MODELS: H3ModelConfig[] = [
  {
    id: 'm1',
    name: 'MiniMax-H3-FL2VA-int8',
    version: 'V2.2 Official',
    type: 'fl2va',
    weightFile: 'MiniMax-H3-FL2VA-int8-convrot.safetensors',
    precision: 'int8',
    description: 'MiniMax H3 官方首尾帧与图生视频核心基座模型，高动态动作生成与物理推演引擎。',
    isDefault: true,
    status: 'active',
    vramRequiredGb: 16
  },
  {
    id: 'm2',
    name: 'MiniMax-H3-Ref2VA-Pruned',
    version: 'V2.2 Official',
    type: 'ref2va',
    weightFile: 'minimax_h3_ref2va_pruned_int8_convrot.safetensors',
    precision: 'int8',
    description: '官方多模态参考生视频模型：支持多图矩阵参考、视频跨段无缝接力与音频音色同步绑定。',
    isDefault: true,
    status: 'active',
    vramRequiredGb: 20
  },
  {
    id: 'm3',
    name: 'Qwen3-VL-32B-NVFP4',
    version: 'AWQ NVFP4 Optimized',
    type: 'director',
    weightFile: 'qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors',
    precision: 'nvfp4',
    description: '多模态视觉语言理解与提示词深度对齐分词器，精准解析 <Picture N> 与 <Subject N> 角色锚点。',
    isDefault: false,
    status: 'active',
    vramRequiredGb: 14
  },
  {
    id: 'm4',
    name: 'MiniMax-H3-FL2V-Turbo-8Step',
    version: 'Turbo v1.0 BF16',
    type: 'turbo',
    weightFile: 'minimax_h3_fl2v_turbo_8step_v1.0_comfyui_bf16.safetensors',
    precision: 'bf16',
    description: '8步极速采样加速 LoRA，大幅降低渲染时长至原先 35%，适合首轮快速抽卡验收。',
    isDefault: false,
    status: 'active',
    vramRequiredGb: 12
  }
];

export const INITIAL_NODE_MAPPINGS: NodeMappingItem[] = [
  {
    id: 'n136',
    nodeId: '136',
    fieldName: 'reference_to_video',
    nodeType: 'MiniMaxH3ReferenceToVideo',
    title: 'H3 视频参考总控枢纽',
    category: 'core',
    desc: '核心出片枢纽，统筹提示词、多图参考矩阵、视频参考输入与音频参考',
    defaultValue: 'Default H3 Ref2VA',
    required: true,
    status: 'synced'
  },
  {
    id: 'n175',
    nodeId: '175',
    fieldName: 'video',
    nodeType: 'VHS_LoadVideo',
    title: '🎬 视频参考输入通道 (跨段接力神器)',
    category: 'video_chain',
    desc: '载入上一段视频成片或关键帧切片，通过潜在特征双通道传递，彻底消灭变脸漂移',
    defaultValue: '',
    required: false,
    status: 'synced'
  },
  {
    id: 'n137',
    nodeId: '137',
    fieldName: 'image',
    nodeType: 'LoadImage',
    title: '多图矩阵：<Picture 1> 主角全身定妆卡',
    category: 'multi_image',
    desc: '主角全身三视图 / 主面容母本卡 (ref_image_0)，锁定人物全局骨架比例与服饰整体色系',
    defaultValue: 'tiedan_character_full.png',
    required: true,
    status: 'synced'
  },
  {
    id: 'n139',
    nodeId: '139',
    fieldName: 'image',
    nodeType: 'LoadImage',
    title: '多图矩阵：<Picture 2> 第二主体/胸口特写卡',
    category: 'multi_image',
    desc: '上半身/胸部标识特写，或第二主体/核心道具 (ref_image_1)，锁定“铁蛋”徽标与表情屏',
    defaultValue: 'tiedan_chest_detail.png',
    required: false,
    status: 'synced'
  },
  {
    id: 'n167',
    nodeId: '167',
    fieldName: 'image',
    nodeType: 'LoadImage',
    title: '多图矩阵：<Picture 3> 场景母本/裤套细节卡',
    category: 'multi_image',
    desc: '下半身裤套细节或场景母本图 (ref_image_2)，锁定红色裤套花纹与鞋履细节，杜绝漂移',
    defaultValue: 'tiedan_legs_detail.png',
    required: false,
    status: 'synced'
  },
  {
    id: 'n173',
    nodeId: '173',
    fieldName: 'image',
    nodeType: 'LoadImage',
    title: '多图矩阵：<Picture 4> 起始构图参考卡',
    category: 'multi_image',
    desc: '起始画面构图参考图或扩展配角卡 (ref_image_3)',
    defaultValue: '',
    required: false,
    status: 'synced'
  },
  {
    id: 'n138',
    nodeId: '138',
    fieldName: 'value',
    nodeType: 'PrimitiveStringMultiline',
    title: '官方六段式提示词输入',
    category: 'prompt',
    desc: 'H3 官方 Ref2VA 规范文本：景别运镜 + 光影色彩 + 主体定妆 + 连续动作 + 物理音效 + 渲染画质',
    defaultValue: '',
    required: true,
    status: 'synced'
  },
  {
    id: 'n132',
    nodeId: '132',
    fieldName: 'value',
    nodeType: 'PrimitiveFloat',
    title: '视频时长控制 (秒)',
    category: 'timeline',
    desc: '控制单段视频时长，标准为 10.0 秒或 15.0 秒',
    defaultValue: 10.0,
    required: true,
    status: 'synced'
  },
  {
    id: 'n131',
    nodeId: '131',
    fieldName: 'expression',
    nodeType: 'ComfyMathExpression',
    title: '17n+5 帧数精确换算器',
    category: 'timeline',
    desc: '执行公式：max(5, round(a*24)) + (5 - (max(5, round(a*24)) % 17)) % 17',
    defaultValue: '17n+5 Exact Formula',
    required: true,
    status: 'synced'
  },
  {
    id: 'n115',
    nodeId: '115',
    fieldName: 'aspect_ratio',
    nodeType: 'ResolutionSelector',
    title: '画幅选择器',
    category: 'timeline',
    desc: '9:16 (736×1280 竖屏短剧) / 16:9 (1280×736 横屏MV) / 1:1 (1024×1024 方形卡片)',
    defaultValue: '9:16',
    required: true,
    status: 'synced'
  },
  {
    id: 'n174',
    nodeId: '174',
    fieldName: 'audio',
    nodeType: 'LoadAudio',
    title: '音频参考音色锁',
    category: 'audio',
    desc: '挂载角色专属干声或音色参考，实现音画同步',
    defaultValue: 'tiedan_voice_ref.wav',
    required: false,
    status: 'synced'
  },
  {
    id: 'n148',
    nodeId: '148',
    fieldName: 'filename_prefix',
    nodeType: 'VHS_VideoCombine',
    title: '音画合成与导出器',
    category: 'export',
    desc: '输出标准 24fps H.264 MP4 视频成片，支持 CRF 18 与无缝接合',
    defaultValue: 'H3_Master_Shot',
    required: true,
    status: 'synced'
  }
];

export const INITIAL_SENSITIVE_RULES: SensitiveWordRule[] = [
  {
    id: 'r1',
    pattern: '撞飞 / 撞死 / 顶飞 / 猛烈撞击',
    category: 'violence',
    riskLevel: 'high',
    cinematicReplacement: '向前猛冲顶起，身形夸张滑稽地轻盈腾空翻转两周半，稳稳坐落在松软金黄草垛上，激起一圈草屑，无物理损伤',
    slapstickLogic: '转换为滑稽喜剧与卡通夸张物理弹跳，消除真实人身伤害暗示，100% 规避风控',
    enabled: true,
    triggerCount: 42
  },
  {
    id: 'r2',
    pattern: '车祸 / 翻车 / 爆炸起火 / 燃烧',
    category: 'traffic',
    riskLevel: 'high',
    cinematicReplacement: '轮胎刹车带出夸张白烟，车辆打转180度滑稽横停，车灯闪烁，引擎盖喷出棉花糖般的安全白色蒸汽',
    slapstickLogic: '将致命灾害重构为无害动作喜剧特效与戏剧化急停',
    enabled: true,
    triggerCount: 19
  },
  {
    id: 'r3',
    pattern: '打架 / 互殴 / 挥拳打脸 / 流血',
    category: 'violence',
    riskLevel: 'high',
    cinematicReplacement: '双方像默剧演员般滑稽推搡闪避，互相被香蕉皮滑倒，翻滚进花丛中，面带夸张惊呆表情，毫发无伤',
    slapstickLogic: '默剧动作化，彻底剥离肢体暴力冲突与出血画面',
    enabled: true,
    triggerCount: 31
  },
  {
    id: 'r4',
    pattern: '坠落深渊 / 摔得粉碎 / 摔断腿',
    category: 'physics_injury',
    riskLevel: 'medium',
    cinematicReplacement: '从矮坡翻滚滑行，顺着光滑石板像溜滑梯一样顺畅滑下，安稳落在厚厚的野花垫上，拍拍灰尘站起',
    slapstickLogic: '消解坠落高差，引入缓冲物理材质',
    enabled: true,
    triggerCount: 12
  }
];

export const INITIAL_CHARACTERS: CharacterAsset[] = [
  {
    id: 'c1',
    name: '铁蛋 (TieDan)',
    codeName: 'tiedan_robot_v2',
    roleType: 'protagonist',
    description: '乡村憨萌农用机器人，老旧金属圆头，胸前嵌入发光像素Emoji屏，穿着中国经典红色大花布防风裤套与复古解放胶鞋。',
    promptAnchors: ['圆头复古农用机器人', '胸前发光像素Emoji屏幕', '红色东北大花布保暖裤套', '复古解放胶鞋'],
    refSlots: {
      picture1_fullBody: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80',
      picture2_upperDetail: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=600&q=80',
      picture3_lowerDetail: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=600&q=80',
      picture4_extra: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80'
    },
    audioVoiceprintUrl: 'tiedan_speech_voiceprint_v2.wav',
    associatedShotsCount: 8,
    createdAt: '2026-09-20'
  },
  {
    id: 'c2',
    name: '大黄牛 (DaHuang)',
    codeName: 'rural_ox_dahuang',
    roleType: 'creature',
    description: '体态健硕的北方水黄牛，牛角挂有一串微生锈铜铃铛，眼神狡黠幽默，充满灵性，常与铁蛋恶作剧互动。',
    promptAnchors: ['健硕黄毛水牛', '牛角系红色麻绳铜铃', '眼神狡黠灵动'],
    refSlots: {
      picture1_fullBody: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=600&q=80',
      picture2_upperDetail: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=600&q=80',
      picture3_lowerDetail: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&q=80'
    },
    associatedShotsCount: 6,
    createdAt: '2026-09-22'
  },
  {
    id: 'c3',
    name: '80年代乡村青砖瓦房',
    codeName: 'scene_vintage_house',
    roleType: 'scene',
    description: '带有岁月剥落痕迹的青砖墙体，屋檐下悬挂金黄玉米串与火红辣椒串，门前有石碾与老槐树，阳光呈3200K暖金色。',
    promptAnchors: ['80年代北方青砖农家院', '屋檐挂金黄玉米串与红辣椒', '暖金色斜阳'],
    refSlots: {
      picture1_fullBody: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600&q=80',
      picture2_upperDetail: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80',
      picture3_lowerDetail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80'
    },
    associatedShotsCount: 12,
    createdAt: '2026-09-18'
  }
];

export const INITIAL_TASKS: H3TaskItem[] = [
  {
    id: 't-01',
    taskUuid: 'rh-job-881290-p01',
    shotId: 'P01',
    title: '铁蛋清晨菜地拔葱 (首镜头·定妆确权)',
    genre: 'short_drama',
    duration: 10.0,
    frames: 243,
    aspectRatio: '9:16',
    status: 'completed',
    progress: 100,
    refImagesCount: 3,
    workerNode: 'GPU-Cluster-US-A100-08',
    costCoins: 35,
    costUsd: 0.35,
    createdAt: '10:14:02',
    completedAt: '10:16:34',
    elapsedSeconds: 152,
    logs: [
      '[10:14:02] 初始化 MiniMax H3 官方工作流 (ID: 2084788947984666625)...',
      '[10:14:05] Node 137, 139, 167 成功注入铁蛋三角度定妆图卡 (<Picture 1~3>)...',
      '[10:14:08] Node 132/131 计算帧数: 10.0s -> 243 帧 (17n+5 严格对齐)...',
      '[10:14:20] 启动 UNet 采样: 24 步 Ref2VA 扩散计算...',
      '[10:16:15] VAE 解码完成，VHS_VideoCombine 导出 24fps 竖屏 MP4...',
      '[10:16:25] 自动化三角度关键帧抽卡完成: full_body, upper_detail, lower_detail 已入库！'
    ],
    outputVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    extractedKeyframes: {
      fullBodyUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80',
      upperDetailUrl: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=600&q=80',
      lowerDetailUrl: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=600&q=80'
    }
  },
  {
    id: 't-02',
    taskUuid: 'rh-job-881291-p02',
    shotId: 'P02',
    title: '大黄牛戏耍铁蛋 (双通道跨段接力)',
    genre: 'short_drama',
    duration: 10.0,
    frames: 243,
    aspectRatio: '9:16',
    status: 'completed',
    progress: 100,
    refVideoParentShotId: 'P01',
    refImagesCount: 3,
    workerNode: 'GPU-Cluster-US-A100-09',
    costCoins: 35,
    costUsd: 0.35,
    createdAt: '10:18:10',
    completedAt: '10:20:41',
    elapsedSeconds: 151,
    logs: [
      '[10:18:10] 载入 P01 成片至 Node 175 (VHS_LoadVideo) 开启跨段视频接力！',
      '[10:18:12] 注入 P01 抽取出的 3 张多角度细节图 (全角度锁死面容与裤套花纹)...',
      '[10:18:15] 安全脱敏引擎检测: "被大黄撞飞" -> 自动转译为 "滑稽喜剧轻盈腾空翻转两周半稳坐草垛"...',
      '[10:19:58] 采样完成，零变脸、零服装漂移指标检测通过 (SSIM: 0.942)...',
      '[10:20:41] 渲染出片成功！'
    ],
    outputVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
  },
  {
    id: 't-03',
    taskUuid: 'rh-job-881292-p03',
    shotId: 'P03',
    title: '铁蛋田埂独轮车狂奔 (高速动态)',
    genre: 'short_drama',
    duration: 10.0,
    frames: 243,
    aspectRatio: '9:16',
    status: 'running',
    progress: 68,
    refVideoParentShotId: 'P02',
    refImagesCount: 3,
    workerNode: 'GPU-Cluster-US-A100-08',
    costCoins: 35,
    costUsd: 0.35,
    createdAt: '10:25:00',
    elapsedSeconds: 84,
    logs: [
      '[10:25:00] 调度派发成功，绑定父节点 P02 视频潜空间...',
      '[10:25:12] 加载 Turbo 8-step LoRA 加速权重...',
      '[10:25:40] Ref2VA 扩散步骤: 16/24 (68%)...'
    ]
  },
  {
    id: 't-04',
    taskUuid: 'rh-job-881293-p04',
    shotId: 'P04',
    title: '夕阳农家院团圆大合照 (收尾终篇)',
    genre: 'short_drama',
    duration: 10.0,
    frames: 243,
    aspectRatio: '9:16',
    status: 'queued',
    progress: 0,
    refVideoParentShotId: 'P03',
    refImagesCount: 4,
    workerNode: '等待分配 (排队中)',
    costCoins: 35,
    costUsd: 0.35,
    createdAt: '10:27:15',
    elapsedSeconds: 0,
    logs: [
      '[10:27:15] 任务已进入高优先级调度队列，等待 P03 生成完毕以继承末尾关键帧与视频特征...'
    ]
  }
];

export const INITIAL_HEALTH: SystemHealthMetrics = {
  inferenceCluster: 'healthy',
  runningHubApi: 'connected',
  runningHubPingMs: 42,
  activeWorkers: 6,
  totalTasksToday: 48,
  successRatePercent: 98.4,
  totalFramesRendered: 11664,
  remainingCoins: 8650,
  estimatedBudgetRemainingUsd: 86.50,
  antiIntegrityBlockRate: 100.0
};
