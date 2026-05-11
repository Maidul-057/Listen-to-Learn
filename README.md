# 📚 Listen and Learn Vocabulary

A personal vocabulary learning web app — add words, listen to them, and test yourself with MCQ quizzes.

---

## Features

- **Word Management** — Add words with English meaning, Bangla meaning, examples, and mnemonic
- **Audio Playback** — Listen to each section individually or all at once (word → English → Bangla → example → mnemonic)
- **Language Detection** — Automatically detects Bengali vs English text and plays in the right voice
- **Play All** — Sequential audio playback of all words for passive revision
- **MCQ Quiz** — Test yourself with 4-option English meaning questions, filter by tag, choose question count
- **Tags** — Organize words by category (GRE, IELTS, Daily, etc.)
- **Search** — Search across word, English meaning, and Bangla meaning
- **Auth** — Each user has their own private word list (signup/login with email)
- **Database** — All words saved permanently in Supabase (PostgreSQL)

---

# 🎧 Audio System

The app uses a hybrid text-to-speech system:

## 🟢 Current (Browser TTS - Web Speech API)
English voice works reliably across devices  
Bangla voice support is device-dependent

## ⚠️ Known Issue (Bangla Audio Skip Problem)

Bangla (bn-BD) audio is sometimes skipped or not played because:  

Many browsers do not include built-in Bengali TTS voices    
Some devices do not have Bengali language packs installed  
Web Speech API fails silently when voice is unavailable

## 🛠️ Current Workaround

If Bengali voice is not available:  

Bangla sections are automatically skipped silently  
English audio continues normally
## 🚀 Planned Fix (Google Cloud Text-to-Speech API)

We are currently upgrading the system to use Google Cloud TTS API to fully solve this issue.  

Why Google Cloud TTS?  
Reliable Bengali (bn-BD) neural voice support  
Consistent across all devices and browsers  
High-quality natural speech output  
No dependency on system-installed voices
## Upcoming Improvement:  
English → Browser TTS (fast, local)  
Bangla → Google Cloud TTS (stable, cloud-based)  
Unified playback system with fallback handling


## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + CSS Variables |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email/password) |
| Audio | Web Speech API (browser TTS) |
| Deployment | Vercel |

---

## Project Structure

```
vocab-shikar/
├── app/       
│   ├── login/page.tsx          
│   ├── signup/page.tsx        
│   ├── words/page.tsx         
│   ├── quiz/page.tsx           
│   ├── layout.tsx             
│   ├── page.tsx               
│   └── globals.css            
├── components/
│   ├── AudioPlayer.tsx         
│   ├── WordCard.tsx            
│   ├── AddWordForm.tsx         
│   └── Navbar.tsx             
├── lib/
│   ├── supabase.ts            
├── supabase-schema.sql        
├── .env.local               
└── README.md
```

---


### Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## How to Use

1. **Sign up** with your email and password
2. Go to **Words** → click **Add word**
3. Fill in the word, meanings, examples, and mnemonic → Save
4. Click any word card to expand and see full details
5. Use the **play buttons** to listen to each section
6. Press **Play all** to listen to all words sequentially
7. Go to **Quiz** → choose a tag and number of questions → Start

---

## Audio Notes

Audio uses the browser's built-in Web Speech API.

- **English** works on all browsers and devices
- **Bengali (bn-BD)** requires Bengali TTS to be installed on the device:
  - **Android** — install Bengali from Settings → General Management → Text-to-speech → Google TTS → Install voice data → Bengali
  - **Windows** — install Bengali from Settings → Time & Language → Language → Add Bengali (Bangladesh) with Text-to-speech enabled
  - If Bengali voice is not available, Bengali sections are skipped silently

---

## Privacy

Every user's words are completely private. Supabase Row Level Security (RLS) ensures that no user can access another user's data — enforced at the database level, not just the application level.
