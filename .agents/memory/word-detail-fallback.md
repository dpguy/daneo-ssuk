---
name: Word detail fallback for unmatched words
description: How word-detail.tsx handles words not found in the dataset (from camera scan).
---

## Rule
word-detail.tsx accepts two params: `id` (primary) and `word` (fallback text for unmatched).

When `getWordById(id)` returns undefined:
- Render `UnknownWordScreen` with `word = wordParam || id || "알 수 없음"`
- Shows TTS (SpeechBar still works), "아직 단어장에 없는 단어입니다" notice, and a "커스텀 단어로 저장하기" CTA (Alert stub for MVP).

**Why:** Camera scan can detect words not in the 300-word dataset. Need graceful fallback.

## Types
- `speechError` is `boolean` (not string | null) — from useSpeech hook
- `speed` is `SpeechSpeed = 0.8 | 1.0 | 1.2` (not number) — must import `SpeechSpeed` from @/hooks/useSpeech
- `onSpeedChange: (s: SpeechSpeed) => void` not `(s: number) => void`
