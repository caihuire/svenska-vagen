# Svenska Vägen (Wave 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete mobile-first Swedish learning PWA (Path, Unit View, Drill Arena, SRS Vocab Trainer, Cultural Reader, Swedish TTS, Streaks/Mastery, Portable `SV1:...` Sync Codes, and GitHub Pages CI/CD) populated with deeply authored, 100% original Stage A1 content (Units 1–13, ~390 words) and all 51 A1–B2 unit outlines on the Skill Path.

**Architecture:** React 19 + TypeScript + Vite + Tailwind CSS static PWA deployed to GitHub Pages (`base: './'`, `HashRouter`). Pure TypeScript domain engines (`morphology`, `srs`, `mastery`, `drills`, `reader`, `storage/merge`, `storage/syncCode`) have zero React/DOM imports and are unit-tested with Vitest. All 51 units and 4 CEFR lexicon chunks are lazy-loaded via Vite dynamic imports.

**Tech Stack:** Vite 6, React 19, TypeScript 5, Tailwind CSS 4 (`@tailwindcss/vite`), `react-router-dom` 7 (`HashRouter`), `lucide-react`, `fflate`, `vite-plugin-pwa`, Vitest 3, `@testing-library/react`, `jsdom`.

## Global Constraints

- **Target Hosting:** GitHub Pages (`base: './'` in `vite.config.ts`, `HashRouter` for all routes, `.github/workflows/deploy.yml`).
- **Original Content Only:** 100% freshly authored grammar cards, examples, exercises, and cultural readings aligned to *Basic Swedish* (U01–U25) and *Intermediate Swedish* (U26–U51). Zero verbatim copying. See `docs/superpowers/specs/2026-11-24-curriculum-syllabus-51-units.md` (51-unit syllabus), `docs/superpowers/specs/2026-11-24-vocabulary-seed-list.md` (~1,530-word A1–B2 vocabulary seed list), and `docs/superpowers/plans/2026-11-24-waves-2-to-4-roadmap.md` (Waves 2–4 content roadmap).
- **Mobile Ergonomics:** Designed for 375px–430px viewports, `≥48px` touch targets, `100dvh` full-screen active sessions, `16px` `<input>` font size (prevents iOS auto-zoom), static inline `å / ä / ö / ⇧ / Check ↵` strip with `onPointerDown` `e.preventDefault()`, and `select-none touch-manipulation` on Cultural Reader tokens.
- **Audio:** Web Speech API (`sv-SE`) at `1.0x` and `0.75x`, synchronous gesture-triggered start for iOS Safari, `isSpeaking` + `stop()`, sentence-chained `▶ Play all`, session-level "Can't listen now" mute toggle. Never use synthetic TTS to grade pitch-accent (Accent 1 vs 2).
- **Persistence & Sync:** Synchronous `localStorage` (`schemaVersion: 1`) behind `StorageAdapter`, deterministic smart-merge (`mergeProgress`), compact gzip + Base64URL + checksum Sync Code (`SV1:...`), plus JSON file export/import.
- **PowerShell Note (Windows):** Use `;` (not `&&`) when chaining shell commands in PowerShell 5.1.

---

## File Structure Map

