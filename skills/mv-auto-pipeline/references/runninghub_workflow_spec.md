# RunningHub 官方 MiniMax H3 Director 工作流规格

## 官方真实工作流参数
- **平台 Workflow ID**: `2100506281638457345`
- **ComfyUI 架构 UUID**: `79e9753c-d7eb-464f-b072-38c26f869748`
- **官方邀请码**: `wefjn44t`（送 1000 RH 币）
- **单段生成时长**: **严格锁定 15.083 秒（362 帧 @ 24fps）**

## 核心节点映射
- **Node 12 (`MiniMaxH3Director`)**: `global_prompt`、`timeline_data`、`total_frames=362`、`frame_rate=24`
- **Node 98/99/100 (`UNETLoader` + `CR Model Switch`)**: FL2VA 与 Ref2VA 官方双模切换
- **Node 16 (`LoraLoaderModelOnly`)**: Turbo 8-step LoRA 极速推理
- **Node 14/15 (`SageAttention`)**: 显存优化补丁
- **Node 58/103/104/51 (`ResolutionSelector` + `SamplerCustomAdvanced`)**: 2MP 二采高清重采样精修
- **Node 109 (`LazySwitch1way`)**: 二采惰性开关 (TRUE 开启 2MP 高清二采；FALSE 原片直出)
- **Node 106/107 (`CreateVideo` + `SaveVideo`)**: 24fps sRGB 音画对齐封包导出
