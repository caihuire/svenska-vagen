# Svenska Vägen — Mobile-First Gamified Swedish Learning PWA (A0 → B2)

**Date:** 2026-11-24
**Status:** Draft for User Review
**Target Hosting:** GitHub Pages (static PWA, no backend required)
**Content Policy:** 100% original, freshly authored grammar cards, exercises, examples, and cultural readings aligned to the pedagogical progression of *Basic Swedish* (25 units) and *Intermediate Swedish* (26 units). No text or exercises lifted from copyrighted textbooks.

---

## 1. Product Goals & Constraints

- **Goal:** Take a learner from zero Swedish (A0) to ~B2 proficiency through structured grammar progression, high-volume word-form drilling, spaced-repetition vocabulary retention, Swedish audio listening, and graded cultural reading.
- **Phone-First, Zero-Install:** Runs directly in mobile Safari/Chrome (375px–430px viewports) with optional "Add to Home Screen" PWA offline caching.
- **Zero-Backend Persistence:** All progress, SRS cards, streaks, and settings stored locally on-device with 1-tap JSON export/import backup.
- **Rollout Strategy (Wave Rollout — Option A):**
  - **Wave 1 (Initial Release):** Complete application (all screens, engines, SRS, Drill Arena, Cultural Reader, TTS audio, streaks, GitHub Pages CI/CD) + **deeply authored Stage A1 (Units 1–13)** (~325 tagged lexicon words, ~140 curated exercises, 13 original cultural readings) + full 51-unit curriculum manifest (Units 14–51 visible on the Skill Path as previewable outlines for Waves 2–4).
  - **Waves 2–4:** Deep content expansion for Stage A2 (Units 14–25), Stage B1 (Units 26–38), and Stage B2 (Units 39–51).

---

## 2. Curriculum & Pedagogy (A0 → B2)

### 2.1 Four CEFR Stages (51 Units)

| Stage | Units | Core Grammar Scope | Wave |
| :--- | :--- | :--- | :--- |
| **Stage A1 — Foundations** | U01–U13 | Cognates & alphabet (`å, ä, ö`), vowel length & soft `g/k/sk`, `en`/`ett` gender, present tense & pronouns, **V2 word order** (statements, questions, fronting), `s`-genitives & 7 noun declensions, numerals/dates/clock (`halv fyra`), clausal adverbials (`inte`, `alltid`), possessives & indefinites (`någon`/`ingen`/`man`), demonstratives (`den här` vs `denna`), modals/future (`ska` vs `kommer att`)/imperatives, short answers (`Ja, det gör jag`) & formal `det`, indefinite & indeclinable adjectives. | Wave 1 |
| **Stage A2 — Core Grammar** | U14–U25 | Definite nouns & article rules, place prepositions (`på/i/vid/hos`), definite adjectives (Types 1–2), adjective comparison, **subordinate clauses & SIV word order**, weak verbs (I, IIa, IIb, III) past/perfect, strong verbs (IV gradation series), adverbs (manner & comparison), location vs. direction (`var/vart/varifrån`), relative clauses (`som`/`där`), `-s` passives & deponents, word formation & compounding. | Wave 2 |
| **Stage B1 — Intermediate Nuance** | U26–U38 | Prosody (sentence/word stress, Accent 1 vs 2), assimilation & `-m/-n` spelling, article contrasts, irregular plurals & count/non-count (`mycket`/`många`, `mer`/`fler`), definite adjectives (Types 3–4), adjectival nouns & nationalities, **reflexive possessives (`hans`/`sin`)**, irregular weak & minor strong verbs, tense nuances & continuous equivalents (`sitter och läser`), object+infinitive & reflexive infinitives, transitive/intransitive pairs (`lägga`/`ligga`) & reflexives, **past participles & all 3 passives (`-s`, `bli`, `vara`)**. | Wave 3 |
| **Stage B2 — Mastery & Fluency** | U39–U51 | Time prepositions & frequency (`i våras`/`på våren`), interrogative/relative/determinative pronouns (`vars`, `vilket`), translating *that* & cleft sentences, tricky English verbs (`vara/bli/finnas/ligga/sitta/stå`, `tycka/tänka/tro`, `veta/känna/kunna`), modal attitude adverbs (`ju/nog/väl/nämligen`) & amplifiers, prepositions & translating *of*, `ingen` vs `inte...någon` in sub-clauses, **present participles & `-ing`**, **particle verbs** (separable vs integrated), advanced word order (inverted conditionals, unstressed object pronouns, duplication, emphasis, ellipsis, non-finite clauses), advanced word formation, **Diderichsen's 7-Position Sentence Model**. | Wave 4 |

