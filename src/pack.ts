import fs from 'node:fs'
import path from 'node:path'
import AdmZip from 'adm-zip'
import { Context, Logger } from 'koishi'
import { decodeWav, DecodedAudio, resample } from './audio/wav'
import { DEFAULT_YSDD } from './tokenizer'

export interface VoicePackConfig {
  name: string
  ysddMap: Record<string, string>
  sampleRate: number
}

export class VoicePackManager {
  private logger: Logger
  private cache = new Map<string, DecodedAudio>()
  public packsDir: string

  constructor(private ctx: Context, private defaultMirror: string) {
    this.logger = ctx.logger('otto-hzys')
    this.packsDir = path.resolve(ctx.baseDir, 'data', 'otto-hzys', 'packs')
    fs.mkdirSync(this.packsDir, { recursive: true })
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
   * 自动预热与准备语音包：
   * 1. 优先检测本地数据目录
   * 2. 检查是否有本地开发仓库（免去下载）
   * 3. 否则从网络下载并解压
   */
  public async ensurePack(packName = 'otto', onProgress?: (msg: string) => void): Promise<void> {
    if (this.hasPack(packName)) return

    const packDir = path.join(this.packsDir, packName)
    fs.mkdirSync(packDir, { recursive: true })

    // 1. 本地免流模式：检测开发环境常见路径直接复制
    const localFallbackPath = path.resolve(
      this.ctx.baseDir,
      '../../AAA_from_git_AAA/HUOZI_koi'
    )
    if (fs.existsSync(localFallbackPath) && fs.existsSync(path.join(localFallbackPath, 'sources'))) {
      onProgress?.('检测到本地开发环境音频源，正在导入...')
      this.logger.info(`Copying voice pack from local source: ${localFallbackPath}`)
      this.copyDirSync(path.join(localFallbackPath, 'sources'), path.join(packDir, 'sources'))
      if (fs.existsSync(path.join(localFallbackPath, 'ysddSources'))) {
        this.copyDirSync(path.join(localFallbackPath, 'ysddSources'), path.join(packDir, 'ysddSources'))
      }
      const ysddTablePath = path.join(localFallbackPath, 'ysddTable.json')
      if (fs.existsSync(ysddTablePath)) {
        fs.copyFileSync(ysddTablePath, path.join(packDir, 'ysddTable.json'))
      }
      return
    }

    // 2. 在线自动下载解压
    onProgress?.(`正在从镜像源下载 ${packName} 语音包，请稍候...`)
    this.logger.info(`Downloading voice pack [${packName}] from mirror...`)

    const zipUrl = `${this.defaultMirror.replace(/\/+$/, '')}/${packName}.zip`
    const buffer = await this.ctx.http.get<ArrayBuffer>(zipUrl, {
      responseType: 'arraybuffer',
      timeout: 60000,
    })

    onProgress?.(`下载完成，正在解压 ${packName} 语音资源...`)
    const zip = new AdmZip(Buffer.from(buffer))
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

    this.logger.info(`Voice pack [${packName}] installed successfully at ${packDir}`)
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

  private copyDirSync(src: string, dest: string) {
    fs.mkdirSync(dest, { recursive: true })
    const entries = fs.readdirSync(src, { withFileTypes: true })
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name)
      const destPath = path.join(dest, entry.name)
      if (entry.isDirectory()) {
        this.copyDirSync(srcPath, destPath)
      } else {
        fs.copyFileSync(srcPath, destPath)
      }
    }
  }
}
