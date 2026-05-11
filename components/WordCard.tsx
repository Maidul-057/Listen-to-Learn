'use client'
import { useState } from 'react'
import { Word } from '@/lib/supabase'
import { speakWord, speakSection, speakFull, getLang } from './AudioPlayer'

interface Props {
  word: Word
  index: number
  onDelete: (id: number) => void
}

export default function WordCard({ word: w, index, onDelete }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="card fade-up" style={{ animationDelay: `${Math.min(index * 25, 250)}ms`, opacity: 0 }}>

      {/* Header row */}
      <div onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', cursor: 'pointer' }}>
        <span className="mono" style={{ fontSize: 11, color: 'var(--muted2)', minWidth: 24 }}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <span style={{ fontSize: 16, fontWeight: 600, flex: 1, letterSpacing: '-0.01em' }}>{w.word}</span>
        {w.phonetic && (
          <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{w.phonetic}</span>
        )}
        {w.tag && <span className="badge badge-purple">{w.tag}</span>}

        <div style={{ display: 'flex', gap: 2 }} onClick={e => e.stopPropagation()}>
          <button className="btn btn-ghost" onClick={() => speakWord(w)} aria-label="play word" style={{ padding: '5px 7px' }}>
            <SpeakerIcon />
          </button>
          <button className="btn btn-ghost" onClick={() => onDelete(w.id)} aria-label="delete" style={{ padding: '5px 7px' }}>
            <TrashIcon />
          </button>
        </div>
        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
          style={{ color: 'var(--muted2)', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>
          <polyline points="6,9 12,15 18,9"/>
        </svg>
      </div>

      {/* Body */}
      {open && (
        <div className="pop" style={{ borderTop: '0.5px solid var(--border)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 11 }}>

          <DetailRow label="🇬🇧 English">
            <span style={{ fontSize: 13, lineHeight: 1.65 }}>{w.en_meaning}</span>
            <PlayBtn onClick={() => speakSection(w.en_meaning, 'en-US')} />
          </DetailRow>

          <DetailRow label="🇧🇩 বাংলা">
            <span className="bn" style={{ fontSize: 13, lineHeight: 1.65 }}>{w.bn_meaning}</span>
            <PlayBtn onClick={() => speakSection(w.bn_meaning, 'bn-BD')} color="var(--green)" />
          </DetailRow>

          {w.en_example && (
            <DetailRow label="💬 Example">
              <span style={{ fontSize: 13, fontStyle: 'italic', lineHeight: 1.65, color: 'var(--muted)' }}>{w.en_example}</span>
              <PlayBtn onClick={() => speakSection(w.en_example!, getLang(w.en_example!))} />
            </DetailRow>
          )}

          {w.bn_example && (
            <DetailRow label="💬 উদাহরণ">
              <span className="bn" style={{ fontSize: 13, fontStyle: 'italic', lineHeight: 1.65, color: 'var(--muted)' }}>{w.bn_example}</span>
              <PlayBtn onClick={() => speakSection(w.bn_example!, 'bn-BD')} color="var(--green)" />
            </DetailRow>
          )}

          {w.mnemonic && (
            <DetailRow label="💡 Mnemonic">
              <div style={{ background: 'rgba(251,191,36,0.07)', border: '0.5px solid rgba(251,191,36,0.18)', borderRadius: 8, padding: '9px 12px' }}>
                <span style={{ fontSize: 13, color: 'var(--amber)', lineHeight: 1.65 }}>{w.mnemonic}</span>
              </div>
              <PlayBtn onClick={() => speakSection(w.mnemonic!, getLang(w.mnemonic!))} color="var(--amber)" />
            </DetailRow>
          )}

          {/* Quick audio buttons */}
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', borderTop: '0.5px solid var(--border)', paddingTop: 11 }}>
            <button className="btn" style={{ fontSize: 12 }} onClick={() => speakSection(w.en_meaning, 'en-US')}>
              English meaning
            </button>
            <button className="btn" style={{ fontSize: 12, color: 'var(--green)', borderColor: 'rgba(52,211,153,0.3)' }}
              onClick={() => speakSection(w.bn_meaning, 'bn-BD')}>
              বাংলা অর্থ
            </button>
            {w.en_example && (
              <button className="btn" style={{ fontSize: 12 }} onClick={() => speakSection(w.en_example!, getLang(w.en_example!))}>
                Example
              </button>
            )}
            <button className="btn btn-accent" style={{ fontSize: 12 }} onClick={() => speakFull(w)}>
              সব শোনো
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '96px 1fr', gap: 8, alignItems: 'start' }}>
      <span style={{ fontSize: 11, color: 'var(--muted)', paddingTop: 2 }}>{label}</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>{children}</div>
    </div>
  )
}

function PlayBtn({ onClick, color = 'var(--accent2)' }: { onClick: () => void; color?: string }) {
  return (
    <button className="btn btn-ghost" onClick={onClick}
      style={{ padding: '2px 7px', fontSize: 11, color, alignSelf: 'flex-start', gap: 4 }}>
      <SpeakerIcon size={11} /> Play
    </button>
  )
}

function SpeakerIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <polyline points="3,6 5,6 21,6"/>
      <path d="M19,6l-1,14H6L5,6"/>
      <path d="M10,11v6M14,11v6M9,6V4h6v2"/>
    </svg>
  )
}