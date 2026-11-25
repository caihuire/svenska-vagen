# Svenska Vägen — Waves 2–4 Roadmap & To-Do Checklist

This roadmap tracks all work after **Wave 1** (`docs/superpowers/plans/2026-11-24-swedish-a0-b2-wave1.md`) is complete and deployed to GitHub Pages.

> **Reference Files for Every Wave:**
> - Design Spec: `docs/superpowers/specs/2026-11-24-swedish-a0-b2-pwa-design.md`
> - 51-Unit Syllabus: `docs/superpowers/specs/2026-11-24-curriculum-syllabus-51-units.md`
> - ~1,500-Word Vocabulary Seed List: `docs/superpowers/specs/2026-11-24-vocabulary-seed-list.md`
> - Rule: **100% original freshly written** grammar cards, example sentences, curated exercises, and cultural readings.

---

## Wave 2 — Stage A2: Core Grammar (Units 14–25)

**Goal:** Unlock all 12 Stage A2 units (~360 new lexicon entries, ~130 original curated exercises, 12 original cultural readings) with zero core UI rewrites.

- [x] **2.1 Author `src/data/lexicon/stage-a2.ts`**
  - Add ~360 `LexiconEntry` items from Units 14–25 of the Vocabulary Seed List, each with full `morph` metadata, explicit irregular `forms` overrides, and original Swedish/English example sentences.
  - Register `stage-a2.ts` in `src/data/lexicon/index.ts`.
- [x] **2.2 Author Original Units `src/data/curriculum/units/u14.ts` – `u25.ts`**
  - `u14` Definite Nouns & Article Usage (Currency reading)
  - `u15` Prepositions of Place (Sámi People & Languages reading)
  - `u16` Definite Adjectives: Types 1 & 2 (Bernadotte Dynasty reading)
  - `u17` Comparison of Adjectives (The Moose reading)
  - `u18` Main vs. Subordinate Clauses & Conjunctions (Swedish Food reading)
  - `u19` Weak Verbs I–III: Past & Perfect (Vasa Era reading)
  - `u20` Strong Verbs IV: Gradation Series (Age of Great Power reading)
  - `u21` Adverbs: Form & Comparison (English in Swedish reading)
  - `u22` Adverbs of Location & Direction (Viking Town of Birka reading)
  - `u23` Subordinate Clause Word Order (SIV) & Relatives (Swedish Troubadours reading)
  - `u24` `-s` Verbs: Deponents & `-s` Passives (Swedish Inventions reading)
  - `u25` Word Formation Basics (Gotland reading)
- [x] **2.3 Register Units & Enable on Skill Path**
  - Add `u14`–`u25` dynamic imports to `src/data/curriculum/loader.ts`.
  - Flip `available: true` for `u14`–`u25` in `src/data/curriculum/manifest.ts`.
- [x] **2.4 Extend Procedural Drill Arena for A2**
  - Enable `A2` stage filter in `DrillArenaView.tsx` for past/supine verb drills, adjective comparison, definite plural nouns, and `-s` passive forms.
- [x] **2.5a Verify Wave 2** (typecheck clean, vitest 14 files / 80 tests, build OK; Wave 1 SV1 codes verified)
  - Run `npm run typecheck; npx vitest run; npm run build` (Content Integrity Gate must validate all 25 available units & ~750 words).
  - Verify existing Wave 1 `SV1:...` Sync Codes still decode and smart-merge cleanly with Wave 2.
- [ ] **2.5b Deploy Wave 2** (pending user approval)

---

## Wave 3 — Stage B1: Intermediate Nuance (Units 26–38)

**Goal:** Unlock all 13 Stage B1 units (~390 new lexicon entries, ~145 original curated exercises, 13 original cultural readings) + past-participle morphology support and prosody visual drills.

- [ ] **3.1 Extend Morphology Engine for B1**
  - Add full `pastPart` inflection (`common`, `neuter`, `plDef`) to `src/engine/morphology/inflector.ts` across Conjugations I (`-ad/-at/-ade`), IIa (`-d/-t/-da`), IIb (`-t/-t/-ta`), III (`-dd/-tt/-dda`), and IV (`-en/-et/-na`) + Vitest unit tests.
  - Add `Past Participles & Passives` and `Transitive vs. Intransitive` categories to `src/engine/drills/generator.ts` and `DrillArenaView.tsx`.
- [ ] **3.2 Author `src/data/lexicon/stage-b1.ts`**
  - Add ~390 `LexiconEntry` items from Units 26–38 of the Vocabulary Seed List (including irregular plurals, irregular weak verbs, minor strong verbs, transitive/intransitive pairs, and reflexive verbs) with original example sentences.
  - Register in `src/data/lexicon/index.ts`.
