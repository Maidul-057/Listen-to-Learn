'use client'
import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, Word } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import WordCard from '@/components/WordCard'
import AddWordForm from '@/components/AddWordForm'
import AudioPlayer from '@/components/AudioPlayer'

export default function WordsPage() {
  const router = useRouter()
  const [userId, setUserId]     = useState<string | null>(null)
  const [userEmail, setEmail]   = useState<string>()
  const [words, setWords]       = useState<Word[]>([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch]     = useState('')
  const [activeTag, setTag]     = useState('all')

  // Auth guard
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.replace('/login'); return }
      setUserId(data.session.user.id)
      setEmail(data.session.user.email ?? '')
    })
  }, [router])

  // Load words once we have userId
  useEffect(() => {
    if (!userId) return
    supabase.from('words').select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setWords(data as Word[] || []); setLoading(false) })
  }, [userId])

  const tags = useMemo(() =>
    ['all', ...Array.from(new Set(words.map(w => w.tag).filter(Boolean)))],
    [words]
  )

  const filtered = useMemo(() => words.filter(w => {
    const tOk = activeTag === 'all' || w.tag === activeTag
    const q   = search.toLowerCase()
    const qOk = !q || w.word.toLowerCase().includes(q)
                   || w.en_meaning.toLowerCase().includes(q)
                   || w.bn_meaning.includes(q)
    return tOk && qOk
  }), [words, activeTag, search])

  const handleAdd    = (w: Word) => setWords(prev => [w, ...prev])
  const handleDelete = async (id: number) => {
    if (!confirm('Delete this word?')) return
    await supabase.from('words').delete().eq('id', id)
    setWords(prev => prev.filter(w => w.id !== id))
  }

  const today = new Date().toISOString().slice(0, 10)

  if (!userId) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ color: 'var(--muted)', fontSize: 14 }}>Loading...</div>
    </div>
  )

  return (
    <>
      <Navbar email={userEmail} />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px 80px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Total words', value: words.length },
            { label: 'Tags',        value: tags.length - 1 },
            { label: 'Added today', value: words.filter(w => w.created_at?.slice(0, 10) === today).length },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '12px 16px' }}>
              <div style={{ fontSize: 24, fontWeight: 600 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input placeholder="Search words..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32 }} />
          </div>
          <button className="btn btn-accent" onClick={() => setShowForm(v => !v)}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add word
          </button>
        </div>

        {showForm && userId && (
          <AddWordForm userId={userId} onAdd={handleAdd} onClose={() => setShowForm(false)} />
        )}

        {/* Tag filters */}
        {tags.length > 1 && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
            {tags.map(t => (
              <button key={t} onClick={() => setTag(t)} style={{
                fontSize: 12, padding: '4px 12px', borderRadius: 20, cursor: 'pointer',
                border: '0.5px solid', transition: 'all 0.15s', fontFamily: 'Sora, sans-serif',
                background:   activeTag === t ? 'rgba(108,99,255,0.15)' : 'transparent',
                color:        activeTag === t ? 'var(--accent2)'        : 'var(--muted)',
                borderColor:  activeTag === t ? 'rgba(108,99,255,0.4)'  : 'var(--border)',
              }}>
                {t === 'all' ? 'All' : t}
              </button>
            ))}
          </div>
        )}

        {/* Player */}
        <AudioPlayer filteredWords={filtered} />

        {/* List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>Loading words...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📚</div>
            {words.length === 0 ? 'No words yet. Add your first word!' : 'No words match your search.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map((w, i) => (
              <WordCard key={w.id} word={w} index={i} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>
    </>
  )
}