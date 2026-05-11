'use client'
import { useState } from 'react'
import { supabase, Word } from '@/lib/supabase'

interface Props {
  userId: string
  onAdd: (w: Word) => void
  onClose: () => void
}

export default function AddWordForm({ userId, onAdd, onClose }: Props) {
  const [form, setForm] = useState({
    word: '', phonetic: '', en_meaning: '', bn_meaning: '',
    en_example: '', bn_example: '', mnemonic: '', tag: ''
  })
  const [loading, setLoading] = useState(false)
  const [err, setErr]         = useState('')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.word.trim() || !form.en_meaning.trim() || !form.bn_meaning.trim()) {
      setErr('Word, English meaning এবং বাংলা অর্থ আবশ্যক।'); return
    }
    setLoading(true); setErr('')
    const { data, error } = await supabase.from('words').insert([{
      user_id:    userId,
      word:       form.word.trim(),
      phonetic:   form.phonetic.trim()   || null,
      en_meaning: form.en_meaning.trim(),
      bn_meaning: form.bn_meaning.trim(),
      en_example: form.en_example.trim() || null,
      bn_example: form.bn_example.trim() || null,
      mnemonic:   form.mnemonic.trim()   || null,
      tag:        form.tag.trim()        || 'General',
    }]).select().single()
    setLoading(false)
    if (error) { setErr(error.message); return }
    onAdd(data as Word)
    onClose()
  }

  return (
    <div className="pop" style={{
      background: 'var(--bg2)', border: '0.5px solid var(--border)',
      borderRadius: 16, padding: '20px', marginBottom: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600 }}>New word</h2>
        <button className="btn btn-ghost" onClick={onClose} style={{ padding: '4px 8px' }}>✕</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <F label="Word *" full><input placeholder="e.g. Eloquent" value={form.word} onChange={e => set('word', e.target.value)} autoFocus /></F>
        {/* <F label="Phonetic"><input placeholder="/ ˈɛl.ə.kwənt /" value={form.phonetic} onChange={e => set('phonetic', e.target.value)} /></F> */}   
        <F label="English meaning *"><textarea placeholder="Fluent and persuasive..." value={form.en_meaning} onChange={e => set('en_meaning', e.target.value)} /></F>
        <F label="বাংলা অর্থ *"><textarea placeholder="বাকপটু, সুবক্তা..." value={form.bn_meaning} onChange={e => set('bn_meaning', e.target.value)} style={{ fontFamily: 'Hind Siliguri, sans-serif' }} /></F>
        <F label="English example"><textarea placeholder="The eloquent lawyer..." value={form.en_example} onChange={e => set('en_example', e.target.value)} /></F>
        <F label="বাংলা উদাহরণ"><textarea placeholder="সেই বাকপটু উকিল..." value={form.bn_example} onChange={e => set('bn_example', e.target.value)} style={{ fontFamily: 'Hind Siliguri, sans-serif' }} /></F>
        <F label="Mnemonic" full><textarea placeholder="মনে রাখার কৌশল..." value={form.mnemonic} onChange={e => set('mnemonic', e.target.value)} /></F>
        <F label="Tag"><input placeholder="GRE, IELTS, Daily..." value={form.tag} onChange={e => set('tag', e.target.value)} /></F>
      </div>

      {err && <p style={{ color: 'var(--red)', fontSize: 12, marginTop: 8 }}>{err}</p>}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 14 }}>
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-accent" onClick={submit} disabled={loading}>
          {loading ? 'Saving...' : 'Save word'}
        </button>
      </div>
    </div>
  )
}

function F({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div style={{ gridColumn: full ? '1 / -1' : undefined }}>
      <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  )
}