import { Context } from 'koishi'
import { registerCommands } from './command'
import { Config } from './config'
import { VoicePackManager } from './pack'
import { usage } from './usage'

export * from './config'
export * from './tokenizer'
export * from './pack'
export * from './audio/wav'
export * from './command'
export { usage }

export const name = 'otto-hzys'

export function apply(ctx: Context, config: Config) {
  const logger = ctx.logger('otto-hzys')
  const packManager = new VoicePackManager(ctx, config.downloadMirror)

  // 启动时在后台静默预热默认语音包
  ctx.on('ready', async () => {
    if (config.autoDownload) {
      try {
        await packManager.ensurePack(config.defaultPack)
      } catch (err) {
        logger.warn(`Failed to auto-download default voice pack: ${err}`)
      }
    }
  })

  // 注册活字印刷指令与别名
  registerCommands(ctx, config, packManager)
}
