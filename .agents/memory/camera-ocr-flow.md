---
name: Camera demo OCR flow
description: How DEMO_RESULTS is structured, key lookup, and navigation for known vs unknown words.
---

## Rule
DEMO_RESULTS items have `id: string` (empty string for unknowns) and `word: string`.
Key for Set selection: `item.id || "unknown:${item.word}"` — avoids collisions.

**Why:** New vocab dataset uses zero-padded IDs (e25, m08, etc.), old IDs (e3, m3) no longer exist.

## Known words (in dataset)
e25=friend, m08=curious, h01=achieve, m03=brave, h03=analyze, h09=equality, m04=creative, m01=kind

## Unknown words (not in dataset)
important, friendship, significant, perseverance — id is empty string "".

## Navigation
- Known: `router.push("/word-detail", { id })`
- Unknown: `router.push("/word-detail", { id: "", word: item.word })`

## Save flow
Only words with a truthy `id` that resolves via `getWordById` are passed to `saveWord`/`addReview`.
Unknown words are skipped — savedCount reflects only known words saved.