### 2.2 Unit Anatomy (4 Tabs)
Every populated unit contains four mobile-sized tabs:
1. **Learn:** 3–4 swipeable, single-focus micro-cards (`Rule` → `Pattern Table` → `Audio Examples` → `English Trap`) sized so cards never require internal scrolling on 375px screens.
2. **Practice:** 10–12 progressive exercises mixing recognition, inflection, word-order building, and comprehension. Scoring ≥80% unlocks the next unit in Guided Mode.
3. **Read (Cultural Reader):** Original short Swedish passage on a Swedish cultural/historical theme (e.g., *Fika*, *Öresundsbron*, *Allemansrätten*, *Midsommar*, *Lucia*, *Vasaskeppet*, *Nobelpriset*) with tap-any-word instant translation & grammar tag, sentence-by-sentence TTS playback, and 2–3 comprehension checks.
4. **Words:** Unit vocabulary list (~25 words/unit) with audio playback, gender/conjugation tags, and 1-tap `Queue for SRS`.

---

## 3. Exercise Taxonomy, Drill Engine, SRS & Gamification

### 3.1 Unified 6-Type Exercise Taxonomy
1. **`classifier`** — Rapid-fire categorical taps (`en` vs `ett`, Accent 1 vs 2, count vs non-count, verb conjugation group).
2. **`morph-fill`** — Typed word-form inflection (plurals, definite singular/plural, verb tenses, supine, participles, adjective agreement). Includes **2-tier diacritic forgiveness**: omitting or swapping `å/ä/ö` triggers an inline *"Almost! Check å/ä/ö"* retry prompt rather than an immediate fail.
3. **`word-order`** — Constituent-chunked **5–7 syntactic phrase tiles** (e.g., `[Igår] [köpte] [jag] [den röda boken] [i stan]`) with optional `triggerCue` for fronting/inversion drills. Optional slot hints (`V2`, `SIV`) display in A1–A2 and fade in B1–B2.
4. **`cloze`** — Contextual fill-in-the-blank (multiple-choice or typed) for prepositions, `hans`/`sin`, modal adverbs, and particle verbs.
5. **`error-spotting`** — Zero-typing syntax/agreement drill: tap the incorrect word/chunk in a Swedish sentence and pick the correction from a 2–4 option bottom sheet.
6. **`listening`** — Swedish TTS audio comprehension with a **session-level "Can't listen now" toggle** that cleanly switches to text + IPA for silent environments.

### 3.2 Hybrid Procedural + Curated Drill Engine
- **Procedural Swedish Morphology Engine (`src/engine/morphology/`):** Pure TypeScript engine generating unlimited `classifier` (`en`/`ett`) and `morph-fill` drills directly from `LexiconEntry` metadata for regular noun declensions (1–7), weak verbs (I, IIa, IIb, III), and regular adjectives. Irregulars, vowel mutations, and strong Group 4 verbs require explicit `forms` overrides on `LexiconEntry`, enforced by automated Vitest checks.
- **Curated Exercises:** Hand-authored original items in each unit file cover syntax (`word-order`), pragmatics (`cloze`, `error-spotting`), and cultural comprehension.
- **Drill Arena:** Dedicated rapid-fire practice tab filterable by category (`en/ett`, Plurals, Definite Forms, Verb Tenses, Adjectives, V2/SIV Word Order, Weak Spots) and CEFR stage. Auto-advance is **OFF by default** so learners can read grammar explanations before tapping `Next`.

### 3.3 SRS Vocabulary Trainer (SM-2-Lite)
- **3-Button Grading Bar:** `Again (<10m)` · `Good` · `Easy` (wide thumb targets).
- **Daily Soft Caps:** Default `15 new / 60 reviews` per day (adjustable in Settings).
- **Recognition → Production Upgrade:** New cards start as Recognition (Swedish + audio → recall English/gender). Once a card reaches `interval >= 4 days`, it upgrades to **Single-Word Typed Production** (English + gender badge → type Swedish word with inline character diff + audio).
- **Leech Handling:** Cards with `lapses >= 4` display a `Svår` badge and show an automatic first-letter hint during Production mode.