```text
.github/workflows/deploy.yml
index.html
package.json
tsconfig.json
vite.config.ts
vitest.config.ts
public/icons/icon-192.svg
public/icons/icon-512.svg
src/
├── main.tsx
├── App.tsx
├── index.css
├── types/index.ts
├── engine/
│   ├── morphology/inflector.ts
│   ├── morphology/normalizer.ts
│   ├── morphology/__tests__/morphology.test.ts
│   ├── srs/scheduler.ts
│   ├── srs/__tests__/scheduler.test.ts
│   ├── mastery/tracker.ts
│   ├── mastery/__tests__/tracker.test.ts
│   ├── reader/parser.ts
│   ├── reader/__tests__/parser.test.ts
│   ├── drills/generator.ts
│   └── drills/__tests__/generator.test.ts
├── storage/
│   ├── adapter.ts
│   ├── migrations.ts
│   ├── merge.ts
│   ├── syncCode.ts
│   ├── backup.ts
│   └── __tests__/storage.test.ts
├── services/tts/speech.ts
├── store/AppContext.tsx
├── data/
│   ├── curriculum/manifest.ts
│   ├── curriculum/loader.ts
│   ├── curriculum/units/u01.ts .. u13.ts
│   ├── lexicon/index.ts
│   ├── lexicon/stage-a1.ts
│   └── __tests__/contentIntegrity.test.ts
├── components/
│   ├── BottomNav.tsx
│   ├── GenderBadge.tsx
│   ├── AudioButton.tsx
│   ├── SwedishInput.tsx
│   ├── FeedbackBanner.tsx
│   └── IosInstallBanner.tsx
└── features/
    ├── exercises/
    │   ├── ExerciseSession.tsx
    │   ├── ClassifierExercise.tsx
    │   ├── MorphFillExercise.tsx
    │   ├── WordOrderExercise.tsx
    │   ├── ClozeExercise.tsx
    │   ├── ErrorSpottingExercise.tsx
    │   └── ListeningExercise.tsx
    ├── path/PathView.tsx
    ├── unit/UnitView.tsx
    ├── unit/LearnTab.tsx
    ├── unit/CulturalReaderTab.tsx
    ├── unit/UnitWordsTab.tsx
    ├── drills/DrillArenaView.tsx
    ├── srs/SrsView.tsx
    └── profile/ProfileView.tsx
```

---

### Task 1: Project Scaffold, PWA Config, Nordic Theme & Core Types

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `index.html`
- Create: `public/icons/icon-192.svg`, `public/icons/icon-512.svg`
- Create: `src/index.css`, `src/types/index.ts`, `src/main.tsx`, `src/App.tsx`
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- Produces: All shared TypeScript interfaces in `src/types/index.ts` (`CefrStage`, `Pos`, `UnitSummary`, `UnitContent`, `GrammarCard`, `LexiconEntry`, `NounMorph`, `VerbMorph`, `AdjMorph`, `Exercise`, `TextToken`, `CulturalText`, `SrsCardState`, `SrsGrade`, `UnitProgress`, `WeakSkillRecord`, `UserSettings`, `UserProgress`, `SyncDiff`).

- [ ] **Step 1: Initialize `package.json` and install dependencies**

Create `package.json` with scripts `dev`, `build`, `preview`, `test`, `typecheck`, and install `react`, `react-dom`, `react-router-dom`, `lucide-react`, `fflate` plus devDeps `vite`, `@vitejs/plugin-react`, `typescript`, `@types/react`, `@types/react-dom`, `tailwindcss`, `@tailwindcss/vite`, `vite-plugin-pwa`, `vitest`, `@testing-library/react`, `jsdom`.

- [ ] **Step 2: Configure `vite.config.ts`, `vitest.config.ts`, `tsconfig.json`, `index.html`, and PWA icons**

`vite.config.ts` sets `base: './'` and registers `react()`, `tailwindcss()`, and `VitePWA({ registerType: 'autoUpdate', manifest: { name: 'Svenska Vägen', short_name: 'Svenska', theme_color: '#1B4D7E', background_color: '#F8F9FA', display: 'standalone', icons: [...] } })`.

- [ ] **Step 3: Create `src/index.css` with Nordic Light + Dark WCAG AA tokens**

Define CSS variables (`--bg-surface`, `--bg-card`, `--text-primary`, `--text-muted`, `--brand`, `--accent`, `--success`, `--error`, `--border`) for light mode and `.dark` class, plus `@media (prefers-reduced-motion: reduce)`.

- [ ] **Step 4: Create `src/types/index.ts` with all core domain schemas**

Define exact discriminated unions for `LexiconEntry['morph']` and `Exercise` (`classifier`, `morph-fill`, `word-order`, `cloze`, `error-spotting`, `listening`), `CulturalText` (`markup: string`, `comprehension: Exercise[]`), `SrsCardState`, `UserProgress` (`schemaVersion: 1`), and `SyncDiff`.

- [ ] **Step 5: Create `.github/workflows/deploy.yml` for GitHub Pages**

