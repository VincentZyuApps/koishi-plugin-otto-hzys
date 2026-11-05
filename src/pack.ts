import fs from 'node:fs'
import path from 'node:path'
import AdmZip from 'adm-zip'
import { Context, Logger } from 'koishi'
import { decodeWav, DecodedAudio, resample } from './audio/wav'
import { DEFAULT_DOWNLOAD_MIRROR_URL_LIST } from './config'
import { DEFAULT_YSDD } from './tokenizer'

export interface VoicePackConfig {
  name: string
  ysddMap: Record<string, string>
  sampleRate: number
}

export class VoicePackManager {
  private logger: Logger
  private cache = new Map<string, DecodedAudio>()
  private mirrors: string[]
  public packsDir: string

  constructor(private ctx: Context, mirrors: string[]) {
    this.logger = ctx.logger('otto-hzys')
    this.packsDir = path.resolve(ctx.baseDir, 'data', 'otto-hzys', 'packs')
    fs.mkdirSync(this.packsDir, { recursive: true })

    const normalized = Array.from(new Set(
      (Array.isArray(mirrors) ? mirrors : [])
        .map(mirror => String(mirror || '').trim().replace(/\/+$/, ''))
        .filter(Boolean),
    ))
    this.mirrors = normalized.length > 0 ? normalized : DEFAULT_DOWNLOAD_MIRROR_URL_LIST
  }

  /**
   * 检查指定语音包是否完整就绪
   */
  public hasPack(packName = 'otto'): boolean {
    const packDir = path.join(this.packsDir, packName)
    if (!fs.existsSync(packDir)) return false

    // 检查是否有 tokens 或 sources 目录
    const hasTokens = fs.existsSync(path.join(packDir, 'tokens')) || fs.existsSync(path.join(packDir, 'sources'))
    return hasTokens
  }

  /**
   * 列出本地所有已安装的语音包信息
   */
  public listInstalledPacks(): { name: string; tokenCount: number; ysddCount: number }[] {
    if (!fs.existsSync(this.packsDir)) return []
    const entries = fs.readdirSync(this.packsDir, { withFileTypes: true })
    const result: { name: string; tokenCount: number; ysddCount: number }[] = []

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const packName = entry.name
        const packDir = path.join(this.packsDir, packName)
        const sourcesDir = fs.existsSync(path.join(packDir, 'sources'))
          ? path.join(packDir, 'sources')
          : (fs.existsSync(path.join(packDir, 'tokens')) ? path.join(packDir, 'tokens') : null)
        const ysddDir = fs.existsSync(path.join(packDir, 'ysddSources'))
          ? path.join(packDir, 'ysddSources')
          : (fs.existsSync(path.join(packDir, 'ysdd_tokens')) ? path.join(packDir, 'ysdd_tokens') : null)

        const tokenCount = sourcesDir && fs.existsSync(sourcesDir) ? fs.readdirSync(sourcesDir).filter(f => f.endsWith('.wav')).length : 0
        const ysddCount = ysddDir && fs.existsSync(ysddDir) ? fs.readdirSync(ysddDir).filter(f => f.endsWith('.wav')).length : 0

        if (tokenCount > 0 || ysddCount > 0) {
          result.push({ name: packName, tokenCount, ysddCount })
        }
      }
    }
    return result
  }

  /**
   * 自动预热与准备语音包：
   * 1. 优先检测本地数据目录已就绪则跳过
   * 2. 否则按配置的镜像地址列表（Gitee/GitHub 等）逐个尝试下载并解压
   */
  public async ensurePack(packName = 'otto', onProgress?: (msg: string) => void): Promise<void> {
    if (this.hasPack(packName)) return

    const packDir = path.join(this.packsDir, packName)
    const failures: string[] = []

    for (let index = 0; index < this.mirrors.length; index++) {
      const mirror = this.mirrors[index]
      const zipUrl = `${mirror}/${packName}.zip`

      onProgress?.(`正在从镜像源（${index + 1}/${this.mirrors.length}）下载 ${packName} 语音包，请稍候...`)
      this.logger.info(`Downloading voice pack [${packName}] from mirror (${index + 1}/${this.mirrors.length}): ${mirror}`)

      try {
        const buffer = await this.ctx.http.get<ArrayBuffer>(zipUrl, {
          responseType: 'arraybuffer',
          timeout: 60000,
        })

        onProgress?.(`下载完成，正在解压 ${packName} 语音资源...`)
        const zip = new AdmZip(Buffer.from(buffer))

        // 每次尝试前清理上一次可能残留的半成品目录
        try { fs.rmSync(packDir, { recursive: true, force: true }) } catch {}
        fs.mkdirSync(packDir, { recursive: true })
        zip.extractAllTo(packDir, true)

        // 若压缩包内包含一层与语音包同名的根目录，自动展平到 packDir
        const nestedDir = path.join(packDir, packName)
        if (fs.existsSync(nestedDir) && !fs.existsSync(path.join(packDir, 'sources')) && !fs.existsSync(path.join(packDir, 'tokens'))) {
          const nestedFiles = fs.readdirSync(nestedDir)
          for (const f of nestedFiles) {
            fs.renameSync(path.join(nestedDir, f), path.join(packDir, f))
          }
          try { fs.rmdirSync(nestedDir) } catch {}
        }

        if (!this.hasPack(packName)) {
          throw new Error('压缩包内容不完整，缺少 tokens/sources 目录')
        }

        this.logger.info(`Voice pack [${packName}] installed successfully at ${packDir}`)
        return
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        failures.push(`${mirror}: ${message}`)
        this.logger.warn(`Failed to download voice pack [${packName}] from ${mirror}: ${message}`)
        try { fs.rmSync(packDir, { recursive: true, force: true }) } catch {}
      }
    }

    throw new Error(`所有镜像源均下载失败：${failures.join('；')}`)
  }

  /**
   * 获取指定 token 的音频数据 (优先内存缓存)
   */
  public getTokenAudio(packName: string, token: string, isYsdd = false): DecodedAudio | null {
    const cacheKey = `${packName}:${isYsdd ? 'ysdd:' : ''}${token}`
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    const packDir = path.join(this.packsDir, packName)
    // 兼容 tokens / sources 与 ysdd_tokens / ysddSources
    const subDirs = isYsdd ? ['ysdd_tokens', 'ysddSources'] : ['tokens', 'sources']

    let filePath: string | null = null
    for (const sub of subDirs) {
      const p = path.join(packDir, sub, `${token}.wav`)
      if (fs.existsSync(p)) {
        filePath = p
        break
      }
    }

    if (!filePath) return null

    try {
      const rawBuf = fs.readFileSync(filePath)
      const decoded = decodeWav(rawBuf)
      // 统一转换为 44100Hz 标准采样率
      if (decoded.sampleRate !== 44100) {
        decoded.samples = resample(decoded.samples, decoded.sampleRate, 44100)
        decoded.sampleRate = 44100
      }
      this.cache.set(cacheKey, decoded)
      return decoded
    } catch (err) {
      this.logger.warn(`Failed to decode audio file: ${filePath}, error: ${err}`)
      return null
    }
  }

  /**
   * 获取当前语音包的原声大碟表
   */
  public getYsddTable(packName = 'otto'): Record<string, string> {
    const packDir = path.join(this.packsDir, packName)
    const possiblePaths = [
      path.join(packDir, 'ysdd.json'),
      path.join(packDir, 'ysddTable.json'),
    ]
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        try {
          return JSON.parse(fs.readFileSync(p, 'utf-8'))
        } catch {}
      }
    }
    return DEFAULT_YSDD
  }


}
