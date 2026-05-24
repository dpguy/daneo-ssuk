# 단어쑥

영어 단어 암기 앱 — Korean students take pictures of English words and memorize them using AI-assisted memory techniques and spaced repetition.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo (React Native) + Expo Router
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Persistence (MVP): AsyncStorage
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Font: Noto Sans KR

## Where things live

- Mobile app: `artifacts/daneo-ssuk/`
- App screens: `artifacts/daneo-ssuk/app/`
- Shared context: `artifacts/daneo-ssuk/context/AppContext.tsx`
- Mock data: `artifacts/daneo-ssuk/constants/mockData.ts`
- Design tokens: `artifacts/daneo-ssuk/constants/colors.ts`
- Components: `artifacts/daneo-ssuk/components/`
- API server: `artifacts/api-server/`
- OpenAPI spec: `lib/api-spec/openapi.yaml`
- DB schema: `lib/db/src/schema/index.ts`

## Architecture decisions

- MVP uses AsyncStorage for all persistence (no Supabase backend yet) — designed for easy swap to Supabase later
- Spaced repetition logic (SM-2 inspired) lives entirely in `AppContext.tsx` — intervals: 1, 3, 7, 14, 30 days
- OCR scanning is mocked with a 2-second simulate delay — ready to wire in Google Cloud Vision API
- All Korean UI strings are inline (no i18n lib) — suitable for MVP
- NativeTabs (liquid glass) used on iOS 26+, classic Tabs with BlurView on older iOS, solid background on web/Android

## Product

단어쑥 is an educational English vocabulary memorization app for Korean elementary, middle, and high school students. Core flow:

1. **Camera scan** — student photographs a textbook page; OCR detects English words
2. **Word detail** — see pronunciation, meaning, example, idiom, and AI memory tip
3. **Memorization** — flashcard with flip animation, then Easy/Hard/Forgot buttons for spaced repetition
4. **Review** — today's due cards, retention chart, upcoming words
5. **Study** — browse by school level → grade → unit
6. **Search** — find words by English or Korean
7. **Profile** — streak, level, study calendar, achievements

## User preferences

- Korean UI throughout
- Primary color #5BC878, Accent #FFD95A, Background #F6FFF6
- Font: Noto Sans KR
- MVP-first: keep it simple, expand to Supabase backend later
- Expo (React Native) for iOS and Android

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after any OpenAPI spec change before using updated hooks
- Do NOT run `npx expo start` — use `restart_workflow` tool instead
- Do NOT create `app.config.ts/js` — always use `app.json`
- expo-camera version pinned to ~17.0.10 for SDK compatibility

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `expo` skill for mobile development guidelines
