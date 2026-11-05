import { Schema } from 'koishi'

export const DEFAULT_DOWNLOAD_MIRROR_URL_LIST = [
  'https://gitee.com/vincent-zyu/koishi-plugin-otto-hzys/releases/download/v0.1.0',
  'https://github.com/VincentZyuApps/koishi-plugin-otto-hzys/releases/download/v0.1.0',
]

export interface AudioQuotePlatformConfig {
  platform: string // 🎯 平台名称（如 onebot、discord）
  quote: boolean // 💬 该平台是否引用触发消息
}

export interface Config {
  // ===== 📌 指令与别名设置 =====
  commandName?: string // 📌 主指令名称（默认 hzys）
  commandAliases?: string[] // 🏷️ 指令别名列表（table）
  packListName?: string // 📦 语音包列表子指令名称（默认 .packlist）
  packListAliases?: string[] // 📦 语音包列表子指令别名列表（table）

  // ===== 📦 语音包与下载设置 =====
  defaultPack: string // 🎙️ 默认使用的语音包名称（默认 otto）
  autoDownload: boolean // 🚀 启动时若缺失是否自动静默下载
  downloadMirrorUrlList: string[] // 🌐 在线语音包下载镜像基础地址列表

  // ===== 💬 语音发送与引用设置 =====
  defaultAudioQuote: boolean // 💬 默认发送语音时是否引用触发消息
  audioQuotePlatformList: AudioQuotePlatformConfig[] // 📋 按平台覆盖语音引用行为

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
    packListName: Schema.string()
      .default('.packlist')
      .description('📦 语音包列表子指令名称（默认 .packlist，可自定义，如 .packs）'),
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
    downloadMirrorUrlList: Schema.array(Schema.string())
      .role('table')
      .min(1)
      .default(DEFAULT_DOWNLOAD_MIRROR_URL_LIST)
      .description('🌐 语音包下载镜像基础地址列表，按顺序依次尝试，任一成功即停止（末尾无需加斜杠）'),
  }).description('📦 语音包与资源下载设置 📥'),

  // ===== 💬 语音发送与引用设置 =====
  Schema.object({
    defaultAudioQuote: Schema.union([
      Schema.const(true).description('带引用（quote）'),
      Schema.const(false).description('不带引用'),
    ])
      .role('radio')
      .default(true)
      .description('💬 默认发送语音时是否引用触发指令的消息'),
    audioQuotePlatformList: Schema.array(Schema.object({
      platform: Schema.string()
        .required()
        .description('🎯 平台名称（如 onebot、discord、qq）'),
      quote: Schema.boolean()
        .default(true)
        .description('💬 该平台发送语音时是否带引用'),
    }))
      .role('table')
      .default([
        { platform: 'onebot', quote: false },
        { platform: 'qq', quote: false },
        { platform: 'discord', quote: true },
      ])
      .description('📋 按平台覆盖语音引用行为，未匹配的平台使用默认值'),
  }).description('💬 语音发送与引用设置 🔗'),

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
