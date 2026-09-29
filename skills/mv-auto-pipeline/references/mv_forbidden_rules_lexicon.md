# MV 负向禁令护盾与静止/背景音乐/字幕规避准则

## 1. 深度继承 MV 铁律 C
在 MV 工程流程中，歌词字幕由后期时间轴挂载，音乐底轨由母带混音控制。将此规范移植至短剧与广告制作中，制定三大禁令：

---

## 2. 🔇 静止/禁止出现背景音乐 (BGM Suppression)
* **正向提示词写法**：
  在 `[non_diegetic_music]` 中明确声明：
  `None. There is no non-diegetic background music in this video track, absolute silence on the music channel to allow clean external master score mixing.`
* **Negative Prompt 编译注入项**：
  `background music, noisy score, discordant soundtrack, distorted audio, bgm, humming, audio clipping, clashing instruments, cacophony`

---

## 3. 👁️ 禁止出现字幕与文字 (Screen Text Suppression)
* **避坑要点**：H3 对文字反向敏感，正向千万不要写 "no subtitles, no text"！
* **Negative Prompt 强力压制项**：
  `text, words, subtitles, lyrics, captions, watermark, logo, typography, letters, signature, username, font, burned-in text, on-screen text, overlaid words`
* **字幕交付**：成片由后期渲染标准 SRT 软字幕或广播级硬字幕。

---

## 4. 🤐 强制嘴唇静止 / 禁止开口 (Mouth Stillness Control)
* **非口型镜头正向声明**：
  `mouth naturally closed, lips completely still, not moving along with vocals, no singing or talking`
* **Negative Prompt 嘴唇抽动压制项**：
  `singing, mouth open, lip-sync, talking, speaking, vocalizing, open lips, moving mouth, dialogue, chatting, parted lips`
