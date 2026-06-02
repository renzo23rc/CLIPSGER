# Proposal: Advanced Match Statistics

## Intent
Parse advanced water polo statistics from World Aquatics official match PDFs and expose them in the existing match detail view, enriching basic stats with per-player shot types, time played, goalkeeper splits, and team-level possession and quarter data.

## Scope

### In Scope
- Store parsed advanced stats as JSONB on `Partido`
- Build `pdftotext`-based parser with versioned output schema
- API route to parse and attach stats to a match
- `AdvancedStatsViewer` component and new tab on `/partidos/[id]`

### Out of Scope
- Automatic PDF ingestion pipeline (manual upload/trigger)
- Backfilling historical matches
- Public-facing admin UI for parser management

## Capabilities

### New Capabilities
- `advanced-match-stats`: Parse and display advanced water polo statistics from official PDFs

### Modified Capabilities
- None

## Approach
Avoid adding 30+ typed columns for shot types, fouls, and goalkeeper metrics. Instead, add `advancedStatsJson` (JSONB, nullable) to `Partido` (Prisma: `advancedStatsJson Json? @map("advanced_stats_json")`), with optional `advancedStatsSourceUrl` / `advancedStatsSourceKind` for traceability. This keeps the Prisma schema stable, avoids migration churn, and lets the PDF schema evolve without repeated DB changes.

Implement a server-side parser that takes `pdftotext` output, normalizes it into a versioned JSON schema (`schemaVersion: "v1"`), and returns structured per-player and team data (players, goalkeepers, team, legend). Expose a Next.js API route that receives a `partidoId` and a PDF source (typically `planillaUrl`), runs the parser, and persists the JSON into `advancedStatsJson`.

On the frontend, add an "Avanzadas" tab to the existing tab bar in `/partidos/[id]`. Render `AdvancedStatsViewer` with tables for shot-type breakdowns, goalkeeper splits, team quarter scoring, possession summaries, and EPS efficiency — mirroring the style of `StatsTable` and `TeamStatsSummary`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `prisma/schema.prisma` | Modified | Add `advancedStatsJson` (+ optional source fields) to `Partido` |
| `lib/data.ts` | Modified | Extend `Partido` interface; add `AdvancedStatsV1` types |
| `app/api/partidos/[id]/advanced-stats/route.ts` | New | POST to parse PDF and store `advancedStatsJson` |
| `lib/parsers/worldAquaticsMatchPdf.ts` | New | `pdftotext` → versioned JSON schema |
| `components/AdvancedStatsViewer.tsx` | New | Tables/charts for advanced metrics |
| `app/partidos/[id]/page.tsx` | Modified | Add "Avanzadas" tab; conditionally render viewer |
| `app/estadisticas/page.tsx` | Modified | Optionally aggregate `statsJson` into Recharts views |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| PDF format changes break parser | Med | Versioned schema + fallback to empty state |
| `pdftotext` not available in hosting runtime | Med | Run parsing in a controlled server/job; allow POSTing pre-parsed JSON |
| Large JSONB impacts query perf | Low | Fetch per match only; avoid selecting JSON in list views if needed |
| UI becomes crowded | Low | New tab isolates advanced data; basic stats unchanged |

## Rollback Plan
1. Stop writing `advancedStatsJson` (disable API route) and hide the "Avanzadas" tab.
2. Remove parser + UI components.
3. Optionally keep DB columns (no downtime). If hard removal is needed, export JSON first, then revert migration.

## Dependencies
- `pdftotext` (Poppler) available in runtime/server environment

## Success Criteria
- [ ] Parser produces valid versioned JSON from a sample World Aquatics PDF
- [ ] `POST /api/partidos/[id]/advanced-stats` stores JSON and returns the match
- [ ] `/partidos/[id]` shows an "Avanzadas" tab with shot types, GK splits, and quarter data when `advancedStatsJson` is present
- [ ] Tab gracefully hides when `advancedStatsJson` is null
