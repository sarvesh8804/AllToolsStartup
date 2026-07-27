---
title: Merge PDFs privately in your browser
description: Combine multiple PDF files without uploading them to a random SaaS. How Forge PDF Merge works client-side.
date: 2026-07-27
---

Most “free PDF merge” sites ask you to upload documents to someone else’s server. That is fine for a flyer. It is a bad idea for contracts, payslips, or ID scans.

## Client-side merge

Forge [PDF Merge](/pdf/pdf-merge) loads files in the browser and stitches pages with a local library. Your PDFs are not sent to Forge for processing.

Typical flow:

1. Drop two or more PDFs.
2. Reorder if needed.
3. Download the combined file.

## Nearby PDF jobs

- [PDF Split](/pdf/pdf-split) — extract a page range
- [PDF Rotate](/pdf/pdf-rotate) — fix sideways scans
- [Images to PDF](/pdf/images-to-pdf) — build a PDF from photos
- [PDF to Images](/pdf/pdf-to-images) — export pages as PNG/JPEG

## Limits to know

Encrypted/password-protected PDFs are not supported yet. Remove the password first, then merge. Very large files may stress older devices — keep batches reasonable.

Privacy-first PDF tooling is a durable SEO niche: people search for the job *and* for “without uploading.” Ship the job honestly.
