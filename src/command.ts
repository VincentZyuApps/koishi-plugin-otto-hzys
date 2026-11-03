import { Context, h, Logger } from 'koishi'
import { changeSpeed, createPause, encodeWav, normalizeAudio, reverseAudio } from './audio/wav'
import { Config } from './config'
import { VoicePackManager } from './pack'
import { tokenizeSentence } from './tokenizer'

export function registerCommands(ctx: Context, config: Config, packManager: VoicePackManager) {
  const logger = ctx.logger('otto-hzys')

  ctx.command('hzys <content:text>', '使用电棍/活字印刷语音合成句子')
    .alias('otto', '活字印刷', '说的道理')
    .option('pack', '-p, --pack <name:string> 指定语音包名称', { fallback: config.defaultPack })
    .option('reverse', '-r, --reverse 倒放生成的音频', { fallback: false })
    .option('norm', '-n, --norm 统一音频音量 (归一化)', { fallback: config.defaultNorm })
    .option('noNorm', '-N, --no-norm 禁用音量归一化')
    .option('ysdd', '-y, --ysdd 匹配特定长句时使用原声大碟', { fallback: config.defaultYsdd })
    .option('noYsdd', '-Y, --no-ysdd 禁用原声大碟')
    .option('speed', '-s, --speed <multiplier:number> 语音播放速度 (0.5~2.5)', { fallback: config.defaultSpeed })
    .option('pause', '-P, --pause <seconds:number> 标点符号与空格停顿长度 (秒)', { fallback: config.pauseLength })
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
