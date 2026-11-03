import { Schema } from 'koishi'

export interface Config {
  defaultPack: string
  autoDownload: boolean
  downloadMirror: string
  defaultNorm: boolean
  defaultYsdd: boolean
  defaultSpeed: number
  pauseLength: number
}

export const Config: Schema<Config> = Schema.object({
  defaultPack: Schema.string()
    .default('otto')
    .description('默认使用的语音包名称'),
  autoDownload: Schema.boolean()
    .default(true)
    .description('插件启动时是否自动检测并在后台下载默认语音包'),
  downloadMirror: Schema.string()
    .default('https://github.com/VincentZyu233/koishi-plugin-otto-hzys/releases/download/v0.1.0')
    .description('在线语音包下载基础地址（无需包含文件名，末尾不要加斜杠）'),
  defaultNorm: Schema.boolean()
    .default(true)
    .description('是否默认开启音量归一化（统一每个字的音量，防止忽大忽小）'),
  defaultYsdd: Schema.boolean()
    .default(true)
    .description('是否默认开启原声大碟（匹配到经典长短语时优先播放整段原声）'),
  defaultSpeed: Schema.number()
    .min(0.5)
    .max(2.5)
    .step(0.1)
    .default(1.0)
    .description('默认语音播放速度倍率 (0.5 ~ 2.5)'),
  pauseLength: Schema.number()
    .min(0.05)
    .max(1.0)
    .step(0.05)
    .default(0.25)
    .description('空格与标点符号的停顿长度（秒）'),
})
