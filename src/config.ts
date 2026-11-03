import { Schema } from 'koishi'

export interface Config {
  // ===== 📌 指令与别名设置 =====
  commandName?: string // 📌 主指令名称（默认 hzys）
  commandAliases?: string[] // 🏷️ 指令别名列表（table）
  packListAliases?: string[] // 📦 语音包列表子指令别名列表（table）

  // ===== 📦 语音包与下载设置 =====
  defaultPack: string // 🎙️ 默认使用的语音包名称（默认 otto）
  autoDownload: boolean // 🚀 启动时若缺失是否自动静默下载
  downloadMirror: string // 🌐 在线语音包下载镜像基础地址

  // ===== 🎛️ 音频合成与特效默认参数 =====
  defaultNorm: boolean // 🎚️ 是否默认开启音量均方根归一化
  defaultYsdd: boolean // 📻 是否默认开启原声大碟匹配
  defaultSpeed: number // ⏩ 默认音频播放速度倍率（0.5 ~ 2.5）
  pauseLength: number // ⏱️ 标点符号与空格默认停顿间隔时长（秒）
}

export const Config: Schema<Config> = Schema.intersect([
  // ===== 📌 指令与别名设置 =====
  Schema.object({
    commandName: Schema.string()
      .default('hzys')
      .description('📌 主指令名称（如 hzys、otto）'),
    commandAliases: Schema.array(Schema.string())
      .role('table')
      .default(['otto', 'ottohzys', 'otto-hzys', '活字印刷', 'otto活字印刷', 'otto-活字印刷', '欧头活字印刷', '欧头-活字印刷'])
      .description('🏷️ 指令别名列表（在聊天中可通过任意别名触发）'),
    packListAliases: Schema.array(Schema.string())
      .role('table')
      .default(['.pack', '.packs', '.list'])
      .description('📦 语音包列表子指令别名列表（在主指令后跟随触发，如 /otto pack）'),
  }).description('📌 指令与别名设置 ⚙️'),

  // ===== 📦 语音包与下载设置 =====
  Schema.object({
    defaultPack: Schema.string()
      .default('otto')
      .description('🎙️ 默认使用的语音包名称（存放于 data/otto-hzys/packs/<name>）'),
    autoDownload: Schema.boolean()
      .default(true)
      .description('🚀 插件启动时，若本地缺失默认语音包是否在后台自动静默下载'),
    downloadMirror: Schema.string()
      .default('https://github.com/VincentZyuApps/koishi-plugin-otto-hzys/releases/download/v0.1.0')
      .description('🌐 在线语音包下载镜像基础地址（末尾无需加斜杠，国内推荐使用 Gitee Releases 地址）'),
  }).description('📦 语音包与资源下载设置 📥'),

  // ===== 🎛️ 音频合成与特效默认参数 =====
  Schema.object({
    defaultNorm: Schema.boolean()
      .default(true)
      .description('🎚️ 是否默认开启音量归一化（统一字词间的 RMS 能量，防止声音忽大忽小）'),
    defaultYsdd: Schema.boolean()
      .default(true)
      .description('📻 是否默认开启原声大碟匹配（识别到经典长短语时优先播放整段原声）'),
    defaultSpeed: Schema.number()
      .min(0.5)
      .max(2.5)
      .step(0.1)
      .default(1.0)
      .description('⏩ 默认音频播放速度倍率（支持 0.5 ~ 2.5 倍速）'),
    pauseLength: Schema.number()
      .min(0.05)
      .max(1.0)
      .step(0.05)
      .default(0.25)
      .description('⏱️ 标点符号与空格默认停顿间隔时长（秒）'),
  }).description('🎛️ 音频合成与特效默认参数 🎵'),
])
