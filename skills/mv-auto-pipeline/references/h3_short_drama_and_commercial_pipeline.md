# H3 竖版短剧与商业广告流水线 (三工作流与一致性锁定 SOP)

## 1. 架构总览：三工作流资产中台

```
文生图 (Qwen-Image 2.1 T2I)
  ├── 角色全身立绘卡 (男主 / 女主 / 女配，全身站立，鞋底离画面底边 8%~15% 留空地面)
  └── 母本场景卡 (豪门宴会厅，20张圆桌纵深网格铺满走道两侧，8位虚化宾客分簇锁定)
         │
         ▼
图像编辑 (Qwen-Image 2.1 Edit)
  └── 场景卡作 image_1 画布，角色卡作 image_2
      提示词注入 CROWD_KEEP，彻底去除原影棚白底/灰底与闪光灯反光，继承场景环境光
         │
         ▼
三张「人物 × 场景」合成参考卡 (Composite Reference Cards)
         │
         ▼
参考生视频 (MiniMax H3 Ref2VA)
  └── 每段固定灌入这 3 张合成卡作为参考图，4段 (60.33s) 或 8段 (120.67s) 批量调度
         │
         ▼
拼接成片 (FFmpeg 0.35s 音频淡接 + AI 标注)
```

### 为什么用合成图当参考图？
1. **从源头消灭影棚底污染**：白底或灰底立绘会直接被 H3 烧进夜景画面，产生突兀灰斑。
2. **三卡合并同源**：一张合成卡同时供给人物 `<Subject N>` 和场景 `<Subject 4>`，将参考图总数严控在 3 张（H3 侧「参考图越少越准」）。

---

## 2. 分辨率与 17n+5 时长换算法则

### 2.1 分辨率换算 (multiple = 32)
* **9:16 图像资产 (Qwen T2I / Edit)**: 1.0 MP → **768×1376**
* **9:16 视频输出 (H3 Ref2VA)**: 0.4 MP → **480×864** (0.41 MP, 比例 5:9 ≈ 0.556)
  * 注：0.4 MP 下 9:16 无整数解，32 的最近倍数为 480×864。

### 2.2 帧数与时长换算
* H3 的 `length` 是**帧数**，必须满足公式：`max(5, round(a*24)) + (5 - (max(5, round(a*24)) % 17)) % 17`，即 `17n + 5`。
* 5 秒 = 124 帧
* **15 秒 = 362 帧**（不是 360 帧）
* **1 分钟成片 = 4 段 × 362 帧 = 60.33 秒**
* **2 分钟成片 = 8 段 × 362 帧 = 120.67 秒**

---

## 3. 跨段一致性锁定清单 (V2 / V3 / V4 实战归纳)

1. **同源场景派生**：所有合成图都以同一张场景卡为画布派生，锁定建筑、天花板五盏吊灯、两侧圆桌与 8 位宾客。
2. **空间锚定与防走廊化**：走道收窄至一张桌宽，20 张圆桌排列为 5 列 × 4 排铺满走道两侧，宾客分两侧入座。
3. **全身立绘鞋底留空**：人物卡头顶距顶边 6%，鞋底距底边 92%，鞋下留空地地面，合成指令明令禁止长裙拖到底边。
4. **防裁头宽景机制**：
   - 近景对白裁头率达 50%，高潮宣言镜改用宽景 `wide shot` 兜底。
   - 镜文中写明 `whole of both of them from head to feet inside the picture`。
   - **机制 4**：宽景镜文中**严禁复述衣着或首饰**（如 velvet gown, earrings），否则 H3 会被拽过去做衣物特写导致裁头。
   - **机制 5**：段末使用 `The camera stays far back for this whole shot and never comes any closer to anybody` 替代 `locks on her face`。
5. **规避反向敏感字幕陷阱**：严禁在提示词或负向中添加 `no subtitles / no text`，H3 越点名越画字幕！保留原生字幕或由后期遮罩。
6. **全局说话人映射**：S1 男主、S2 女主、S3 女配，八段全程固定编号。台词用 `<d>[Chinese] 台词</d>`，数字一律写汉字。

---

## 4. FFmpeg 拼接规范 (0.35s 音频淡接)

当段数 ≥ 4 时，不可直接 `-c copy`，否则每段各自生成的配乐会在接缝处产生突兀跳变。改用 `filter_complex` 做 0.35s 音频淡接：

```bash
ffmpeg -y -v error \
 -i S01.mp4 -i S02.mp4 -i S03.mp4 -i S04.mp4 \
 -filter_complex "
   [0:v]setpts=PTS-STARTPTS[v0];[0:a]afade=t=in:st=0:d=0.35,afade=t=out:st=14.73:d=0.35,asetpts=PTS-STARTPTS[a0];
   [1:v]setpts=PTS-STARTPTS[v1];[1:a]afade=t=in:st=0:d=0.35,afade=t=out:st=14.73:d=0.35,asetpts=PTS-STARTPTS[a1];
   [2:v]setpts=PTS-STARTPTS[v2];[2:a]afade=t=in:st=0:d=0.35,afade=t=out:st=14.73:d=0.35,asetpts=PTS-STARTPTS[a2];
   [3:v]setpts=PTS-STARTPTS[v3];[3:a]afade=t=in:st=0:d=0.35,afade=t=out:st=14.73:d=0.35,asetpts=PTS-STARTPTS[a3];
   [v0][a0][v1][a1][v2][a2][v3][a3]concat=n=4:v=1:a=1[vout][aout]" \
 -map "[vout]" -map "[aout]" -c:v libx264 -crf 19 -preset medium -pix_fmt yuv420p \
 -c:a aac -b:a 192k -movflags +faststart 成片_4段短剧.mp4
```

### AI 合规角标 (中国平台必须)
```bash
ffmpeg -y -i 成片_4段短剧.mp4 -vf "drawtext=fontfile='C\:/Windows/Fonts/msyh.ttc':text='AI生成':x=w-tw-22:y=26:fontsize=32:fontcolor=white@0.92:box=1:boxcolor=black@0.32:boxborderw=9" -c:v libx264 -crf 19 -pix_fmt yuv420p -c:a copy 成片_AI标注版.mp4
```
