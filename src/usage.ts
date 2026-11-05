const pkg = require('../package.json');

const KOISHI_LOGO_BASE64 = 'data%3Aimage%2Fpng%3Bbase64%2CiVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAABU0lEQVR42p2UQSsFYRSGnxnqLuytKWKpKFkQNsS%2FsOHPWPADLCmxU5S7UzYWNrJR7lYiRF2FeWzOMKZ7mXHqNNP5vvP2nu%2B850CY2lP4X1K31ZbaDm%2BpO%2Bpyp5wfAXVEPfRvO1JHf4AVQGbUh7j4EZ4VkrNCXPVRnf3CUBN1SH2KC28VGOV3ntRhNclZHdcAKYM11QR1oVBOXctzFlNgBTC8qmXxPQEegbVeYApIgJT6tg%2F0AdMp0B%2FBpCabK2AAmAAa%2F2GRBft1oBFPkqTAba7LCiAfQC9wClwAY1HJHepuiO29Yrsf1Dn1uiDU3RTYCtTkl1Leg8k9MB4NGgReI28rV3azgyCz0og01Xl1Uz1QX8uCTELm3UbkTF1VJ9Wr0tn3iBSGdjYG0XivE3VN3VD31PM4a3cc2tIGGI0VkTO7rLxGuiy25ejmjfqsvkSXui62TxaK03td4FXTAAAAAElFTkSuQmCC';

// 通用卡片与代码块样式
const baseDetailsStyle = 'margin:12px 0;border-radius:10px;overflow:hidden;box-shadow:var(--k-card-shadow, 0 1px 4px rgb(0 0 0 / 10%));transition:border-color .2s ease, background-color .2s ease;';
const baseSummaryStyle = 'padding:10px 14px;cursor:pointer;user-select:none;font-weight:700;display:flex;align-items:center;';
const baseBodyStyle = 'padding:10px 16px 14px;color:var(--k-text-dark, inherit);line-height:1.75;font-size:14px;';
const codeBlockStyle = 'margin:6px 0 10px;padding:8px 12px;background:var(--k-hover-bg, rgba(127, 127, 127, .12));border:1px solid var(--k-color-divider, rgba(127, 127, 127, .2));border-radius:6px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:13px;line-height:1.6;overflow-x:auto;color:var(--k-text-dark, inherit);';

// 6 大主题色彩独立卡片配置（默认折叠，带有独立背景色与圆角框）
// 1. 绿卡（指令参数）
const greenDetails = `${baseDetailsStyle}border:1px solid rgba(47, 133, 90, 0.4);background:rgba(47, 133, 90, 0.05);`;
const greenSummary = `${baseSummaryStyle}background:rgba(47, 133, 90, 0.12);color:#22543d;`;
const greenBody = `${baseBodyStyle}border-top:1px solid rgba(47, 133, 90, 0.2);`;

// 2. 橙金卡（调音实战示例）
const orangeDetails = `${baseDetailsStyle}border:1px solid rgba(221, 107, 32, 0.4);background:rgba(221, 107, 32, 0.05);`;
const orangeSummary = `${baseSummaryStyle}background:rgba(221, 107, 32, 0.12);color:#9c4221;`;
const orangeBody = `${baseBodyStyle}border-top:1px solid rgba(221, 107, 32, 0.2);`;

// 3. 紫卡（原声大碟词库）
const purpleDetails = `${baseDetailsStyle}border:1px solid rgba(128, 90, 213, 0.4);background:rgba(128, 90, 213, 0.05);`;
const purpleSummary = `${baseSummaryStyle}background:rgba(128, 90, 213, 0.12);color:#553c9a;`;
const purpleBody = `${baseBodyStyle}border-top:1px solid rgba(128, 90, 213, 0.2);`;

// 4. 蓝卡（离线包与镜像加速）
const blueDetails = `${baseDetailsStyle}border:1px solid rgba(49, 130, 206, 0.4);background:rgba(49, 130, 206, 0.05);`;
const blueSummary = `${baseSummaryStyle}background:rgba(49, 130, 206, 0.12);color:#2b6cb0;`;
const blueBody = `${baseBodyStyle}border-top:1px solid rgba(49, 130, 206, 0.2);`;

// 5. 蓝灰卡（多平台适配与引用）
const slateDetails = `${baseDetailsStyle}border:1px solid rgba(74, 85, 104, 0.4);background:rgba(74, 85, 104, 0.05);`;
const slateSummary = `${baseSummaryStyle}background:rgba(74, 85, 104, 0.12);color:#2d3748;`;
const slateBody = `${baseBodyStyle}border-top:1px solid rgba(74, 85, 104, 0.2);`;