### 3.4 Gamification & Progression
- **Guided Path + Free-Browse Toggle:** Guided Mode unlocks units sequentially (≥80% Practice score). Free-Browse Mode (toggleable on Path) opens all available units and drills to match textbook study.
- **Unit Mastery Tiers (0–3):**
  - Tier 1 (Bronze): Practice passed (≥80%).
  - Tier 2 (Silver): Cultural Reader comprehension passed.
  - Tier 3 (Gold): ≥80% of enrolled unit words at SRS `interval >= 4 days` (in Free-Browse, prompts 1-tap enrollment if no words are queued yet).
  - **Soft Decay:** Gold units unreviewed for >45 days display a subtle amber `Refresh` dot without losing their Gold badge.
- **Streaks & Freeze:** Daily XP goal (default 50 XP) maintains streak; 1 Streak Freeze auto-earned every 7 consecutive days (max 2 banked).
- **Weak-Spot Radar:** Tracks a rolling 20-attempt ring buffer per `grammarTag`. Any tag with ≥5 attempts and <75% accuracy surfaces in the Home Daily Hub as a 1-tap `🎯 Fix weak spots` drill.

---

## 4. Mobile-First UI/UX & Visual Design System

### 4.1 Information Architecture & Navigation
- **4-Tab Bottom Navigation:** `Path` · `Vocab` · `Drills` · `Profile` (Settings, Backup/Restore, Stats).
- **Distraction-Free Sessions:** Entering Practice, Drill Arena, or SRS expands to full-screen (`100dvh`) with a slim top progress bar and exit confirmation. All interactive targets are `≥48px`.
- **Home Daily Hub:** Compact top card on `Path` showing up to 3 conditional single-tap actions:
  1. `Continue · Unit X` `[Practice →]`
  2. `N SRS cards due` `[Review]` *(hidden if 0)*
  3. `🎯 Weak spots: ...` `[Fix]` *(hidden if none <75%)*

### 4.2 Zero-Hack Swedish Diacritic Input
To avoid mobile Safari `visualViewport` bugs, typed exercises place a **static inline strip directly below the `16px` `<input>`** inside the upper-half container:
```text
┌─────────────────────────────────────┐
│ Prompt (compacts on input focus)    │
│ [ de röda husen_                  ] │ <- 16px, autocorrect/spellcheck off, lang="sv"
│ [ å ] [ ä ] [ ö ] [ ⇧ ] [ Check ↵ ] │ <- 44px inline strip (e.preventDefault on pointerDown)
└─────────────────────────────────────┘
```
Tapping `å / ä / ö / ⇧` inserts the character at the caret without blurring the input or dismissing the virtual keyboard.

### 4.3 Cultural Reader & Diderichsen Rail
- **Reader Tokens:** Rendered as `<button className="select-none touch-manipulation">` so iOS Safari's text-selection loupe never hijacks word taps. Multi-word expressions and split particle verbs (*tycker ... om*) share a `spanGroup` ID so tapping either highlights both and opens a bottom-docked glossary sheet (`lemma · en · 🔊 · [+ SRS]`).
- **Diderichsen 7-Position Rail (B2):** Renders as a compact 2-row grid (`[F][v][n][a]` / `[V][N][A]`) for 375px screens.

### 4.4 Nordic Visual Design System
- **Palette (WCAG AA, Light + Dark Mode):**
  - Primary: Nordic Fjord Blue (`#1B4D7E` light / `#6BA4DC` dark)
  - Accent / Mastery Gold: Amber Birch (`#D98A1A` light / `#F2B449` dark)
  - Success: Pine Green (`#1E7A56` light / `#4DC492` dark)
  - Error / Leech: Lingonberry Coral (`#C73E3A` light / `#F0716D` dark)
  - Surface: Warm Snow (`#F8F9FA`) / Deep Midnight (`#0F1722`)
- **Colorblind-Safe Gender Badges:** `en` (blue pill + `●` dot) and `ett` (amber pill + `◆` diamond) always display text + shape + color.
- **Motion:** Subtle spring transitions for tile placement and card flips, honoring `prefers-reduced-motion`.

---

## 5. Frontend Systems Architecture & Technical Plan

### 5.1 Tech Stack & Directory Layout
- **Stack:** Vite + React 19 + TypeScript + Tailwind CSS + `react-router-dom` (`HashRouter`) + `vite-plugin-pwa` (Workbox) + Vitest.
- **Strict Layering:** `features/ -> store/ -> engine/ (pure TS) -> services/ -> data/ & storage/`

