# Claudia’s research studio — Vercel edition

The complete working app, prepared as a standard Next.js project for Vercel. No index.html is required. The homepage is app/page.tsx. Research runs in app/api/research-content/route.ts.

## Deploy with GitHub

1. Extract claudia-research-studio-vercel.zip.
2. Upload the contents of the extracted folder to the root of a GitHub repository, including package.json, pnpm-lock.yaml and configuration files.
3. In Vercel, choose Add New → Project and import that repository.
4. Framework: Next.js. Root Directory: repository root (or this folder if you upload the enclosing folder). Use the supplied build command; leave Output Directory at its default.
5. Add OPENALEX_API_KEY under Environment Variables. Paste the existing OpenAlex key there and enable Production and Preview as needed. Do not prefix it NEXT_PUBLIC_ and do not upload .env.
6. Click Deploy.

## Local development

Node 22.13 or newer. Use the pnpm version in package.json.

pnpm install
pnpm dev

Copy .env.example to .env.local and insert the OpenAlex key for local testing.

## Runtime changes

This edition uses next dev/build/start instead of Sites/Vinext. The research endpoint uses the Node runtime and process.env.OPENALEX_API_KEY, with a 180-second function duration. Client throttling uses forwarded-IP headers. The UI and research retrieval/generation logic are unchanged. No new paid APIs or model calls were introduced.

The archive contains no API key. Uploading to GitHub alone does not deploy it; Vercel must import and build the repository. Deployment has not been performed on an account from this task.

Rate limits and cache are per function instance. The tool remains a bounded discovery sample, not a systematic review. Marketing activations are proposals, not verified performance predictions.
## Research signals

Research signals identify reported patterns across supplied abstracts, independently of topic themes. The analyser supports twelve signal types, retains exact excerpts and citations, and keeps contradictory findings Mixed. It is a conservative rule-based analyser with no model calls or extra OpenAlex retrieval. Abstract-only analysis is capped at Moderate evidence and may return no signal when findings are missing or ambiguous. Read the full sources before making a claim.