Workflow runs `npm ci`, `npm run typecheck`, `npm test`, `npm run build`, and deploys `./dist` via `actions/upload-pages-artifact@v3` + `actions/deploy-pages@v4`.

- [ ] **Step 6: Verify build and test runner**

Run: `npm run typecheck; npm run build`
Expected: 0 TypeScript errors and clean `dist/` bundle.

- [ ] **Step 7: Commit**

```powershell
git add -A; git commit -m "chore: scaffold Vite React TS PWA with Nordic theme, core types, and GitHub Pages workflow"
```

---

### Task 2: Swedish Morphology Engine & 2-Tier Answer Normalizer

**Files:**
- Create: `src/engine/morphology/inflector.ts`
- Create: `src/engine/morphology/normalizer.ts`
- Test: `src/engine/morphology/__tests__/morphology.test.ts`

**Interfaces:**
- Consumes: `LexiconEntry`, `NounMorph`, `VerbMorph`, `AdjMorph` from `src/types/index.ts`.
- Produces:
  - `inflectNoun(entry: LexiconEntry): { indefSg: string; defSg: string; indefPl: string; defPl: string }`
  - `inflectVerb(entry: LexiconEntry): { inf: string; imp: string; pres: string; past: string; supine: string; pastPart?: string }`
  - `inflectAdj(entry: LexiconEntry): { common: string; neuter: string; plDef: string; comp?: string; sup?: string }`
  - `evaluateTypedAnswer(input: string, accepted: string[]): { status: 'exact' | 'diacritic-retry' | 'wrong'; matched?: string }`

- [ ] **Step 1: Write failing tests in `src/engine/morphology/__tests__/morphology.test.ts`**

Cover:
- Noun declensions 1 (`en flicka -> flickan / flickor / flickorna`), 2 (`en bil -> bilen / bilar / bilarna`; `en tidning -> tidningen / tidningar / tidningarna`), 3 (`en park -> parken / parker / parkerna`), 4 (`en ko -> kon / kor / korna`), 5 (`ett äpple -> äpplet / äpplen / äpplena`), 6 (`ett hus -> huset / hus / husen`; `en lärare -> läraren / lärare / lärarna`), 7 (`en fan -> fanen / fans / fansen`), plus irregular overrides (`en bok -> boken / böcker / böckerna`).
- Verb groups 1 (`arbeta`), 2a (`ringa`, `köra` r-stem assimilation), 2b (`köpa`), 3 (`bo`), and 4/irregular overrides (`dricka`, `vara`).
- Adjectives: regular (`stor -> stort / stora`), long vowel (`ny -> nytt / nya`), vowel+d (`röd -> rött / röda`), indeclinable (`bra -> bra / bra`), irregular override (`liten -> litet / små`).
- Normalizer: exact match ignoring case/whitespace/punctuation, `'diacritic-retry'` when `a/o` is typed for `å/ä/ö` (e.g. `bocker` vs `böcker`, `ag` vs `äg`), and `'wrong'` for real spelling mistakes.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/engine/morphology/__tests__/morphology.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `inflector.ts` and `normalizer.ts`**

