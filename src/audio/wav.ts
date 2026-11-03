/**
 * 纯 TypeScript 实现的极简 WAV 编解码与基础 DSP 处理
 * 零 native 依赖，纯内存快速处理
 */

export interface DecodedAudio {
  sampleRate: number
  channels: number
  samples: Float32Array // 单声道归一化浮点采样 (-1.0 ~ 1.0)
}

/**
 * 健壮的 WAV 解析器，遍历 RIFF Chunk，支持各种带元数据/填充的 WAV
 */
export function decodeWav(buffer: Buffer): DecodedAudio {
  if (buffer.length < 44 || buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error('Invalid WAV file: missing RIFF/WAVE header')
  }

  let offset = 12
  let sampleRate = 44100
  let channels = 1
  let bitsPerSample = 16
  let audioFormat = 1
  let dataOffset = -1
  let dataSize = 0

  while (offset + 8 <= buffer.length) {
    const chunkId = buffer.toString('ascii', offset, offset + 4)
    const chunkSize = buffer.readUInt32LE(offset + 4)
    offset += 8

    if (chunkId === 'fmt ') {
      audioFormat = buffer.readUInt16LE(offset)
      channels = buffer.readUInt16LE(offset + 2)
      sampleRate = buffer.readUInt32LE(offset + 4)
      bitsPerSample = buffer.readUInt16LE(offset + 14)
    } else if (chunkId === 'data') {
      dataOffset = offset
      dataSize = chunkSize
      break
    }

    offset += chunkSize
  }

  if (dataOffset === -1) {
    throw new Error('Invalid WAV file: data chunk not found')
  }

  // 截断到缓冲区实际可用范围
  const actualDataSize = Math.min(dataSize, buffer.length - dataOffset)
  const bytesPerSample = bitsPerSample / 8
  const totalSamples = Math.floor(actualDataSize / (bytesPerSample * channels))
  const floatSamples = new Float32Array(totalSamples)

  if (bitsPerSample === 16) {
    for (let i = 0; i < totalSamples; i++) {
      let sum = 0
      for (let ch = 0; ch < channels; ch++) {
        const sampleIdx = (i * channels + ch) * 2
        sum += buffer.readInt16LE(dataOffset + sampleIdx) / 32768.0
      }
      floatSamples[i] = sum / channels // 多声道合并为单声道
    }
  } else if (bitsPerSample === 8) {
    for (let i = 0; i < totalSamples; i++) {
      let sum = 0
      for (let ch = 0; ch < channels; ch++) {
        const sampleIdx = i * channels + ch
        sum += (buffer.readUInt8(dataOffset + sampleIdx) - 128) / 128.0
      }
      floatSamples[i] = sum / channels
    }
  } else {
    throw new Error(`Unsupported WAV bitsPerSample: ${bitsPerSample}`)
  }

  return {
    sampleRate,
    channels: 1,
    samples: floatSamples,
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
