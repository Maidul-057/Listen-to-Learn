import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Word = {
  id: number
  user_id: string
  word: string
  phonetic: string | null
  en_meaning: string
  bn_meaning: string
  en_example: string | null
  bn_example: string | null
  mnemonic: string | null
  tag: string
  created_at: string
}