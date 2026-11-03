# koishi-plugin-otto-hzys

[![npm](https://img.shields.io/npm/v/koishi-plugin-otto-hzys?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-otto-hzys)

**纯 TypeScript 实现的开箱即用 Otto 活字印刷语音合成插件**，无需部署任何外部 Python Flask 后端，无需依赖易失效的第三方云函数。

## ✨ 特性

- 🚀 **纯 TypeScript 纯净架构**：内置轻量纯 JS/TS WAV 编解码与重采样引擎，完全在 Node.js 内存中毫秒级完成音频切片拼接。
- 📦 **开箱即用 / 免流预热**：
  - 自动从 GitHub/Gitee Releases 按需拉取语音包切片，避免臃肿的 npm 包体积。
  - 本地开发/已克隆环境下自动秒级复用现有 `HUOZI_koi` 切片，无需消耗带宽。
- 🎚️ **RMS 音量归一化**：内置均方根能量平滑算法，统一单个字词的发音音量，告别“忽大忽小”。
- 📻 **原声大碟 (YSDD) 贪婪匹配**：长句优先智能匹配经典名场面原声（如“大家好啊”、“我是说的道理”、“今天来点大家想看的东西”）。
- 🔤 **中式英语/数字拼读**：输入字母数字（如 `666 ABC`）自动转为地道中式发音切片。
- ⏩ **高级音频特效**：支持自由指定语速（`--speed` 0.5x~2.5x）、音频倒放（`--reverse`）、符号停顿长度（`--pause`）。

## 📖 指令与用法

### 主指令

- `hzys <content:text>`
- **别名**：`otto`、`活字印刷`、`说的道理`

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
| `downloadMirror` | `string` | `https://github.com/lgc-NB2Dev/nonebot-plugin-ottohzys/releases/download/voice-packs` | 远程语音包下载镜像基础地址 |
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
