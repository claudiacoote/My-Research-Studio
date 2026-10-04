# Research Signals v2 — fixed evidence framework

## What changed

The old topic classification system, generic fallback categories, badges, filters and exported classification fields are removed. Words such as trust and sustainability remain where they naturally occur in research, query phrases and the existing industry selector; they are not result categories.

A single canonical definition in types/research.ts now owns exactly twelve machine-readable ResearchSignalType values and their human labels. Four canonical evidence strengths are similarly constrained. lib/signals.ts exports matching Zod schemas; invalid types such as consumer_trend fail validation. UI filter options and CSV labels derive from the canonical definitions and actual results, not a separate list.

The new data model uses signalType, evidenceSummary, marketingImplication, evidenceStrength and supportingPaperIds, plus validated counts and exact excerpts. Source IDs and quotes are checked against retrieved papers before returning results. Contradictions remain mixed. Multiple abstracts can contribute to one signal; categories are never padded.

lib/planning.ts replaces topic classification with research-question planning. Existing domain-specific search phrases remain query templates, not labels attached to results. Generic briefs use their own terms rather than a fixed list of topic categories. Content Ideas and Marketing Opportunities retain their independent evidence-based generation and source references. lib/themes.ts is an empty retired-module compatibility file: it overwrites the older uploaded module so that updating an existing GitHub folder does not leave obsolete TypeScript code behind. It contains no classification or fallback logic.

## Files

Changed: types/research.ts, lib/signals.ts, lib/research.ts, lib/scoring.ts, lib/marketing.ts, lib/export.ts, app/page.tsx, app/globals.css, ResearchSignalCard, OpportunityCard, MarketingOpportunityCard, ResearchProgress, EvidenceDrawer and tests. Added lib/planning.ts. Retired lib/themes.ts logic.

## Evidence limits

No language model or generation prompt is used. The extractor is deliberately narrow and rule-based; it may miss patterns outside its supported vocabulary or return no signal where abstracts are absent or ambiguous. It does not independently verify full papers, study quality or statistical findings. Abstract-only strength is capped at moderate. Growth and decline require explicit comparative/temporal result language; recent dates alone do not establish either. Source gaps are qualified to the retrieved sample. Association is not described as causation. Audience and context signals retain reported boundaries in their evidence summaries.

## Existing state

There is no database or browser storage for generated results: results are held in page state and exported. Canonical signal objects survive a JSON round trip with citations intact. Historical classification-shaped objects and invalid signal objects are rejected by validation and ignored during restoration, never converted into signals. Old topic fields on content records are not rendered or used for filtering.

## Validation

33 automated tests passed. Full lint and TypeScript passed. The Vercel Next.js production build passed. Browser fixtures checked the removal of all topic filters, canonical result-only signal filters, exact excerpts, supporting-paper drawer, readable strength labels, CSV, invalid historical data, zero-signal state, reduced motion and layouts at 375/768/1024/1440px. No browser errors or overflow were detected. Viewing or filtering evidence caused no extra retrieval.

No new paid API, model call or dependency was introduced. Existing bounded OpenAlex retrieval is reused. Query planning for generic briefs changed as required to remove the predefined classification fallback. Both local and Vercel editions have the update. The hosted Vercel website is not automatically modified.

## Upload

Extract research-signals-v2-vercel.zip into a fresh location. Drag the entire inner claudia-research-studio-vercel folder into GitHub's upload area. File paths must include claudia-research-studio-vercel/app/page.tsx and claudia-research-studio-vercel/lib/planning.ts. Commit as Replace topic taxonomy with Research Signals v2. Vercel Root Directory remains claudia-research-studio-vercel. Open Visit on the deployment for that new commit.
