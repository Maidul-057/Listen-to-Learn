'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, Word } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

interface Question {
  word: Word
  options: string[]
  correct: number
}

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5) }

function makeQuestions(words: Word[]): Question[] {
  if (words.length < 4) return []
  const meanings = words.map(w => w.en_meaning)
  return shuffle(words).map(word => {
    const wrong = shuffle(meanings.filter(m => m !== word.en_meaning)).slice(0, 3)
    const opts  = shuffle([word.en_meaning, ...wrong])
    return { word, options: opts, correct: opts.indexOf(word.en_meaning) }
  })
}

export default function QuizPage() {
  const router = useRouter()
  const [userId, setUserId]     = useState<string | null>(null)
  const [userEmail, setEmail]   = useState<string>()
  const [words, setWords]       = useState<Word[]>([])
  const [loading, setLoading]   = useState(true)
  const [questions, setQ]       = useState<Question[]>([])
  const [qIdx, setQIdx]         = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore]       = useState(0)
  const [done, setDone]         = useState(false)
  const [results, setResults]   = useState<boolean[]>([])
  const [quizTag, setQuizTag]   = useState('all')
  const [quizSize, setQuizSize] = useState(10)

  // Auth guard
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.replace('/login'); return }
      setUserId(data.session.user.id)
      setEmail(data.session.user.email ?? '')
    })
  }, [router])

  useEffect(() => {
    if (!userId) return
    supabase.from('words').select('*').eq('user_id', userId)
      .then(({ data }) => { setWords(data as Word[] || []); setLoading(false) })
  }, [userId])

  const tags = ['all', ...Array.from(new Set(words.map(w => w.tag).filter(Boolean)))]

  const startQuiz = useCallback(() => {
    const pool = quizTag === 'all' ? words : words.filter(w => w.tag === quizTag)
    if (pool.length < 4) return
    const qs = makeQuestions(pool).slice(0, quizSize)
    setQ(qs); setQIdx(0); setSelected(null); setScore(0); setDone(false); setResults([])
  }, [words, quizTag, quizSize])

  const answer = (i: number) => {
    if (selected !== null) return
    setSelected(i)
    const correct = i === questions[qIdx].correct
    if (correct) setScore(s => s + 1)
    setResults(r => [...r, correct])
    setTimeout(() => {
      if (qIdx + 1 >= questions.length) setDone(true)
      else { setQIdx(q => q + 1); setSelected(null) }
    }, 1300)
  }

  const speakW = (text: string) => {
    const syn = window.speechSynthesis; syn.cancel()
    const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.rate = 0.88; syn.speak(u)
  }

  // ── Loading ──────────────────────────────────────────
  if (!userId || loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ color: 'var(--muted)', fontSize: 14 }}>Loading...</div>
    </div>
  )

  // ── Not enough words ──────────────────────────────────
  if (words.length < 4) return (
    <>
      <Navbar email={userEmail} />
      <main style={{ maxWidth: 540, margin: '0 auto', padding: '60px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 14 }}>📚</div>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>কম word আছে</h2>
        <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7 }}>
          Quiz এর জন্য কমপক্ষে 4টা word লাগবে।<br />আগে Words পেজে গিয়ে word add করো।
        </p>
      </main>
    </>
  )

  // ── Setup screen ──────────────────────────────────────
  if (questions.length === 0) return (
    <>
      <Navbar email={userEmail} />
      <main style={{ maxWidth: 480, margin: '0 auto', padding: '40px 16px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>MCQ Quiz</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 28 }}>
          Word দেখে সঠিক English meaning বেছে নাও
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Tag filter</label>
            <select value={quizTag} onChange={e => setQuizTag(e.target.value)}>
              {tags.map(t => <option key={t} value={t}>{t === 'all' ? 'All tags' : t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
              Number of questions: <strong style={{ color: 'var(--text)' }}>{quizSize}</strong>
            </label>
            <input type="range" min={4} max={Math.min(50, words.length)} step={1}
              value={quizSize} onChange={e => setQuizSize(Number(e.target.value))}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', accentColor: 'var(--accent)' }} />
          </div>
          <div style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>Available words in pool</div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>
              {(quizTag === 'all' ? words : words.filter(w => w.tag === quizTag)).length}
            </div>
          </div>
          <button className="btn btn-accent" onClick={startQuiz}
            style={{ padding: '12px', fontSize: 15, justifyContent: 'center', borderRadius: 10 }}>
            Start Quiz →
          </button>
        </div>
      </main>
    </>
  )

  // ── Done screen ───────────────────────────────────────
  if (done) {
    const pct = Math.round((score / questions.length) * 100)
    const emoji = pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'
    const msg   = pct >= 80 ? 'Excellent! দারুণ করেছ।' : pct >= 50 ? 'ভালো! আরেকটু practice করো।' : 'Keep going! আরো পড়ো।'
    return (
      <>
        <Navbar email={userEmail} />
        <main style={{ maxWidth: 520, margin: '0 auto', padding: '40px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>{emoji}</div>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>{score} / {questions.length}</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>{msg}</p>

          <div style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <div className="prog-track" style={{ height: 8, marginBottom: 10 }}>
              <div className="prog-fill" style={{
                width: pct + '%',
                background: pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--amber)' : 'var(--red)',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)' }}>
              <span style={{ color: 'var(--green)' }}>✓ {score} correct</span>
              <span style={{ color: 'var(--red)'   }}>✗ {questions.length - score} wrong</span>
              <span>{pct}%</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24, textAlign: 'left' }}>
            {questions.map((q, i) => (
              <div key={i} style={{
                background: 'var(--bg2)',
                border: `0.5px solid ${results[i] ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`,
                borderRadius: 8, padding: '9px 14px',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 14 }}>{results[i] ? '✅' : '❌'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{q.word.word}</div>
                  {!results[i] && (
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>
                      {q.word.en_meaning.slice(0, 70)}…
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="btn" onClick={() => setQ([])}>Settings</button>
            <button className="btn btn-accent" onClick={startQuiz}>Try again</button>
          </div>
        </main>
      </>
    )
  }

  // ── Active quiz ───────────────────────────────────────
  const q       = questions[qIdx]
  const pct     = Math.round((qIdx / questions.length) * 100)

  return (
    <>
      <Navbar email={userEmail} />
      <main style={{ maxWidth: 560, margin: '0 auto', padding: '28px 16px' }}>

        {/* Progress header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>
              <span>{qIdx + 1} / {questions.length}</span>
              <span style={{ color: 'var(--green)' }}>Score: {score}</span>
            </div>
            <div className="prog-track">
              <div className="prog-fill" style={{ width: pct + '%' }} />
            </div>
          </div>
          <button className="btn btn-ghost" onClick={() => setQ([])} style={{ fontSize: 12 }}>Quit</button>
        </div>

        {/* Word card */}
        <div className="pop" style={{
          background: 'var(--bg2)', border: '0.5px solid var(--border)',
          borderRadius: 16, padding: '28px 24px', textAlign: 'center', marginBottom: 20,
        }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
            What does this word mean?
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 6 }}>
            <h2 style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em' }}>{q.word.word}</h2>
            <button onClick={() => speakW(q.word.word)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
              </svg>
            </button>
          </div>
          {q.word.phonetic && <div className="mono" style={{ fontSize: 13, color: 'var(--muted)' }}>{q.word.phonetic}</div>}
          {q.word.tag && <span className="badge badge-purple" style={{ marginTop: 10 }}>{q.word.tag}</span>}
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {q.options.map((opt, i) => {
            let cls = 'quiz-opt'
            if (selected !== null) {
              if (i === q.correct)                     cls += ' correct'
              else if (i === selected)                 cls += ' wrong'
            }
            return (
              <button key={i} className={cls} onClick={() => answer(i)} disabled={selected !== null}>
                <span className="mono" style={{ color: 'var(--muted2)', marginRight: 10, fontSize: 12 }}>
                  {String.fromCharCode(65 + i)}.
                </span>
                {opt}
              </button>
            )
          })}
        </div>

        {/* Feedback */}
        {selected !== null && (
          <div className="pop" style={{
            marginTop: 16, padding: '12px 16px', borderRadius: 10,
            background: selected === q.correct ? 'rgba(52,211,153,0.07)' : 'rgba(248,113,113,0.07)',
            border: `0.5px solid ${selected === q.correct ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: selected === q.correct ? 'var(--green)' : 'var(--red)', marginBottom: 4 }}>
              {selected === q.correct ? '✓ Correct!' : '✗ Wrong'}
            </div>
            {q.word.bn_meaning && (
              <div className="bn" style={{ fontSize: 13, color: 'var(--muted)' }}>
                বাংলা: {q.word.bn_meaning}
              </div>
            )}
          </div>
        )}
      </main>
    </>
  )
}