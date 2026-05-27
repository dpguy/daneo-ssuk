---
name: Vocabulary dataset IDs and structure
description: ID scheme, counts, and structure of the 300-word vocabulary dataset.
---

## ID scheme
- Elementary: e01–e100 (grades 3–6, 4 units/grade, ~6–7 words/unit)
- Middle: m01–m100 (grades 1–3, 4 units/grade, 8–9 words/unit)
- High: h01–h100 (grades 1–3, 4 units/grade, 8–9 words/unit)

## Imports
mockData.ts imports only: ELEMENTARY_WORDS, MIDDLE_WORDS, HIGH1_WORDS
(middle_rest.ts and high2.ts are empty exports — not used)

## Helpers exported from mockData.ts
- `getVocabStats()` — returns total, elementaryCount, middleCount, highCount, demoMatched, demoTotal, unitCounts
- `getWordById(id)`, `getRelatedWords(word)`, `getLevelLabel(level)`, `formatNextReview(isoDate)`

## Debug screen
Route: /debug — accessible from Profile tab via "개발자 검증 체크리스트" button.
Shows checklist of 10 validation items + unit breakdown + quick flow navigation links.
