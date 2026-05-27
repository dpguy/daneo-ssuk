---
name: Custom word architecture
description: How user-saved custom words are stored, accessed, and integrated across all screens.
---

## Rule
Custom words are stored in AsyncStorage under the key `dss:customWords` as a `Word[]` array.
All screens that look up words by ID must use `findWord(id)` from `useApp()`, not `getWordById(id)` directly.
All screens that need a full word list must build `allWords = [...MOCK_WORDS, ...customWords]`.

**Why:** MOCK_WORDS is a static dataset; custom words live only in AsyncStorage/context. Any screen that uses MOCK_WORDS.find() directly will silently miss custom words.

## AppContext API (durable)
- `customWords: Word[]` — reactive state, loaded on startup from AsyncStorage
- `saveCustomWord(word: Word)` — saves to customWords + savedWords + reviews atomically
- `updateCustomWord(id, fields)` — patches specific fields of a saved custom word
- `deleteCustomWord(id)` — removes from customWords only (reviews/savedWords kept)
- `findWord(id)` — checks MOCK_WORDS first via getWordById, then customWords

## Custom word shape
- `id: "custom_${Date.now()}"` — unique timestamp-based ID
- `isCustom: true` — flag used by word-detail header to show "내 단어장" badge instead of grade/unit
- `level: "elementary", grade: 0, unit: 0` — defaults (not shown in UI when isCustom=true)
- `difficulty: "custom"` — added to difficulty union in wordTypes.ts

## Save flow (UnknownWordScreen)
1. User taps "커스텀 단어로 저장하기"
2. EditCustomWordModal opens (meaning, example, exampleKorean, memoryTip fields)
3. User fills in meaning (required) + optional fields
4. handleModalSave: creates Word object with defaults for empty fields, calls saveCustomWord
5. router.replace({ pathname: "/word-detail", params: { id: newId } }) → full Word Detail

## Screens that were updated
- word-detail.tsx: uses findWord; UnknownWordScreen has real save via EditCustomWordModal
- search.tsx: allWords = useMemo([...MOCK_WORDS, ...customWords], [customWords])
- memorization.tsx: uses findWord for both single-word and review queue modes
- review.tsx: uses findWord for today/upcoming review navigation
- spelling.tsx: allWords pattern in useMemo for word queue building
- quiz.tsx: allWords pattern in useMemo for quiz word building
- debug.tsx: 5 new custom word checklist items

## EditCustomWordModal
- Path: artifacts/daneo-ssuk/components/EditCustomWordModal.tsx
- Props: visible, wordText, onSave(fields: CustomWordFields), onClose
- Exports: EditCustomWordModal, CustomWordFields interface
