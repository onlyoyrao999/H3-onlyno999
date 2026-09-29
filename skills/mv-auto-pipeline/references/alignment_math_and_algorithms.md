# 音频包络对齐与时长贴合数学规范

## 1. 为什么音画会随时间漂移？
在主流 AI 视频生成流程中，模型输出的持续时间为离散帧的集合：
$$T_{\text{actual}} = \frac{N_{\text{frames}}}{\text{FPS}}$$
由于时间浮点截断与模型默认补帧策略，生成的片段往往多出 $0.1\text{s} \sim 0.4\text{s}$。
经过 25 个镜头的累积，末尾音画错位可达：
$$\Delta T = \sum_{k=1}^{25} \delta t_k \approx 25 \times 0.25\text{s} = 6.25\text{s}$$
整支 MV 将完全脱节崩溃。

## 2. 机制一：时长贴合算法 (Duration Fitting Algorithm)

### 步骤 A：请求时长向上对齐帧网格
给定分镜理论窗口时长 $W_k = \text{End}_k - \text{Start}_k$（以秒为单位），目标帧率 $\text{FPS} = 24$：
$$N_{\text{target\_frames}} = \lceil W_k \times \text{FPS} \rceil$$
向视频模型发起请求时，帧数参数必须固定为此网格值。

### 步骤 B：落盘毫秒级裁切
下载生成的视频片段后，使用精准时间戳进行裁切：
$$\text{Duration}_{\text{clip}} = W_k \pm 0.0001\text{s}$$
确保：
$$\sum_{k=1}^{M} \text{Duration}_{\text{clip}, k} \equiv T_{\text{master\_track}}$$

---

## 3. 机制二：对齐三验轻量搜索数学原理

### A. 音频包络压缩 (Envelope Extraction)
若母带音频采样率 $f_s = 44100\text{ Hz}$，一段 4 秒音频有 176,400 个采样点。直接全量互相关运算复杂度极高。
采用 50ms 滑动窗口（Hop Size = 10ms）计算短时根均方能量（Short-Time RMS）：
$$E[m] = \sqrt{\frac{1}{H} \sum_{n=m \cdot H}^{(m+1) \cdot H} x^2[n]}$$
将原数据点降维至每秒 100 个特征点。

### B. 局部滞后搜索 (Local Lag Search)
仅在理论切点时间点 $t_{\text{expected}}$ 附近 $\pm 300\text{ms}$（对应包络序列偏移 $\tau \in [-30, +30]$）进行归一化互相关搜索：
$$R_{xy}[\tau] = \frac{\sum_{m} (E_{\text{video}}[m] - \bar{E}_v)(E_{\text{master}}[m + \tau] - \bar{E}_m)}{\sigma_v \sigma_m}$$

### C. 三大验收门槛 (Acceptance Criteria)
1. **最优时间滞后 (Lag Offset)**：
   $$\tau^* = \arg\max_{\tau} R_{xy}[\tau], \quad |\tau^*| \le 80\text{ms}$$
2. **包络相关系数 (Correlation)**：
   $$\max_\tau R_{xy}[\tau] \ge 0.78$$
3. **人声能量基底 (Vocal Energy)**：
   $$\text{RMS}_{\text{segment}} \ge -36\text{ dBFS}$$
   防止空镜静音段产生虚假相关。
