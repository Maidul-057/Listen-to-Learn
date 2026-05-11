'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Navbar({ email }: { email?: string }) {
  const path   = usePathname()
  const router = useRouter()

  const logout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <nav style={{
      background: 'var(--bg2)', borderBottom: '0.5px solid var(--border)',
      padding: '0 20px', display: 'flex', alignItems: 'center',
      gap: 6, height: 56, position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 16 }}>
        <span style={{ fontSize: 20 }}>📚</span>
        <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em' }}>Vocab Shikar</span>
      </div>

      <Link href="/words" className={`nav-link${path === '/words' ? ' active' : ''}`}>
        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
        Words
      </Link>

      <Link href="/quiz" className={`nav-link${path === '/quiz' ? ' active' : ''}`}>
        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        Quiz
      </Link>

      <div style={{ flex: 1 }} />

      {email && (
        <span style={{ fontSize: 12, color: 'var(--muted)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {email}
        </span>
      )}

      <button className="btn btn-ghost" onClick={logout} style={{ fontSize: 12, gap: 5 }}>
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16,17 21,12 16,7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Logout
      </button>
    </nav>
  )
}