Pure TypeScript, zero DOM/React dependencies. Always check explicit `forms` overrides first, then apply standard Swedish declension/conjugation rules.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/engine/morphology/__tests__/morphology.test.ts`
Expected: PASS (all cases green).

- [ ] **Step 5: Commit**

```powershell
git add src/engine/morphology; git commit -m "feat(engine): add Swedish morphology inflector and 2-tier diacritic normalizer"
```

---

### Task 3: SM-2-Lite SRS Scheduler, Mastery, Streaks & Weak-Spot Radar

**Files:**
- Create: `src/engine/srs/scheduler.ts`
- Create: `src/engine/mastery/tracker.ts`
- Test: `src/engine/srs/__tests__/scheduler.test.ts`
- Test: `src/engine/mastery/__tests__/tracker.test.ts`

**Interfaces:**
- Consumes: `SrsCardState`, `SrsGrade`, `UserProgress`, `UnitProgress` from `src/types/index.ts`.
- Produces:
  - `createSrsCard(lexId: string, nowMs: number): SrsCardState`
  - `reviewSrsCard(card: SrsCardState, grade: SrsGrade, nowMs: number): SrsCardState`
  - `getDueSrsQueue(cards: Record<string, SrsCardState>, nowMs: number, newCap: number, reviewCap: number): SrsCardState[]`
  - `isProductionCard(card: SrsCardState): boolean` (`intervalDays >= 4`)
  - `isLeechCard(card: SrsCardState): boolean` (`lapses >= 4`)
  - `localDateKey(nowMs: number): string` (`YYYY-MM-DD`)
  - `recordXpAndStreak(progress: UserProgress, xpDelta: number, nowMs: number): UserProgress`
  - `recordGrammarAttempt(progress: UserProgress, tag: string, correct: boolean): UserProgress`
  - `getWeakGrammarTags(progress: UserProgress): { tag: string; accuracy: number; attempts: number }[]`
  - `computeUnitMastery(unitId: string, unitLexIds: string[], progress: UserProgress, nowMs: number): { tier: 0 | 1 | 2 | 3; needsRefresh: boolean }`

- [ ] **Step 1: Write failing tests for SRS scheduler and Mastery/Streak tracker**

Test:
- `again` resets interval to `<10m` (same-session requeue), increments `lapses`, drops ease (min `1.3`).
- `good` progresses `1d -> 4d -> round(interval * ease)`; `easy` boosts interval and ease.
- `isProductionCard` flips `true` at `intervalDays >= 4`; `isLeechCard` flips `true` at `lapses >= 4`.
- Daily cap enforcement (`15 new / 60 review`).
- Streak increments on consecutive days, consumes 1 Streak Freeze on a single missed day, auto-earns 1 freeze every 7 consecutive days (capped at 2).
- Weak-spot ring buffer keeps max 20 attempts per tag and flags tags with `>= 5` attempts and `< 0.75` accuracy.
- Unit Mastery Tiers 0 -> 1 (practice >=80%) -> 2 (reader passed) -> 3 (>=80% enrolled unit words at `interval >= 4d`), plus `needsRefresh: true` when Tier 3 is >45 days stale.

- [ ] **Step 2: Run tests to verify failure**

Run: `npx vitest run src/engine/srs src/engine/mastery`
Expected: FAIL.

- [ ] **Step 3: Implement `scheduler.ts` and `tracker.ts`**

Pure deterministic functions taking `nowMs` explicitly so all date/interval tests are deterministic.

- [ ] **Step 4: Run tests to verify pass**

Run: `npx vitest run src/engine/srs src/engine/mastery`
Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/engine/srs src/engine/mastery; git commit -m "feat(engine): add SM-2-Lite SRS scheduler, streak/freeze, mastery tiers, and weak-spot radar"
```

---

### Task 4: Cultural Reader Markup Parser & Procedural Drill Generator

**Files:**
- Create: `src/engine/reader/parser.ts`
- Create: `src/engine/drills/generator.ts`
- Test: `src/engine/reader/__tests__/parser.test.ts`
- Test: `src/engine/drills/__tests__/generator.test.ts`

**Interfaces:**
- Consumes: `LexiconEntry`, `Exercise`, `TextToken`, `CefrStage` from `src/types/index.ts`; `inflectNoun`, `inflectVerb`, `inflectAdj` from `src/engine/morphology/inflector.ts`.
- Produces:
  - `parseCulturalMarkup(markup: string): TextToken[][]` (array of paragraphs, each an array of `TextToken` with `surface`, `lexId?`, `gloss?`, `spanGroup?`, `isPunct?`).
  - `extractSentences(markup: string): string[]` (clean plain-text Swedish sentences for TTS `▶ Play all`).
  - `generateMorphologyDrills(category: DrillCategory, lexicon: LexiconEntry[], count: number, seed?: number): Exercise[]`

- [ ] **Step 1: Write failing tests for reader parser and drill generator**

