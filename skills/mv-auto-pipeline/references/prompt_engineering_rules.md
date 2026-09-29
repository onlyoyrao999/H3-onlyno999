# 六段式提示词规范与 11 项机检细则

## 1. 六段式标准分块 (The Six-Section Structure)

每个分镜 Prompt 必须且仅能由以下六个标准大写英文区块构成：

```markdown
[SHOT]
Shot scale: Close-Up. Camera motion: Slow push-in tracking shot. Eye-level, cinematic 35mm lens, shallow depth of field.

[SUBJECT]
A young Asian female vocalist in her early 20s, sharp features, delicate porcelain skin, gentle expressive eyes, dressed in an oversized crimson vintage knit sweater.

[ACTION]
Standing serenely near a rain-streaked window, emotive facial micro-expressions.
Singing vocals: "夜色渐浓 街灯也渐渐熄灭"

[ENVIRONMENT]
A dimly lit modernist apartment room overlooking a misty neon-lit rainy metropolis at midnight, soft reflections on wet glass.

[LIGHTING_COLOR]
Cinematic teal and warm amber split lighting, moody atmosphere, subtle volumetric dust motes caught in streetlight beam.

[CAMERA_TECH]
Photorealistic, 8k resolution, cinematic film grain, Kodak Vision3 color science, motion blur natural to 24fps.
```

## 2. 非口型镜头的规范形态 (Non-Lip-Sync Prompt Example)

```markdown
[SHOT]
Shot scale: Wide Long Shot. Camera motion: Slow high-angle crane drift downwards.

[SUBJECT]
Silhouetted figure walking alone along the deserted wet boulevard, back turned toward camera.

[ACTION]
Walking slowly into the misty distance with hands in coat pockets. Mouth naturally closed, lips completely still, not moving along with vocals, stoic and quiet.

[ENVIRONMENT]
Empty city street, glowing reflections of neon billboards on puddles, towering skyscrapers.

[LIGHTING_COLOR]
Cyan and deep violet ambient cyberpunk lighting, high contrast cinematic noir.

[CAMERA_TECH]
Crisp 8k, anamorphic lens flare, rich cinematic texture, slow shutter aesthetics.
```

### 对应 Negative Prompt (口型段与非口型段均必须屏蔽画面文字):
- **非口型段 Negative Prompt**:
```
text, words, subtitles, lyrics, captions, watermark, logo, typography, letters, signature, font, burned-in text, singing, mouth open, lip-sync, talking, speaking, vocalizing, open lips, moving mouth, cartoon, 3d render, distorted anatomy, jitter, flicker
```
- **口型段 Negative Prompt**:
```
text, words, subtitles, lyrics, captions, watermark, logo, typography, letters, signature, font, burned-in text, talking, speaking, dialogue, cartoon, 3d render, distorted face, oversaturated, lowres
```

## 3. 11 项机检规则矩阵

| 序号 | 规则名称 | 严重度 | 检验逻辑 |
| :--- | :--- | :--- | :--- |
| **01** | `CHECK_STRUCTURE` | **CRITICAL** | 必须包含 `[SHOT]`, `[SUBJECT]`, `[ACTION]`, `[ENVIRONMENT]`, `[LIGHTING_COLOR]`, `[CAMERA_TECH]` |
| **02** | `CHECK_LANG_TIER` | **CRITICAL** | 区块名与技术参数全英，叙事描写与歌词允许保留中文 |
| **03** | `CHECK_VOCAL_LINE` | **CRITICAL** | 口型段必须包含 `Singing vocals: "..."` 且独立占行 |
| **04** | `CHECK_NO_TALK_VERB`| **CRITICAL** | 严禁出现 `saying`, `talking`, `speaking`, `chatting` 等对白词汇；正向禁止索要文字字幕 |
| **05** | `CHECK_SCALE_MATCH` | **CRITICAL** | 口型段景别限制在 `[ECU, CU, MCU, MS]`，严禁远景/全景/空镜 |
| **06** | `CHECK_LIP_STILL`   | **CRITICAL** | 非口型段正向必须包含 `mouth naturally closed` 或 `lips completely still` |
| **07** | `CHECK_NEG_LIP_AND_TEXT` | **CRITICAL** | Negative 必须包含 `text, subtitles, lyrics, words, watermark` 屏蔽画面文字；非口型段还必须压制 `singing, mouth open, lip-sync` |
| **08** | `CHECK_CHAR_ANCHOR` | **HIGH** | 有主角模式下检查人物一致性提示词锚点 |
| **09** | `CHECK_NO_CONFLICT` | **HIGH** | 不得存在日夜、强弱光前后自相矛盾的词汇组合 |
| **10** | `CHECK_MOTION_FIT`  | **MEDIUM** | 窗口时长小于 3 秒时，剧烈运动动词数量不得超过 1 个 |
| **11** | `CHECK_HASH_SIGN`   | **CRITICAL** | 提示词生成 SHA-256 签名，参数任何变更必须废除并重新认证 |

---

## 4. 静止出现与禁止提示词策略 (Suppression Rules & Negative Lexicon)

### 4.1 静止/禁止出现背景音乐 (Silence Model BGM for Clean Master Score)
* **痛点**：视频生成模型如果自主生成 AI 配乐，在多段拼接时会导致接缝处音乐剧烈变奏、爆音破损。
* **正向 [non_diegetic_music] 声明**：
  ```markdown
  [non_diegetic_music]
  None. There is no non-diegetic background music in this video track, absolute silence on the music channel to allow clean external master score mixing.
  ```
* **Negative Prompt 压制词**：
  `background music, noisy score, discordant soundtrack, distorted audio, bgm, humming, audio clipping, clashing instruments`

### 4.2 严格禁止出现画面文字与字幕 (Screen Text & Subtitle Suppression)
* **铁律**：正向严禁索要字幕文字；Negative 必须强制注入：
  `text, words, subtitles, lyrics, captions, watermark, logo, typography, letters, signature, font, burned-in text`
* 成片字幕统一在后期通过无损 SRT 轨压制，杜绝画面出现 AI 扭曲字符与假水印。

### 4.3 嘴唇静止与闭合声明 (Lips Still / No Open Mouth)
* **非口型段 / 反应镜正向声明**：
  `mouth naturally closed, lips completely still, not moving along with vocals, no singing or talking`
* **Negative Prompt 压制词**：
  `singing, mouth open, lip-sync, talking, speaking, vocalizing, open lips, moving mouth`
