# SepTaf React Client (Vite + TS)

A small React app to query your SepTaf API endpoints with HMAC headers.

## ⚠️ Security NOTE
HMAC secrets should **not** live in the browser for production. This project is meant for
internal testing in a trusted network or behind a proxy that performs signing server-side.
For production, move signing to a lightweight backend or an edge function.

## Quick start

```bash
npm i
cp .env.example .env
# edit .env to point VITE_API_BASE and provide a test secret for v1
npm run dev
```

Open: http://localhost:5174

## Canonical string
By default we sign:
```
METHOD\nPATH\nQUERY\nBODY_SHA256_HEX\nEPOCH_SECONDS\nNONCE\n
```
where:
- QUERY is the URL-encoded querystring with keys sorted ascending (omit completely if empty unless `VITE_CANON_INCLUDE_EMPTY_QUERY=true`).
- BODY_SHA256_HEX is SHA-256 of request body (use the hash of empty string for GET with no body).
- EPOCH_SECONDS is used for `X-Date` when `VITE_DATE_HEADER=epoch`. Switch to RFC3339 if your server expects that.

If your gateway expects a slightly different canonicalization, adjust `buildCanonical()` in `src/api/signing.ts`.
