# Tasks: Advanced Match Statistics

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~750-800 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (Tasks 1-3: backend) → PR 2 (Tasks 4-6: frontend + testing) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Data model + parser + API route | PR 1 | Base: main. Schema, types, parser, endpoint. ~400 lines. |
| 2 | Test fixture + viewer component + page integration | PR 2 | Base: PR 1 branch. Fixture, UI, wiring. ~350 lines. |

## Phase 1: Data Model & Types

- [ ] 1.1 Add `advancedStatsJson Json? @map("advanced_stats_json")` to `Partido` model in `prisma/schema.prisma`
- [ ] 1.2 Run `npx prisma migrate dev --name add-advanced-stats-json` to generate migration
- [ ] 1.3 Add `AdvancedStatsV1`, `PlayerStatsV1`, `GoalkeeperStatsV1`, `TeamStatsV1`, `QuarterData`, `ShotBreakdown` interfaces to `lib/data.ts` (copy from design.md lines 44-129)
- [ ] 1.4 Extend `Partido` interface in `lib/data.ts` with `advancedStatsJson?: AdvancedStatsV1 | null`

**Files**: `prisma/schema.prisma`, `lib/data.ts`
**Complexity**: Simple
**Dependencies**: None

## Phase 2: PDF Parser

- [ ] 2.1 Create `lib/parsers/worldAquaticsMatchPdf.ts` with exported `parseWorldAquaticsMatchPdf(text: string): AdvancedStatsV1`
- [ ] 2.2 Implement match header extraction: tournament name, date, score line (`ARG 5 - 24 CRO`), quarter scores
- [ ] 2.3 Implement field player row parser: cap number (with `*` for starters), name, timePlayed, goals/shots, shot breakdown by type (A/C/D/X/6m/PS), fouls, steals, blocks, sprints
- [ ] 2.4 Implement goalkeeper section parser: detect "Goalkeepers:" header, extract saves/shots by type, totals row
- [ ] 2.5 Implement team totals row parser: `Team` line with aggregate goals/shots/fouls/steals/blocks
- [ ] 2.6 Implement quarter/period possession parser: lines matching `Q1 ARG ...`, `Q1 CRO ...` pattern — extract possessions count, time, possession%, goals, shots per quarter per team
- [ ] 2.7 Implement EPS efficiency extraction from quarter data (extra-player shot conversion)
- [ ] 2.8 Add error handling: throw `ParseError` with `{ reason: string }` for empty input, missing sections, unparseable lines
- [ ] 2.9 Build legend map from column header abbreviations (TO, ST, RB, BL, SP, CP, FP, DS, M6, CS, DE, P, EX)

**Files**: `lib/parsers/worldAquaticsMatchPdf.ts`
**Complexity**: Complex
**Dependencies**: Phase 1 (types)

## Phase 3: API Route

- [ ] 3.1 Create `app/api/partidos/[id]/advanced-stats/route.ts` with `POST` handler
- [ ] 3.2 Validate request body: require `{ pdfText: string }`, return 400 if missing
- [ ] 3.3 Load partido by ID via Prisma, return 404 if not found
- [ ] 3.4 Call `parseWorldAquaticsMatchPdf(pdfText)`, catch `ParseError` → return 422 with reason
- [ ] 3.5 Persist via `prisma.partido.update({ data: { advancedStatsJson: parsed } })`
- [ ] 3.6 Return updated partido with full relations (same include pattern as `GET /api/partidos`)

**Files**: `app/api/partidos/[id]/advanced-stats/route.ts`
**Complexity**: Medium
**Dependencies**: Phase 1 (schema), Phase 2 (parser)

## Phase 4: Test Fixture & Validation

- [ ] 4.1 Create `lib/parsers/fixtures/arg-cro-2023.txt` with the full ARG 5-24 CRO raw PDF text
- [ ] 4.2 Create `scripts/test-parser.ts` — reads fixture, calls parser, prints structured output and validates key assertions (5 ARG goals, 24 CRO goals, 13 ARG players, 2 ARG goalkeepers, 4 quarters)
- [ ] 4.3 Add `"test-parser": "npx tsx scripts/test-parser.ts"` to `package.json` scripts
- [ ] 4.4 Verify parser handles edge cases: empty string → ParseError, truncated text → partial result or ParseError

**Files**: `lib/parsers/fixtures/arg-cro-2023.txt`, `scripts/test-parser.ts`, `package.json`
**Complexity**: Simple
**Dependencies**: Phase 2 (parser)

## Phase 5: AdvancedStatsViewer Component

- [ ] 5.1 Create `components/AdvancedStatsViewer.tsx` — props: `stats: AdvancedStatsV1` (non-null, conditionally rendered by parent)
- [ ] 5.2 Shot Type Summary section: per-player table with columns Action / Center / Extra Player / Penalty / 5m — each showing `made/attempted (pct%)`, color-coded by efficiency (green >50%, yellow 25-50%, red <25%)
- [ ] 5.3 Goalkeeper Comparison section: table or side-by-side cards showing saves by type, total save%, highlight best performer
- [ ] 5.4 Quarter-by-Quarter section: table with Q1-Q4 rows — team score, opponent score, shots, possession%, possession time
- [ ] 5.5 Team Totals section: summary cards for steals, blocks, fouls, sprints, EPS efficiency — reuse `TeamStatsSummary` card grid pattern
- [ ] 5.6 Apply `framer-motion` stagger animations matching existing components (`motion.div` with `initial/animate` opacity+y), `overflow-x-auto` on all tables, dark theme Tailwind classes consistent with `StatsTable`

**Files**: `components/AdvancedStatsViewer.tsx`
**Complexity**: Complex
**Dependencies**: Phase 1 (types)

## Phase 6: Match Detail Page Integration

- [ ] 6.1 Add `{ id: "avanzadas", label: "Avanzadas", icon: BarChart3 }` to `tabs` array in `app/partidos/[id]/page.tsx` — only include when `partido.advancedStatsJson` is not null
- [ ] 6.2 Add `activeTab === "avanzadas"` render block with `<AdvancedStatsViewer stats={partido.advancedStatsJson} />`
- [ ] 6.3 Add "Parse PDF" button next to existing "Planilla" button — visible when `!partido.advancedStatsJson`, triggers POST to `/api/partidos/[id]/advanced-stats` with pdfText from a textarea or file input
- [ ] 6.4 Add loading state (`isParsing` state variable) with spinner during API call, error toast on failure
- [ ] 6.5 On successful parse, update `partido` state with response data so "Avanzadas" tab appears immediately

**Files**: `app/partidos/[id]/page.tsx`
**Complexity**: Medium
**Dependencies**: Phase 3 (API), Phase 5 (viewer)