Test:
- Parsing `[kaffe|noun:kaffe]` -> `{ surface: 'kaffe', lexId: 'noun:kaffe' }`.
- Parsing split particle verb `[tycker|g1:verb:tycka_om] mycket [om|g1]` -> both tokens share `spanGroup: 'g1'` and `lexId: 'verb:tycka_om'`.
- Parsing inline gloss `[Stockholm|gloss:Capital of Sweden]`.
- `extractSentences` strips markup cleanly and splits on `.`, `!`, `?`.
- `generateMorphologyDrills` generates valid `classifier` (`en`/`ett`) and `morph-fill` (plurals, definite forms, verb present/past/supine, adjective agreement) exercises with no duplicate prompts in a session.

- [ ] **Step 2: Run tests to verify failure**

Run: `npx vitest run src/engine/reader src/engine/drills`
Expected: FAIL.

- [ ] **Step 3: Implement `parser.ts` and `generator.ts`**

- [ ] **Step 4: Run tests to verify pass**

Run: `npx vitest run src/engine/reader src/engine/drills`
Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/engine/reader src/engine/drills; git commit -m "feat(engine): add cultural reader inline markup parser and procedural drill generator"
```

---

### Task 5: Storage Adapter, Migrations, Smart-Merge & Portable Sync Code (`SV1:...`)

**Files:**
- Create: `src/storage/adapter.ts`
- Create: `src/storage/migrations.ts`
- Create: `src/storage/merge.ts`
- Create: `src/storage/syncCode.ts`
- Create: `src/storage/backup.ts`
- Test: `src/storage/__tests__/storage.test.ts`

**Interfaces:**
- Consumes: `UserProgress`, `SyncDiff` from `src/types/index.ts`.
- Produces:
  - `LocalStorageAdapter` implementing `StorageAdapter { load(): UserProgress; save(p: UserProgress): void; clear(): void }`
  - `createInitialProgress(): UserProgress` and `migrateProgress(raw: unknown): UserProgress`
  - `mergeProgress(local: UserProgress, incoming: UserProgress): UserProgress`
  - `computeSyncDiff(local: UserProgress, incoming: UserProgress): SyncDiff`
  - `encodeSyncCode(progress: UserProgress): string` (returns `SV1:<checksum>.<base64url>`)
  - `decodeSyncCode(code: string): UserProgress` (throws descriptive error on bad prefix, checksum mismatch, or invalid schema)
  - `exportProgressJson(progress: UserProgress): Promise<void>` and `parseProgressJson(text: string): UserProgress`

- [ ] **Step 1: Write failing tests in `src/storage/__tests__/storage.test.ts`**

Test:
- `encodeSyncCode` -> `decodeSyncCode` round-trips full `UserProgress` losslessly and produces a compact string (<1.5 KB for 100 SRS cards + 13 units).
- Truncating or mutating 1 character of a Sync Code throws a checksum error.
- `mergeProgress` keeps the newest `lastReviewedAt` per SRS card, highest practice score / reader passed per unit, max XP, and union of `activeDates` (recomputing streak cleanly).
- `computeSyncDiff` reports exact counts of new/updated SRS cards, updated units, and XP delta.

- [ ] **Step 2: Run tests to verify failure**

Run: `npx vitest run src/storage/__tests__/storage.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `adapter.ts`, `migrations.ts`, `merge.ts`, `syncCode.ts`, `backup.ts`**

Use `fflate` (`deflateSync` / `inflateSync`) + Base64URL + 32-bit FNV-1a hex checksum for `SV1:<hash>.<payload>`.

- [ ] **Step 4: Run tests to verify pass**

Run: `npx vitest run src/storage/__tests__/storage.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/storage; git commit -m "feat(storage): add localStorage adapter, smart-merge, portable SV1 sync codes, and JSON backup"
```

---

### Task 6: Swedish TTS Audio Service & Global App Store

**Files:**
- Create: `src/services/tts/speech.ts`
- Create: `src/store/AppContext.tsx`

**Interfaces:**
- Consumes: `UserProgress`, `SrsGrade` from `src/types/index.ts`; `LocalStorageAdapter`, `mergeProgress` from `src/storage/`; engine functions from `src/engine/`.
- Produces:
  - `ttsService`: `{ isSupported(): boolean; speak(text: string, rate?: 1 | 0.75): void; speakSentences(sentences: string[], rate?: 1 | 0.75, onSentenceIndex?: (idx: number | null) => void): void; stop(): void; subscribe(cb: (speaking: boolean) => void): () => void }`
  - `AppProvider` and `useApp()` hook exposing `progress`, `recordAttempt`, `completeUnitPractice`, `completeUnitReader`, `enrollWords`, `reviewCard`, `updateSettings`, `applyMergedProgress`, `resetProgress`.

