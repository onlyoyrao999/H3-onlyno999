---
name: RUNNINGHUB调度技能
description: RunningHub OpenAPI v2 调度配置与 MiniMax H3 官方 Director 自动化流水线执行指南。严格锁定 15 秒（362 帧）工业级原子单元一次出片。严禁调用宿主环境简陋的 media.generate_video 内置函数。
agent_created: true
version: 2.2.0
---

# RunningHub OpenAPI v2 调度与执行规范

## ⚠️ 极度重要：调用工具唯一性铁律
* **严禁调用宿主平台的 `media.generate_video` 内置函数**：
  * 宿主平台的 `media.generate_video` 是简陋的通用占位接口，**根本不支持 MiniMax H3 的 15 秒/362 帧、Node 12 导演台、`<Subject N>` 与台词音频对齐参数**，调用必报 `media.generate_video 参数不匹配`！
* **唯一指定执行方式**：
  * 必须调用 **`skills/runninghub/rh_h3.py`** 脚本或直接通过 HTTP POST 派发至 RunningHub 官方 OpenAPI v2 工作流！

## 官方真实工作流配置 (RunningHub Verified Workflow)
- **RH 官方 Director 工作流 ID**: `workflowId: "2100506281638457345"`
- **ComfyUI 架构 UUID**: `79e9753c-d7eb-464f-b072-38c26f869748`
- **官方邀请码**: `wefjn44t`（赠送 1000 RH 币）
- **本地工作流配置文件**: `h3_director_workflow.json` (对应 `Node 12 MiniMaxH3Director` 官方中台)
- **单段出片规格**: **严格锁定 15.083 秒（362 帧 @ 24fps）**，拒绝碎片化 3-4 秒镜头

## 官方正确执行命令
```bash
# 执行真实 15 秒原子分镜渲染任务
python3 rh_h3.py --workflow-id 2100506281638457345 --shot tiedan_cow_seg1 --frames 362 --prompt "..."
```
