'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [done, setDone]         = useState(false)

  const handleSignup = async () => {
    if (!email || !password) { setError('Email ও password দাও।'); return }
    if (password.length < 6)  { setError('Password কমপক্ষে 6 character হতে হবে।'); return }
    if (password !== confirm)  { setError('Password দুটো match করছে না।'); return }
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (err) { setError(err.message); return }
    setDone(true)
  }

  if (done) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>✉️</div>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Email verify করো</h2>
        <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>
          {email} এ একটা confirmation email পাঠানো হয়েছে।<br />
          Link এ click করলেই account active হয়ে যাবে।
        </p>
        <Link href="/login">
          <button className="btn btn-accent" style={{ marginTop: 20, justifyContent: 'center', width: '100%', padding: 11 }}>
            Login পেজে যাও
          </button>
        </Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>📚</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>Vocab Shikar</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>তোমার personal vocabulary app</p>
      </div>

      <div className="auth-card">
        <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 20 }}>Account বানাও</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Email</label>
            <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Password</label>
            <input type="password" placeholder="কমপক্ষে 6 character" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Confirm Password</label>
            <input type="password" placeholder="আবার লেখো" value={confirm} onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSignup()} />
          </div>

          {error && (
            <div style={{ background: 'rgba(248,113,113,0.08)', border: '0.5px solid rgba(248,113,113,0.3)', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: 'var(--red)' }}>
              {error}
            </div>
          )}

          <button className="btn btn-accent" onClick={handleSignup} disabled={loading}
            style={{ justifyContent: 'center', padding: '11px', marginTop: 4, fontSize: 14 }}>
            {loading ? 'Creating account...' : 'Sign up →'}
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', marginTop: 20 }}>
          Account আছে?{' '}
          <Link href="/login" style={{ color: 'var(--accent2)', textDecoration: 'none', fontWeight: 500 }}>
            Login করো
          </Link>
        </p>
      </div>
    </div>
  )
}