- [ ] **Step 1: Implement `src/services/tts/speech.ts`**

Handle iOS Safari `speechSynthesis.getVoices()` async loading, pick best `sv-SE` voice, call `cancel()` then `speak()` synchronously inside click handlers, expose `stop()` and `isSpeaking` listener, and chain `onend` for `speakSentences`.

- [ ] **Step 2: Implement `src/store/AppContext.tsx`**

Wrap state in `useReducer` hydrated synchronously from `LocalStorageAdapter`, auto-persisting on every state transition.

- [ ] **Step 3: Verify typecheck**

Run: `npm run typecheck`
Expected: 0 errors.

- [ ] **Step 4: Commit**

```powershell
git add src/services src/store; git commit -m "feat(core): add Swedish TTS audio service and global app state context"
```

---

### Task 7: 51-Unit Manifest, Stage A1 Lexicon (~325 Words), Original Units 1–13 & Content Integrity Gate

**Files:**
- Create: `src/data/curriculum/manifest.ts` (all 51 units: `u01`–`u13` `available: true`, `u14`–`u51` `available: false`)
- Create: `src/data/lexicon/stage-a1.ts` (~325 original tagged A1 `LexiconEntry` items with gender, declension/conjugation, irregular overrides, and original Swedish example sentences)
- Create: `src/data/lexicon/index.ts` (stage-chunked lazy loader + lookup map)
- Create: `src/data/curriculum/units/u01.ts` through `src/data/curriculum/units/u13.ts` (13 deeply authored, 100% original A1 units)
- Create: `src/data/curriculum/loader.ts` (Vite dynamic import map for lazy unit loading)
- Test: `src/data/__tests__/contentIntegrity.test.ts`

**Interfaces:**
- Produces: `CURRICULUM_MANIFEST: UnitSummary[]`, `loadUnit(id: string): Promise<UnitContent>`, `loadStageLexicon(stage: CefrStage): Promise<LexiconEntry[]>`, `getA1LexiconMap()`.

- [ ] **Step 1: Write `src/data/__tests__/contentIntegrity.test.ts` (Content Integrity Gate)**

Test verifies:
- `CURRICULUM_MANIFEST` has exactly 51 units numbered 1..51 across A1 (13), A2 (12), B1 (13), B2 (13).
- Every `available: true` unit (`u01`–`u13`) loads cleanly, has 3–4 `grammarCards`, ≥10 `exercises`, ≥15 `lexiconIds`, and a `culturalText` with ≥2 comprehension exercises.
- Every `lexiconId` referenced in any unit or inline Cultural Reader markup exists in `stage-a1.ts`.
- Every `morph.declension === 'irreg'` noun and `morph.group === '4' | 'irreg'` verb in `stage-a1.ts` has explicit `forms` overrides and produces non-empty inflections via `inflectNoun`/`inflectVerb`.
- No duplicate `LexiconEntry.id` or `Exercise.id`.

- [ ] **Step 2: Author `manifest.ts`, `stage-a1.ts`, `lexicon/index.ts`, `loader.ts`, and `u01.ts`–`u13.ts`**

All grammar cards, examples, 10–12 exercises per unit, and 13 original Swedish cultural mini-texts freshly authored to match the 13 A1 grammar topics (1. Cognates & Alphabet, 2. Pronunciation & Vowel Length, 3. `en`/`ett` Gender, 4. Present Tense & Pronouns, 5. V2 Word Order & Questions, 6. `s`-Genitives & 7 Plurals, 7. Numerals, Dates & Clock, 8. Main-Clause Adverbials, 9. Possessive & Indefinite Pronouns, 10. Demonstratives, 11. Infinitives, Modals, Future & Imperatives, 12. Short Answers & Formal `det`, 13. Indefinite & Indeclinable Adjectives).

