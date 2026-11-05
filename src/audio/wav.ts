/**
 * WAV 解码、编码与基础 DSP 处理
 * 无 native 依赖，纯内存快速处理
 */

export interface DecodedAudio {
  sampleRate: number
  channels: number
  samples: Float32Array // 单声道归一化浮点采样 (-1.0 ~ 1.0)
}

/**
 * 基于 @audio/decode-wav 的解码封装：
 * 支持 PCM 8/16/24/32-bit、IEEE float 32/64-bit 与 WAVE_FORMAT_EXTENSIBLE。
 * 该依赖为 ESM-only，因此这里使用动态 import 并按需缓存模块。
 */
let wavDecoderPromise: Promise<typeof import('@audio/decode-wav')> | undefined

async function loadWavDecoder() {
  wavDecoderPromise ??= import('@audio/decode-wav')
  return wavDecoderPromise
}

export async function decodeWav(buffer: Buffer): Promise<DecodedAudio> {
  const { default: decode } = await loadWavDecoder()
  // 传入真正的 Uint8Array 副本，避免 Buffer.slice() 返回视图导致非对齐采样读取失败
  const { channelData, sampleRate } = decode(new Uint8Array(buffer))

  if (channelData.length === 0) {
    return { sampleRate, channels: 1, samples: new Float32Array(0) }
  }

  const length = channelData[0].length
  const samples = new Float32Array(length)

  for (let i = 0; i < length; i++) {
    let sum = 0
    for (const channel of channelData) {
      sum += channel[i] ?? 0
    }
    samples[i] = sum / channelData.length
  }

  return {
    sampleRate,
    channels: 1,
    samples,
  }
}

/**
 * 线性插值音频重采样
 */
export function resample(samples: Float32Array, fromRate: number, toRate: number): Float32Array {
  if (fromRate === toRate || samples.length === 0) return samples

  const ratio = toRate / fromRate
  const newLength = Math.round(samples.length * ratio)
  const result = new Float32Array(newLength)

  for (let i = 0; i < newLength; i++) {
    const srcIdx = i / ratio
    const index = Math.floor(srcIdx)
    const frac = srcIdx - index

    if (index >= samples.length - 1) {
      result[i] = samples[samples.length - 1]
    } else {
      result[i] = samples[index] * (1 - frac) + samples[index + 1] * frac
    }
  }

  return result
}

/**
 * 音频音量 RMS 能量归一化 (统一音量)
 */
export function normalizeAudio(samples: Float32Array, targetRms = 0.2): Float32Array {
  if (samples.length === 0) return samples

  let sumSq = 0
  for (let i = 0; i < samples.length; i++) {
    sumSq += samples[i] * samples[i]
  }

  const rms = Math.sqrt(sumSq / samples.length)
  if (rms <= 0.0001) return samples

  const scale = targetRms / rms
  const result = new Float32Array(samples.length)
  for (let i = 0; i < samples.length; i++) {
    // 缩放并做软限制防爆音
    const val = samples[i] * scale
    result[i] = Math.max(-1.0, Math.min(1.0, val))
  }
  return result
}

/**
 * 倒放音频
 */
export function reverseAudio(samples: Float32Array): Float32Array {
  const result = new Float32Array(samples.length)
  for (let i = 0; i < samples.length; i++) {
    result[i] = samples[samples.length - 1 - i]
  }
  return result
}

/**
 * 变速变调（通过插值拉伸实现简易速度调节）
 */
export function changeSpeed(samples: Float32Array, speedMultiplier: number): Float32Array {
  if (speedMultiplier <= 0 || speedMultiplier === 1) return samples

  const newLength = Math.round(samples.length / speedMultiplier)
  const result = new Float32Array(newLength)

  for (let i = 0; i < newLength; i++) {
    const srcIdx = i * speedMultiplier
    const index = Math.floor(srcIdx)
    const frac = srcIdx - index

    if (index >= samples.length - 1) {
      result[i] = samples[samples.length - 1]
    } else {
      result[i] = samples[index] * (1 - frac) + samples[index + 1] * frac
    }
  }

  return result
}

/**
 * 生成静音频段 (秒)
 */
export function createPause(seconds: number, sampleRate = 44100): Float32Array {
  return new Float32Array(Math.round(seconds * sampleRate))
}

/**
 * 将 Float32Array 单声道采样编码为标准 16-bit 44.1kHz WAV Buffer
 */
export function encodeWav(samples: Float32Array, sampleRate = 44100): Buffer {
  const numChannels = 1
  const bytesPerSample = 2
  const dataSize = samples.length * bytesPerSample
  const buffer = Buffer.alloc(44 + dataSize)

  // RIFF Chunk
  buffer.write('RIFF', 0, 4, 'ascii')
  buffer.writeUInt32LE(36 + dataSize, 4)
  buffer.write('WAVE', 8, 4, 'ascii')

  // fmt Subchunk
  buffer.write('fmt ', 12, 4, 'ascii')
  buffer.writeUInt32LE(16, 16) // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20)  // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(numChannels, 22)
  buffer.writeUInt32LE(sampleRate, 24)
  buffer.writeUInt32LE(sampleRate * numChannels * bytesPerSample, 28) // ByteRate
  buffer.writeUInt16LE(numChannels * bytesPerSample, 32)             // BlockAlign
  buffer.writeUInt16LE(16, 34)                                       // BitsPerSample

  // data Subchunk
  buffer.write('data', 36, 4, 'ascii')
  buffer.writeUInt32LE(dataSize, 40)

  // Samples (Float32 -> Int16)
  let offset = 44
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1.0, Math.min(1.0, samples[i]))
    const int16 = clamped < 0 ? Math.round(clamped * 32768) : Math.round(clamped * 32767)
    buffer.writeInt16LE(int16, offset)
    offset += 2
  }

  return buffer
}
