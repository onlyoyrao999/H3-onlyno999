# MiniMax H3 官方 Ref2VA 规范与 Awesome-Seedance 差异辨析

## 1. 核心定位与背景
- **Awesome-Seedance**: 社区通用视频生成提示词模板，常用于 Runway/Pika/SeaDance 等通用扩散模型。其特点是自然语言散文式叙事，使用大量 "masterpiece, 8k, photorealistic" 修饰词，对白常写为 `says "..."`，缺少严格的角色特征锁定，且习惯在负向添加 "no text, no subtitles"。
- **MiniMax H3 (Ref2VA / T2VA)**: 具备强物理世界先验与多模态参考生视频 (Reference-to-Video-with-Audio) 架构。对输入格式有极高强度的结构化约束，且模型对特定关键词具有**反向敏感**与**镜头联合条件**特性。直接套用 Awesome-Seedance 在 H3 上会导致 100% 出现角色崩脸、发型漂移、头顶裁切、画面反向烧入双重字幕等重大事故。

---

## 2. 六大结构性硬伤对照表

| 维度 | Awesome-Seedance 通用写法 | MiniMax H3 官方规范 (Ref2VA) | 为什么 H3 必须这么做 (实战机制) |
|---|---|---|---|
| **段落架构** | 无固定段落，整段散文长文本 | **固定六段式**：<br>1. `[subject_definitions]`<br>2. `[summary]`<br>3. `[retention_analysis]`<br>4. `[detailed_description]`<br>5. `[overall_soundscape]`<br>6. `[non_diegetic_music]` | H3 编码器基于 Qwen3VL，按六段独立解析特征。缺少分段会导致角色参考、环境音与画外配乐混淆。 |
| **字幕与负面** | 频繁添加：<br>`no text, no subtitles, no watermark` | **绝对禁止写任何反向文字禁用词！**<br>负向与正向均不得提及 subtitles/text。 | **实战陷阱**：H3 对此类词反向敏感，越点名越画字幕！点名 1 个可能出 2 条字幕。台词烧入由模型原生渲染，后期可重贴覆盖。 |
| **台词与发声** | 自然语言对白：<br>`She says: "..."` 或 `talking angrily` | 严格标签式：<br>`(Sx)` 说话人代号 + <br>`<d>[Chinese] 台词</d>` + <br>`His/her mouth moves only while he/she speaks.` | `saying/talking` 会诱发人物说话口型抽搐乱动；`<d>` 为 H3 官方台词专用 token，`(Sx)` 全局固定以保证同角色音色不漂移。 |
| **参考图引用** | 独立给图描述：<br>`<Picture 1> is the man...` | 来源直接并入 `<Subject N>`：<br>`<Subject 1> is the male lead. His face... comes from <Picture 1>` | 若给 `<Picture N>` 独立条目，H3 会将其视为「帧锚点」而非「特征来源」，导致画面各拍各的。 |
| **取景与防裁头** | 惯用近景特写：<br>`tight close-up / medium close-up`，配亲密动作 | **宽景兜底**：<br>`wide shot`, `whole of both of them from head to feet inside the picture`, `the camera stays far back` | **实战陷阱**：H3 近景发声镜 50% 发生头顶裁出画面（只露躯干）；亲密动作会诱发相机向上猛推。宽景 100% 免疫裁头。 |
| **宽景描述禁忌** | 在宽景镜文中细写衣服：<br>`the woman in wine-red gown with gold earrings` | **宽景镜文中严禁复述衣着与首饰！**<br>仅用 `<Subject 2> (S2) stands small` 即可。 | **机制 4**：宽景镜文中一旦点名具体衣物或首饰，H3 会强制拉近做该衣物的特写，瞬间破坏宽景导致躯干特写裁头！ |

---

## 3. 官方标准 Ref2VA 六段式范例 (短剧场景)

```text
[subject_definitions]
<Subject 1> is the male lead. His face, lean athletic build, black wool bespoke tuxedo, crisp spread-collar white dress shirt and black silk bow tie come from <Picture 1>, and <Picture 1> also carries the ballroom he stands in. Smooth skin across cheeks and chin with no stubble of any kind.
<Subject 2> is the female lead. Her face, slender frame, wine-red velvet evening gown, and straight black hair hanging clearly well past her chest come from <Picture 2>.
<Subject 3> is the wealthy antagonist woman. Her face, sharp arched eyebrows, dark navy satin tailored trouser suit come from <Picture 3>.
<Subject 4> is the grand banquet ballroom with five tiered crystal chandeliers down the centre axis and twenty ivory-draped round tables arranged on both sides of a single narrow marble aisle from <Picture 1>.

[summary]
Inside the opulent ballroom, <Subject 3> confronts <Subject 2> beside the marble aisle, questioning her right to attend, while <Subject 1> observes coldly from the entrance.

[retention_analysis]
<Subject 1>, <Subject 2>, <Subject 3> and <Subject 4> are preserved from <Picture 1>, <Picture 2> and <Picture 3>.

[detailed_description]
The grade is locked and identical in every shot: the same exposure, contrast curve and warm amber highlight from the first shot to the last. No two shots repeat the same framing.
[Shot 1] The shot opens on a wide shot of <Subject 4> from the far side at chest height, the ivory-draped tables spread across both sides of the frame. <Subject 2> (S2) and <Subject 3> (S3) stand small in the aisle in lower middle of the frame, the whole of both of them from head to feet inside the picture. <Subject 3> (S3) raises her chin slightly, her mouth moves only while she speaks: <d>[Chinese] 林清晚，你以为顾家这道门，是你想进就能进的？</d>
[Shot 2] The shot cuts to a medium two-shot from the right side at shoulder height. <Subject 2> (S2) stands calm and poised, looking straight into the lens.
[Shot 3] The shot cuts to a low-angle wide view showing the towering double doors behind them.
[Shot 4] The shot cuts to a silent reaction shot of <Subject 2> (S2) raising her eyes calmly, lips completely closed and still, not speaking. The camera stays far back for this whole shot and never comes any closer to anybody: it does not push in, and the shot never ends on a nearer framing.

[overall_soundscape]
Muffled murmur of background ballroom guests, subtle clink of champagne flutes on distant tables.

[non_diegetic_music]
A low tense cello drone building with subtle staccato string pizzicato.
```
