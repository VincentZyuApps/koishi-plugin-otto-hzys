> 💡 推荐前往 [GitHub](https://github.com/VincentZyuApps/koishi-plugin-otto-hzys) 或 [Gitee](https://gitee.com/vincent-zyu/koishi-plugin-otto-hzys) 阅读 README，体验更好。

![koishi-plugin-otto-hzys](https://socialify.git.ci/VincentZyuApps/koishi-plugin-otto-hzys/image?description=1&font=Bitter&forks=1&issues=1&language=1&logo=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Ff%2Ff3%2FKoishi.js_Logo.png&name=1&owner=1&pattern=Plus&pulls=1&stargazers=1&theme=Auto)

# 📻 koishi-plugin-otto-hzys

[![npm](https://img.shields.io/npm/v/koishi-plugin-otto-hzys?style=flat-square&logo=npm)](https://www.npmjs.com/package/koishi-plugin-otto-hzys)
[![npm-download](https://img.shields.io/npm/dm/koishi-plugin-otto-hzys?style=flat-square&logo=npm)](https://npm-stat.com/charts.html?package=koishi-plugin-otto-hzys)

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/VincentZyuApps/koishi-plugin-otto-hzys)
[![Gitee](https://img.shields.io/badge/Gitee-C71D23?style=for-the-badge&logo=gitee&logoColor=white)](https://gitee.com/vincent-zyu/koishi-plugin-otto-hzys)

[![Koishi Forum](https://img.shields.io/badge/Koishi%20Forum-xxxxx-5546A3?style=for-the-badge&logo=data%3Aimage%2Fpng%3Bbase64%2CiVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAABU0lEQVR42p2UQSsFYRSGnxnqLuytKWKpKFkQNsS%2FsOHPWPADLCmxU5S7UzYWNrJR7lYiRF2FeWzOMKZ7mXHqNNP5vvP2nu%2B850CY2lP4X1K31ZbaDm%2BpO%2Bpyp5wfAXVEPfRvO1JHf4AVQGbUh7j4EZ4VkrNCXPVRnf3CUBN1SH2KC28VGOV3ntRhNclZHdcAKYM11QR1oVBOXctzFlNgBTC8qmXxPQEegbVeYApIgJT6tg%2F0AdMp0B%2FBpCabK2AAmAAa%2F2GRBft1oBFPkqTAba7LCiAfQC9wClwAY1HJHepuiO29Yrsf1Dn1uiDU3RTYCtTkl1Leg8k9MB4NGgReI28rV3azgyCz0og01Xl1Uz1QX8uCTELm3UbkTF1VJ9Wr0tn3iBSGdjYG0XivE3VN3VD31PM4a3cc2tIGGI0VkTO7rLxGuiy25ejmjfqsvkSXui62TxaK03td4FXTAAAAAElFTkSuQmCC&logoColor=white)](https://forum.koishi.xyz/t/topic/xxxxx)

[![QQ群](https://img.shields.io/badge/QQ群-1085190201-12B7F5?style=flat-square&logo=qq&logoColor=white)](https://qm.qq.com/q/ZHj33L5cuC)

<h2>💬 交流反馈</h2>
<p>🐛 Bug 反馈 / 💡 建议 / 👨‍💻 插件开发交流，欢迎加群：</p>
<p><del>💬 插件使用问题 / 🐛 Bug反馈 / 👨‍💻 插件开发交流，欢迎加入QQ群：<b>259248174</b>   🎉（这个群G了）</del></p> 
<p>💬 插件使用问题 / 🐛 Bug反馈 / 👨‍💻 插件开发交流，欢迎加入QQ群：<b>1085190201</b> 🎉</p>
<p>💡 在群里直接艾特我，回复的更快哦~ ✨</p>

---

**纯 TypeScript 实现的开箱即用 Otto 活字印刷语音合成插件**，无需部署任何外部 Python Flask 后端，无需依赖易失效的第三方云函数。

> 🙏 **上游致谢**：本插件的语音包与实现灵感来自 [@lgc-NB2Dev](https://github.com/lgc-NB2Dev) 的开源项目 [nonebot-plugin-ottohzys](https://github.com/lgc-NB2Dev/nonebot-plugin-ottohzys)，感谢上游作者提供的基础与灵感！

## ✨ 特性

- 🚀 **纯 TypeScript 纯净架构**：内置轻量纯 JS/TS WAV 编解码与重采样引擎，完全在 Node.js 内存中毫秒级完成音频切片拼接。
- 🎧 **多格式 WAV 解码**：支持 8/16/24/32-bit PCM、32/64-bit float 与 WAVE_FORMAT_EXTENSIBLE，兼容不同来源的语音切片。
- 📦 **开箱即用 / 远程按需拉取**：
  - 自动从 GitHub/Gitee Releases 按需拉取语音包切片并解压，避免臃肿的 npm 包体积。
- 🎚️ **RMS 音量归一化**：内置均方根能量平滑算法，统一单个字词的发音音量，告别“忽大忽小”。
- 📻 **原声大碟 (YSDD) 贪婪匹配**：长句优先智能匹配经典名场面原声（如“大家好啊”、“我是说的道理”、“今天来点大家想看的东西”）。
- 🔤 **中式英语/数字拼读**：输入字母数字（如 `666 ABC`）自动转为地道中式发音切片。
- ⏩ **高级音频特效**：支持自由指定语速（`--speed` 0.5x~2.5x）、音频倒放（`--reverse`）、符号停顿长度（`--pause`）。

## 📊 插件市场生态调研与架构对比

在开发本插件前，我们对 Koishi 插件市场中现存的 Otto / 活字印刷插件进行了深入调研（详见完整的 [竞品对比分析文档](./docs/competitor-research.md)）：

![Koishi 插件市场搜索结果](https://cdn.jsdelivr.net/gh/VincentZyuApps/koishi-plugin-otto-hzys@main/docs/images/uniapp-market-search-otto-20261105.png)

区别于以往插件**要么需要部署繁琐的外部 Python Flask 后端**（如 `huozi-generator`），**要么依赖极易失效的第三方个人云函数**（如 `@asuna-bot/otto-synth`），本项目实现了**真正的纯内嵌、零外部后端依赖、毫秒级本地合成**。

## 📖 指令与用法

### 主指令

- `hzys <content:text>`
- **别名**：`otto`、`ottohzys`、`otto-hzys`、`活字印刷`、`otto活字印刷`、`otto-活字印刷`、`欧头活字印刷`、`欧头-活字印刷`

### 子指令

- `hzys.packlist`（别名 `.pack`、`.packs`、`.list`）：查看本地所有已下载/安装的语音包名称及音频切片数量统计。子指令名可通过配置项 `packListName` 自定义。

### 选项参数

| 参数选项 | 简写 | 默认值 | 作用说明 |
| :--- | :--- | :--- | :--- |
| `--pack <name>` | `-p` | `otto` | 指定使用的语音包目录名称 |
| `--speed <multiplier>` | `-s` | `1.0` | 调整音频语速（支持 0.5 ~ 2.5 倍速） |
| `--reverse` | `-r` | `false` | 倒放生成的活字印刷音频 |
| `--norm` / `--no-norm` | `-n` / `-N` | `true` | 启用 / 禁用均方根 (RMS) 音量归一化 |
| `--ysdd` / `--no-ysdd` | `-y` / `-Y` | `true` | 启用 / 禁用经典短语的原声大碟匹配 |
| `--pause <seconds>` | `-P` | `0.25` | 标点符号与空格的停顿间隔时长（秒） |

### 示例

```bash
# 基础合成
/otto 大家好啊 我是说的道理

# 混合英文字母与数字
/otto 666 abc 今天天气真好

# 1.5倍速并倒放
/otto -s 1.5 -r 说的道理

# 纯拼音切片拼接（禁用原声大碟）
/otto -Y 大家好啊
```

## ⚙️ 插件配置项

| 配置项 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `defaultPack` | `string` | `otto` | 默认加载的语音包名称 |
| `autoDownload` | `boolean` | `true` | 插件启动时是否在后台自动检测并下载默认语音包 |
| `packListName` | `string` | `.packlist` | 语音包列表子指令名称，可自定义 |
| `downloadMirrorUrlList` | `string[]` | Gitee 和 GitHub Releases 地址 | 远程语音包下载镜像基础地址列表，按顺序逐个尝试 |
| `defaultAudioQuote` | `boolean` | `true` | 默认发送语音时是否引用触发指令的消息 |
| `audioQuotePlatformList` | `{ platform, quote }[]` | `onebot: false`、`qq: false`、`telegram: true`、`kook: true`、`lark: true`、`discord: true` | 按平台覆盖语音引用行为，未匹配的平台使用默认值 |
| `defaultNorm` | `boolean` | `true` | 默认是否开启音量归一化 |
| `defaultYsdd` | `boolean` | `true` | 默认是否开启原声大碟匹配 |
| `defaultSpeed` | `number` | `1.0` | 默认音频播放速度倍率 |
| `pauseLength` | `number` | `0.25` | 标点符号与空格默认停顿秒数 |

## 📁 资源目录结构

语音包存放于运行根目录的 `data/otto-hzys/packs/<packName>/` 中：

```text
data/otto-hzys/packs/otto/
├── sources/          # 普通拼音音频切片 (a.wav, ba.wav, ni.wav ...)
├── ysddSources/      # 原声大碟音频切片 (djha.wav, wssddl.wav ...)
└── ysddTable.json    # 原声短语到音频文件名的映射表
```
