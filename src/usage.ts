const pkg = require('../package.json');

const KOISHI_LOGO_BASE64 = 'data%3Aimage%2Fpng%3Bbase64%2CiVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAABU0lEQVR42p2UQSsFYRSGnxnqLuytKWKpKFkQNsS%2FsOHPWPADLCmxU5S7UzYWNrJR7lYiRF2FeWzOMKZ7mXHqNNP5vvP2nu%2B850CY2lP4X1K31ZbaDm%2BpO%2Bpyp5wfAXVEPfRvO1JHf4AVQGbUh7j4EZ4VkrNCXPVRnf3CUBN1SH2KC28VGOV3ntRhNclZHdcAKYM11QR1oVBOXctzFlNgBTC8qmXxPQEegbVeYApIgJT6tg%2F0AdMp0B%2FBpCabK2AAmAAa%2F2GRBft1oBFPkqTAba7LCiAfQC9wClwAY1HJHepuiO29Yrsf1Dn1uiDU3RTYCtTkl1Leg8k9MB4NGgReI28rV3azgyCz0og01Xl1Uz1QX8uCTELm3UbkTF1VJ9Wr0tn3iBSGdjYG0XivE3VN3VD31PM4a3cc2tIGGI0VkTO7rLxGuiy25ejmjfqsvkSXui62TxaK03td4FXTAAAAAElFTkSuQmCC';

// 内联基础样式，标题文字强制以 var(--k-text-dark, inherit) 兜底，确保在任何黑夜模式下 100% 清晰可见
const baseDetailsStyle = 'margin:12px 0;border-radius:10px;overflow:hidden;box-shadow:var(--k-card-shadow, 0 1px 4px rgb(0 0 0 / 10%));border:1px solid var(--card-border, rgba(127, 127, 127, 0.3));background:var(--k-card-bg, transparent);transition:border-color .2s ease, background-color .2s ease;';
const baseSummaryStyle = 'padding:10px 14px;cursor:pointer;user-select:none;font-weight:700;display:flex;align-items:center;justify-content:space-between;outline:none;background:var(--card-summary-bg, rgba(127, 127, 127, 0.12));color:var(--card-title-color, var(--k-text-dark, #f5f5f5));';
const baseBodyStyle = 'padding:10px 16px 14px;color:var(--k-text-dark, inherit);line-height:1.75;font-size:14px;border-top:1px solid var(--card-border, rgba(127, 127, 127, 0.2));background:var(--k-card-bg, transparent);';
const codeBlockStyle = 'margin:6px 0 10px;padding:8px 12px;background:var(--k-hover-bg, rgba(127, 127, 127, .15));border:1px solid var(--k-color-divider, rgba(127, 127, 127, .25));border-radius:6px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:13px;line-height:1.6;overflow-x:auto;color:var(--k-text-dark, inherit);';

