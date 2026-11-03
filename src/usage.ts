const pkg = require('../package.json')

const detailsStyle = 'margin:10px 0;border:1px solid var(--k-color-border, #909399);border-radius:8px;background:var(--k-card-bg, transparent);color:var(--k-text-dark, inherit);overflow:hidden;box-shadow:var(--k-card-shadow, 0 1px 3px rgb(0 0 0 / 12%));transition:var(--color-transition, border-color .2s ease, background-color .2s ease)'
const summaryStyle = 'padding:9px 12px;background:var(--k-hover-bg, rgba(127, 127, 127, .12));color:var(--k-text-dark, inherit);cursor:pointer;user-select:none'
const detailsBodyStyle = 'padding:2px 14px 8px;border-top:1px solid var(--k-color-divider, rgba(127, 127, 127, .28));background:var(--k-card-bg, transparent);color:var(--k-text-dark, inherit)'

export const usage = `
<h1>Koishi 插件：Otto 活字印刷语音合成 otto-hzys</h1>
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
  <a href="https://qm.qq.com/q/rvrRosfKMw" target="_blank">
    <img src="https://img.shields.io/badge/awa群_zyu建的qq群-1085190201-12B7F5?style=flat-square&logo=qq&logoColor=white" alt="awa群-zyu建的qq群">
  </a>
</p>

<h2>✨ 核心特色</h2>

<ul>
  <li>🚀 <b>纯 TypeScript 架构</b>：无需部署外部 Python Flask，不依赖易失效的第三方 Web API，内存毫秒级合成。</li>
  <li>🎚️ <b>RMS 音量归一化</b>：内置均方根算法，自动平滑字与字之间的音量，告别“忽大忽小”。</li>
  <li>📻 <b>原声大碟贪婪匹配</b>：长词优先匹配经典短语（“大家好啊”、“我是说的道理”、“今天来点大家想看的东西”）。</li>
  <li>🔤 <b>中式英文与数字发音</b>：输入 <code>666 ABC</code> 自动转换拼读，流畅自然。</li>
  <li>📦 <b>免流预热与多镜像分发</b>：支持从 GitHub / Gitee Releases 按需拉取语音包切片，保持 npm 包体极简。</li>
</ul>

<h3>📌 常用指令与别名</h3>

<pre>
主指令：<code>hzys &lt;content:text&gt;</code>
别名：<code>otto</code>、<code>活字印刷</code>、<code>说的道理</code>
</pre>

<details style="${detailsStyle}">
<summary style="${summaryStyle}"><b style="color: #2f855a;">🎛️ 指令参数与选项说明</b></summary>
<div style="${detailsBodyStyle}">
<ul>
  <li><code>-s, --speed &lt;multiplier&gt;</code>：调节语音语速，范围 <code>0.5 ~ 2.5</code>（默认 <code>1.0</code>）。</li>
  <li><code>-r, --reverse</code>：倒放合成后的音频（鬼畜效果）。</li>
  <li><code>-n, --norm</code> / <code>-N, --no-norm</code>：启用 / 禁用 RMS 音量归一化（默认开启）。</li>
  <li><code>-y, --ysdd</code> / <code>-Y, --no-ysdd</code>：启用 / 禁用原声大碟匹配（默认开启）。</li>
  <li><code>-P, --pause &lt;seconds&gt;</code>：标点符号与空格停顿间隔时长（秒，默认 <code>0.25</code>）。</li>
  <li><code>-p, --pack &lt;name&gt;</code>：指定所使用的语音包名称（默认 <code>otto</code>）。</li>
</ul>
</div>
</details>

<details style="${detailsStyle}">
<summary style="${summaryStyle}"><b style="color: #ff8a00;">💡 常用使用示例</b></summary>
<div style="${detailsBodyStyle}">
<pre>
# 基础活字印刷合成
/otto 大家好啊 我是说的道理

# 英文与数字连读
/otto 666 ABC 今天天气真好

# 1.5 倍速播放并倒放
/otto -s 1.5 -r 说的道理

# 纯单字切片拼接（关闭原声大碟）
/otto -Y 大家好啊
</pre>
</div>
</details>

<blockquote style="margin: 18px 0; padding: 14px 18px; border-left: 6px solid #10b981; border-radius: 8px; background: rgba(16, 185, 129, 0.1); color: inherit; font-weight: 600; line-height: 1.7;">
  💬 插件使用问题 / 🐛 Bug 反馈 / 💡 需求建议，欢迎加入 QQ 交流群：<b style="color: #12B7F5;">1085190201</b>
</blockquote>
`