```text
src/
├── data/
│   ├── curriculum/
│   │   ├── manifest.ts           # Eager lightweight index of all 51 units (~8KB gz)
│   │   └── units/u01.ts..u13.ts  # Lazy-loaded Wave 1 units (u14..u51 in Waves 2-4)
│   └── lexicon/
│       ├── index.ts              # Stage-chunked dynamic loader
│       └── stage-a1.ts           # ~325 Wave 1 LexiconEntry items (a2/b1/b2 in Waves 2-4)
├── engine/
│   ├── morphology/               # Swedish inflector + 2-tier answer normalizer
│   ├── drills/                   # Procedural drill generator + session mixer
│   ├── srs/                      # Pure SM-2-Lite scheduler & leech logic
│   ├── reader/                   # Inline cultural text markup parser
│   └── mastery/                  # XP, streaks, freeze, mastery tiers, weak-spot ring buffer
├── services/
│   └── tts/                      # Web Speech API (sv-SE) wrapper + iOS workarounds
├── storage/
│   ├── adapter.ts                # StorageAdapter interface + localStorage implementation
│   ├── migrations.ts             # Schema version upgrades (v1 -> vN)
│   └── backup.ts                 # JSON export (Web Share / download) & validated import
├── store/                        # React Context + reducer app state
├── features/                     # path/, unit/, drills/, srs/, reader/, profile/
└── components/                   # BottomNav, SwedishInput, AudioBtn, GenderBadge, FeedbackBar
```

### 5.2 Core TypeScript Interfaces
- `UnitSummary` (eager) & `UnitContent` (lazy): `id`, `number`, `stage`, `title`, `grammarFocus`, `available: boolean`, `grammarCards`, `lexiconIds`, `exercises`, `culturalText`.
- `LexiconEntry`: `id`, `lemma`, `en`, `pos`, `unitId`, `stage`, `ipa?`, `example?: { sv: string; en: string }`, `tags?`, `morph?` (discriminated union for `noun` gender/declension/overrides, `verb` group/particle/deponent/reflexive/overrides, `adj` indeclinable/overrides).
- `Exercise`: 6-member discriminated union (`classifier`, `morph-fill`, `word-order`, `cloze`, `error-spotting`, `listening`) sharing `id`, `unitId`, `grammarTag`, `explanation`, `ttsText?`.
- `CulturalText`: Compact inline markup (e.g. `Hon [tycker|g1:verb:tycka_om] mycket [om|g1] [kaffe|noun:kaffe].`) parsed into `TextToken[]` with `spanGroup` support, plus 2–3 comprehension `Exercise` items.
- `UserProgress` (`schemaVersion: 1`): `xp`, `streak`, `freezes`, `freeBrowse`, `autoAdvance`, `unitProgress`, `srsCards`, `weakSkills` (rolling 20-attempt ring buffer per tag), `settings`.

### 5.3 PWA, Storage, Audio & Testing
- **GitHub Pages Deployment:** `vite.config.ts` uses `base: './'`, `HashRouter` for client routes, and `.github/workflows/deploy.yml` to build, run tests, and deploy `dist/` to GitHub Pages automatically.
- **Storage Resilience:** Synchronous `localStorage` (`<250 KB` JSON) behind `StorageAdapter`. After completing Unit 1 on iOS Safari, show a dismissible "Add to Home Screen" tip to prevent Safari's 7-day script-storage eviction. Profile tab includes 1-tap JSON Export (`navigator.share` with download fallback) and validated Import with diff preview.
- **Swedish TTS (`sv-SE`):** Plays at `1.0x` or `0.75x`, invokes `speechSynthesis.speak()` synchronously inside click handlers for iOS Safari, exposes `isSpeaking` and `stop()` (called automatically on card flip/navigation), and chains sentences sequentially for Cultural Reader `▶ Play all`. Synthetic TTS is never used to grade subtle pitch-accent (Accent 1 vs 2) drills.
- **Automated Verification (Vitest):**
  - Unit tests for `morphology/` inflector & 2-tier diacritic normalizer, `srs/` scheduler & leech transitions, `mastery/` streak/freeze/weak-spot math, `reader/` markup parser, and `storage/` migrations & backup validation.
  - **Content Integrity Gate:** Automated test verifying every unit's `lexiconIds` resolve, every inline reader token links to a valid `LexiconEntry` or inline gloss, and every irregular word has explicit `forms` overrides.
