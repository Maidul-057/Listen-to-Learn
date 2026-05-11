'use client'
import { useState, useRef, useCallback } from 'react'
import { Word } from '@/lib/supabase'

// ── Voice helpers ────────────────────────────────────────────────────────────

function getBengaliVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  return (
    voices.find(v => v.lang === 'bn-BD') ||
    voices.find(v => v.lang === 'bn-IN') ||
    voices.find(v => v.lang.startsWith('bn')) ||
    null
  )
}

function getEnglishVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  return voices.find(v => v.lang === 'en-US') || null
}

export function hasBengali(text: string) {
  return /[\u0980-\u09FF]/.test(text)
}

export function getLang(text: string) {
  return hasBengali(text) ? 'bn-BD' : 'en-US'
}

export function getSteps(w: Word) {
  const s: { text: string; lang: string; label: string }[] = []
  s.push({ text: w.word,       lang: 'en-US', label: 'word' })
  //if (w.phonetic)   s.push({ text: w.phonetic,   lang: 'en-US', label: 'phonetic' })
  s.push({ text: w.en_meaning, lang: 'en-US', label: 'English meaning' })
  s.push({ text: w.bn_meaning, lang: 'bn-BD', label: 'বাংলা অর্থ' })
  if (w.en_example) s.push({ text: w.en_example, lang: getLang(w.en_example), label: 'example' })
  if (w.bn_example) s.push({ text: w.bn_example, lang: 'bn-BD', label: 'বাংলা example' })
  if (w.mnemonic)   s.push({ text: w.mnemonic,   lang: getLang(w.mnemonic),   label: 'mnemonic' })
  return s
}

// Core speak — resolves when done, skips silently if voice missing
export function speakWithVoice(text: string, lang: string): Promise<void> {
  return new Promise(resolve => {
    const syn = window.speechSynthesis
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 0.88

    const isBengali = lang.startsWith('bn')

    if (isBengali) {
      const bnVoice = getBengaliVoice()
      if (!bnVoice) { resolve(); return }
      u.voice = bnVoice
      u.lang  = bnVoice.lang
    } else {
      const enVoice = getEnglishVoice()
      if (enVoice) u.voice = enVoice
      u.lang = 'en-US'
    }

    u.onend   = () => resolve()
    u.onerror = () => resolve()
    syn.speak(u)
  })
}

// ── Exported single-use helpers (used by WordCard) ───────────────────────────

export function speakWord(w: Word) {
  window.speechSynthesis.cancel()
  speakWithVoice(w.word, 'en-US')
}

export function speakSection(text: string, lang: string) {
  window.speechSynthesis.cancel()
  speakWithVoice(text, lang)
}

export function speakFull(w: Word) {
  window.speechSynthesis.cancel()
  const steps = getSteps(w)
  let i = 0
  const next = async () => {
    if (i >= steps.length) return
    const s = steps[i++]
    await speakWithVoice(s.text, s.lang)
    next()
  }
  next()
}

// ── Player bar component ─────────────────────────────────────────────────────

interface Props { filteredWords: Word[] }

export default function AudioPlayer({ filteredWords }: Props) {
  const [playing, setPlaying]   = useState(false)
  const [nowWord, setNowWord]   = useState('')
  const [nowStep, setNowStep]   = useState('')
  const [progress, setProgress] = useState(0)
  const idxRef   = useRef(0)
  const goingRef = useRef(false)
  const syn = typeof window !== 'undefined' ? window.speechSynthesis : null

  const speak = useCallback((text: string, lang: string): Promise<void> => {
    return new Promise(resolve => {
      if (!syn) return resolve()

      const u = new SpeechSynthesisUtterance(text)
      u.rate = 0.88

      const voices    = syn.getVoices()
      const isBengali = lang.startsWith('bn')

      if (isBengali) {
        const bnVoice =
          voices.find(v => v.lang === 'bn-BD') ||
          voices.find(v => v.lang === 'bn-IN') ||
          voices.find(v => v.lang.startsWith('bn')) ||
          null
        if (!bnVoice) { resolve(); return }
        u.voice = bnVoice
        u.lang  = bnVoice.lang
      } else {
        const enVoice = voices.find(v => v.lang === 'en-US') || null
        if (enVoice) u.voice = enVoice
        u.lang = 'en-US'
      }

      u.onend   = () => resolve()
      u.onerror = () => resolve()
      syn.speak(u)
    })
  }, [syn])

  const playFrom = useCallback(async (list: Word[], startIdx: number) => {
    goingRef.current = true
    setPlaying(true)

    for (let i = startIdx; i < list.length; i++) {
      if (!goingRef.current) break
      idxRef.current = i
      const w = list[i]
      setNowWord(w.word)
      setProgress(Math.round((i / list.length) * 100))

      for (const s of getSteps(w)) {
        if (!goingRef.current) break
        setNowStep(s.label)
        await speak(s.text, s.lang)
      }
    }

    if (goingRef.current) {
      setNowWord('Done')
      setNowStep('')
      setProgress(100)
    }
    goingRef.current = false
    setPlaying(false)
  }, [speak])

  const playAll = () => {
    if (!syn || !filteredWords.length) return
    syn.cancel()
    idxRef.current = 0
    playFrom(filteredWords, 0)
  }

  const togglePlay = () => {
    if (!syn) return
    if (playing) {
      syn.cancel()
      goingRef.current = false
      setPlaying(false)
    } else {
      playFrom(filteredWords, Math.min(idxRef.current, filteredWords.length - 1))
    }
  }

  const skipNext = () => {
    if (!syn) return
    syn.cancel()
    const next = Math.min(idxRef.current + 1, filteredWords.length - 1)
    idxRef.current = next
    playFrom(filteredWords, next)
  }

  const skipPrev = () => {
    if (!syn) return
    syn.cancel()
    const prev = Math.max(idxRef.current - 1, 0)
    idxRef.current = prev
    playFrom(filteredWords, prev)
  }

  if (!filteredWords.length) return null

  return (
    <div className="player" style={{ marginBottom: 16 }}>
      {/* Play / Pause */}
      <button className="btn btn-ghost" onClick={togglePlay} aria-label="play/pause" style={{ padding: '6px 8px' }}>
        {playing
          ? <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          : <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
        }
      </button>

      {/* Prev */}
      <button className="btn btn-ghost" onClick={skipPrev} aria-label="previous" style={{ padding: '6px 8px' }}>
        <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
          <polygon points="19,20 9,12 19,4"/><rect x="5" y="4" width="2" height="16"/>
        </svg>
      </button>

      {/* Next */}
      <button className="btn btn-ghost" onClick={skipNext} aria-label="next" style={{ padding: '6px 8px' }}>
        <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
          <polygon points="5,4 15,12 5,20"/><rect x="17" y="4" width="2" height="16"/>
        </svg>
      </button>

      {/* Info + progress */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {nowWord || 'Play all words'}
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>
          {nowStep || `${filteredWords.length} words`}
        </div>
        <div className="prog-track" style={{ marginTop: 5 }}>
          <div className="prog-fill" style={{ width: progress + '%' }} />
        </div>
      </div>

      {/* Play all button */}
      <button className="btn btn-accent" onClick={playAll} style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
        Play all
      </button>
    </div>
  )
}