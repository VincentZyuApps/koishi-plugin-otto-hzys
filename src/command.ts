import { Context, h, Logger } from 'koishi'
import { changeSpeed, createPause, encodeWav, normalizeAudio, reverseAudio } from './audio/wav'
import { Config } from './config'
import { VoicePackManager } from './pack'
import { tokenizeSentence } from './tokenizer'

export function registerCommands(ctx: Context, config: Config, packManager: VoicePackManager) {
  const logger = ctx.logger('otto-hzys')
  const primaryName = config.commandName || 'hzys'

  const cmd = ctx.command(`${primaryName} <content:text>`, '🎙️ 使用电棍/活字印刷语音合成句子')

  const aliasSet = new Set<string>()
  const defaultAliases = [
    'otto',
    'ottohzys',
    'otto-hzys',
    '活字印刷',
    'otto活字印刷',
    'otto-活字印刷',
    '欧头活字印刷',
    '欧头-活字印刷',
    'hzys',
  ]
  for (const a of defaultAliases) {
    if (a !== primaryName) aliasSet.add(a)
  }
  if (Array.isArray(config.commandAliases)) {
    for (const a of config.commandAliases) {
      if (a && a !== primaryName) aliasSet.add(a)
    }
  }

  for (const alias of aliasSet) {
    cmd.alias(alias)
  }

  // 子指令：查看本地已有的语音包名称与切片统计
  cmd.subcommand('.packlist', '📦 查看本地所有已安装的活字印刷语音包')
    .alias('.pack', '.packs', '.list')
    .action(async () => {
      const packs = packManager.listInstalledPacks()
      if (packs.length === 0) {
        return `📁 当前本地尚未下载任何语音包。\n💡 默认语音包为 [${config.defaultPack}]，首次调用合成指令时将自动下载。`
      }
      const lines = [
        `🎙️ 本地已安装语音包列表（共 ${packs.length} 个）：`,
        ...packs.map(p => `  • ${p.name === config.defaultPack ? `⭐ [${p.name}] (当前默认)` : `  [${p.name}]`}: ${p.tokenCount} 个拼音切片，${p.ysddCount} 个原声短语`),
        `\n💡 使用方法：通过 -p 选项指定语音包合成，例如：/otto -p ${packs[0]?.name || 'otto'} 大家好啊`,
        `📂 语音包存放目录：data/otto-hzys/packs/<语音包名>/`
      ]
      return lines.join('\n')
    })

  cmd
    .option('pack', '-p, --pack <name:string> 📁 指定使用的语音包名称', { fallback: config.defaultPack })
    .option('reverse', '-r, --reverse 🔄 倒放生成的音频 (鬼畜效果)', { fallback: false })
    .option('norm', '-n, --norm 🎚️ 统一音频音量 (均方根归一化)', { fallback: config.defaultNorm })
    .option('noNorm', '-N, --no-norm 🔇 禁用音量归一化')
    .option('ysdd', '-y, --ysdd 📻 匹配特定长句时优先使用原声大碟', { fallback: config.defaultYsdd })
    .option('noYsdd', '-Y, --no-ysdd 🚫 禁用原声大碟')
    .option('speed', '-s, --speed <multiplier:number> ⏩ 语音播放速度倍率 (0.5~2.5)', { fallback: config.defaultSpeed })
    .option('pause', '-P, --pause <seconds:number> ⏱️ 标点符号与空格停顿长度 (秒)', { fallback: config.pauseLength })
    .action(async ({ session, options }, content) => {
      if (!content || !content.trim()) {
        return '请输入要合成的文本，例如：/otto 大家好啊 我是说的道理'
      }

      const packName = options.pack || config.defaultPack
      const useNorm = options.noNorm ? false : (options.norm ?? config.defaultNorm)
      const useYsdd = options.noYsdd ? false : (options.ysdd ?? config.defaultYsdd)
      const speed = Math.max(0.5, Math.min(2.5, options.speed || config.defaultSpeed))
      const pauseSec = Math.max(0.05, Math.min(1.0, options.pause || config.pauseLength))
      const isReverse = Boolean(options.reverse)

      // 检查并准备语音包资源
      if (!packManager.hasPack(packName)) {
        await session.send(`⏳ 首次使用检测到本地未就绪语音包 [${packName}]，正在下载准备音频切片资源，请稍候...`)
        try {
          await packManager.ensurePack(packName)
        } catch (err) {
          logger.error(`Download pack failed: ${err}`)
          return `❌ 下载语音包 [${packName}] 失败，请检查网络或配置的镜像源地址！`
        }
      }

      try {
        const ysddMap = packManager.getYsddTable(packName)
        const tokens = tokenizeSentence(content, ysddMap, undefined, useYsdd)

        if (tokens.length === 0) {
          return '未识别到有效的汉字或发音内容。'
        }

        // 收集所有音频采样片段
        const audioChunks: Float32Array[] = []
        let totalLength = 0

        for (const item of tokens) {
          if (!item.token) {
            // 空格/标点停顿
            const pauseChunk = createPause(pauseSec)
            audioChunks.push(pauseChunk)
            totalLength += pauseChunk.length
            continue
          }

          const audio = packManager.getTokenAudio(packName, item.token, item.isYsdd)
          if (audio && audio.samples.length > 0) {
            audioChunks.push(audio.samples)
            totalLength += audio.samples.length
          } else {
            // 找不到音频的未知拼音，用短停顿代替
            const fallbackPause = createPause(0.1)
            audioChunks.push(fallbackPause)
            totalLength += fallbackPause.length
          }
        }

        if (totalLength === 0) {
          return '未能找到对应的拼音音频切片。'
        }

        // 拼接成完整的单声道音频流
        let combined: Float32Array<ArrayBufferLike> = new Float32Array(totalLength)
        let currentOffset = 0
        for (const chunk of audioChunks) {
          combined.set(chunk, currentOffset)
          currentOffset += chunk.length
        }

        // 1. 音量能量归一化
        if (useNorm) {
          combined = normalizeAudio(combined)
        }

        // 2. 变速处理
        if (speed !== 1.0) {
          combined = changeSpeed(combined, speed)
        }

        // 3. 倒放处理
        if (isReverse) {
          combined = reverseAudio(combined)
        }

        // 4. 打包为 WAV 格式二进制流
        const wavBuffer = encodeWav(combined, 44100)

        // 5. 下发语音消息
        return h.audio(wavBuffer, 'audio/wav')
      } catch (err) {
        logger.error(`Failed to synthesize otto speech: ${err}`)
        return `语音合成失败：${err instanceof Error ? err.message : String(err)}`
      }
    })
}
