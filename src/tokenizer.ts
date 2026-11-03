import { pinyin } from 'pinyin-pro'

export interface TokenItem {
  token: string | null // 音频文件名（如 "ni"、"djha"），null 表示停顿
  isYsdd?: boolean
}

export const DEFAULT_CHINGLISH: Record<string, string> = {
  a: 'ei', b: 'bi', c: 'xi', d: 'di', e: 'yi',
  f: 'ai fu', g: 'ji', h: 'ai chi', i: 'ai', j: 'zhei',
  k: 'kei', l: 'ai lu', m: 'ai mu', n: 'en', o: 'ou',
  p: 'pi', q: 'kiu', r: 'a', s: 'ai si', t: 'ti',
  u: 'you', v: 'wei', w: 'da bu liu', x: 'ai ke si', y: 'wai', z: 'zei',
  0: 'ling', 1: 'yi', 2: 'er', 3: 'san', 4: 'si',
  5: 'wu', 6: 'liu', 7: 'qi', 8: 'ba', 9: 'jiu',
}

export const DEFAULT_YSDD: Record<string, string> = {
  米浴说的道理: 'miyu',
  啊米浴说的道理: 'miyu',
  大家好啊: 'djha',
  我是说的道理: 'wssddl',
  今天来点大家想看的东西: 'jtlaidian',
  今天来点儿大家想看的东西: 'jtlaidian',
  说的道理: 'sddl',
  波比是我爹: 'bobi',
  啊嘛波比是我爹: 'bobi',
}

interface Segment {
  text: string
  isYsdd?: boolean
  isPinyin?: boolean
}

/**
 * 文本分词管线：原声大碟匹配 -> 字母数字替换 -> 汉字拼音化 -> 符号停顿
 */
export function tokenizeSentence(
  sentence: string,
  ysddMap: Record<string, string> = DEFAULT_YSDD,
  chinglishMap: Record<string, string> = DEFAULT_CHINGLISH,
  useYsdd = true,
): TokenItem[] {
  let segments: Segment[] = [{ text: sentence.toLowerCase() }]

  // 1. 原声大碟长词贪婪匹配
  if (useYsdd && ysddMap) {
    // 按照词长度降序排列，优先匹配最长原声大碟短语
    const sortedPhrases = Object.keys(ysddMap).sort((a, b) => b.length - a.length)
    for (const phrase of sortedPhrases) {
      const token = ysddMap[phrase]
      const lowerPhrase = phrase.toLowerCase()
      const newSegments: Segment[] = []

      for (const seg of segments) {
        if (seg.isYsdd || seg.isPinyin || !seg.text.includes(lowerPhrase)) {
          newSegments.push(seg)
          continue
        }

        const parts = seg.text.split(lowerPhrase)
        for (let i = 0; i < parts.length; i++) {
          if (parts[i]) {
            newSegments.push({ text: parts[i] })
          }
          if (i < parts.length - 1) {
            newSegments.push({ text: token, isYsdd: true })
          }
        }
      }
      segments = newSegments
    }
  }

  // 2. 字母与数字的中式英文读音替换 (如 A -> ei, 1 -> yi)
  const sortedChars = Object.keys(chinglishMap).sort((a, b) => b.length - a.length)
  for (const ch of sortedChars) {
    const pron = chinglishMap[ch]
    const newSegments: Segment[] = []

    for (const seg of segments) {
      if (seg.isYsdd || seg.isPinyin || !seg.text.includes(ch)) {
        newSegments.push(seg)
        continue
      }

      const parts = seg.text.split(ch)
      for (let i = 0; i < parts.length; i++) {
        if (parts[i]) {
          newSegments.push({ text: parts[i] })
        }
        if (i < parts.length - 1) {
          // 字母发音可能有空格如 "ai fu"，切成多段
          for (const p of pron.split(/\s+/)) {
            if (p) newSegments.push({ text: p, isPinyin: true })
          }
        }
      }
    }
    segments = newSegments
  }

  // 3. 汉字转拼音与标点断句
  const tokens: TokenItem[] = []

  for (const seg of segments) {
    if (seg.isYsdd) {
      tokens.push({ token: seg.text, isYsdd: true })
      continue
    }

    if (seg.isPinyin) {
      tokens.push({ token: seg.text })
      continue
    }

    // 处理普通汉字与符号
    // 使用 pinyin-pro 获取无音调拼音
    const pinyinList = pinyin(seg.text, {
      toneType: 'none',
      type: 'all',
      nonZh: 'consecutive',
    })

    for (const item of pinyinList) {
      if (item.isZh) {
        // 中文字符，提取拼音
        const p = item.pinyin.toLowerCase()
        if (p) tokens.push({ token: p })
      } else {
        // 非中文（标点符号、空格、未识别字符等），插入停顿
        const trimmed = item.origin.trim()
        if (!trimmed) {
          // 纯空格/换行，插入一个停顿
          tokens.push({ token: null })
        } else {
          // 标点符号也视作停顿
          tokens.push({ token: null })
        }
      }
    }
  }

  // 合并连续的 null 停顿，避免停顿过长
  const dedupedTokens: TokenItem[] = []
  for (const t of tokens) {
    if (t.token === null && dedupedTokens.length > 0 && dedupedTokens[dedupedTokens.length - 1].token === null) {
      continue
    }
    dedupedTokens.push(t)
  }

  return dedupedTokens
}
