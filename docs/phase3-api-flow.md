# Phase 3 API + Persistence Flow (Supabase)

## End-to-end flow

1. User chooses upload source in `/upload`.
2. Client calls `POST /api/ingest` with `{ source, fileName }`.
3. API route:
   - Parses incoming data (current MVP parser: schema-driven mock parser)
   - Validates rows (`validateUploadData`)
   - Computes report/scores (`buildBusinessReportFromParsed`)
   - Persists all artifacts to Supabase tables (`saveUploadAnalysis`)
4. API returns `{ uploadId, summary }`.
5. Client redirects to `/data-validation?uploadId=<id>`.
6. Validation page reads persisted `validation_issues` and report quality score from Supabase.
7. Dashboard, Products, Suppliers pages read latest persisted report + score tables from Supabase.

## Routes

- `POST /api/ingest`
  - Purpose: ingest, parse, validate, score, persist
  - Input: `{ source?: 'excel' | 'csv' | 'google-sheets', fileName?: string }`
  - Output: `{ ok, uploadId, summary }`

- `GET /api/report/latest`
  - Purpose: return most recent persisted business report

- `GET /api/uploads/[uploadId]/validation`
  - Purpose: return validation issues/quality metrics for one upload

## Supabase environment variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

When env vars are missing, app pages gracefully use mock fallback data.