- [ ] **3.3 Author Original Units `src/data/curriculum/units/u26.ts` – `u38.ts`**
  - `u26` Prosody, Stress & Accent 1 vs. 2 *(visual/rule drills only — never TTS-graded)* (Geography of Sweden reading)
  - `u27` Assimilation, French `g/j`, `-m/-n` Spelling (French Loanwords reading)
  - `u28` Nuanced Article Use (Gustav III reading)
  - `u29` Irregular Plurals & Count/Non-Count (Smörgåsbord reading)
  - `u30` Definite Adjectives: Types 3 & 4 (Swedish Academy reading)
  - `u31` Adjectival Nouns & Nationality Words (Emigration & Immigration reading)
  - `u32` Reflexive Possessives: `hans` vs. `sin` (Carl Michael Bellman reading)
  - `u33` Irregular Weak Verbs & `r`-Stems (Nordic Noir / Deckare reading)
  - `u34` Minor Strong Verbs (The Letter Q reading)
  - `u35` Nuanced Tenses & Continuous Forms (Astrid Lindgren reading)
  - `u36` The Infinitive in Swedish & English (Raoul Wallenberg reading)
  - `u37` Transitive, Intransitive & Reflexive Verbs (Warship Vasa reading)
  - `u38` Past Participles & All 3 Passives (Runes & Runestones reading)
- [ ] **3.4 Register, Verify & Deploy Wave 3**
  - Wire `u26`–`u38` in `loader.ts`, flip `available: true` in `manifest.ts`.
  - Run `npm run typecheck; npx vitest run; npm run build`.

---

## Wave 4 — Stage B2: Mastery & Fluency (Units 39–51)

**Goal:** Complete the entire 51-unit A0 → B2 curriculum (~390 new lexicon entries, ~150 original curated exercises, 13 original cultural readings) + Diderichsen 7-Position Sentence Model interactive rail and particle-verb mastery drills.

- [ ] **4.1 Build Diderichsen 7-Position Sentence Rail Component**
  - Create `src/components/DiderichsenRail.tsx`: responsive 2-row grid (`[F][v][n][a]` / `[V][N][A]`) for 375px screens, used in Unit 51 Learn cards and B2 word-order feedback explanations.
- [ ] **4.2 Extend Morphology Engine for B2**
  - Add present participle (`-nde`/`-ende`) inflection helper to `src/engine/morphology/inflector.ts` + Vitest tests.
  - Add `Particle Verbs` and `Advanced Word Order (B2)` drill sets in `DrillArenaView.tsx`.
- [ ] **4.3 Author `src/data/lexicon/stage-b2.ts`**
  - Add ~390 `LexiconEntry` items from Units 39–51 of the Vocabulary Seed List (including particle verbs, modal adverbs `ju/nog/väl/nämligen`, time prepositions, and formal/academic B2 vocabulary) with original example sentences.
  - Register in `src/data/lexicon/index.ts`.
- [ ] **4.4 Author Original Units `src/data/curriculum/units/u39.ts` – `u51.ts`**
  - `u39` Time Expressions & Prepositions (Karl XII reading)
  - `u40` Interrogative, Relative & Determinative Pronouns (Famous Swedes reading)
  - `u41` Translating *That* & Cleft Sentences (*Du*-Reform reading)
  - `u42` Translating *To Be* & Common Verbs (Swedish Nicknames reading)
  - `u43` Amplifiers & Attitude Adverbs `ju, nog, väl, nämligen` (Surnames & Personnummer reading)
  - `u44` Prepositions & Translating *Of* (Valborg reading)
  - `u45` `ingen` vs. `inte...någon` in Main & Sub Clauses (Carl von Linné reading)
  - `u46` Present Participles & English `-ing` (Vilhelm Moberg reading)
  - `u47` Particle Verbs — with linked `spanGroup` reader highlights (Nobel Prize reading)
  - `u48` Advanced Clause Order (Finland Swedish reading)
  - `u49` Unstressed Object Pronouns (Sweden's National Day reading)
  - `u50` Duplication, Emphasis, Ellipsis & Non-Finite Clauses (Systembolaget reading)
  - `u51` Advanced Word Formation & Diderichsen's Sentence Model (Gender-Neutral Language reading)
- [ ] **4.5 Final B2 Verification & Release**
  - Flip `available: true` for `u39`–`u51` in `manifest.ts` (all 51/51 units live!).
  - Run full `npm run typecheck; npx vitest run; npm run build`.
  - Verify `SV1:...` Sync Code size stays `<3 KB` even with 1,000+ active SRS cards and all 51 units mastered.

---

## Optional Future Polish (Post-Wave 4 Backlog)

- [ ] **Custom Deck / Bookmark List:** Let users star favorite words or cultural idioms for quick pre-travel review.
- [ ] **B2 Comprehensive Mock Checkpoints:** End-of-stage mastery boss quizzes for A1, A2, B1, and B2.
- [ ] **Optional Private GitHub Gist Auto-Sync:** Add 1-click background sync alongside `SV1:...` Sync Codes if desired later.
