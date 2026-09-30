# 动作打斗·模型引擎适配与格式对照表 (Engine Formats)

本文件规范不同视频生成引擎对打斗与特效锚点的适配方式。核心以 **MiniMax H3** 为基准。

---

## 1. MiniMax H3 官方结构映射 (Official Benchmark)

MiniMax H3 原生支持单次生成中同时包含：
- **画面 (Video 1080p/720p)**
- **对白人声 (Lip-synced Dialogue with Reference Audio)**
- **物理现场拟音 (Native Realistic Foley: 刀剑声、雷击声、脚步泥水声)**

### 映射规范：
1. **角色与武器绑定 (`subject_definitions`)**：
   - `<Subject 1>`: 决战场地场景图（擂台、竹林、悬崖、破庙、虚空雷台）
   - `<Subject 2>`: 角色 A（明确兵刃款式与衣装细节）
   - `<Subject 3>`: 角色 B（对手或魔物）
   - `<Subject 4>`: 起始构图定妆图或双方招式交锋定格
2. **声音与声线锁定 (`声音设定`)**：
   - `<Picture 2>` 对应 `(S1)` 角色 A
   - `<Picture 3>` 对应 `(S2)` 角色 B
3. **分镜内部格式**：
   - `【Shot N｜起止秒｜景别·动作】`
   - `【主体】`
   - `【动作】` 必须包含特效锚点三段式：蓄力 ➔ 碰撞 ➔ 收束，台词嵌入在 `<d>[中文] 短喝</d>`
   - `【镜头】` 必须标明机位运动（如：16:9 低机位高速横摇、希区柯克推拉、环绕升降）
   - `【音效】` 必须包含兵刃火星、风爆、受击钝响，严格声明“无背景音乐，无对白外闲杂声音”
   - `【约束】` 必须包含关节防扭曲、武器刚体防弯折、二人分立防融体

---

## 2. 负向提示词 (Negative Prompting) 动作打斗专用

在提交给 RunningHub 或 MiniMax API 时，必须追加以下专属负向提示词，防止打斗崩坏：

```text
(background music:1.3), (bgm:1.3), (noisy soundtrack:1.3), (speech outside dialogue:1.4), (deformed limbs:1.5), (extra hands:1.5), (missing fingers:1.5), (fused bodies:1.5), (soft weapons:1.4), (bending swords:1.4), (floating characters:1.3), (distorted faces during combat:1.4), (blurry fast-motion artifacts:1.2), low resolution, 3d cartoon
```

> **注意**：负向词中**绝不可**出现 `sound effect`, `metal noise`, `clash`, `foley`，否则会杀掉所有的打斗交击音效！