export const usage = `
<style>
/* ================= Koishi WebUI 白天 & 黑夜双模式高对比度卡片样式 ================= */
.k-usage-card {
  margin: 12px 0;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: var(--k-card-shadow, 0 1px 4px rgba(0, 0, 0, 0.1));
  border: 1px solid var(--card-border);
  background: var(--k-card-bg, transparent);
  transition: border-color .2s ease, background-color .2s ease;
}
.k-usage-card summary {
  padding: 10px 14px;
  cursor: pointer;
  user-select: none;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--card-summary-bg);
  color: var(--card-title-color, var(--k-text-dark, inherit));
  list-style: none;
  outline: none;
}
.k-usage-card summary::-webkit-details-marker {
  display: none;
}
.k-usage-card summary:hover {
  filter: brightness(1.06);
}
.k-usage-card .k-card-body {
  padding: 10px 16px 14px;
  color: var(--k-text-dark, inherit);
  line-height: 1.75;
  font-size: 14px;
  border-top: 1px solid var(--card-border);
  background: var(--k-card-bg, transparent);
}
.k-usage-card .k-fold-hint {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 500;
  opacity: 0.9;
  color: var(--card-hint-color, var(--k-text-normal, inherit));
}
.k-usage-card .k-fold-state::before {
  content: "展开";
}
.k-usage-card[open] summary .k-fold-state::before {
  content: "收起";
}
.k-usage-card .k-arrow-icon {
  display: inline-block;
  transition: transform .25s ease;
  font-size: 11px;
}
.k-usage-card[open] summary .k-arrow-icon {
  transform: rotate(180deg);
}

/* 浅色 / 白天模式色彩 (Light Theme) */
.card-green {
  --card-border: rgba(47, 133, 90, 0.35);
  --card-summary-bg: rgba(47, 133, 90, 0.1);
  --card-title-color: #22543d;
  --card-hint-color: #276749;
}
.card-orange {
  --card-border: rgba(221, 107, 32, 0.35);
  --card-summary-bg: rgba(221, 107, 32, 0.1);
  --card-title-color: #9c4221;
  --card-hint-color: #c05621;
}
.card-purple {
  --card-border: rgba(128, 90, 213, 0.35);
  --card-summary-bg: rgba(128, 90, 213, 0.1);
  --card-title-color: #553c9a;
  --card-hint-color: #6b46c1;
}
.card-blue {
  --card-border: rgba(49, 130, 206, 0.35);
  --card-summary-bg: rgba(49, 130, 206, 0.1);
  --card-title-color: #2b6cb0;
  --card-hint-color: #2b6cb0;
}
.card-cyan {
  --card-border: rgba(49, 151, 149, 0.35);
  --card-summary-bg: rgba(49, 151, 149, 0.1);
  --card-title-color: #234e52;
  --card-hint-color: #285e61;
}
.card-pink {
  --card-border: rgba(229, 62, 62, 0.35);
  --card-summary-bg: rgba(229, 62, 62, 0.1);
  --card-title-color: #9b2c2c;
  --card-hint-color: #c53030;
}

/* 深色 / 黑夜模式色彩 (全面匹配 html.dark, .dark, .theme-root.dark 以及媒体查询) */
html.dark .card-green, .theme-root.dark .card-green, .dark .card-green {
  --card-border: rgba(72, 187, 120, 0.45);
  --card-summary-bg: rgba(72, 187, 120, 0.18);
  --card-title-color: #68d391;
  --card-hint-color: #9ae6b4;
}
html.dark .card-orange, .theme-root.dark .card-orange, .dark .card-orange {
  --card-border: rgba(237, 137, 54, 0.45);
  --card-summary-bg: rgba(237, 137, 54, 0.18);
  --card-title-color: #f6ad55;
  --card-hint-color: #fbd38d;
}
html.dark .card-purple, .theme-root.dark .card-purple, .dark .card-purple {
  --card-border: rgba(159, 122, 234, 0.45);
  --card-summary-bg: rgba(159, 122, 234, 0.18);
  --card-title-color: #b794f4;
  --card-hint-color: #d6bcfa;
}
html.dark .card-blue, .theme-root.dark .card-blue, .dark .card-blue {
  --card-border: rgba(66, 153, 225, 0.45);
  --card-summary-bg: rgba(66, 153, 225, 0.18);
  --card-title-color: #63b3ed;
  --card-hint-color: #90cdf4;
}
html.dark .card-cyan, .theme-root.dark .card-cyan, .dark .card-cyan {
  --card-border: rgba(78, 205, 196, 0.45);
  --card-summary-bg: rgba(78, 205, 196, 0.18);
  --card-title-color: #4fd1c5;
  --card-hint-color: #81e6d9;
}
html.dark .card-pink, .theme-root.dark .card-pink, .dark .card-pink {
  --card-border: rgba(245, 101, 101, 0.45);
  --card-summary-bg: rgba(245, 101, 101, 0.18);
  --card-title-color: #fc8181;
  --card-hint-color: #feb2b2;
}

@media (prefers-color-scheme: dark) {
  :root:not(.light) .card-green { --card-title-color: #68d391; --card-summary-bg: rgba(72,187,120,0.18); }
  :root:not(.light) .card-orange { --card-title-color: #f6ad55; --card-summary-bg: rgba(237,137,54,0.18); }
  :root:not(.light) .card-purple { --card-title-color: #b794f4; --card-summary-bg: rgba(159,122,234,0.18); }
  :root:not(.light) .card-blue { --card-title-color: #63b3ed; --card-summary-bg: rgba(66,153,225,0.18); }
  :root:not(.light) .card-cyan { --card-title-color: #4fd1c5; --card-summary-bg: rgba(78,205,196,0.18); }
  :root:not(.light) .card-pink { --card-title-color: #fc8181; --card-summary-bg: rgba(245,101,101,0.18); }
}
</style>

<h1>🏷️ Koishi 插件：Otto 活字印刷语音合成 otto-hzys</h1>
<h2>🎯 插件版本：v${pkg.version}</h2>

<p>
  <a href="https://www.npmjs.com/package/koishi-plugin-otto-hzys" target="_blank">
    <img src="https://img.shields.io/npm/v/koishi-plugin-otto-hzys?style=flat-square&logo=npm" alt="npm version">
  </a>
  <a href="https://npm-stat.com/charts.html?package=koishi-plugin-otto-hzys" target="_blank">
    <img src="https://img.shields.io/npm/dm/koishi-plugin-otto-hzys?style=flat-square&logo=npm" alt="npm downloads">
  </a>
  <br>
  <a href="https://github.com/VincentZyuApps/koishi-plugin-otto-hzys" target="_blank">
    <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub">
  </a>
  <a href="https://gitee.com/vincent-zyu/koishi-plugin-otto-hzys" target="_blank">
    <img src="https://img.shields.io/badge/Gitee-C71D23?style=for-the-badge&logo=gitee&logoColor=white" alt="Gitee">
  </a>
  <br>
  <a href="https://forum.koishi.xyz/t/topic/xxxxx" target="_blank">
    <img src="https://img.shields.io/badge/Koishi%20Forum-xxxxx-5546A3?style=for-the-badge&logo=${KOISHI_LOGO_BASE64}&logoColor=white" alt="Koishi Forum">
  </a>
  <a href="https://qm.qq.com/q/ZHj33L5cuC" target="_blank">
    <img src="https://img.shields.io/badge/QQ群-1085190201-12B7F5?style=flat-square&logo=qq&logoColor=white" alt="QQ群">
  </a>
  <br>
</p>

<h2>💬 交流反馈</h2>
<p>🐛 Bug 反馈 / 💡 建议 / 👨‍💻 插件开发交流，欢迎加群：</p>
<p>💬 交流 QQ 群：<b>1085190201</b> 🎉</p>
<p>💡 在群里直接艾特我，回复的更快哦~ ✨</p>

<p><b>💡 提示：</b>
  <a href="https://github.com/VincentZyuApps/koishi-plugin-otto-hzys" target="_blank">
    前往 GitHub 或 Gitee README 获得更佳观感 →
  </a>
</p>

<hr>

<h2>✨ 核心特色</h2>

<ul>
  <li>🚀 <b>纯 TypeScript 架构</b>：无需部署外部 Python 后端，不依赖易失效的第三方 Web API，内存级极速合成。</li>
  <li>🎧 <b>多格式 WAV 原生解码</b>：完整支持 8/16/24/32-bit PCM 与 32/64-bit 浮点采样，高保真剪辑。</li>
  <li>🎚️ <b>RMS 均方根音量归一化</b>：内置声学平滑算法，自动平衡字与字之间的音量，告别“忽大忽小”。</li>
  <li>📻 <b>原声大碟贪婪匹配</b>：长词优先匹配经典短语（“大家好啊”、“我是说的道理”、“今天来点大家想看的东西”）。</li>
  <li>🔤 <b>中式英文与数字发音</b>：输入 <code>666 ABC</code> 自动转换拼读，自然连贯。</li>
  <li>📦 <b>在线按需拉取</b>：支持从 Gitee / GitHub Releases 镜像列表按顺序回退拉取切片包，保持 npm 包体极简。</li>
  <li>💬 <b>细粒度语音引用</b>：支持配置默认是否引用触发消息，并可为各平台单独覆盖。</li>
</ul>

<h3>📌 常用指令与别名</h3>

<div style="${codeBlockStyle}">
  <div><b>主指令：</b><code>hzys &lt;content:text&gt;</code></div>
  <div style="margin-top: 4px;"><b>别名：</b><code>otto</code>、<code>ottohzys</code>、<code>otto-hzys</code>、<code>活字印刷</code>、<code>otto活字印刷</code>、<code>otto-活字印刷</code>、<code>欧头活字印刷</code>、<code>欧头-活字印刷</code></div>
  <div style="margin-top: 4px;"><b>查看语音包：</b><code>hzys.packlist</code>（别名 <code>.pack</code>、<code>.packs</code>、<code>.list</code>，支持自定义子指令名）</div>
</div>

<!-- ================= 折叠区域 1: 绿色卡片 - 参数选项 ================= -->
<details class="k-usage-card card-green" style="${baseDetailsStyle}">
<summary style="${baseSummaryStyle}">
  <span>🎛️ 指令参数与选项说明</span>
  <span class="k-fold-hint">
    <span class="k-fold-state"></span>
    <span class="k-arrow-icon">▼</span>
  </span>
</summary>
<div class="k-card-body" style="${baseBodyStyle}">
  <ul style="margin: 6px 0; padding-left: 20px; line-height: 1.85;">
    <li><code>-s, --speed &lt;multiplier&gt;</code>：调节语音语速，范围 <code>0.5 ~ 2.5</code>（默认 <code>1.0</code>）。</li>
    <li><code>-r, --reverse</code>：倒放合成后的音频（制造神金与鬼畜效果）。</li>
    <li><code>-n, --norm</code> / <code>-N, --no-norm</code>：显式开启 / 禁用 RMS 音量归一化（默认开启）。</li>
    <li><code>-y, --ysdd</code> / <code>-Y, --no-ysdd</code>：启用 / 禁用原声大碟匹配（禁用后将强制采用纯单字拼读）。</li>
    <li><code>-P, --pause &lt;seconds&gt;</code>：标点符号与空格停顿间隔时长（秒，默认 <code>0.25</code>）。</li>
    <li><code>-p, --pack &lt;name&gt;</code>：指定所使用的语音包名称（默认 <code>otto</code>）。</li>
  </ul>
</div>
</details>

<!-- ================= 折叠区域 2: 橙金卡片 - 调音使用示例 ================= -->
<details class="k-usage-card card-orange" style="${baseDetailsStyle}">
<summary style="${baseSummaryStyle}">
  <span>💡 常用使用与调音鬼畜示例</span>
  <span class="k-fold-hint">
    <span class="k-fold-state"></span>
    <span class="k-arrow-icon">▼</span>
  </span>
</summary>
<div class="k-card-body" style="${baseBodyStyle}">
  <p style="margin: 8px 0 2px;"><b>1. 基础活字印刷合成：</b></p>
  <pre style="${codeBlockStyle}"><code>/otto 大家好啊 我是说的道理</code></pre>

  <p style="margin: 8px 0 2px;"><b>2. 英文与数字连读（自动转换发音）：</b></p>
  <pre style="${codeBlockStyle}"><code>/otto 666 ABC 今天天气真好</code></pre>

  <p style="margin: 8px 0 2px;"><b>3. 1.5 倍速播放并倒放（异世界恶魔低语）：</b></p>
  <pre style="${codeBlockStyle}"><code>/otto -s 1.5 -r 说的道理</code></pre>

  <p style="margin: 8px 0 2px;"><b>4. 纯单字切片拼接（关闭原声大碟，极具机械喜感）：</b></p>
  <pre style="${codeBlockStyle}"><code>/otto -Y 大家好啊我是说的道理</code></pre>
</div>
</details>

<!-- ================= 折叠区域 3: 紫色卡片 - 原声大碟短语库 ================= -->
<details class="k-usage-card card-purple" style="${baseDetailsStyle}">
<summary style="${baseSummaryStyle}">
  <span>📻 内置原声大碟精选短语（长词贪婪匹配）</span>
  <span class="k-fold-hint">
    <span class="k-fold-state"></span>
    <span class="k-arrow-icon">▼</span>
  </span>
</summary>
<div class="k-card-body" style="${baseBodyStyle}">
  <p>插件内置了经典长短语优先匹配机制，当文本命中以下经典台词时，会自动调用原版连续采样音频，听感比单字拼接更加自然连贯：</p>
  <ul style="margin: 6px 0; padding-left: 20px; line-height: 1.8;">
    <li><code>大家好啊</code>、<code>我是说的道理</code>、<code>今天来点大家想看的东西</code></li>
    <li><code>哇真的是你啊</code>、<code>你也网上冲浪啊</code>、<code>芜湖起飞</code></li>
    <li><code>你们可能不知道只用二十万赢到五百七十八万是什么概念</code></li>
    <li><code>哈比下</code>、<code>白银也是银</code>、<code>别急</code>、<code>直接拔电源</code></li>
  </ul>
  <p style="margin-top: 6px; font-size: 13px; color: var(--k-text-light, #909399);">💡 提示：若希望故意拆开成机械电音，可使用 <code>-Y</code> 参数或在字与字之间插入空格。</p>
</div>
</details>

<!-- ================= 折叠区域 4: 蓝色卡片 - 离线包与镜像拉取 ================= -->
<details class="k-usage-card card-blue" style="${baseDetailsStyle}">
<summary style="${baseSummaryStyle}">
  <span>📦 语音包离线下载与镜像源配置</span>
  <span class="k-fold-hint">
    <span class="k-fold-state"></span>
    <span class="k-arrow-icon">▼</span>
  </span>
</summary>
<div class="k-card-body" style="${baseBodyStyle}">
  <p>为保证 npm 发布包轻量，插件首次启动若本地未解压切片，会自动根据配置从高可用镜像源拉取：</p>
  <ul style="margin: 6px 0; padding-left: 20px; line-height: 1.8;">
    <li><b>首选镜像源</b>：Gitee Releases（国内网络极速直连，免代理，秒级下载）</li>
    <li><b>备用镜像源</b>：GitHub Releases（海外节点备用回退）</li>
    <li><b>本地解压目录</b>：音频切片将自动解压并缓存在 <code>data/otto-hzys/packs/otto</code> 中，无需重复下载。</li>
  </ul>
</div>
</details>

<!-- ================= 折叠区域 5: 清爽青蓝卡片 - 平台兼容性 (杜绝暗黑隐身) ================= -->
<details class="k-usage-card card-cyan" style="${baseDetailsStyle}">
<summary style="${baseSummaryStyle}">
  <span style="color: var(--card-title-color, var(--k-text-dark, #4fd1c5));">💬 多聊天平台语音适配与引用策略</span>
  <span class="k-fold-hint">
    <span class="k-fold-state"></span>
    <span class="k-arrow-icon">▼</span>
  </span>
</summary>
<div class="k-card-body" style="${baseBodyStyle}">
  <p>插件输出标准 Koishi <code>h.audio</code> 媒体流，深度适配各大平台协议：</p>
  <ul style="margin: 6px 0; padding-left: 20px; line-height: 1.8;">
    <li><b>OneBot / Red 平台</b>：自动支持通过语音消息发送，并支持 quote 引用。</li>
    <li><b>QQ 官方 Bot 平台</b>：支持公网 URL 转换或本地语音格式上传。</li>
    <li><b>Telegram / Discord / KOOK</b>：自动转为平台原生语音条展示。</li>
    <li><b>个性化引用</b>：可在配置项 <code>platformQuoteOverrides</code> 中按平台自定义开启/关闭引用。</li>
  </ul>
</div>
</details>

<!-- ================= 折叠区域 6: 粉赤卡片 - 讨论区与神金台词 ================= -->
<details class="k-usage-card card-pink" style="${baseDetailsStyle}">
<summary style="${baseSummaryStyle}">
  <span>🎉 活字茶话会：分享你的神金台词与调音组合！</span>
  <span class="k-fold-hint">
    <span class="k-fold-state"></span>
    <span class="k-arrow-icon">▼</span>
  </span>
</summary>
<div class="k-card-body" style="${baseBodyStyle}">
  <p>你在群里试出了哪些具有绝妙节目效果的活字印刷台词？或者发现某种离谱的 <code>-s</code>、<code>-r</code> 调音组合？</p>
  <p style="margin: 10px 0;">
    👉 <b>欢迎前往 GitHub 社区讨论区分享交流：</b><br>
    <a href="https://github.com/VincentZyuApps/koishi-plugin-otto-hzys/discussions/5" target="_blank" style="display:inline-block;margin-top:6px;padding:6px 14px;background:#e53e3e;color:#fff;border-radius:6px;text-decoration:none;font-weight:700;">
      💬 点我直达 Discussions #5「神金台词分享专区」→
    </a>
  </p>
  <p style="font-size: 13px; color: var(--k-text-light, #909399);">大家发掘的好玩的谐音梗、整活句子统统可以贴在置顶讨论帖里交流哦~ 2333</p>
</div>
</details>

<hr>
`;