- [ ] **Step 3: Run Content Integrity Gate**

Run: `npx vitest run src/data/__tests__/contentIntegrity.test.ts`
Expected: PASS (all 13 units & ~325 lexicon entries verified).

- [ ] **Step 4: Commit**

```powershell
git add src/data; git commit -m "feat(content): add 51-unit manifest, Stage A1 lexicon, original Units 1-13, and integrity tests"
```

---

### Task 8: Shared Mobile Primitives & App Shell

**Files:**
- Create: `src/components/BottomNav.tsx`
- Create: `src/components/GenderBadge.tsx`
- Create: `src/components/AudioButton.tsx`
- Create: `src/components/SwedishInput.tsx`
- Create: `src/components/FeedbackBanner.tsx`
- Create: `src/components/IosInstallBanner.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Build shared mobile UI primitives**

- `BottomNav`: Fixed 4-tab bottom bar (`Path`, `Vocab`, `Drills`, `Profile`) with `safe-area-inset-bottom` padding and `≥48px` targets.
- `GenderBadge`: `en ●` (Fjord Blue pill) / `ett ◆` (Amber Birch pill) — colorblind-safe.
- `AudioButton`: `1.0x` normal + `0.75x` turtle slow toggle wired to `ttsService` with active pulse.
- `SwedishInput`: `16px` `<input>` (`autoCorrect="off" autoCapitalize="off" spellCheck={false} lang="sv" enterKeyHint="done"`) + static inline `[ å ] [ ä ] [ ö ] [ ⇧ ] [ Check ↵ ]` strip directly underneath, calling `e.preventDefault()` on `onPointerDown` so the mobile keyboard stays open.
- `FeedbackBanner`: Bottom-anchored feedback sheet showing Correct (Pine Green), Diacritic Retry (Amber), or Incorrect (Lingonberry Coral) + expected answer + 1-line grammar tip + `Continue` button.
- `IosInstallBanner`: Dismissible tip shown after completing Unit 1 on iOS Safari outside standalone mode.

- [ ] **Step 2: Wire `HashRouter` and dark-mode class toggle in `src/App.tsx`**

Routes: `/`, `/unit/:unitId`, `/vocab`, `/drills`, `/profile`.

- [ ] **Step 3: Verify typecheck and build**

Run: `npm run typecheck; npm run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```powershell
git add src/components src/App.tsx; git commit -m "feat(ui): add mobile-first Nordic primitives, inline Swedish input strip, and app shell"
```

---

### Task 9: 6-Type Exercise Runner & Unit View (Learn, Practice, Cultural Reader, Words)

**Files:**
- Create: `src/features/exercises/ExerciseSession.tsx`
- Create: `src/features/exercises/ClassifierExercise.tsx`
- Create: `src/features/exercises/MorphFillExercise.tsx`
- Create: `src/features/exercises/WordOrderExercise.tsx`
- Create: `src/features/exercises/ClozeExercise.tsx`
- Create: `src/features/exercises/ErrorSpottingExercise.tsx`
- Create: `src/features/exercises/ListeningExercise.tsx`
- Create: `src/features/unit/UnitView.tsx`
- Create: `src/features/unit/LearnTab.tsx`
- Create: `src/features/unit/CulturalReaderTab.tsx`
- Create: `src/features/unit/UnitWordsTab.tsx`

- [ ] **Step 1: Implement all 6 exercise components + `ExerciseSession.tsx`**

- Full-screen `100dvh` layout, slim top progress bar, session-level `"Can't listen now"` mute toggle (stored in session state), `autoAdvance` (OFF by default), 2-tier diacritic retry on `MorphFillExercise` and typed `ClozeExercise`, constituent-chunked phrase tiles (`44px` min-height, `8px` gap) on `WordOrderExercise`, tap-token + bottom 2–4 choice sheet on `ErrorSpottingExercise`, and end-of-session XP + accuracy summary card.

- [ ] **Step 2: Implement `UnitView.tsx` and its 4 tabs**