// 6. 粉赤卡（神金台词讨论区）
const pinkDetails = `${baseDetailsStyle}border:1px solid rgba(229, 62, 62, 0.4);background:rgba(229, 62, 62, 0.05);`;
const pinkSummary = `${baseSummaryStyle}background:rgba(229, 62, 62, 0.12);color:#9b2c2c;`;
const pinkBody = `${baseBodyStyle}border-top:1px solid rgba(229, 62, 62, 0.2);`;

export const usage = `
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
<details style="${greenDetails}">
<summary style="${greenSummary}">
  <span>🎛️ 指令参数与选项说明</span>
</summary>
<div style="${greenBody}">
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
<details style="${orangeDetails}">
<summary style="${orangeSummary}">
  <span>💡 常用使用与调音鬼畜示例</span>
</summary>
<div style="${orangeBody}">
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
<details style="${purpleDetails}">
<summary style="${purpleSummary}">
  <span>📻 内置原声大碟精选短语（长词贪婪匹配）</span>
</summary>
<div style="${purpleBody}">
  <p>插件内置了经典长短语优先匹配机制，当文本命中以下经典台词时，会自动调用原版连续采样音频，听感比单字拼接更加自然连贯：</p>
  <ul style="margin: 6px 0; padding-left: 20px; line-height: 1.8;">
    <li><code>大家好啊</code>、<code>我是说的道理</code>、<code>今天来点大家想看的东西</code></li>
    <li><code>哇真的是你啊</code>、<code>你也网上冲浪啊</code>、<code>芜湖起飞</code></li>
    <li><code>你们可能不知道只用二十万赢到五百七十八万是什么概念</code></li>
    <li><code>哈比下</code>、<code>白银也是银</code>、<code>别急</code>、<code>直接拔电源</code></li>
  </ul>
  <p style="margin-top: 6px; font-size: 13px; color: #718096;">💡 提示：若希望故意拆开成机械电音，可使用 <code>-Y</code> 参数或在字与字之间插入空格。</p>
</div>
</details>

<!-- ================= 折叠区域 4: 蓝色卡片 - 离线包与镜像拉取 ================= -->
<details style="${blueDetails}">
<summary style="${blueSummary}">
  <span>📦 语音包离线下载与镜像源配置</span>
</summary>
<div style="${blueBody}">
  <p>为保证 npm 发布包轻量，插件首次启动若本地未解压切片，会自动根据配置从高可用镜像源拉取：</p>
  <ul style="margin: 6px 0; padding-left: 20px; line-height: 1.8;">
    <li><b>首选镜像源</b>：Gitee Releases（国内网络极速直连，免代理，秒级下载）</li>
    <li><b>备用镜像源</b>：GitHub Releases（海外节点备用回退）</li>
    <li><b>本地解压目录</b>：音频切片将自动解压并缓存在 <code>data/otto-hzys/packs/otto</code> 中，无需重复下载。</li>
  </ul>
</div>
</details>

<!-- ================= 折叠区域 5: 蓝灰卡片 - 平台兼容性 ================= -->
<details style="${slateDetails}">
<summary style="${slateSummary}">
  <span>💬 多聊天平台语音适配与引用策略</span>
</summary>
<div style="${slateBody}">
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
<details style="${pinkDetails}">
<summary style="${pinkSummary}">
  <span>🎉 活字茶话会：分享你的神金台词与调音组合！</span>
</summary>
<div style="${pinkBody}">
  <p>你在群里试出了哪些具有绝妙节目效果的活字印刷台词？或者发现某种离谱的 <code>-s</code>、<code>-r</code> 调音组合？</p>
  <p style="margin: 10px 0;">
    👉 <b>欢迎前往 GitHub 社区讨论区分享交流：</b><br>
    <a href="https://github.com/VincentZyuApps/koishi-plugin-otto-hzys/discussions/5" target="_blank" style="display:inline-block;margin-top:6px;padding:6px 14px;background:#e53e3e;color:#fff;border-radius:6px;text-decoration:none;font-weight:700;">
      💬 点我直达 Discussions #5「神金台词分享专区」→
    </a>
  </p>
  <p style="font-size: 13px; color: #718096;">大家发掘的好玩的谐音梗、整活句子统统可以贴在置顶讨论帖里交流哦~ 2333</p>
</div>
</details>

<hr>
`;
