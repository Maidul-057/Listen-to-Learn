import type { Metadata } from 'next'
// @ts-ignore
import './globals.css'

export const metadata: Metadata = {
  title: 'Listen & Learn Vocabulary',
  description: 'Your personal vocabulary learning app',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}