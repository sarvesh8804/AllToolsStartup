---
title: Decode a JWT without trusting a random website
description: Inspect JWT header and payload locally. Why client-side decoding matters for tokens that contain PII.
date: 2026-07-27
---

JSON Web Tokens show up in auth headers, cookies, and debug logs. Decoding one is often the fastest way to see claims — `sub`, `exp`, roles — without spinning up a backend.

## Decode locally

Paste a token into Forge [JWT Decoder](/tools/jwt-decoder). The tool splits header and payload and pretty-prints the JSON **in your browser**. That matters when payloads include emails, tenant IDs, or internal scopes.

## What decoding is not

Decoding is **not** signature verification. A forged token can still decode. Use your auth library or JWKS endpoint to verify signatures in production.

## Nearby developer tools

- [Base64 Encode / Decode](/tools/base64-encode-decode)
- [JSON Formatter](/tools/json-formatter)
- [Unix Timestamp Converter](/tools/unix-timestamp-converter) for `exp` / `iat`
- [SHA-256 Hash](/tools/sha-256-hash) when comparing digests

If you handle tokens daily, bookmark a local decoder. Uploading production JWTs to an unknown website is an avoidable habit.