- `LearnTab`: Swipeable / tap-navigable single-focus micro-cards (`Rule`, `Table`, `Examples` with TTS, `English Trap`).
- `CulturalReaderTab`: Renders `parseCulturalMarkup()` tokens as `<button className="select-none touch-manipulation">`, highlights all linked `spanGroup` tokens together, opens a bottom-docked glossary sheet (`lemma · en · GenderBadge · AudioButton · [+ SRS]`), includes `▶ Play all` sentence-chained TTS, and launches the 2–3 comprehension checks.
- `UnitWordsTab`: Lists unit lexicon entries with audio, example sentence, and 1-tap `Queue All for SRS` / individual `+ SRS` toggles.

- [ ] **Step 3: Verify typecheck and build**

Run: `npm run typecheck; npm run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```powershell
git add src/features/exercises src/features/unit; git commit -m "feat(unit): add 6-type mobile exercise runner and 4-tab Unit View with interactive Cultural Reader"
```

---

### Task 10: Skill Path Home, Drill Arena, SRS Vocab Trainer & Profile/Sync

**Files:**
- Create: `src/features/path/PathView.tsx`
- Create: `src/features/drills/DrillArenaView.tsx`
- Create: `src/features/srs/SrsView.tsx`
- Create: `src/features/profile/ProfileView.tsx`

- [ ] **Step 1: Implement `PathView.tsx`**

- Top **Home Daily Hub** (max 3 conditional rows: Continue Unit, Due SRS Reviews, `🎯 Fix weak spots`).
- Streak pill (with freeze shield count), XP badge, and **Guided / Free-Browse** toggle.
- 4 collapsible CEFR stage sections (A1–B2) showing all 51 units, 0–3 Mastery Tier badges, 45-day amber `Refresh` dot, and preview cards for Wave 2–4 units.

- [ ] **Step 2: Implement `DrillArenaView.tsx`**

- Category cards (`en`/`ett` Gender, Noun Plurals, Definite Forms, Verb Present/Past/Supine, Adjective Agreement, V2/SIV Word Order, Weak Spots) + session length picker (10 / 20) launching `ExerciseSession` powered by `generateMorphologyDrills` + curated unit drills.

- [ ] **Step 3: Implement `SrsView.tsx`**

- Queue summary (`Due today`, `New remaining`, `Mastered`, `Svår Leeches`).
- Active flashcard session: Recognition mode (`interval < 4d`) flips to reveal English, gender, example sentence, and audio; Production mode (`interval >= 4d`) uses `SwedishInput` with inline character diff and automatic first-letter hint for `Svår` leeches (`lapses >= 4`); 3-button `Again / Good / Easy` grading bar (`52px` tall) with next-interval labels.

- [ ] **Step 4: Implement `ProfileView.tsx`**

- Learning stats (XP, streak, freezes, mastered words, weak skills).
- Settings (Daily XP goal, SRS daily caps, Auto-Advance toggle, Dark Mode).
- **Portable Sync Code (`SV1:...`)**: 1-tap `Copy Sync Code` & `Share to Chat` + `Paste & Smart-Merge` textarea showing `SyncDiff` preview before applying.
- **JSON File Backup**: 1-tap `Export JSON` & `Import & Merge JSON`.

- [ ] **Step 5: Verify typecheck and build**

Run: `npm run typecheck; npm run build`
Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add src/features/path src/features/drills src/features/srs src/features/profile; git commit -m "feat(views): add Path Home, Drill Arena, SRS Vocab Trainer, and Profile with Portable Sync Codes"
```

---

### Task 11: End-to-End Verification & Production PWA Check

**Files:**
- Verify entire codebase (no new feature code; fix any issues found).

- [ ] **Step 1: Run full automated test suite & typecheck**

Run: `npm run typecheck; npx vitest run`
Expected: All unit tests and Content Integrity Gate pass with 0 errors.

- [ ] **Step 2: Run production PWA build and inspect bundle size**

Run: `npm run build`
Expected: Clean `dist/` with `sw.js`, `manifest.webmanifest`, lazy-loaded unit chunks (`u01`–`u13`), and main shell `<120 KB` gzipped.

- [ ] **Step 3: Smoke-test production preview**

Verify `index.html` serves cleanly via `npm run preview` and responds 200 OK.
