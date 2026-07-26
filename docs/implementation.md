# Forge — Daily Implementation Plan

**Companion to:** [`plan.md`](./plan.md)  
**Cadence:** **1 phase per day** → commit → push → Vercel production updates automatically  
**Goal:** Host on Day 1 (end of F04). Grow from 0 → 755 tools without ever taking the site offline.  
**Version:** 1.0 · July 2026

---

## How to use this document

1. Do **exactly one phase** per working day (skip weekends or use them for catch-up — your choice).
2. Mark the phase checkbox when merged to `main` and live on production.
3. Never open a new tool category with a thin stub: either ship a working tool or keep it `planned` + `noindex`.
4. If a Hard phase slips, **split it** into `Pxxx-a` / `Pxxx-b` rather than skipping deploy.
5. Strategy/taste decisions stay in `plan.md`. This file is the **shipping calendar**.

### Definition of Done (every tool phase)

A tool phase is done only when **all** are true:

- [ ] Tool works client-side for happy path + obvious edge cases
- [ ] Unit tests for the tool’s pure logic (`src/**/*.test.ts`) — write + `npm test` green
- [ ] Registry entry `status: shipped` with title, description, FAQ (≥3), relatedSlugs
- [ ] Unique URL under correct family; in sitemap
- [ ] Privacy badge accurate (local processing)
- [ ] Mobile usable; keyboard copy/download works
- [ ] No new Lighthouse regressions on the shared chrome (spot-check weekly)
- [ ] Deployed to production same day

### Continuous hosting model

```
Day F04 ──► Vercel production LIVE (0–few tools)
   │
   ├─ every later phase ──► git push main ──► Vercel rebuild
   │
   └─ sitemap grows only with status=shipped
```

| Rule | Why |
|---|---|
| `main` always deployable | Site never broken for users/Google |
| Feature branches for Hard tools | Keep production green |
| Sitemap = shipped only | Avoid thin-content risk |
| Homepage shows shipped + honest “building in public” | Trust |
| Planned tools may exist as noindex placeholders | Optional; prefer not linking them in nav |

### Effort guide

| Phase type | Typical contents | Hours |
|---|---|---|
| Foundation (F) | Platform work | 3–8h |
| Easy batch | 2–3 Easy tools, same cluster | 2–5h |
| Medium | 1–2 Medium tools | 4–8h |
| Hard | 1 Hard tool | 6–16h (split days if needed) |
| Hub / SEO (H/S) | Category page polish, FAQs, 1 guide | 2–5h |

---

## Phase index summary

| Block | Phases | Purpose |
|---|---:|---|
| Foundation **F00–F11** | 12 | Hostable shell + registry + SEO + editor kit |
| Tool build **P001–P472** | 472 | All 755 tools in daily batches |
| Hub / SEO interludes **H***/**S*** | ~90 | Category hubs, guides, internal links (scheduled below) |
| Monetization / polish **M*** | ~15 | Late: ads prep, affiliates, Plus experiments |
| **Total calendar days (approx.)** | **~589** | ~29.4 months at 5 days/week |

_Exact tool-phase count: **472** covering **755** tools._  
_Plus ~50 hub days (H) + ~94 SEO days (S) + 15 monetization days (M) interleaved — **~643 working days** if every interlude is taken literally; compress S-days if you need faster tool velocity._

### Progress pointer (update daily)

> **Canonical tracker:** [`done.md`](./done.md) — mark phases `[x]` there. Keep this table in sync.

| Field | Value |
|---|---|
| **Today’s phase** | `P002` |
| **Last shipped** | `P001` |
| **Tools live (shipped)** | 2 / 755 |
| **Production URL** | _set after Vercel deploy_ |
| **Notes** | P001 shipped. Next: Base64, URL encode, UUID. |

---

## Week 1 — get hosted immediately

| Day | Phase | Outcome | Live? |
|---|---|---|---|
| Day 1 | **F00** | Next.js + Tailwind builds | Preview OK |
| Day 2 | **F01** | Brand chrome (charcoal/copper) | Preview OK |
| Day 3 | **F02** | Tool registry schema (0 shipped) | Preview OK |
| Day 4 | **F03** | Dynamic `/{family}/[slug]` + ToolShell | Preview OK |
| Day 5 | **F04** | Homepage + **Vercel production** | **YES — public site** |
| Day 6 | **F05** | Family hub pages (empty shipped lists) | YES |
| Day 7 | **F06** | robots/sitemap/metadata | YES |

From Day 8: finish **F07–F11**, then start **P001** (JSON Formatter + Validator). Every later day = one P/H/S phase and a production push.

---

## Block A — Foundation (ship the empty factory)

Complete these **before or as** the first tool phases. **Production goes live at F04.**

### F00 — Repo bootstrap

- [x] Create Next.js App Router + TS + Tailwind + ESLint. `pnpm create`, git init, basic README. Empty homepage that builds.
- [x] Push `main` → confirm Vercel deploy green

### F01 — Design tokens & global chrome

- [x] Charcoal/copper tokens, fonts, dark mode CSS vars, Navbar/Footer shells, layout.tsx. No tools yet.
- [x] Push `main` → confirm Vercel deploy green

### F02 — Tool registry schema

- [x] JSON/TS content schema for tools: slug, family, category, status=planned|shipped, seo fields. Validate script. Zero shipped tools OK.
- [x] Push `main` → confirm Vercel deploy green

### F03 — Dynamic tool route + ToolShell

- [x] Route `/{family}/[slug]`. Shared ToolShell: title, privacy badge, FAQ slot, related tools, empty/error states. Coming-soon page for planned tools (noindex).
- [x] Push `main` → confirm Vercel deploy green

### F04 — Homepage v1 (shippable)

- [x] Brand hero, search stub, curated featured list (empty or placeholders), privacy pitch, category links. **Deploy to Vercel.**
- [x] Push `main` → confirm Vercel deploy green

### F05 — Category hub pages

- [x] Family indexes `/tools`, `/pdf`, `/image`, `/calculators`, `/convert` listing only `status=shipped`. Empty states friendly.
- [x] Push `main` → confirm Vercel deploy green

### F06 — SEO primitives

- [x] Metadata API, canonical, OG, robots.txt, sitemap.ts (shipped only), BreadcrumbList + WebApplication schema helpers.
- [x] Push `main` → confirm Vercel deploy green

### F07 — Command palette + client search

- [x] cmdk over shipped tools registry. Keyboard `/` focus. Works with 0 tools.
- [x] Push `main` → confirm Vercel deploy green

### F08 — Analytics + privacy pages

- [x] Cloudflare Web Analytics or similar, `/privacy`, `/terms`, `/about`. Event helper `tool_start`/`tool_complete`.
- [x] Push `main` → confirm Vercel deploy green

### F09 — CI + quality gates

- [x] GitHub Action: typecheck, lint, build, schema validate. Preview deploys on PR. Main auto-deploys.
- [x] Push `main` → confirm Vercel deploy green

### F10 — Editor kit

- [x] CodeMirror 6 wrapper, CopyButton, FileDropzone, DownloadButton, Toast. Shared by most Phase tools.
- [x] Push `main` → confirm Vercel deploy green

### F11 — First content stubs

- [x] 3 MDX posts outline only OR 1 real guide. Blog index. Internal link component.
- [x] Push `main` → confirm Vercel deploy green

---

## Block B — Daily tool phases (P001…)

Each phase below is **one day**. Tools are ordered for topical authority (dev utilities → PDF/image → calculators → satellites), not alphabetical.

**Columns:** Phase · Tools · Diff · Family · Category · Slugs

| Phase | Tools (ship today) | Diff | Family | Category |
|---|---|---|---|---|
| P001 | JSON Formatter / Beautifier; JSON Validator | E | `/tools` | JSON & Data Formats |
| P002 | Base64 Encode / Decode; URL Encode / Decode; UUID v4 Generator | E | `/tools` | Encoding & Hashing |
| P003 | JWT Decoder; SHA-256 Hash; MD5 Hash Generator | E | `/tools` | Encoding & Hashing |
| P004 | Case Converter (upper/lower/title/camel/snake/kebab); Word Counter; Character Counter | E | `/tools` | Text Tools |
| P005 | Slug Generator; Random Password Generator | E | `/tools` | Encoding & Hashing, Text Tools |
| P006 | QR Code Generator | E | `/tools` | QR & Barcodes |
| P007 | Unix Timestamp Converter; Cron Expression Explainer | E/M | `/convert` | Converters (Units & Misc) |
| P008 | Text Diff (side-by-side); Markdown Preview | E/M | `/tools` | Regex & Text, Text Tools |
| P009 | HTML Formatter; CSS Formatter; CSS Minifier | E | `/tools` | Code Formatters |
| P010 | SQL Formatter; YAML to JSON | E | `/tools` | Code Formatters, JSON & Data Formats |
| P011 | JSON to YAML; CSV to JSON; JSON to CSV | E | `/tools` | JSON & Data Formats |
| P012 | Lorem Ipsum Generator; Color Contrast Checker (WCAG) | E | `/tools` | Colors, Text Tools |
| P013 | HEX to RGB; Gitignore Generator | E | `/tools` | Colors, Generators |
| P014 | Number Base Converter (2/8/10/16) | E | `/convert` | Converters (Units & Misc) |
| P015 | Percentage Calculator; Tip Calculator | E | `/calculators` | Finance Calculators, Math & Calculators |
| P016 | EMI / Loan Calculator | E | `/calculators` | Finance Calculators |
| P017 | Age Calculator | E | `/tools` | Date & Time |
| P018 | Timezone Converter | M | `/convert` | Converters (Units & Misc) |
| P019 | Regex Tester | M | `/tools` | Regex & Text |
| P020 | Image Resizer; PNG to JPG | E/M | `/image` | Image Tools |
| P021 | JPG to PNG; WebP Converter | E/M | `/image` | Image Tools |
| P022 | Image Compressor; EXIF Remover | M | `/image` | Image Tools |
| P023 | Favicon Generator from Image | M | `/image` | Image Tools |
| P024 | Images to PDF | M | `/pdf` | PDF Tools |
| P025 | PDF Merge | H | `/pdf` | PDF Tools |
| P026 | PDF Split | H | `/pdf` | PDF Tools |
| P027 | PDF Rotate | M | `/pdf` | PDF Tools |
| P028 | PDF to Images | H | `/pdf` | PDF Tools |
| P029 | Unit Converter (length); Unit Converter (weight); Unit Converter (temperature) | E | `/convert` | Converters (Units & Misc) |
| P030 | Unit Converter (data storage) | E | `/convert` | Converters (Units & Misc) |
| P031 | GST / Sales Tax Calculator; SIP Calculator | E | `/calculators` | Finance Calculators |
| P032 | BMI Calculator; GPA Calculator | E | `/calculators` | Health & Everyday, Student Tools |
| P033 | Meta Tags Preview (SERP); CSV Viewer / Table | E | `/tools` | CSV & Spreadsheets, Web & HTML |
| P034 | CSV to JSON (advanced options); Password Strength Meter | E | `/tools` | CSV & Spreadsheets, Encoding & Hashing |
| P035 | Markdown to HTML; JavaScript Beautifier | E | `/tools` | Code Formatters, Text Tools |
| P036 | JavaScript Minifier; Date Difference Calculator | E | `/tools` | Code Formatters, Date & Time |
| P037 | Regex Cheatsheet Interactive; JSON Minifier | E | `/tools` | JSON & Data Formats, Regex & Text |
| P038 | CSS Box Shadow Generator; CSS Gradient Generator | E | `/tools` | CSS & Design Dev |
| P039 | CSV to Excel (XLSX) client-side; Excel to CSV | M | `/tools` | CSV & Spreadsheets |
| P040 | Fake Credit Card (test numbers only); Open Graph Meta Generator | E | `/tools` | Generators |
| P041 | Text Diff (inline); Password Generator (advanced options) | E/M | `/tools` | Regex & Text, Security & Crypto (educational, client) |
| P042 | Color Picker; Fake User JSON Generator | E | `/tools` | Colors, Generators |
| P043 | README Generator; Readme Badges Generator | E | `/tools` | Generators, Markdown & Docs |
| P044 | SQL Formatter (advanced); Keyword Density Checker | E | `/tools` | SQL & Databases, Text Tools |
| P045 | Markdown Table Generator; RGB to HEX | E | `/tools` | Colors, Text Tools |
| P046 | Pomodoro Timer; Fake Address Generator | E | `/tools` | Date & Time, Generators |
| P047 | Fake Name Generator; Git Cheat Sheet Interactive | E | `/tools` | Generators, Git & DevOps |
| P048 | Git Command Explorer; HTML Minifier | E | `/tools` | Code Formatters, Git & DevOps |
| P049 | Add / Subtract Dates; Meeting Time Planner (multi-TZ) | E/M | `/tools` | Date & Time |
| P050 | Time Duration Calculator; World Clock | E | `/tools` | Date & Time |
| P051 | HTML Entity Encode / Decode; SHA-1 Hash | E | `/tools` | Encoding & Hashing |
| P052 | Fake Email Generator (local); License Text Generator; Sitemap XML Generator (manual URLs) | E | `/tools` | Generators |
| P053 | htaccess Redirect Generator; robots.txt Generator | E | `/tools` | Generators |
| P054 | JSON to XML; XML to JSON | E | `/tools` | JSON & Data Formats |
| P055 | HTTP Status Code Reference; Remove Duplicate Lines | E | `/tools` | Networking & HTTP, Text Tools |
| P056 | Sort Lines; XML Formatter | E | `/tools` | Text Tools, XML & YAML & Config |
| P057 | YAML Formatter; CSS Flexbox Playground | E/M | `/tools` | CSS & Design Dev, XML & YAML & Config |
| P058 | CSS Grid Playground; Palette from Image | M | `/tools` | CSS & Design Dev, Colors |
| P059 | QR Code Reader (camera/file); WiFi QR Generator | E/M | `/tools` | QR & Barcodes |
| P060 | Business Days Calculator; JSON to TypeScript Interface | M | `/tools` | Date & Time, JSON & Data Formats |
| P061 | vCard QR Generator; Glassmorphism Generator | E | `/tools` | CSS & Design Dev, QR & Barcodes |
| P062 | CSV to SQL INSERT | M | `/tools` | CSV & Spreadsheets |
| P063 | SVG Optimizer (SVGO-like) | H | `/tools` | Code Formatters |
| P064 | Countdown Timer Builder; File Checksum (browser) | E/M | `/tools` | Date & Time, Encoding & Hashing |
| P065 | JWT Debugger with Claims Explain; Passphrase Generator | E/M | `/tools` | Encoding & Hashing |
| P066 | Dockerfile Generator (templates); JSON Diff | M | `/tools` | Generators, JSON & Data Formats |
| P067 | HTML to Markdown; Reading Time Estimator | E/M | `/tools` | Text Tools |
| P068 | Zero-Width Character Detector; CSS Border Radius Generator | E | `/tools` | CSS & Design Dev, Text Tools |
| P069 | CSV Column Splitter; GraphQL Formatter | E | `/tools` | CSV & Spreadsheets, Code Formatters |
| P070 | SQL Minifier; Complementary Color Finder | E | `/tools` | Code Formatters, Colors |
| P071 | Week Number Calculator; Base64 URL-safe | E | `/tools` | Date & Time, Encoding & Hashing |
| P072 | SHA-512 Hash; Twitter Card Meta Generator | E | `/tools` | Encoding & Hashing, Generators |
| P073 | UUID Bulk Generator; Gitignore Builder (advanced) | E | `/tools` | Generators, Git & DevOps |
| P074 | Image to Base64 | E | `/image` | Image Tools |
| P075 | Mermaid Live Editor (embed) | H | `/tools` | Markdown & Docs |
| P076 | Find & Replace Batch | E | `/tools` | Regex & Text |
| P077 | Regex Explainer (static rules) | H | `/tools` | Regex & Text |
| P078 | Dummy Text Generator (paragraphs); Invisible Character Remover; Line Counter | E | `/tools` | Text Tools |
| P079 | Word Frequency Counter; HTML Table Generator | E | `/tools` | Text Tools, Web & HTML |
| P080 | CSV to Markdown; Accessible Palette Generator | E/M | `/tools` | CSV & Spreadsheets, Colors |
| P081 | HEX to HSL; Commit Message Helper | E | `/tools` | Colors, Generators |
| P082 | Conventional Commit Builder; JSON to Markdown Table | E | `/tools` | Generators, JSON & Data Formats |
| P083 | DNS Record Types Cheatsheet; Port Number Reference; URL Parser / Builder | E | `/tools` | Networking & HTTP |
| P084 | User-Agent Parser; SQL JOIN Visualizer | E/M | `/tools` | Networking & HTTP, SQL & Databases |
| P085 | Caesar Cipher; Markdown TOC Generator; Morse to Text | E | `/tools` | Text Tools |
| P086 | Text to Morse; HTML Entity Reference | E | `/tools` | Text Tools, Web & HTML |
| P087 | JSON-LD Formatter; CSV to HTML Table | E | `/tools` | CSV & Spreadsheets, Web & HTML |
| P088 | Day of Week Finder; Binary Encode / Decode | E | `/tools` | Date & Time, Encoding & Hashing |
| P089 | Hex Encode / Decode; NanoID Generator; ULID Generator | E | `/tools` | Encoding & Hashing |
| P090 | Unicode Escape / Unescape; API Key Style Token Generator | E | `/tools` | Encoding & Hashing, Generators |
| P091 | Colorful Avatar Generator (SVG); Lorem Picsum Alternative Placeholder | E/M | `/tools` | Generators |
| P092 | JSON Escape / Unescape; Barcode Generator (Code128) | E/M | `/tools` | JSON & Data Formats, QR & Barcodes |
| P093 | CSV to SQL INSERT Bulk; QR Code for OTP Setup | M | `/tools` | SQL & Databases, Security & Crypto (educational, client) |
| P094 | Binary to Text; Remove Extra Spaces; Reverse Text | E | `/tools` | Text Tools |
| P095 | Text to Binary; Open Graph Preview | E/M | `/tools` | Text Tools, Web & HTML |
| P096 | Schema Markup Generator (FAQ/HowTo); INI / ENV Parser | E/M | `/tools` | Web & HTML, XML & YAML & Config |
| P097 | CSS Animation Keyframes Builder; Clip-path Generator | M | `/tools` | CSS & Design Dev |
| P098 | CSV Cleaner (trim, dedupe); CSV Diff | M | `/tools` | CSV & Spreadsheets |
| P099 | Color Blindness Simulator; Random Palette Generator | E/M | `/tools` | Colors |
| P100 | Calendar Generator (print); Docker Run to Compose Converter | M | `/tools` | Date & Time, Git & DevOps |
| P101 | Image Cropper | M | `/image` | Image Tools |
| P102 | JSON Path Tester; JSON Pretty Print with Tree View | M | `/tools` | JSON & Data Formats |
| P103 | CIDR Calculator; Fetch to cURL Converter | M | `/tools` | Networking & HTTP |
| P104 | SSL Certificate Decoder (paste PEM); Subnet Calculator | M | `/tools` | Networking & HTTP |
| P105 | cURL to Fetch Converter; Grep Online (multiline) | M | `/tools` | Networking & HTTP, Regex & Text |
| P106 | CORS Explainer Simulator; CSS Clamp Calculator | E/M | `/tools` | CSS & Design Dev, Security & Crypto (educational, client) |
| P107 | CSS Filter Generator; Responsive Font Scale Calculator | E | `/tools` | CSS & Design Dev |
| P108 | CSV Merger; Java Beautifier | M | `/tools` | CSV & Spreadsheets, Code Formatters |
| P109 | PHP Beautifier; SCSS / LESS Formatter | M | `/tools` | Code Formatters |
| P110 | TypeScript Formatter; Gradient from Two Colors | E/M | `/tools` | Code Formatters, Colors |
| P111 | Tint / Shade Generator; Triadic / Analogous Generator | E | `/tools` | Colors |
| P112 | HMAC Generator; JWT Encoder (unsigned/demo) | M | `/tools` | Encoding & Hashing |
| P113 | UUID v1 / v7 Generator; Nginx Config Snippet Generator | M | `/tools` | Encoding & Hashing, Generators |
| P114 | Barcode Scanner (camera) | H | `/tools` | QR & Barcodes |
| P115 | Word Diff | M | `/tools` | Regex & Text |
| P116 | AES Encrypt / Decrypt (demo WebCrypto) | H | `/tools` | Security & Crypto (educational, client) |
| P117 | CSP Builder | M | `/tools` | Security & Crypto (educational, client) |
| P118 | OTP / TOTP Generator (local secret) | H | `/tools` | Security & Crypto (educational, client) |
| P119 | RSA Keypair Generator (WebCrypto) | H | `/tools` | Security & Crypto (educational, client) |
| P120 | HTML Preview Sandbox (sandboxed iframe); XML Validator | M | `/tools` | Web & HTML, XML & YAML & Config |
| P121 | XML to CSV; YAML Validator | M | `/tools` | XML & YAML & Config |
| P122 | CSS to Tailwind Converter (heuristic) | H | `/tools` | CSS & Design Dev |
| P123 | Pivot Table Generator (simple) | H | `/tools` | CSV & Spreadsheets |
| P124 | Date to Epoch; Epoch to Date | E | `/convert` | Converters (Units & Misc) |
| P125 | Compound Interest; Mortgage Calculator | E | `/calculators` | Finance Calculators |
| P126 | Identicon Generator; SSH Public Key Fingerprint | E/M | `/tools` | Generators, Git & DevOps |
| P127 | Pregnancy Due Date | E | `/calculators` | Health & Everyday |
| P128 | Placeholder Image Generator | E | `/image` | Image Tools |
| P129 | JSON to Go Struct; JSON to Python Dataclass | M | `/tools` | JSON & Data Formats |
| P130 | Percentage Change; Random Number Generator | E | `/calculators` | Math & Calculators |
| P131 | HTTP Header Parser; IP Address Explainer (v4/v6 educational) | E/M | `/tools` | Networking & HTTP |
| P132 | Query String Builder | E | `/tools` | Networking & HTTP |
| P133 | PDF Compress (basic) | H | `/pdf` | PDF Tools |
| P134 | Secure Random Bytes Generator; Security Headers Checker (paste response) | E | `/tools` | Security & Crypto (educational, client) |
| P135 | CGPA Converter | E | `/calculators` | Student Tools |
| P136 | Anagram Finder; .env Diff | E/M | `/tools` | Text Tools, XML & YAML & Config |
| P137 | CSS Specificity Calculator; Neumorphism Generator; Scrollbar Styler | E | `/tools` | CSS & Design Dev |
| P138 | Tailwind Color Palette Viewer; TSV Converter | E | `/tools` | CSS & Design Dev, CSV & Spreadsheets |
| P139 | Python Formatter (black-like rules subset) | H | `/tools` | Code Formatters |
| P140 | Name That Color | E | `/tools` | Colors |
| P141 | Bcrypt Hash (wasm) | H | `/tools` | Encoding & Hashing |
| P142 | CRC32 Calculator; CI Workflow Template Picker | E | `/tools` | Encoding & Hashing, Git & DevOps |
| P143 | Base64 to Image | E | `/image` | Image Tools |
| P144 | JSON Flatten / Unflatten | M | `/tools` | JSON & Data Formats |
| P145 | JSON Schema Validator | H | `/tools` | JSON & Data Formats |
| P146 | JSON to TOML; TOML to JSON | E | `/tools` | JSON & Data Formats |
| P147 | Changelog Formatter; Patch / Unified Diff Viewer | E/M | `/tools` | Markdown & Docs, Regex & Text |
| P148 | Regex to Automata Visualizer | H | `/tools` | Regex & Text |
| P149 | String Similarity (Levenshtein); Add Line Numbers | E/M | `/tools` | Regex & Text, Text Tools |
| P150 | Button CSS Generator; Viewport Tester Sizes | E | `/tools` | Web & HTML |
| P151 | TOML Formatter; XML Minifier | E | `/tools` | XML & YAML & Config |
| P152 | Cron Generator (UI) | M | `/convert` | Converters (Units & Misc) |
| P153 | Env Var Reference Linter; Semantic Version Bumper | E | `/tools` | Git & DevOps |
| P154 | AVIF Converter (if browser supports); Add Watermark | M | `/image` | Image Tools |
| P155 | App Icon Pack Generator (sizes); Image Metadata Viewer (EXIF) | M | `/image` | Image Tools |
| P156 | SVG to PNG | M | `/image` | Image Tools |
| P157 | MIME Type Lookup; XSS Payload Encoder (educational) | E | `/tools` | Networking & HTTP, Security & Crypto (educational, client) |
| P158 | Kubernetes YAML Explainer (static) | H | `/tools` | XML & YAML & Config |
| P159 | Emoji Search / Picker; CREATE TABLE Builder | E/M | `/tools` | Education & Reference, SQL & Databases |
| P160 | Form Builder HTML Export | M | `/tools` | Web & HTML |
| P161 | Docker Compose Validator (client) | H | `/tools` | XML & YAML & Config |
| P162 | WCAG Contrast Checker (advanced) | E | `/tools` | Accessibility Tools |
| P163 | Unit Converter (volume) | E | `/convert` | Converters (Units & Misc) |
| P164 | CAGR Calculator; Currency Converter (static rates snapshot) | E/M | `/calculators` | Finance Calculators |
| P165 | Currency Exchange Table (snapshot); FD / RD Calculator | E | `/calculators` | Finance Calculators |
| P166 | Income Tax Estimator (static slabs demo); Inflation Calculator | E/M | `/calculators` | Finance Calculators |
| P167 | Lumpsum Investment; Profit Margin Calculator; ROI Calculator | E | `/calculators` | Finance Calculators |
| P168 | Salary Take-Home Estimator; VAT Calculator | E/M | `/calculators` | Finance Calculators |
| P169 | Kubernetes Resource Calculator (requests) | M | `/tools` | Git & DevOps |
| P170 | BMR Calculator; Calorie Needs (TDEE); Ovulation Calculator | E | `/calculators` | Health & Everyday |
| P171 | PNG to SVG (trace approx) | H | `/image` | Image Tools |
| P172 | Social OG Image Size Crops | E | `/image` | Image Tools |
| P173 | System Design Component Glossary | E | `/interview` | Interview & DSA |
| P174 | Scientific Calculator | M | `/calculators` | Math & Calculators |
| P175 | PDF Signature Place (draw) | H | `/pdf` | PDF Tools |
| P176 | EAN / UPC Generator | M | `/tools` | QR & Barcodes |
| P177 | ERD from SQL (simple) | H | `/tools` | SQL & Databases |
| P178 | JSON to SQL; Hash Identifier (heuristic) | M | `/tools` | SQL & Databases, Security & Crypto (educational, client) |
| P179 | Citation Generator (APA/MLA static); Grade Percentage Calculator | E/M | `/calculators` | Student Tools |
| P180 | Weighted Grade Calculator | E | `/calculators` | Student Tools |
| P181 | Vigenère Cipher (educational); Favicon & App Manifest Preview | M | `/tools` | Text Tools, Web & HTML |
| P182 | Delimiter Detector; OKLCH Converter | E/M | `/tools` | CSV & Spreadsheets, Colors |
| P183 | Roman Numerals Converter | E | `/convert` | Converters (Units & Misc) |
| P184 | Leap Year Checker; Stopwatch | E | `/tools` | Date & Time |
| P185 | CUID Generator | E | `/tools` | Encoding & Hashing |
| P186 | Sleep Cycle Calculator | E | `/calculators` | Health & Everyday |
| P187 | Image Rotate / Flip | E | `/image` | Image Tools |
| P188 | Big-O Cheatsheet Interactive | E | `/interview` | Interview & DSA |
| P189 | JSON Merge; JSON Sort Keys | E/M | `/tools` | JSON & Data Formats |
| P190 | NDJSON Viewer | E | `/tools` | JSON & Data Formats |
| P191 | Number to Words | E | `/calculators` | Math & Calculators |
| P192 | HTTP Request Builder (client-only mock) | H | `/tools` | Networking & HTTP |
| P193 | PDF Delete Pages | H | `/pdf` | PDF Tools |
| P194 | PDF Extract Pages | H | `/pdf` | PDF Tools |
| P195 | PDF Protect (encrypt) | H | `/pdf` | PDF Tools |
| P196 | PDF Reorder Pages | H | `/pdf` | PDF Tools |
| P197 | PDF Text Extract | H | `/pdf` | PDF Tools |
| P198 | PDF Unlock (password known, client) | H | `/pdf` | PDF Tools |
| P199 | PDF Watermark | H | `/pdf` | PDF Tools |
| P200 | SQL Query Explainer (static heuristics) | H | `/tools` | SQL & Databases |
| P201 | Palindrome Checker; String Rot13 | E | `/tools` | Text Tools |
| P202 | Unicode Normalizer (NFC/NFD); Responsive Breakpoint Preview | M | `/tools` | Text Tools, Web & HTML |
| P203 | Properties File Converter; YAML Diff | E/M | `/tools` | XML & YAML & Config |
| P204 | CSS Triangle Generator | E | `/tools` | CSS & Design Dev |
| P205 | Unit Converter (area); Unit Converter (speed) | E | `/convert` | Converters (Units & Misc) |
| P206 | Discount Calculator; Hourly to Salary Converter; Simple Interest | E | `/calculators` | Finance Calculators |
| P207 | Ideal Weight Calculator; Pace Calculator (running) | E | `/calculators` | Health & Everyday |
| P208 | PlantUML Client Preview (wasm if avail) | H | `/tools` | Markdown & Docs |
| P209 | Average / Mean Calculator; Degree / Radian Converter; GCD / LCM Calculator | E | `/calculators` | Math & Calculators |
| P210 | Permutation / Combination; Quadratic Equation Solver; Standard Deviation | E | `/calculators` | Math & Calculators |
| P211 | Trigonometry Calculator | E | `/calculators` | Math & Calculators |
| P212 | SQL Injection Playground (safe mock) | H | `/tools` | SQL & Databases |
| P213 | Certificate Fingerprint SHA256; SQL Injection Pattern Detector (educational) | E/M | `/tools` | Security & Crypto (educational, client) |
| P214 | Flashcard App (localStorage); Multiplication Table Generator | E/M | `/calculators` | Student Tools |
| P215 | Canonical URL Checker (paste HTML) | E | `/tools` | Web & HTML |
| P216 | C/C++ Formatter (clang-format subset) | H | `/tools` | Code Formatters |
| P217 | Go Formatter (gofmt-like subset) | H | `/tools` | Code Formatters |
| P218 | ASCII Table Interactive; Periodic Table Interactive | E/M | `/tools` | Education & Reference |
| P219 | Typing Speed Test; WPM Accuracy Test | M | `/tools` | Education & Reference |
| P220 | Freelance Rate Calculator | E | `/calculators` | Finance Calculators |
| P221 | LeetCode Pattern Finder (static map) | E | `/interview` | Interview & DSA |
| P222 | MDX Preview (limited) | H | `/tools` | Markdown & Docs |
| P223 | Text Compare (3-way) | H | `/tools` | Text Tools |
| P224 | Web Vitals Score Explainer | E | `/tools` | Developer Advanced |
| P225 | Amortization Schedule; Credit Card Payoff Calculator | M | `/calculators` | Finance Calculators |
| P226 | Retirement Calculator | M | `/calculators` | Finance Calculators |
| P227 | Noise Texture Generator; Waveform SVG Generator | M | `/tools` | Generators |
| P228 | Blur Face Region (manual); Dominant Color Extractor | M | `/image` | Image Tools |
| P229 | Load Balancer Explainer | E | `/interview` | Interview & DSA |
| P230 | Graphing Calculator (simple) | H | `/calculators` | Math & Calculators |
| P231 | CSR Decoder; Tracking Parameter Stripper (URL) | E/M | `/tools` | Networking & HTTP, Privacy Utilities |
| P232 | Fuzzy Match Demo | M | `/tools` | Regex & Text |
| P233 | Bar Chart Maker; Line Chart Maker; Pie Chart Maker | E | `/calculators` | Statistics & Charts |
| P234 | Bibliography Formatter; Fraction Visualizer | M | `/calculators` | Student Tools |
| P235 | Long Division Visualizer | M | `/calculators` | Student Tools |
| P236 | Headline Analyzer (heuristic); Column Type Inferencer | E/M | `/tools` | CSV & Spreadsheets, Writing & Content |
| P237 | Cron Next Runs Calculator | M | `/convert` | Converters (Units & Misc) |
| P238 | Box Model Visualizer | E | `/tools` | Developer Advanced |
| P239 | Budget Splitter (50/30/20) | E | `/calculators` | Finance Calculators |
| P240 | ICO Converter; Image Color Adjust (brightness/contrast) | M | `/image` | Image Tools |
| P241 | Image to ASCII Art | M | `/image` | Image Tools |
| P242 | Bitwise Operations Playground; Latency Numbers Reference | E | `/interview` | Interview & DSA |
| P243 | Sorting Visualizer | M | `/interview` | Interview & DSA |
| P244 | JSON Filter by Key; ASCII Doc Lite Preview | M | `/tools` | JSON & Data Formats, Markdown & Docs |
| P245 | Documentation Search Demo | M | `/tools` | Markdown & Docs |
| P246 | PDF Metadata Viewer | M | `/pdf` | PDF Tools |
| P247 | UTM Builder; UTM Parser | E | `/tools` | Privacy Utilities |
| P248 | Algebra Step Checker (limited) | H | `/calculators` | Student Tools |
| P249 | CommonMark / GFM Diff; Meta Description Length Checker | E/M | `/tools` | Text Tools, Writing & Content |
| P250 | Readability Score (Flesch); Title Tag Length Checker | E | `/tools` | Writing & Content |
| P251 | CSS Reset Diff Viewer; Color Mixer | E | `/tools` | CSS & Design Dev, Colors |
| P252 | ISO 8601 Parser; Unit Converter (energy); Unit Converter (power) | E | `/convert` | Converters (Units & Misc) |
| P253 | Unit Converter (pressure) | E | `/convert` | Converters (Units & Misc) |
| P254 | Semver Range Explainer; Keyboard Shortcut Cheatsheets | E | `/tools` | Developer Advanced, Education & Reference |
| P255 | Break-even Calculator | E | `/calculators` | Finance Calculators |
| P256 | .gitattributes Helper; Changelog Diff Helper | E | `/tools` | Git & DevOps |
| P257 | Body Fat Estimator (formula); Heart Rate Zone Calculator; Macro Split Calculator | E | `/calculators` | Health & Everyday |
| P258 | CAP Theorem Explorer; Time Complexity Calculator (input size) | E | `/interview` | Interview & DSA |
| P259 | Equation Plotter | H | `/calculators` | Math & Calculators |
| P260 | Fraction Calculator; Matrix Calculator (2x2/3x3) | M | `/calculators` | Math & Calculators |
| P261 | Median / Mode Calculator; Ratio Calculator | E | `/calculators` | Math & Calculators |
| P262 | Whois-like Educational (no live lookup) | E | `/tools` | Networking & HTTP |
| P263 | PDF Compare (page images) | H | `/pdf` | PDF Tools |
| P264 | Regex Cheatsheet by Language Flavor; Regex for SQL LIKE Converter | E | `/tools` | Programming Language Tools, SQL & Databases |
| P265 | Essay Word Target Tracker; Periodic Table Quiz | E | `/calculators` | Student Tools |
| P266 | AMP Remover / HTML Cleaner; ARIA Role Reference | E | `/tools` | Accessibility Tools, Web & HTML |
| P267 | Protobuf Formatter | H | `/tools` | Code Formatters |
| P268 | Lighthouse Metric Glossary; Country Codes Lookup (ISO) | E | `/tools` | Developer Advanced, Education & Reference |
| P269 | Currency Codes Lookup | E | `/tools` | Education & Reference |
| P270 | Dice Roller | E | `/calculators` | Math & Calculators |
| P271 | PDF Form Filler (basic AcroForm) | H | `/pdf` | PDF Tools |
| P272 | PDF Metadata Editor | H | `/pdf` | PDF Tools |
| P273 | PDF Page Number Add | H | `/pdf` | PDF Tools |
| P274 | Cookie String Parser | E | `/tools` | Privacy Utilities |
| P275 | Mongo Query to SQL (limited) | H | `/tools` | SQL & Databases |
| P276 | CSV to Chart; Descriptive Stats Calculator | E/M | `/calculators` | Statistics & Charts |
| P277 | Z-Score Calculator | E | `/calculators` | Statistics & Charts |
| P278 | Color Blind Safe Palette Test | M | `/tools` | Accessibility Tools |
| P279 | Angle Converter; Scientific Notation Converter | E | `/convert` | Converters (Units & Misc) |
| P280 | Cache-Control Playground; HTTP Caching Header Builder | M | `/tools` | Developer Advanced |
| P281 | Water Intake Estimator | E | `/calculators` | Health & Everyday |
| P282 | Image Diff (pixel) | H | `/image` | Image Tools |
| P283 | Exponent Calculator; Factorial Calculator; Logarithm Calculator | E | `/calculators` | Math & Calculators |
| P284 | Prime Checker; Prime Factors; Square Root / Nth Root | E | `/calculators` | Math & Calculators |
| P285 | Index Recommendation Heuristic | H | `/tools` | SQL & Databases |
| P286 | PGP Message Explainer (structure) | H | `/tools` | Security & Crypto (educational, client) |
| P287 | A/B Test Significance Calculator | M | `/calculators` | Statistics & Charts |
| P288 | Prompt Template Library | E | `/tools` | AI Prompts (no inference) |
| P289 | Round Avatar Crop | E | `/image` | Image Advanced |
| P290 | Binary Search Visualizer | M | `/interview` | Interview & DSA |
| P291 | WhatsApp Link Generator; JSON → Zod Schema | E/M | `/tools` | Miscellaneous High-SEO, Programming Language Tools |
| P292 | Sample Size Calculator; Study Schedule Generator | M | `/calculators` | Statistics & Charts, Student Tools |
| P293 | Bundle Size Analyzer (upload stats.json) | M | `/tools` | Developer Advanced |
| P294 | Background Remover (manual mask) | H | `/image` | Image Advanced |
| P295 | Behavioral STAR Answer Template | E | `/interview` | Interview & DSA |
| P296 | Linear Equation Solver (2 var) | M | `/calculators` | Math & Calculators |
| P297 | YouTube Thumbnail Downloader (client URL parse) | E | `/tools` | Miscellaneous High-SEO |
| P298 | Histogram Generator; Scatter Plot Maker | E/M | `/calculators` | Statistics & Charts |
| P299 | Font Size Readability Checker | E | `/tools` | Accessibility Tools |
| P300 | Event Loop Visualizer | H | `/tools` | Developer Advanced |
| P301 | Specificity Battle; Flag Quiz | E | `/tools` | Developer Advanced, Education & Reference |
| P302 | Timezone Database Browser; Unicode Character Search | M | `/tools` | Education & Reference |
| P303 | World Capitals Quiz | E | `/tools` | Education & Reference |
| P304 | BST Visualizer | H | `/interview` | Interview & DSA |
| P305 | Graph Traversal Visualizer | H | `/interview` | Interview & DSA |
| P306 | Pathfinding Visualizer (A*/Dijkstra) | H | `/interview` | Interview & DSA |
| P307 | Stack / Queue Visualizer | E | `/interview` | Interview & DSA |
| P308 | GraphQL Query Formatter | E | `/tools` | Programming Language Tools |
| P309 | JavaScript Playground (sandboxed) | H | `/tools` | Programming Language Tools |
| P310 | TypeScript Playground (lite) | H | `/tools` | Programming Language Tools |
| P311 | Confidence Interval Calculator; Linear Regression (2D) | M | `/calculators` | Statistics & Charts |
| P312 | P-Value from Z (tables) | M | `/calculators` | Statistics & Charts |
| P313 | Keyword Stuffing Checker; Sequence Diagram (Mermaid) | E/M | `/tools` | Diagrams, Writing & Content |
| P314 | Multiplication Practice; Sign Language Alphabet (images) | E | `/tools` | Education & Reference |
| P315 | HEIC to JPG (if support) | H | `/image` | Image Advanced |
| P316 | Interview Question Timer; Resume Bullet Rewriter (rules-based, no AI) | E/M | `/interview` | Interview & DSA |
| P317 | Two's Complement Visualizer | E | `/interview` | Interview & DSA |
| P318 | Determinant Calculator; Vector Calculator | M | `/calculators` | Math & Calculators |
| P319 | Words to Number | M | `/calculators` | Math & Calculators |
| P320 | WebSocket Message Frame Explainer | H | `/tools` | Networking & HTTP |
| P321 | Regex → JS Code Generator; Prompt Improver Checklist | E | `/tools` | AI Prompts (no inference), Programming Language Tools |
| P322 | System Prompt Builder; File Hash (drag-drop) | E/M | `/tools` | AI Prompts (no inference), Compression & Files |
| P323 | Package.json Dependency Visualizer; Flight Phonetics / NATO | E/M | `/tools` | Developer Advanced, Education & Reference |
| P324 | Language Codes (ISO 639); Phonetic Alphabet Converter | E | `/tools` | Education & Reference |
| P325 | Image Upscale (simple bilinear) | M | `/image` | Image Advanced |
| P326 | Sprite Sheet Slicer | H | `/image` | Image Tools |
| P327 | PDF Flatten Annotations (limited) | H | `/pdf` | PDF Tools |
| P328 | Local Storage Inspector UI; Escape Sequence Tester | E | `/tools` | Privacy Utilities, Programming Language Tools |
| P329 | Sentence Length Visualizer; Token Count Estimator (heuristic) | E/M | `/tools` | AI Prompts (no inference), Writing & Content |
| P330 | ER Diagram Builder | H | `/tools` | Diagrams |
| P331 | Flowchart Maker (simple) | H | `/tools` | Diagrams |
| P332 | Mind Map (basic) | H | `/tools` | Diagrams |
| P333 | Resistor Color Code | E | `/calculators` | Electronics & Engineering |
| P334 | Image Collage Maker | H | `/image` | Image Advanced |
| P335 | Eisenhower Matrix; Google Maps Link Builder | E | `/tools` | Miscellaneous High-SEO |
| P336 | Box Plot from Data | M | `/calculators` | Statistics & Charts |
| P337 | Content Outline Generator (rules); Focus Order Visualizer (paste HTML) | M | `/tools` | Accessibility Tools, Writing & Content |
| P338 | ZIP Creator (client) | H | `/tools` | Compression & Files |
| P339 | ZIP Extractor (client) | H | `/tools` | Compression & Files |
| P340 | Multipart Form Data Builder; z-index Stacking Context Demo | M | `/tools` | Developer Advanced |
| P341 | Gantt Lite | H | `/tools` | Diagrams |
| P342 | Timeline Maker; Venn Diagram Maker | M | `/tools` | Diagrams |
| P343 | Linked List Visualizer | M | `/interview` | Interview & DSA |
| P344 | Cookie Policy Outline; Privacy Policy Section Outline | E | `/tools` | Legal / Docs Utilities |
| P345 | SRT to VTT Converter; VTT to SRT | E | `/tools` | Media (light) |
| P346 | CMYK to RGB Approx; DPI / PPI Calculator; Pixels to Inches | E | `/tools` | Printing & Paper |
| P347 | Print Size Calculator; RGB to CMYK Approx | E | `/tools` | Printing & Paper |
| P348 | Canvas Fingerprint Demo; OpenAPI Snippet Viewer | M | `/tools` | Privacy Utilities, Programming Language Tools |
| P349 | Chi-Square Calculator; Correlation Calculator | M | `/calculators` | Statistics & Charts |
| P350 | Passive Voice Detector (rules); Gzip Compress Text | E/M | `/tools` | Compression & Files, Writing & Content |
| P351 | Position Size Calculator | E | `/calculators` | Crypto Markets Static |
| P352 | CSS Cascade Layers Explainer; Braille Translator (basic) | M | `/tools` | Developer Advanced, Education & Reference |
| P353 | Ohm's Law Calculator | E | `/calculators` | Electronics & Engineering |
| P354 | Pixel Art Scaler (nearest) | E | `/image` | Image Advanced |
| P355 | YouTube Timestamp Link Builder | E | `/tools` | Miscellaneous High-SEO |
| P356 | DOCX Text Extract (client mammoth) | H | `/pdf` | PDF Advanced & Office |
| P357 | DOCX to HTML (mammoth) | H | `/pdf` | PDF Advanced & Office |
| P358 | PDF Combine Images Mixed | H | `/pdf` | PDF Advanced & Office |
| P359 | Clipboard History (session only); Country Info Lookup | E/M | `/tools` | Countries & Geo, Privacy Utilities |
| P360 | Country to Currency Map; Dialing Codes Lookup; Lat/Long Converter (DMS) | E | `/tools` | Countries & Geo |
| P361 | Content-Type Sniffer Educational; Import Cost Estimator (heuristic) | E/M | `/tools` | Developer Advanced |
| P362 | Lockfile Diff (package-lock) | M | `/tools` | Developer Advanced |
| P363 | Promise Timeline Visualizer | H | `/tools` | Developer Advanced |
| P364 | Source Map Consumer Viewer | H | `/tools` | Developer Advanced |
| P365 | DP Grid Visualizer | H | `/interview` | Interview & DSA |
| P366 | Heap Visualizer | H | `/interview` | Interview & DSA |
| P367 | Recursion Tree Visualizer | H | `/interview` | Interview & DSA |
| P368 | Social Bio Character Counter; Tweet Length Counter | E | `/tools` | Miscellaneous High-SEO |
| P369 | Wheel of Names Advanced; Paper Size Reference (A4/Letter) | E/M | `/tools` | Miscellaneous High-SEO, Printing & Paper |
| P370 | Referrer Policy Explainer | E | `/tools` | Privacy Utilities |
| P371 | WebRTC Leak Demo (local) | H | `/tools` | Privacy Utilities |
| P372 | File Size Converter Display; MIME from Extension | E | `/tools` | Compression & Files |
| P373 | Recipe Scaler | E | `/calculators` | Cooking & Lifestyle |
| P374 | Polaroid Frame Generator | M | `/image` | Image Advanced |
| P375 | Video Thumbnail Capture; Calendar .ics Generator | M | `/tools` | Media (light), Miscellaneous High-SEO |
| P376 | Habit Tracker (local); Pomodoro + Task List | M | `/tools` | Miscellaneous High-SEO |
| P377 | vCard Generator | M | `/tools` | Miscellaneous High-SEO |
| P378 | Air Fryer Converter; Coffee Ratio Calculator | E | `/calculators` | Cooking & Lifestyle |
| P379 | Distance Between Cities (static coords); Memory Match Game | E/M | `/tools` | Countries & Geo, Education & Reference |
| P380 | Pixelate Region Tool | M | `/image` | Image Advanced |
| P381 | Subtitle SRT Editor; Video Metadata Viewer | M | `/tools` | Media (light) |
| P382 | Amazon Affiliate Link Cleaner | E | `/tools` | Miscellaneous High-SEO |
| P383 | Markdown Resume to PDF | H | `/tools` | Miscellaneous High-SEO |
| P384 | Random Team Generator; Guitar Capo Transposer | E | `/tools` | Miscellaneous High-SEO, Music |
| P385 | Scale Generator | E | `/tools` | Music |
| P386 | Plate Calculator (barbell) | E | `/calculators` | Sports |
| P387 | Few-shot Example Formatter; Prompt Diff; Prompt Variable Filler | E | `/tools` | AI Prompts (no inference) |
| P388 | RAG Chunk Size Estimator | E | `/tools` | AI Prompts (no inference) |
| P389 | Concrete Volume Calculator; Paint Coverage Calculator; Roof Pitch Calculator | E | `/calculators` | Construction & DIY |
| P390 | Tile Calculator; Cooking Unit Converter | E | `/calculators` | Construction & DIY, Cooking & Lifestyle |
| P391 | GeoJSON Viewer | M | `/tools` | Countries & Geo |
| P392 | APY to APR Converter; DCA Schedule Calculator; Gas Fee Unit Converter (Gwei) | E | `/calculators` | Crypto Markets Static |
| P393 | Risk/Reward Calculator; Wallet Address Checksum (ETH) | E | `/calculators` | Crypto Markets Static |
| P394 | Architecture Box Diagram | H | `/tools` | Diagrams |
| P395 | LED Resistor Calculator; Voltage Divider | E | `/calculators` | Electronics & Engineering |
| P396 | Dithering Converter | M | `/image` | Image Advanced |
| P397 | Invoice PDF Generator (client) | H | `/tools` | Legal / Docs Utilities |
| P398 | Big Number Arithmetic | M | `/calculators` | Math & Calculators |
| P399 | Audio Trim (WebAudio) | H | `/tools` | Media (light) |
| P400 | LinkedIn Post Formatter; Telegram Link Generator | E | `/tools` | Miscellaneous High-SEO |
| P401 | XLSX Sheet Lister | M | `/pdf` | PDF Advanced & Office |
| P402 | Cricket Run Rate Calculator; Net Run Rate Calculator; One-Rep Max Calculator | E | `/calculators` | Sports |
| P403 | Chat Transcript Cleaner; Reduced Motion Preview Toggle | E | `/tools` | AI Prompts (no inference), Accessibility Tools |
| P404 | Duplicate File Finder (hash local) | H | `/tools` | Compression & Files |
| P405 | Org Chart Builder | H | `/tools` | Diagrams |
| P406 | Wireframe Blocks (low-fi) | H | `/tools` | Diagrams |
| P407 | Chroma Key Simple | H | `/image` | Image Advanced |
| P408 | Image Histogram | M | `/image` | Image Advanced |
| P409 | NDA Clause Checklist (educational); Terms Outline Generator | E | `/tools` | Legal / Docs Utilities |
| P410 | Bitcoin URI Generator; Hashtag Counter; PayPal.me Link Builder | E | `/tools` | Miscellaneous High-SEO |
| P411 | SMS Link Generator; Secret Santa Shuffler; mailto Link Generator | E | `/tools` | Miscellaneous High-SEO |
| P412 | BPM Tap Tempo; Business Card Size Templates | E | `/tools` | Music, Printing & Paper |
| P413 | Permissions API Demo; Bytecode / Opcode Reference | E | `/tools` | Privacy Utilities, Programming Language Tools |
| P414 | String Template Interpolator; Quote Case Formatter | E | `/tools` | Programming Language Tools, Writing & Content |
| P415 | Screen Reader Announcement Simulator | H | `/tools` | Accessibility Tools |
| P416 | Huffman Coding Visualizer | H | `/tools` | Compression & Files |
| P417 | Wattage to Amps; Oven Temperature Converter | E | `/calculators` | Construction & DIY, Cooking & Lifestyle |
| P418 | Tip Split with Tax; Frequency Wavelength | E | `/calculators` | Cooking & Lifestyle, Electronics & Engineering |
| P419 | Power Calculator (V/I/R); dB Converter | E | `/calculators` | Electronics & Engineering |
| P420 | Animated WebP Split | H | `/image` | Image Advanced |
| P421 | TIFF to PNG (limited) | H | `/image` | Image Advanced |
| P422 | Circle of Fifths Interactive | M | `/tools` | Music |
| P423 | PDF Crop Margins | H | `/pdf` | PDF Advanced & Office |
| P424 | PDF Grayscale Convert | H | `/pdf` | PDF Advanced & Office |
| P425 | PPTX Text Extract | H | `/pdf` | PDF Advanced & Office |
| P426 | Heart Rate Training Zones; Pace to Finish Time | E | `/calculators` | Sports |
| P427 | Tree-shaking Demo; Word to Minutes Estimator | E/M | `/tools` | Developer Advanced, Legal / Docs Utilities |
| P428 | Bracket Generator; Chord Finder | M | `/tools` | Miscellaneous High-SEO, Music |
| P429 | Piano Chord Diagram | M | `/tools` | Music |
| P430 | HVAC BTU Estimator; Stair Stringer Calculator | M | `/calculators` | Construction & DIY |
| P431 | Impermanent Loss Calculator; Liquidation Price Estimator | M | `/calculators` | Crypto Markets Static |
| P432 | Decision Matrix Maker; Markdown Notes (local) | M | `/tools` | Miscellaneous High-SEO |
| P433 | Countdown to Event Page | E | `/calculators` | Cooking & Lifestyle |
| P434 | GeoJSON to CSV Points; ETag Simulator | M | `/tools` | Countries & Geo, Developer Advanced |
| P435 | Name Picker Wheel; Receipt Generator | E/M | `/tools` | Games & Fun, Legal / Docs Utilities |
| P436 | Audio Format Info | M | `/tools` | Media (light) |
| P437 | Whiteboard Lite | H | `/tools` | Miscellaneous High-SEO |
| P438 | Metronome | M | `/tools` | Music |
| P439 | Tuner (mic WebAudio) | H | `/tools` | Music |
| P440 | Bleed & Margin Guide Generator; Paraphrase Distance Meter | M | `/tools` | Printing & Paper, Writing & Content |
| P441 | Board Feet Calculator; Fence Post Calculator; Mulch Calculator | E | `/calculators` | Construction & DIY |
| P442 | Baking Pan Size Converter; Battery Life Estimator | E | `/calculators` | Cooking & Lifestyle, Electronics & Engineering |
| P443 | RC Time Constant; Transformer Turns Ratio; Wire Gauge Calculator | E | `/calculators` | Electronics & Engineering |
| P444 | Business Card Designer (print CSS) | H | `/tools` | Legal / Docs Utilities |
| P445 | Audio Waveform from File | H | `/tools` | Media (light) |
| P446 | GIF Frame Viewer | H | `/tools` | Media (light) |
| P447 | Simple Kanban (local) | H | `/tools` | Miscellaneous High-SEO |
| P448 | Interval Calculator | E | `/tools` | Music |
| P449 | Office MIME Detector | E | `/pdf` | PDF Advanced & Office |
| P450 | PDF Booklet Imposition | H | `/pdf` | PDF Advanced & Office |
| P451 | March Madness Bracket Printer; Race Predictor (Riegel) | E/M | `/calculators` | Sports |
| P452 | Grocery Split Calculator | E | `/calculators` | Cooking & Lifestyle |
| P453 | Text Compression Ratio Demo | M | `/tools` | Compression & Files |
| P454 | Glitch Art Generator | M | `/image` | Image Advanced |
| P455 | MIDI Note Number Converter | E | `/tools` | Music |
| P456 | EPUB Metadata Viewer | H | `/pdf` | PDF Advanced & Office |
| P457 | LZW Demo Visualizer | H | `/tools` | Compression & Files |
| P458 | Macro from Recipe Estimator; Bech32 Address Viewer (educational) | M | `/calculators` | Cooking & Lifestyle, Crypto Markets Static |
| P459 | Funding Rate PnL Estimator; Three-Phase Power Calculator | M | `/calculators` | Crypto Markets Static, Electronics & Engineering |
| P460 | Jailbreak Pattern Educators (safe); Bounding Box Calculator | E/M | `/tools` | AI Prompts (no inference), Countries & Geo |
| P461 | Coin Flip / Decision Wheel | E | `/tools` | Games & Fun |
| P462 | Sudoku Generator / Solver | H | `/tools` | Games & Fun |
| P463 | Instagram Username Checker Style; Invoice Number Generator | E | `/tools` | Miscellaneous High-SEO |
| P464 | Football Score Probability (simple) | M | `/calculators` | Sports |
| P465 | Nine-patch Preview | H | `/image` | Image Advanced |
| P466 | Meme Text Overlay (image); Map Tile Coordinate Converter | M | `/tools` | Countries & Geo, Games & Fun |
| P467 | 2048; Wordle Clone (daily static) | M | `/tools` | Games & Fun |
| P468 | Color from Video Frame | H | `/tools` | Media (light) |
| P469 | BMI for Athletes Note | E | `/calculators` | Sports |
| P470 | Hangman; Tic Tac Toe; Rock Paper Scissors | E | `/tools` | Games & Fun |
| P471 | Yes/No Oracle; Minesweeper | E/M | `/tools` | Games & Fun |
| P472 | Snake | M | `/tools` | Games & Fun |

### Per-phase checklist template

Copy for the phase you are on:

```markdown
### P0XX — <date>
- [ ] Implement tool engine(s) client-side
- [ ] Wire ToolShell + registry status=shipped
- [ ] FAQ + related tools + meta description
- [ ] Manual QA mobile + desktop
- [ ] Commit: `feat(tools): ship <slugs>`
- [ ] Production URL(s) verified
```

---

## Block C — Hub interludes (insert after first tool in each category)

When a category first appears in Block B, schedule the matching **H** phase the **next day** (or same week). Do not wait until the category is “done.”

| Hub phase | After tool phase | Category | Deliverable |
|---|---|---|---|
| H001 | P001 | JSON & Data Formats | Hub copy for `/tools` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H002 | P002 | Encoding & Hashing | Hub copy for `/tools` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H003 | P004 | Text Tools | Hub copy for `/tools` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H004 | P006 | QR & Barcodes | Hub copy for `/tools` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H005 | P007 | Converters (Units & Misc) | Hub copy for `/convert` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H006 | P008 | Regex & Text | Hub copy for `/tools` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H007 | P009 | Code Formatters | Hub copy for `/tools` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H008 | P012 | Colors | Hub copy for `/tools` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H009 | P013 | Generators | Hub copy for `/tools` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H010 | P015 | Math & Calculators | Hub copy for `/calculators` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H011 | P015 | Finance Calculators | Hub copy for `/calculators` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H012 | P017 | Date & Time | Hub copy for `/tools` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H013 | P020 | Image Tools | Hub copy for `/image` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H014 | P024 | PDF Tools | Hub copy for `/pdf` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H015 | P032 | Health & Everyday | Hub copy for `/calculators` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H016 | P032 | Student Tools | Hub copy for `/calculators` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H017 | P033 | Web & HTML | Hub copy for `/tools` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H018 | P033 | CSV & Spreadsheets | Hub copy for `/tools` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H019 | P038 | CSS & Design Dev | Hub copy for `/tools` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H020 | P041 | Security & Crypto (educational, client) | Hub copy for `/tools` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H021 | P043 | Markdown & Docs | Hub copy for `/tools` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H022 | P044 | SQL & Databases | Hub copy for `/tools` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H023 | P047 | Git & DevOps | Hub copy for `/tools` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H024 | P055 | Networking & HTTP | Hub copy for `/tools` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H025 | P056 | XML & YAML & Config | Hub copy for `/tools` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H026 | P159 | Education & Reference | Hub copy for `/tools` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H027 | P162 | Accessibility Tools | Hub copy for `/tools` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H028 | P173 | Interview & DSA | Hub copy for `/interview` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H029 | P224 | Developer Advanced | Hub copy for `/tools` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H030 | P231 | Privacy Utilities | Hub copy for `/tools` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H031 | P233 | Statistics & Charts | Hub copy for `/calculators` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H032 | P236 | Writing & Content | Hub copy for `/tools` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H033 | P264 | Programming Language Tools | Hub copy for `/tools` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H034 | P288 | AI Prompts (no inference) | Hub copy for `/tools` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H035 | P289 | Image Advanced | Hub copy for `/image` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H036 | P291 | Miscellaneous High-SEO | Hub copy for `/tools` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H037 | P313 | Diagrams | Hub copy for `/tools` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H038 | P322 | Compression & Files | Hub copy for `/tools` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H039 | P333 | Electronics & Engineering | Hub copy for `/calculators` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H040 | P344 | Legal / Docs Utilities | Hub copy for `/tools` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H041 | P345 | Media (light) | Hub copy for `/tools` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H042 | P346 | Printing & Paper | Hub copy for `/tools` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H043 | P351 | Crypto Markets Static | Hub copy for `/calculators` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H044 | P356 | PDF Advanced & Office | Hub copy for `/pdf` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H045 | P359 | Countries & Geo | Hub copy for `/tools` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H046 | P373 | Cooking & Lifestyle | Hub copy for `/calculators` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H047 | P384 | Music | Hub copy for `/tools` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H048 | P386 | Sports | Hub copy for `/calculators` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H049 | P389 | Construction & DIY | Hub copy for `/calculators` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |
| H050 | P435 | Games & Fun | Hub copy for `/tools` filter or `/…` category section: intro, 5 FAQs, links to shipped tools only, schema ItemList |

---

## Block D — SEO / content cadence (every 5 tool days)

After every **5 completed P-phases**, spend the next day on an **S** phase instead of more tools:

| S phase pattern | Work |
|---|---|
| S-a | 1 comparison or alternative page (e.g. “privacy-friendly JSONLint alternative”) |
| S-b | 1 how-to guide linking 3+ shipped tools |
| S-c | Internal linking pass + FAQ upgrade on top 5 pages by impressions |
| S-d | CWV / bundle audit; fix regressions |
| S-e | Update homepage featured row + changelog |

At 472 tool phases → roughly **94** S-days interleaved.

Suggested numbering: `S001` after `P005`, `S002` after `P010`, …

---

## Block E — Monetization & polish (only after traffic)

Do **not** start these until ~P050+ tools shipped **and** Search Console shows consistent impressions.

- [ ] **M001** — Ad slot components (empty, feature-flagged off)
- [ ] **M002** — AdSense application prep: content density audit
- [ ] **M003** — Enable ads on low-intent pages only (guides first)
- [ ] **M004** — Affiliate disclosure + 1 hosting affiliate test
- [ ] **M005** — Affiliate: design tool or VPN (labeled)
- [ ] **M006** — Donate / Sponsors page
- [ ] **M007** — Gumroad templates store (3 packs)
- [ ] **M008** — Forge Plus landing (ad-free) — waitlist only
- [ ] **M009** — Embeddable calculator widget MVP
- [ ] **M010** — PWA offline shell for top 20 tools
- [ ] **M011** — Localization spike (1 locale, 10 tools)
- [ ] **M012** — Performance budget CI enforcement
- [ ] **M013** — Accessibility audit pass (axe on top 30)
- [ ] **M014** — Deprecate/noindex zero-impression tools (>9 months)
- [ ] **M015** — Year-1 retrospective → revise this plan

---

## Suggested calendar rhythm

```
Week pattern (example):
  Mon  P-phase (tools)
  Tue  P-phase
  Wed  P-phase
  Thu  P-phase
  Fri  P-phase OR S-phase (every other Friday = SEO)
  Sat  optional Hard catch-up / H-hub
  Sun  off OR content only
```

| Milestone | Target phase | Live on site |
|---|---|---|
| **Hostable** | F04 | Homepage + chrome |
| Soft launch | P010 | ~20–30 tools |
| Public launch (PH/HN) | ~P025–P035 | First-50 cluster mostly done |
| PDF privacy beachhead | first PDF Merge phase | Marketing angle live |
| Calculator engine | first finance/unit phases | Template reuse proven |
| 100 tools | ~P040–P060 (depends on batching) | Real SEO flywheel |
| 300 tools | mid Block B | Authority expanding carefully |
| 755 tools | end of Block B | Full backlog cleared or consciously cut |

---

## Slug registry (all 755)

Use these slugs in `content/tools/*.json`. Adjust only with redirects.

| # | Phase | Slug | Family | Diff | SEO | Tool |
|---|---|---|---|---|---|---|
| 1 | P001 | `json-formatter-beautifier` | tools | E | H | JSON Formatter / Beautifier |
| 2 | P001 | `json-validator` | tools | E | H | JSON Validator |
| 3 | P002 | `base64-encode-decode` | tools | E | H | Base64 Encode / Decode |
| 4 | P002 | `url-encode-decode` | tools | E | H | URL Encode / Decode |
| 5 | P002 | `uuid-v4-generator` | tools | E | H | UUID v4 Generator |
| 6 | P003 | `jwt-decoder` | tools | E | H | JWT Decoder |
| 7 | P003 | `sha-256-hash` | tools | E | H | SHA-256 Hash |
| 8 | P003 | `md5-hash-generator` | tools | E | H | MD5 Hash Generator |
| 9 | P004 | `case-converter` | tools | E | H | Case Converter (upper/lower/title/camel/snake/kebab) |
| 10 | P004 | `word-counter` | tools | E | H | Word Counter |
| 11 | P004 | `character-counter` | tools | E | H | Character Counter |
| 12 | P005 | `slug-generator` | tools | E | H | Slug Generator |
| 13 | P005 | `random-password-generator` | tools | E | H | Random Password Generator |
| 14 | P006 | `qr-code-generator` | tools | E | H | QR Code Generator |
| 15 | P007 | `unix-timestamp-converter` | convert | E | H | Unix Timestamp Converter |
| 16 | P007 | `cron-expression-explainer` | convert | M | H | Cron Expression Explainer |
| 17 | P008 | `text-diff` | tools | M | H | Text Diff (side-by-side) |
| 18 | P008 | `markdown-preview` | tools | E | H | Markdown Preview |
| 19 | P009 | `html-formatter` | tools | E | H | HTML Formatter |
| 20 | P009 | `css-formatter` | tools | E | H | CSS Formatter |
| 21 | P009 | `css-minifier` | tools | E | H | CSS Minifier |
| 22 | P010 | `sql-formatter` | tools | E | H | SQL Formatter |
| 23 | P010 | `yaml-to-json` | tools | E | H | YAML to JSON |
| 24 | P011 | `json-to-yaml` | tools | E | H | JSON to YAML |
| 25 | P011 | `csv-to-json` | tools | E | H | CSV to JSON |
| 26 | P011 | `json-to-csv` | tools | E | H | JSON to CSV |
| 27 | P012 | `lorem-ipsum-generator` | tools | E | H | Lorem Ipsum Generator |
| 28 | P012 | `color-contrast-checker` | tools | E | H | Color Contrast Checker (WCAG) |
| 29 | P013 | `hex-to-rgb` | tools | E | H | HEX to RGB |
| 30 | P013 | `gitignore-generator` | tools | E | H | Gitignore Generator |
| 31 | P014 | `number-base-converter` | convert | E | H | Number Base Converter (2/8/10/16) |
| 32 | P015 | `percentage-calculator` | calculators | E | H | Percentage Calculator |
| 33 | P015 | `tip-calculator` | calculators | E | H | Tip Calculator |
| 34 | P016 | `emi-loan-calculator` | calculators | E | H | EMI / Loan Calculator |
| 35 | P017 | `age-calculator` | tools | E | H | Age Calculator |
| 36 | P018 | `timezone-converter` | convert | M | H | Timezone Converter |
| 37 | P019 | `regex-tester` | tools | M | H | Regex Tester |
| 38 | P020 | `image-resizer` | image | M | H | Image Resizer |
| 39 | P020 | `png-to-jpg` | image | E | H | PNG to JPG |
| 40 | P021 | `jpg-to-png` | image | E | H | JPG to PNG |
| 41 | P021 | `webp-converter` | image | M | H | WebP Converter |
| 42 | P022 | `image-compressor` | image | M | H | Image Compressor |
| 43 | P022 | `exif-remover` | image | M | H | EXIF Remover |
| 44 | P023 | `favicon-generator-from-image` | image | M | H | Favicon Generator from Image |
| 45 | P024 | `images-to-pdf` | pdf | M | H | Images to PDF |
| 46 | P025 | `pdf-merge` | pdf | H | H | PDF Merge |
| 47 | P026 | `pdf-split` | pdf | H | H | PDF Split |
| 48 | P027 | `pdf-rotate` | pdf | M | H | PDF Rotate |
| 49 | P028 | `pdf-to-images` | pdf | H | H | PDF to Images |
| 50 | P029 | `unit-converter` | convert | E | H | Unit Converter (length) |
| 51 | P029 | `unit-converter` | convert | E | H | Unit Converter (weight) |
| 52 | P029 | `unit-converter` | convert | E | H | Unit Converter (temperature) |
| 53 | P030 | `unit-converter` | convert | E | H | Unit Converter (data storage) |
| 54 | P031 | `gst-sales-tax-calculator` | calculators | E | H | GST / Sales Tax Calculator |
| 55 | P031 | `sip-calculator` | calculators | E | H | SIP Calculator |
| 56 | P032 | `bmi-calculator` | calculators | E | H | BMI Calculator |
| 57 | P032 | `gpa-calculator` | calculators | E | H | GPA Calculator |
| 58 | P033 | `meta-tags-preview` | tools | E | H | Meta Tags Preview (SERP) |
| 59 | P033 | `csv-viewer-table` | tools | E | H | CSV Viewer / Table |
| 60 | P034 | `csv-to-json` | tools | E | H | CSV to JSON (advanced options) |
| 61 | P034 | `password-strength-meter` | tools | E | H | Password Strength Meter |
| 62 | P035 | `markdown-to-html` | tools | E | H | Markdown to HTML |
| 63 | P035 | `javascript-beautifier` | tools | E | H | JavaScript Beautifier |
| 64 | P036 | `javascript-minifier` | tools | E | H | JavaScript Minifier |
| 65 | P036 | `date-difference-calculator` | tools | E | H | Date Difference Calculator |
| 66 | P037 | `regex-cheatsheet-interactive` | tools | E | H | Regex Cheatsheet Interactive |
| 67 | P037 | `json-minifier` | tools | E | H | JSON Minifier |
| 68 | P038 | `css-box-shadow-generator` | tools | E | H | CSS Box Shadow Generator |
| 69 | P038 | `css-gradient-generator` | tools | E | H | CSS Gradient Generator |
| 70 | P039 | `csv-to-excel-client-side` | tools | M | H | CSV to Excel (XLSX) client-side |
| 71 | P039 | `excel-to-csv` | tools | M | H | Excel to CSV |
| 72 | P040 | `fake-credit-card` | tools | E | H | Fake Credit Card (test numbers only) |
| 73 | P040 | `open-graph-meta-generator` | tools | E | H | Open Graph Meta Generator |
| 74 | P041 | `text-diff` | tools | M | H | Text Diff (inline) |
| 75 | P041 | `password-generator` | tools | E | H | Password Generator (advanced options) |
| 76 | P042 | `color-picker` | tools | E | H | Color Picker |
| 77 | P042 | `fake-user-json-generator` | tools | E | H | Fake User JSON Generator |
| 78 | P043 | `readme-generator` | tools | E | H | README Generator |
| 79 | P043 | `readme-badges-generator` | tools | E | H | Readme Badges Generator |
| 80 | P044 | `sql-formatter` | tools | E | H | SQL Formatter (advanced) |
| 81 | P044 | `keyword-density-checker` | tools | E | H | Keyword Density Checker |
| 82 | P045 | `markdown-table-generator` | tools | E | H | Markdown Table Generator |
| 83 | P045 | `rgb-to-hex` | tools | E | H | RGB to HEX |
| 84 | P046 | `pomodoro-timer` | tools | E | H | Pomodoro Timer |
| 85 | P046 | `fake-address-generator` | tools | E | H | Fake Address Generator |
| 86 | P047 | `fake-name-generator` | tools | E | H | Fake Name Generator |
| 87 | P047 | `git-cheat-sheet-interactive` | tools | E | H | Git Cheat Sheet Interactive |
| 88 | P048 | `git-command-explorer` | tools | E | H | Git Command Explorer |
| 89 | P048 | `html-minifier` | tools | E | H | HTML Minifier |
| 90 | P049 | `add-subtract-dates` | tools | E | H | Add / Subtract Dates |
| 91 | P049 | `meeting-time-planner` | tools | M | H | Meeting Time Planner (multi-TZ) |
| 92 | P050 | `time-duration-calculator` | tools | E | H | Time Duration Calculator |
| 93 | P050 | `world-clock` | tools | E | H | World Clock |
| 94 | P051 | `html-entity-encode-decode` | tools | E | H | HTML Entity Encode / Decode |
| 95 | P051 | `sha-1-hash` | tools | E | H | SHA-1 Hash |
| 96 | P052 | `fake-email-generator` | tools | E | H | Fake Email Generator (local) |
| 97 | P052 | `license-text-generator` | tools | E | H | License Text Generator |
| 98 | P052 | `sitemap-xml-generator` | tools | E | H | Sitemap XML Generator (manual URLs) |
| 99 | P053 | `htaccess-redirect-generator` | tools | E | H | htaccess Redirect Generator |
| 100 | P053 | `robots-txt-generator` | tools | E | H | robots.txt Generator |
| 101 | P054 | `json-to-xml` | tools | E | H | JSON to XML |
| 102 | P054 | `xml-to-json` | tools | E | H | XML to JSON |
| 103 | P055 | `http-status-code-reference` | tools | E | H | HTTP Status Code Reference |
| 104 | P055 | `remove-duplicate-lines` | tools | E | H | Remove Duplicate Lines |
| 105 | P056 | `sort-lines` | tools | E | H | Sort Lines |
| 106 | P056 | `xml-formatter` | tools | E | H | XML Formatter |
| 107 | P057 | `yaml-formatter` | tools | E | H | YAML Formatter |
| 108 | P057 | `css-flexbox-playground` | tools | M | H | CSS Flexbox Playground |
| 109 | P058 | `css-grid-playground` | tools | M | H | CSS Grid Playground |
| 110 | P058 | `palette-from-image` | tools | M | H | Palette from Image |
| 111 | P059 | `qr-code-reader` | tools | M | H | QR Code Reader (camera/file) |
| 112 | P059 | `wifi-qr-generator` | tools | E | H | WiFi QR Generator |
| 113 | P060 | `business-days-calculator` | tools | M | H | Business Days Calculator |
| 114 | P060 | `json-to-typescript-interface` | tools | M | H | JSON to TypeScript Interface |
| 115 | P061 | `vcard-qr-generator` | tools | E | H | vCard QR Generator |
| 116 | P061 | `glassmorphism-generator` | tools | E | H | Glassmorphism Generator |
| 117 | P062 | `csv-to-sql-insert` | tools | M | H | CSV to SQL INSERT |
| 118 | P063 | `svg-optimizer` | tools | H | H | SVG Optimizer (SVGO-like) |
| 119 | P064 | `countdown-timer-builder` | tools | E | M | Countdown Timer Builder |
| 120 | P064 | `file-checksum` | tools | M | H | File Checksum (browser) |
| 121 | P065 | `jwt-debugger-with-claims-explain` | tools | M | H | JWT Debugger with Claims Explain |
| 122 | P065 | `passphrase-generator` | tools | E | M | Passphrase Generator |
| 123 | P066 | `dockerfile-generator` | tools | M | H | Dockerfile Generator (templates) |
| 124 | P066 | `json-diff` | tools | M | H | JSON Diff |
| 125 | P067 | `html-to-markdown` | tools | M | H | HTML to Markdown |
| 126 | P067 | `reading-time-estimator` | tools | E | M | Reading Time Estimator |
| 127 | P068 | `zero-width-character-detector` | tools | E | M | Zero-Width Character Detector |
| 128 | P068 | `css-border-radius-generator` | tools | E | H | CSS Border Radius Generator |
| 129 | P069 | `csv-column-splitter` | tools | E | M | CSV Column Splitter |
| 130 | P069 | `graphql-formatter` | tools | E | M | GraphQL Formatter |
| 131 | P070 | `sql-minifier` | tools | E | M | SQL Minifier |
| 132 | P070 | `complementary-color-finder` | tools | E | H | Complementary Color Finder |
| 133 | P071 | `week-number-calculator` | tools | E | M | Week Number Calculator |
| 134 | P071 | `base64-url-safe` | tools | E | M | Base64 URL-safe |
| 135 | P072 | `sha-512-hash` | tools | E | M | SHA-512 Hash |
| 136 | P072 | `twitter-card-meta-generator` | tools | E | M | Twitter Card Meta Generator |
| 137 | P073 | `uuid-bulk-generator` | tools | E | M | UUID Bulk Generator |
| 138 | P073 | `gitignore-builder` | tools | E | H | Gitignore Builder (advanced) |
| 139 | P074 | `image-to-base64` | image | E | H | Image to Base64 |
| 140 | P075 | `mermaid-live-editor` | tools | H | H | Mermaid Live Editor (embed) |
| 141 | P076 | `find-and-replace-batch` | tools | E | M | Find & Replace Batch |
| 142 | P077 | `regex-explainer` | tools | H | H | Regex Explainer (static rules) |
| 143 | P078 | `dummy-text-generator` | tools | E | M | Dummy Text Generator (paragraphs) |
| 144 | P078 | `invisible-character-remover` | tools | E | M | Invisible Character Remover |
| 145 | P078 | `line-counter` | tools | E | M | Line Counter |
| 146 | P079 | `word-frequency-counter` | tools | E | M | Word Frequency Counter |
| 147 | P079 | `html-table-generator` | tools | E | H | HTML Table Generator |
| 148 | P080 | `csv-to-markdown` | tools | E | M | CSV to Markdown |
| 149 | P080 | `accessible-palette-generator` | tools | M | H | Accessible Palette Generator |
| 150 | P081 | `hex-to-hsl` | tools | E | H | HEX to HSL |
| 151 | P081 | `commit-message-helper` | tools | E | M | Commit Message Helper |
| 152 | P082 | `conventional-commit-builder` | tools | E | M | Conventional Commit Builder |
| 153 | P082 | `json-to-markdown-table` | tools | E | M | JSON to Markdown Table |
| 154 | P083 | `dns-record-types-cheatsheet` | tools | E | H | DNS Record Types Cheatsheet |
| 155 | P083 | `port-number-reference` | tools | E | H | Port Number Reference |
| 156 | P083 | `url-parser-builder` | tools | E | H | URL Parser / Builder |
| 157 | P084 | `user-agent-parser` | tools | E | H | User-Agent Parser |
| 158 | P084 | `sql-join-visualizer` | tools | M | H | SQL JOIN Visualizer |
| 159 | P085 | `caesar-cipher` | tools | E | M | Caesar Cipher |
| 160 | P085 | `markdown-toc-generator` | tools | E | M | Markdown TOC Generator |
| 161 | P085 | `morse-to-text` | tools | E | M | Morse to Text |
| 162 | P086 | `text-to-morse` | tools | E | M | Text to Morse |
| 163 | P086 | `html-entity-reference` | tools | E | H | HTML Entity Reference |
| 164 | P087 | `json-ld-formatter` | tools | E | H | JSON-LD Formatter |
| 165 | P087 | `csv-to-html-table` | tools | E | M | CSV to HTML Table |
| 166 | P088 | `day-of-week-finder` | tools | E | M | Day of Week Finder |
| 167 | P088 | `binary-encode-decode` | tools | E | M | Binary Encode / Decode |
| 168 | P089 | `hex-encode-decode` | tools | E | M | Hex Encode / Decode |
| 169 | P089 | `nanoid-generator` | tools | E | M | NanoID Generator |
| 170 | P089 | `ulid-generator` | tools | E | M | ULID Generator |
| 171 | P090 | `unicode-escape-unescape` | tools | E | M | Unicode Escape / Unescape |
| 172 | P090 | `api-key-style-token-generator` | tools | E | M | API Key Style Token Generator |
| 173 | P091 | `colorful-avatar-generator` | tools | M | M | Colorful Avatar Generator (SVG) |
| 174 | P091 | `lorem-picsum-alternative-placeholder` | tools | E | M | Lorem Picsum Alternative Placeholder |
| 175 | P092 | `json-escape-unescape` | tools | E | M | JSON Escape / Unescape |
| 176 | P092 | `barcode-generator` | tools | M | H | Barcode Generator (Code128) |
| 177 | P093 | `csv-to-sql-insert-bulk` | tools | M | H | CSV to SQL INSERT Bulk |
| 178 | P093 | `qr-code-for-otp-setup` | tools | M | H | QR Code for OTP Setup |
| 179 | P094 | `binary-to-text` | tools | E | M | Binary to Text |
| 180 | P094 | `remove-extra-spaces` | tools | E | M | Remove Extra Spaces |
| 181 | P094 | `reverse-text` | tools | E | M | Reverse Text |
| 182 | P095 | `text-to-binary` | tools | E | M | Text to Binary |
| 183 | P095 | `open-graph-preview` | tools | M | H | Open Graph Preview |
| 184 | P096 | `schema-markup-generator` | tools | M | H | Schema Markup Generator (FAQ/HowTo) |
| 185 | P096 | `ini-env-parser` | tools | E | M | INI / ENV Parser |
| 186 | P097 | `css-animation-keyframes-builder` | tools | M | H | CSS Animation Keyframes Builder |
| 187 | P097 | `clip-path-generator` | tools | M | H | Clip-path Generator |
| 188 | P098 | `csv-cleaner` | tools | M | M | CSV Cleaner (trim, dedupe) |
| 189 | P098 | `csv-diff` | tools | M | M | CSV Diff |
| 190 | P099 | `color-blindness-simulator` | tools | M | H | Color Blindness Simulator |
| 191 | P099 | `random-palette-generator` | tools | E | M | Random Palette Generator |
| 192 | P100 | `calendar-generator` | tools | M | M | Calendar Generator (print) |
| 193 | P100 | `docker-run-to-compose-converter` | tools | M | H | Docker Run to Compose Converter |
| 194 | P101 | `image-cropper` | image | M | H | Image Cropper |
| 195 | P102 | `json-path-tester` | tools | M | M | JSON Path Tester |
| 196 | P102 | `json-pretty-print-with-tree-view` | tools | M | M | JSON Pretty Print with Tree View |
| 197 | P103 | `cidr-calculator` | tools | M | H | CIDR Calculator |
| 198 | P103 | `fetch-to-curl-converter` | tools | M | H | Fetch to cURL Converter |
| 199 | P104 | `ssl-certificate-decoder` | tools | M | H | SSL Certificate Decoder (paste PEM) |
| 200 | P104 | `subnet-calculator` | tools | M | H | Subnet Calculator |
| 201 | P105 | `curl-to-fetch-converter` | tools | M | H | cURL to Fetch Converter |
| 202 | P105 | `grep-online` | tools | M | M | Grep Online (multiline) |
| 203 | P106 | `cors-explainer-simulator` | tools | M | H | CORS Explainer Simulator |
| 204 | P106 | `css-clamp-calculator` | tools | E | M | CSS Clamp Calculator |
| 205 | P107 | `css-filter-generator` | tools | E | M | CSS Filter Generator |
| 206 | P107 | `responsive-font-scale-calculator` | tools | E | M | Responsive Font Scale Calculator |
| 207 | P108 | `csv-merger` | tools | M | M | CSV Merger |
| 208 | P108 | `java-beautifier` | tools | M | M | Java Beautifier |
| 209 | P109 | `php-beautifier` | tools | M | M | PHP Beautifier |
| 210 | P109 | `scss-less-formatter` | tools | M | M | SCSS / LESS Formatter |
| 211 | P110 | `typescript-formatter` | tools | M | M | TypeScript Formatter |
| 212 | P110 | `gradient-from-two-colors` | tools | E | M | Gradient from Two Colors |
| 213 | P111 | `tint-shade-generator` | tools | E | M | Tint / Shade Generator |
| 214 | P111 | `triadic-analogous-generator` | tools | E | M | Triadic / Analogous Generator |
| 215 | P112 | `hmac-generator` | tools | M | M | HMAC Generator |
| 216 | P112 | `jwt-encoder` | tools | M | M | JWT Encoder (unsigned/demo) |
| 217 | P113 | `uuid-v1-v7-generator` | tools | M | M | UUID v1 / v7 Generator |
| 218 | P113 | `nginx-config-snippet-generator` | tools | M | M | Nginx Config Snippet Generator |
| 219 | P114 | `barcode-scanner` | tools | H | H | Barcode Scanner (camera) |
| 220 | P115 | `word-diff` | tools | M | M | Word Diff |
| 221 | P116 | `aes-encrypt-decrypt` | tools | H | H | AES Encrypt / Decrypt (demo WebCrypto) |
| 222 | P117 | `csp-builder` | tools | M | H | CSP Builder |
| 223 | P118 | `otp-totp-generator` | tools | H | H | OTP / TOTP Generator (local secret) |
| 224 | P119 | `rsa-keypair-generator` | tools | H | H | RSA Keypair Generator (WebCrypto) |
| 225 | P120 | `html-preview-sandbox` | tools | M | H | HTML Preview Sandbox (sandboxed iframe) |
| 226 | P120 | `xml-validator` | tools | M | M | XML Validator |
| 227 | P121 | `xml-to-csv` | tools | M | M | XML to CSV |
| 228 | P121 | `yaml-validator` | tools | M | M | YAML Validator |
| 229 | P122 | `css-to-tailwind-converter` | tools | H | H | CSS to Tailwind Converter (heuristic) |
| 230 | P123 | `pivot-table-generator` | tools | H | M | Pivot Table Generator (simple) |
| 231 | P124 | `date-to-epoch` | convert | E | H | Date to Epoch |
| 232 | P124 | `epoch-to-date` | convert | E | H | Epoch to Date |
| 233 | P125 | `compound-interest` | calculators | E | H | Compound Interest |
| 234 | P125 | `mortgage-calculator` | calculators | E | H | Mortgage Calculator |
| 235 | P126 | `identicon-generator` | tools | M | M | Identicon Generator |
| 236 | P126 | `ssh-public-key-fingerprint` | tools | E | M | SSH Public Key Fingerprint |
| 237 | P127 | `pregnancy-due-date` | calculators | E | H | Pregnancy Due Date |
| 238 | P128 | `placeholder-image-generator` | image | E | H | Placeholder Image Generator |
| 239 | P129 | `json-to-go-struct` | tools | M | M | JSON to Go Struct |
| 240 | P129 | `json-to-python-dataclass` | tools | M | M | JSON to Python Dataclass |
| 241 | P130 | `percentage-change` | calculators | E | H | Percentage Change |
| 242 | P130 | `random-number-generator` | calculators | E | H | Random Number Generator |
| 243 | P131 | `http-header-parser` | tools | E | M | HTTP Header Parser |
| 244 | P131 | `ip-address-explainer` | tools | M | H | IP Address Explainer (v4/v6 educational) |
| 245 | P132 | `query-string-builder` | tools | E | M | Query String Builder |
| 246 | P133 | `pdf-compress` | pdf | H | H | PDF Compress (basic) |
| 247 | P134 | `secure-random-bytes-generator` | tools | E | M | Secure Random Bytes Generator |
| 248 | P134 | `security-headers-checker` | tools | E | M | Security Headers Checker (paste response) |
| 249 | P135 | `cgpa-converter` | calculators | E | H | CGPA Converter |
| 250 | P136 | `anagram-finder` | tools | M | M | Anagram Finder |
| 251 | P136 | `env-diff` | tools | E | M | .env Diff |
| 252 | P137 | `css-specificity-calculator` | tools | E | M | CSS Specificity Calculator |
| 253 | P137 | `neumorphism-generator` | tools | E | M | Neumorphism Generator |
| 254 | P137 | `scrollbar-styler` | tools | E | M | Scrollbar Styler |
| 255 | P138 | `tailwind-color-palette-viewer` | tools | E | M | Tailwind Color Palette Viewer |
| 256 | P138 | `tsv-converter` | tools | E | M | TSV Converter |
| 257 | P139 | `python-formatter` | tools | H | M | Python Formatter (black-like rules subset) |
| 258 | P140 | `name-that-color` | tools | E | M | Name That Color |
| 259 | P141 | `bcrypt-hash` | tools | H | M | Bcrypt Hash (wasm) |
| 260 | P142 | `crc32-calculator` | tools | E | M | CRC32 Calculator |
| 261 | P142 | `ci-workflow-template-picker` | tools | E | M | CI Workflow Template Picker |
| 262 | P143 | `base64-to-image` | image | E | H | Base64 to Image |
| 263 | P144 | `json-flatten-unflatten` | tools | M | M | JSON Flatten / Unflatten |
| 264 | P145 | `json-schema-validator` | tools | H | M | JSON Schema Validator |
| 265 | P146 | `json-to-toml` | tools | E | M | JSON to TOML |
| 266 | P146 | `toml-to-json` | tools | E | M | TOML to JSON |
| 267 | P147 | `changelog-formatter` | tools | E | M | Changelog Formatter |
| 268 | P147 | `patch-unified-diff-viewer` | tools | M | M | Patch / Unified Diff Viewer |
| 269 | P148 | `regex-to-automata-visualizer` | tools | H | M | Regex to Automata Visualizer |
| 270 | P149 | `string-similarity` | tools | M | M | String Similarity (Levenshtein) |
| 271 | P149 | `add-line-numbers` | tools | E | M | Add Line Numbers |
| 272 | P150 | `button-css-generator` | tools | E | M | Button CSS Generator |
| 273 | P150 | `viewport-tester-sizes` | tools | E | M | Viewport Tester Sizes |
| 274 | P151 | `toml-formatter` | tools | E | M | TOML Formatter |
| 275 | P151 | `xml-minifier` | tools | E | M | XML Minifier |
| 276 | P152 | `cron-generator` | convert | M | H | Cron Generator (UI) |
| 277 | P153 | `env-var-reference-linter` | tools | E | M | Env Var Reference Linter |
| 278 | P153 | `semantic-version-bumper` | tools | E | M | Semantic Version Bumper |
| 279 | P154 | `avif-converter` | image | M | H | AVIF Converter (if browser supports) |
| 280 | P154 | `add-watermark` | image | M | H | Add Watermark |
| 281 | P155 | `app-icon-pack-generator` | image | M | H | App Icon Pack Generator (sizes) |
| 282 | P155 | `image-metadata-viewer` | image | M | H | Image Metadata Viewer (EXIF) |
| 283 | P156 | `svg-to-png` | image | M | H | SVG to PNG |
| 284 | P157 | `mime-type-lookup` | tools | E | M | MIME Type Lookup |
| 285 | P157 | `xss-payload-encoder` | tools | E | M | XSS Payload Encoder (educational) |
| 286 | P158 | `kubernetes-yaml-explainer` | tools | H | M | Kubernetes YAML Explainer (static) |
| 287 | P159 | `emoji-search-picker` | tools | E | H | Emoji Search / Picker |
| 288 | P159 | `create-table-builder` | tools | M | M | CREATE TABLE Builder |
| 289 | P160 | `form-builder-html-export` | tools | M | M | Form Builder HTML Export |
| 290 | P161 | `docker-compose-validator` | tools | H | M | Docker Compose Validator (client) |
| 291 | P162 | `wcag-contrast-checker` | tools | E | H | WCAG Contrast Checker (advanced) |
| 292 | P163 | `unit-converter` | convert | E | H | Unit Converter (volume) |
| 293 | P164 | `cagr-calculator` | calculators | E | H | CAGR Calculator |
| 294 | P164 | `currency-converter` | calculators | M | H | Currency Converter (static rates snapshot) |
| 295 | P165 | `currency-exchange-table` | calculators | E | H | Currency Exchange Table (snapshot) |
| 296 | P165 | `fd-rd-calculator` | calculators | E | H | FD / RD Calculator |
| 297 | P166 | `income-tax-estimator` | calculators | M | H | Income Tax Estimator (static slabs demo) |
| 298 | P166 | `inflation-calculator` | calculators | E | H | Inflation Calculator |
| 299 | P167 | `lumpsum-investment` | calculators | E | H | Lumpsum Investment |
| 300 | P167 | `profit-margin-calculator` | calculators | E | H | Profit Margin Calculator |
| 301 | P167 | `roi-calculator` | calculators | E | H | ROI Calculator |
| 302 | P168 | `salary-take-home-estimator` | calculators | M | H | Salary Take-Home Estimator |
| 303 | P168 | `vat-calculator` | calculators | E | H | VAT Calculator |
| 304 | P169 | `kubernetes-resource-calculator` | tools | M | M | Kubernetes Resource Calculator (requests) |
| 305 | P170 | `bmr-calculator` | calculators | E | H | BMR Calculator |
| 306 | P170 | `calorie-needs` | calculators | E | H | Calorie Needs (TDEE) |
| 307 | P170 | `ovulation-calculator` | calculators | E | H | Ovulation Calculator |
| 308 | P171 | `png-to-svg` | image | H | H | PNG to SVG (trace approx) |
| 309 | P172 | `social-og-image-size-crops` | image | E | M | Social OG Image Size Crops |
| 310 | P173 | `system-design-component-glossary` | interview | E | H | System Design Component Glossary |
| 311 | P174 | `scientific-calculator` | calculators | M | H | Scientific Calculator |
| 312 | P175 | `pdf-signature-place` | pdf | H | H | PDF Signature Place (draw) |
| 313 | P176 | `ean-upc-generator` | tools | M | M | EAN / UPC Generator |
| 314 | P177 | `erd-from-sql` | tools | H | M | ERD from SQL (simple) |
| 315 | P178 | `json-to-sql` | tools | M | M | JSON to SQL |
| 316 | P178 | `hash-identifier` | tools | M | M | Hash Identifier (heuristic) |
| 317 | P179 | `citation-generator` | calculators | M | H | Citation Generator (APA/MLA static) |
| 318 | P179 | `grade-percentage-calculator` | calculators | E | H | Grade Percentage Calculator |
| 319 | P180 | `weighted-grade-calculator` | calculators | E | H | Weighted Grade Calculator |
| 320 | P181 | `vigen-re-cipher` | tools | M | M | Vigenère Cipher (educational) |
| 321 | P181 | `favicon-and-app-manifest-preview` | tools | M | M | Favicon & App Manifest Preview |
| 322 | P182 | `delimiter-detector` | tools | E | L | Delimiter Detector |
| 323 | P182 | `oklch-converter` | tools | M | M | OKLCH Converter |
| 324 | P183 | `roman-numerals-converter` | convert | E | H | Roman Numerals Converter |
| 325 | P184 | `leap-year-checker` | tools | E | L | Leap Year Checker |
| 326 | P184 | `stopwatch` | tools | E | L | Stopwatch |
| 327 | P185 | `cuid-generator` | tools | E | L | CUID Generator |
| 328 | P186 | `sleep-cycle-calculator` | calculators | E | H | Sleep Cycle Calculator |
| 329 | P187 | `image-rotate-flip` | image | E | M | Image Rotate / Flip |
| 330 | P188 | `big-o-cheatsheet-interactive` | interview | E | H | Big-O Cheatsheet Interactive |
| 331 | P189 | `json-merge` | tools | M | M | JSON Merge |
| 332 | P189 | `json-sort-keys` | tools | E | L | JSON Sort Keys |
| 333 | P190 | `ndjson-viewer` | tools | E | L | NDJSON Viewer |
| 334 | P191 | `number-to-words` | calculators | E | H | Number to Words |
| 335 | P192 | `http-request-builder` | tools | H | M | HTTP Request Builder (client-only mock) |
| 336 | P193 | `pdf-delete-pages` | pdf | H | H | PDF Delete Pages |
| 337 | P194 | `pdf-extract-pages` | pdf | H | H | PDF Extract Pages |
| 338 | P195 | `pdf-protect` | pdf | H | H | PDF Protect (encrypt) |
| 339 | P196 | `pdf-reorder-pages` | pdf | H | H | PDF Reorder Pages |
| 340 | P197 | `pdf-text-extract` | pdf | H | H | PDF Text Extract |
| 341 | P198 | `pdf-unlock` | pdf | H | H | PDF Unlock (password known, client) |
| 342 | P199 | `pdf-watermark` | pdf | H | H | PDF Watermark |
| 343 | P200 | `sql-query-explainer` | tools | H | M | SQL Query Explainer (static heuristics) |
| 344 | P201 | `palindrome-checker` | tools | E | L | Palindrome Checker |
| 345 | P201 | `string-rot13` | tools | E | L | String Rot13 |
| 346 | P202 | `unicode-normalizer` | tools | M | M | Unicode Normalizer (NFC/NFD) |
| 347 | P202 | `responsive-breakpoint-preview` | tools | M | M | Responsive Breakpoint Preview |
| 348 | P203 | `properties-file-converter` | tools | E | L | Properties File Converter |
| 349 | P203 | `yaml-diff` | tools | M | M | YAML Diff |
| 350 | P204 | `css-triangle-generator` | tools | E | M | CSS Triangle Generator |
| 351 | P205 | `unit-converter` | convert | E | H | Unit Converter (area) |
| 352 | P205 | `unit-converter` | convert | E | H | Unit Converter (speed) |
| 353 | P206 | `discount-calculator` | calculators | E | H | Discount Calculator |
| 354 | P206 | `hourly-to-salary-converter` | calculators | E | H | Hourly to Salary Converter |
| 355 | P206 | `simple-interest` | calculators | E | H | Simple Interest |
| 356 | P207 | `ideal-weight-calculator` | calculators | E | H | Ideal Weight Calculator |
| 357 | P207 | `pace-calculator` | calculators | E | H | Pace Calculator (running) |
| 358 | P208 | `plantuml-client-preview` | tools | H | M | PlantUML Client Preview (wasm if avail) |
| 359 | P209 | `average-mean-calculator` | calculators | E | H | Average / Mean Calculator |
| 360 | P209 | `degree-radian-converter` | calculators | E | H | Degree / Radian Converter |
| 361 | P209 | `gcd-lcm-calculator` | calculators | E | H | GCD / LCM Calculator |
| 362 | P210 | `permutation-combination` | calculators | E | H | Permutation / Combination |
| 363 | P210 | `quadratic-equation-solver` | calculators | E | H | Quadratic Equation Solver |
| 364 | P210 | `standard-deviation` | calculators | E | H | Standard Deviation |
| 365 | P211 | `trigonometry-calculator` | calculators | E | H | Trigonometry Calculator |
| 366 | P212 | `sql-injection-playground` | tools | H | M | SQL Injection Playground (safe mock) |
| 367 | P213 | `certificate-fingerprint-sha256` | tools | E | M | Certificate Fingerprint SHA256 |
| 368 | P213 | `sql-injection-pattern-detector` | tools | M | M | SQL Injection Pattern Detector (educational) |
| 369 | P214 | `flashcard-app` | calculators | M | H | Flashcard App (localStorage) |
| 370 | P214 | `multiplication-table-generator` | calculators | E | H | Multiplication Table Generator |
| 371 | P215 | `canonical-url-checker` | tools | E | M | Canonical URL Checker (paste HTML) |
| 372 | P216 | `c-c-formatter` | tools | H | M | C/C++ Formatter (clang-format subset) |
| 373 | P217 | `go-formatter` | tools | H | M | Go Formatter (gofmt-like subset) |
| 374 | P218 | `ascii-table-interactive` | tools | E | H | ASCII Table Interactive |
| 375 | P218 | `periodic-table-interactive` | tools | M | H | Periodic Table Interactive |
| 376 | P219 | `typing-speed-test` | tools | M | H | Typing Speed Test |
| 377 | P219 | `wpm-accuracy-test` | tools | M | H | WPM Accuracy Test |
| 378 | P220 | `freelance-rate-calculator` | calculators | E | M | Freelance Rate Calculator |
| 379 | P221 | `leetcode-pattern-finder` | interview | E | H | LeetCode Pattern Finder (static map) |
| 380 | P222 | `mdx-preview` | tools | H | M | MDX Preview (limited) |
| 381 | P223 | `text-compare` | tools | H | M | Text Compare (3-way) |
| 382 | P224 | `web-vitals-score-explainer` | tools | E | H | Web Vitals Score Explainer |
| 383 | P225 | `amortization-schedule` | calculators | M | H | Amortization Schedule |
| 384 | P225 | `credit-card-payoff-calculator` | calculators | M | H | Credit Card Payoff Calculator |
| 385 | P226 | `retirement-calculator` | calculators | M | H | Retirement Calculator |
| 386 | P227 | `noise-texture-generator` | tools | M | L | Noise Texture Generator |
| 387 | P227 | `waveform-svg-generator` | tools | M | L | Waveform SVG Generator |
| 388 | P228 | `blur-face-region` | image | M | M | Blur Face Region (manual) |
| 389 | P228 | `dominant-color-extractor` | image | M | M | Dominant Color Extractor |
| 390 | P229 | `load-balancer-explainer` | interview | E | H | Load Balancer Explainer |
| 391 | P230 | `graphing-calculator` | calculators | H | H | Graphing Calculator (simple) |
| 392 | P231 | `csr-decoder` | tools | M | M | CSR Decoder |
| 393 | P231 | `tracking-parameter-stripper` | tools | E | H | Tracking Parameter Stripper (URL) |
| 394 | P232 | `fuzzy-match-demo` | tools | M | L | Fuzzy Match Demo |
| 395 | P233 | `bar-chart-maker` | calculators | E | H | Bar Chart Maker |
| 396 | P233 | `line-chart-maker` | calculators | E | H | Line Chart Maker |
| 397 | P233 | `pie-chart-maker` | calculators | E | H | Pie Chart Maker |
| 398 | P234 | `bibliography-formatter` | calculators | M | H | Bibliography Formatter |
| 399 | P234 | `fraction-visualizer` | calculators | M | H | Fraction Visualizer |
| 400 | P235 | `long-division-visualizer` | calculators | M | H | Long Division Visualizer |
| 401 | P236 | `headline-analyzer` | tools | E | H | Headline Analyzer (heuristic) |
| 402 | P236 | `column-type-inferencer` | tools | M | L | Column Type Inferencer |
| 403 | P237 | `cron-next-runs-calculator` | convert | M | H | Cron Next Runs Calculator |
| 404 | P238 | `box-model-visualizer` | tools | E | H | Box Model Visualizer |
| 405 | P239 | `budget-splitter` | calculators | E | M | Budget Splitter (50/30/20) |
| 406 | P240 | `ico-converter` | image | M | M | ICO Converter |
| 407 | P240 | `image-color-adjust` | image | M | M | Image Color Adjust (brightness/contrast) |
| 408 | P241 | `image-to-ascii-art` | image | M | M | Image to ASCII Art |
| 409 | P242 | `bitwise-operations-playground` | interview | E | H | Bitwise Operations Playground |
| 410 | P242 | `latency-numbers-reference` | interview | E | H | Latency Numbers Reference |
| 411 | P243 | `sorting-visualizer` | interview | M | H | Sorting Visualizer |
| 412 | P244 | `json-filter-by-key` | tools | M | L | JSON Filter by Key |
| 413 | P244 | `ascii-doc-lite-preview` | tools | M | L | ASCII Doc Lite Preview |
| 414 | P245 | `documentation-search-demo` | tools | M | L | Documentation Search Demo |
| 415 | P246 | `pdf-metadata-viewer` | pdf | M | M | PDF Metadata Viewer |
| 416 | P247 | `utm-builder` | tools | E | H | UTM Builder |
| 417 | P247 | `utm-parser` | tools | E | H | UTM Parser |
| 418 | P248 | `algebra-step-checker` | calculators | H | H | Algebra Step Checker (limited) |
| 419 | P249 | `commonmark-gfm-diff` | tools | M | L | CommonMark / GFM Diff |
| 420 | P249 | `meta-description-length-checker` | tools | E | H | Meta Description Length Checker |
| 421 | P250 | `readability-score` | tools | E | H | Readability Score (Flesch) |
| 422 | P250 | `title-tag-length-checker` | tools | E | H | Title Tag Length Checker |
| 423 | P251 | `css-reset-diff-viewer` | tools | E | L | CSS Reset Diff Viewer |
| 424 | P251 | `color-mixer` | tools | E | L | Color Mixer |
| 425 | P252 | `iso-8601-parser` | convert | E | M | ISO 8601 Parser |
| 426 | P252 | `unit-converter` | convert | E | M | Unit Converter (energy) |
| 427 | P252 | `unit-converter` | convert | E | M | Unit Converter (power) |
| 428 | P253 | `unit-converter` | convert | E | M | Unit Converter (pressure) |
| 429 | P254 | `semver-range-explainer` | tools | E | H | Semver Range Explainer |
| 430 | P254 | `keyboard-shortcut-cheatsheets` | tools | E | H | Keyboard Shortcut Cheatsheets |
| 431 | P255 | `break-even-calculator` | calculators | E | M | Break-even Calculator |
| 432 | P256 | `gitattributes-helper` | tools | E | L | .gitattributes Helper |
| 433 | P256 | `changelog-diff-helper` | tools | E | L | Changelog Diff Helper |
| 434 | P257 | `body-fat-estimator` | calculators | E | M | Body Fat Estimator (formula) |
| 435 | P257 | `heart-rate-zone-calculator` | calculators | E | M | Heart Rate Zone Calculator |
| 436 | P257 | `macro-split-calculator` | calculators | E | M | Macro Split Calculator |
| 437 | P258 | `cap-theorem-explorer` | interview | E | H | CAP Theorem Explorer |
| 438 | P258 | `time-complexity-calculator` | interview | E | H | Time Complexity Calculator (input size) |
| 439 | P259 | `equation-plotter` | calculators | H | H | Equation Plotter |
| 440 | P260 | `fraction-calculator` | calculators | M | H | Fraction Calculator |
| 441 | P260 | `matrix-calculator` | calculators | M | H | Matrix Calculator (2x2/3x3) |
| 442 | P261 | `median-mode-calculator` | calculators | E | M | Median / Mode Calculator |
| 443 | P261 | `ratio-calculator` | calculators | E | M | Ratio Calculator |
| 444 | P262 | `whois-like-educational` | tools | E | L | Whois-like Educational (no live lookup) |
| 445 | P263 | `pdf-compare` | pdf | H | M | PDF Compare (page images) |
| 446 | P264 | `regex-cheatsheet-by-language-flavor` | tools | E | H | Regex Cheatsheet by Language Flavor |
| 447 | P264 | `regex-for-sql-like-converter` | tools | E | L | Regex for SQL LIKE Converter |
| 448 | P265 | `essay-word-target-tracker` | calculators | E | M | Essay Word Target Tracker |
| 449 | P265 | `periodic-table-quiz` | calculators | E | M | Periodic Table Quiz |
| 450 | P266 | `amp-remover-html-cleaner` | tools | E | L | AMP Remover / HTML Cleaner |
| 451 | P266 | `aria-role-reference` | tools | E | H | ARIA Role Reference |
| 452 | P267 | `protobuf-formatter` | tools | H | L | Protobuf Formatter |
| 453 | P268 | `lighthouse-metric-glossary` | tools | E | H | Lighthouse Metric Glossary |
| 454 | P268 | `country-codes-lookup` | tools | E | H | Country Codes Lookup (ISO) |
| 455 | P269 | `currency-codes-lookup` | tools | E | H | Currency Codes Lookup |
| 456 | P270 | `dice-roller` | calculators | E | M | Dice Roller |
| 457 | P271 | `pdf-form-filler` | pdf | H | M | PDF Form Filler (basic AcroForm) |
| 458 | P272 | `pdf-metadata-editor` | pdf | H | M | PDF Metadata Editor |
| 459 | P273 | `pdf-page-number-add` | pdf | H | M | PDF Page Number Add |
| 460 | P274 | `cookie-string-parser` | tools | E | H | Cookie String Parser |
| 461 | P275 | `mongo-query-to-sql` | tools | H | M | Mongo Query to SQL (limited) |
| 462 | P276 | `csv-to-chart` | calculators | M | H | CSV to Chart |
| 463 | P276 | `descriptive-stats-calculator` | calculators | E | H | Descriptive Stats Calculator |
| 464 | P277 | `z-score-calculator` | calculators | E | H | Z-Score Calculator |
| 465 | P278 | `color-blind-safe-palette-test` | tools | M | H | Color Blind Safe Palette Test |
| 466 | P279 | `angle-converter` | convert | E | M | Angle Converter |
| 467 | P279 | `scientific-notation-converter` | convert | E | M | Scientific Notation Converter |
| 468 | P280 | `cache-control-playground` | tools | M | H | Cache-Control Playground |
| 469 | P280 | `http-caching-header-builder` | tools | M | H | HTTP Caching Header Builder |
| 470 | P281 | `water-intake-estimator` | calculators | E | M | Water Intake Estimator |
| 471 | P282 | `image-diff` | image | H | M | Image Diff (pixel) |
| 472 | P283 | `exponent-calculator` | calculators | E | M | Exponent Calculator |
| 473 | P283 | `factorial-calculator` | calculators | E | M | Factorial Calculator |
| 474 | P283 | `logarithm-calculator` | calculators | E | M | Logarithm Calculator |
| 475 | P284 | `prime-checker` | calculators | E | M | Prime Checker |
| 476 | P284 | `prime-factors` | calculators | E | M | Prime Factors |
| 477 | P284 | `square-root-nth-root` | calculators | E | M | Square Root / Nth Root |
| 478 | P285 | `index-recommendation-heuristic` | tools | H | M | Index Recommendation Heuristic |
| 479 | P286 | `pgp-message-explainer` | tools | H | M | PGP Message Explainer (structure) |
| 480 | P287 | `a-b-test-significance-calculator` | calculators | M | H | A/B Test Significance Calculator |
| 481 | P288 | `prompt-template-library` | tools | E | H | Prompt Template Library |
| 482 | P289 | `round-avatar-crop` | image | E | H | Round Avatar Crop |
| 483 | P290 | `binary-search-visualizer` | interview | M | H | Binary Search Visualizer |
| 484 | P291 | `whatsapp-link-generator` | tools | E | H | WhatsApp Link Generator |
| 485 | P291 | `json-zod-schema` | tools | M | H | JSON → Zod Schema |
| 486 | P292 | `sample-size-calculator` | calculators | M | H | Sample Size Calculator |
| 487 | P292 | `study-schedule-generator` | calculators | M | M | Study Schedule Generator |
| 488 | P293 | `bundle-size-analyzer` | tools | M | H | Bundle Size Analyzer (upload stats.json) |
| 489 | P294 | `background-remover` | image | H | H | Background Remover (manual mask) |
| 490 | P295 | `behavioral-star-answer-template` | interview | E | M | Behavioral STAR Answer Template |
| 491 | P296 | `linear-equation-solver` | calculators | M | M | Linear Equation Solver (2 var) |
| 492 | P297 | `youtube-thumbnail-downloader` | tools | E | H | YouTube Thumbnail Downloader (client URL parse) |
| 493 | P298 | `histogram-generator` | calculators | M | H | Histogram Generator |
| 494 | P298 | `scatter-plot-maker` | calculators | E | M | Scatter Plot Maker |
| 495 | P299 | `font-size-readability-checker` | tools | E | M | Font Size Readability Checker |
| 496 | P300 | `event-loop-visualizer` | tools | H | H | Event Loop Visualizer |
| 497 | P301 | `specificity-battle` | tools | E | M | Specificity Battle |
| 498 | P301 | `flag-quiz` | tools | E | M | Flag Quiz |
| 499 | P302 | `timezone-database-browser` | tools | M | H | Timezone Database Browser |
| 500 | P302 | `unicode-character-search` | tools | M | H | Unicode Character Search |
| 501 | P303 | `world-capitals-quiz` | tools | E | M | World Capitals Quiz |
| 502 | P304 | `bst-visualizer` | interview | H | H | BST Visualizer |
| 503 | P305 | `graph-traversal-visualizer` | interview | H | H | Graph Traversal Visualizer |
| 504 | P306 | `pathfinding-visualizer` | interview | H | H | Pathfinding Visualizer (A*/Dijkstra) |
| 505 | P307 | `stack-queue-visualizer` | interview | E | M | Stack / Queue Visualizer |
| 506 | P308 | `graphql-query-formatter` | tools | E | M | GraphQL Query Formatter |
| 507 | P309 | `javascript-playground` | tools | H | H | JavaScript Playground (sandboxed) |
| 508 | P310 | `typescript-playground` | tools | H | H | TypeScript Playground (lite) |
| 509 | P311 | `confidence-interval-calculator` | calculators | M | H | Confidence Interval Calculator |
| 510 | P311 | `linear-regression` | calculators | M | H | Linear Regression (2D) |
| 511 | P312 | `p-value-from-z` | calculators | M | H | P-Value from Z (tables) |
| 512 | P313 | `keyword-stuffing-checker` | tools | E | M | Keyword Stuffing Checker |
| 513 | P313 | `sequence-diagram` | tools | M | H | Sequence Diagram (Mermaid) |
| 514 | P314 | `multiplication-practice` | tools | E | M | Multiplication Practice |
| 515 | P314 | `sign-language-alphabet` | tools | E | M | Sign Language Alphabet (images) |
| 516 | P315 | `heic-to-jpg` | image | H | H | HEIC to JPG (if support) |
| 517 | P316 | `interview-question-timer` | interview | E | M | Interview Question Timer |
| 518 | P316 | `resume-bullet-rewriter` | interview | M | M | Resume Bullet Rewriter (rules-based, no AI) |
| 519 | P317 | `two-s-complement-visualizer` | interview | E | M | Two's Complement Visualizer |
| 520 | P318 | `determinant-calculator` | calculators | M | M | Determinant Calculator |
| 521 | P318 | `vector-calculator` | calculators | M | M | Vector Calculator |
| 522 | P319 | `words-to-number` | calculators | M | M | Words to Number |
| 523 | P320 | `websocket-message-frame-explainer` | tools | H | L | WebSocket Message Frame Explainer |
| 524 | P321 | `regex-js-code-generator` | tools | E | M | Regex → JS Code Generator |
| 525 | P321 | `prompt-improver-checklist` | tools | E | H | Prompt Improver Checklist |
| 526 | P322 | `system-prompt-builder` | tools | E | H | System Prompt Builder |
| 527 | P322 | `file-hash` | tools | M | H | File Hash (drag-drop) |
| 528 | P323 | `package-json-dependency-visualizer` | tools | M | M | Package.json Dependency Visualizer |
| 529 | P323 | `flight-phonetics-nato` | tools | E | M | Flight Phonetics / NATO |
| 530 | P324 | `language-codes` | tools | E | M | Language Codes (ISO 639) |
| 531 | P324 | `phonetic-alphabet-converter` | tools | E | M | Phonetic Alphabet Converter |
| 532 | P325 | `image-upscale` | image | M | H | Image Upscale (simple bilinear) |
| 533 | P326 | `sprite-sheet-slicer` | image | H | M | Sprite Sheet Slicer |
| 534 | P327 | `pdf-flatten-annotations` | pdf | H | M | PDF Flatten Annotations (limited) |
| 535 | P328 | `local-storage-inspector-ui` | tools | E | M | Local Storage Inspector UI |
| 536 | P328 | `escape-sequence-tester` | tools | E | M | Escape Sequence Tester |
| 537 | P329 | `sentence-length-visualizer` | tools | E | M | Sentence Length Visualizer |
| 538 | P329 | `token-count-estimator` | tools | M | H | Token Count Estimator (heuristic) |
| 539 | P330 | `er-diagram-builder` | tools | H | H | ER Diagram Builder |
| 540 | P331 | `flowchart-maker` | tools | H | H | Flowchart Maker (simple) |
| 541 | P332 | `mind-map` | tools | H | H | Mind Map (basic) |
| 542 | P333 | `resistor-color-code` | calculators | E | H | Resistor Color Code |
| 543 | P334 | `image-collage-maker` | image | H | H | Image Collage Maker |
| 544 | P335 | `eisenhower-matrix` | tools | E | H | Eisenhower Matrix |
| 545 | P335 | `google-maps-link-builder` | tools | E | H | Google Maps Link Builder |
| 546 | P336 | `box-plot-from-data` | calculators | M | M | Box Plot from Data |
| 547 | P337 | `content-outline-generator` | tools | M | M | Content Outline Generator (rules) |
| 548 | P337 | `focus-order-visualizer` | tools | M | M | Focus Order Visualizer (paste HTML) |
| 549 | P338 | `zip-creator` | tools | H | H | ZIP Creator (client) |
| 550 | P339 | `zip-extractor` | tools | H | H | ZIP Extractor (client) |
| 551 | P340 | `multipart-form-data-builder` | tools | M | M | Multipart Form Data Builder |
| 552 | P340 | `z-index-stacking-context-demo` | tools | M | M | z-index Stacking Context Demo |
| 553 | P341 | `gantt-lite` | tools | H | H | Gantt Lite |
| 554 | P342 | `timeline-maker` | tools | M | H | Timeline Maker |
| 555 | P342 | `venn-diagram-maker` | tools | M | H | Venn Diagram Maker |
| 556 | P343 | `linked-list-visualizer` | interview | M | M | Linked List Visualizer |
| 557 | P344 | `cookie-policy-outline` | tools | E | H | Cookie Policy Outline |
| 558 | P344 | `privacy-policy-section-outline` | tools | E | H | Privacy Policy Section Outline |
| 559 | P345 | `srt-to-vtt-converter` | tools | E | H | SRT to VTT Converter |
| 560 | P345 | `vtt-to-srt` | tools | E | H | VTT to SRT |
| 561 | P346 | `cmyk-to-rgb-approx` | tools | E | H | CMYK to RGB Approx |
| 562 | P346 | `dpi-ppi-calculator` | tools | E | H | DPI / PPI Calculator |
| 563 | P346 | `pixels-to-inches` | tools | E | H | Pixels to Inches |
| 564 | P347 | `print-size-calculator` | tools | E | H | Print Size Calculator |
| 565 | P347 | `rgb-to-cmyk-approx` | tools | E | H | RGB to CMYK Approx |
| 566 | P348 | `canvas-fingerprint-demo` | tools | M | M | Canvas Fingerprint Demo |
| 567 | P348 | `openapi-snippet-viewer` | tools | M | M | OpenAPI Snippet Viewer |
| 568 | P349 | `chi-square-calculator` | calculators | M | M | Chi-Square Calculator |
| 569 | P349 | `correlation-calculator` | calculators | M | M | Correlation Calculator |
| 570 | P350 | `passive-voice-detector` | tools | M | M | Passive Voice Detector (rules) |
| 571 | P350 | `gzip-compress-text` | tools | E | M | Gzip Compress Text |
| 572 | P351 | `position-size-calculator` | calculators | E | H | Position Size Calculator |
| 573 | P352 | `css-cascade-layers-explainer` | tools | M | M | CSS Cascade Layers Explainer |
| 574 | P352 | `braille-translator` | tools | M | M | Braille Translator (basic) |
| 575 | P353 | `ohm-s-law-calculator` | calculators | E | H | Ohm's Law Calculator |
| 576 | P354 | `pixel-art-scaler` | image | E | M | Pixel Art Scaler (nearest) |
| 577 | P355 | `youtube-timestamp-link-builder` | tools | E | H | YouTube Timestamp Link Builder |
| 578 | P356 | `docx-text-extract` | pdf | H | H | DOCX Text Extract (client mammoth) |
| 579 | P357 | `docx-to-html` | pdf | H | H | DOCX to HTML (mammoth) |
| 580 | P358 | `pdf-combine-images-mixed` | pdf | H | H | PDF Combine Images Mixed |
| 581 | P359 | `clipboard-history` | tools | M | M | Clipboard History (session only) |
| 582 | P359 | `country-info-lookup` | tools | E | H | Country Info Lookup |
| 583 | P360 | `country-to-currency-map` | tools | E | H | Country to Currency Map |
| 584 | P360 | `dialing-codes-lookup` | tools | E | H | Dialing Codes Lookup |
| 585 | P360 | `lat-long-converter` | tools | E | H | Lat/Long Converter (DMS) |
| 586 | P361 | `content-type-sniffer-educational` | tools | E | M | Content-Type Sniffer Educational |
| 587 | P361 | `import-cost-estimator` | tools | M | M | Import Cost Estimator (heuristic) |
| 588 | P362 | `lockfile-diff` | tools | M | M | Lockfile Diff (package-lock) |
| 589 | P363 | `promise-timeline-visualizer` | tools | H | M | Promise Timeline Visualizer |
| 590 | P364 | `source-map-consumer-viewer` | tools | H | M | Source Map Consumer Viewer |
| 591 | P365 | `dp-grid-visualizer` | interview | H | M | DP Grid Visualizer |
| 592 | P366 | `heap-visualizer` | interview | H | M | Heap Visualizer |
| 593 | P367 | `recursion-tree-visualizer` | interview | H | M | Recursion Tree Visualizer |
| 594 | P368 | `social-bio-character-counter` | tools | E | H | Social Bio Character Counter |
| 595 | P368 | `tweet-length-counter` | tools | E | H | Tweet Length Counter |
| 596 | P369 | `wheel-of-names-advanced` | tools | M | H | Wheel of Names Advanced |
| 597 | P369 | `paper-size-reference` | tools | E | H | Paper Size Reference (A4/Letter) |
| 598 | P370 | `referrer-policy-explainer` | tools | E | M | Referrer Policy Explainer |
| 599 | P371 | `webrtc-leak-demo` | tools | H | M | WebRTC Leak Demo (local) |
| 600 | P372 | `file-size-converter-display` | tools | E | M | File Size Converter Display |
| 601 | P372 | `mime-from-extension` | tools | E | M | MIME from Extension |
| 602 | P373 | `recipe-scaler` | calculators | E | H | Recipe Scaler |
| 603 | P374 | `polaroid-frame-generator` | image | M | M | Polaroid Frame Generator |
| 604 | P375 | `video-thumbnail-capture` | tools | M | H | Video Thumbnail Capture |
| 605 | P375 | `calendar-ics-generator` | tools | M | H | Calendar .ics Generator |
| 606 | P376 | `habit-tracker` | tools | M | H | Habit Tracker (local) |
| 607 | P376 | `pomodoro-task-list` | tools | M | H | Pomodoro + Task List |
| 608 | P377 | `vcard-generator` | tools | M | H | vCard Generator |
| 609 | P378 | `air-fryer-converter` | calculators | E | H | Air Fryer Converter |
| 610 | P378 | `coffee-ratio-calculator` | calculators | E | H | Coffee Ratio Calculator |
| 611 | P379 | `distance-between-cities` | tools | M | H | Distance Between Cities (static coords) |
| 612 | P379 | `memory-match-game` | tools | E | L | Memory Match Game |
| 613 | P380 | `pixelate-region-tool` | image | M | M | Pixelate Region Tool |
| 614 | P381 | `subtitle-srt-editor` | tools | M | H | Subtitle SRT Editor |
| 615 | P381 | `video-metadata-viewer` | tools | M | H | Video Metadata Viewer |
| 616 | P382 | `amazon-affiliate-link-cleaner` | tools | E | M | Amazon Affiliate Link Cleaner |
| 617 | P383 | `markdown-resume-to-pdf` | tools | H | H | Markdown Resume to PDF |
| 618 | P384 | `random-team-generator` | tools | E | M | Random Team Generator |
| 619 | P384 | `guitar-capo-transposer` | tools | E | H | Guitar Capo Transposer |
| 620 | P385 | `scale-generator` | tools | E | H | Scale Generator |
| 621 | P386 | `plate-calculator` | calculators | E | H | Plate Calculator (barbell) |
| 622 | P387 | `few-shot-example-formatter` | tools | E | M | Few-shot Example Formatter |
| 623 | P387 | `prompt-diff` | tools | E | M | Prompt Diff |
| 624 | P387 | `prompt-variable-filler` | tools | E | M | Prompt Variable Filler |
| 625 | P388 | `rag-chunk-size-estimator` | tools | E | M | RAG Chunk Size Estimator |
| 626 | P389 | `concrete-volume-calculator` | calculators | E | H | Concrete Volume Calculator |
| 627 | P389 | `paint-coverage-calculator` | calculators | E | H | Paint Coverage Calculator |
| 628 | P389 | `roof-pitch-calculator` | calculators | E | H | Roof Pitch Calculator |
| 629 | P390 | `tile-calculator` | calculators | E | H | Tile Calculator |
| 630 | P390 | `cooking-unit-converter` | calculators | E | H | Cooking Unit Converter |
| 631 | P391 | `geojson-viewer` | tools | M | H | GeoJSON Viewer |
| 632 | P392 | `apy-to-apr-converter` | calculators | E | H | APY to APR Converter |
| 633 | P392 | `dca-schedule-calculator` | calculators | E | H | DCA Schedule Calculator |
| 634 | P392 | `gas-fee-unit-converter` | calculators | E | H | Gas Fee Unit Converter (Gwei) |
| 635 | P393 | `risk-reward-calculator` | calculators | E | H | Risk/Reward Calculator |
| 636 | P393 | `wallet-address-checksum` | calculators | E | H | Wallet Address Checksum (ETH) |
| 637 | P394 | `architecture-box-diagram` | tools | H | M | Architecture Box Diagram |
| 638 | P395 | `led-resistor-calculator` | calculators | E | H | LED Resistor Calculator |
| 639 | P395 | `voltage-divider` | calculators | E | H | Voltage Divider |
| 640 | P396 | `dithering-converter` | image | M | M | Dithering Converter |
| 641 | P397 | `invoice-pdf-generator` | tools | H | H | Invoice PDF Generator (client) |
| 642 | P398 | `big-number-arithmetic` | calculators | M | L | Big Number Arithmetic |
| 643 | P399 | `audio-trim` | tools | H | H | Audio Trim (WebAudio) |
| 644 | P400 | `linkedin-post-formatter` | tools | E | M | LinkedIn Post Formatter |
| 645 | P400 | `telegram-link-generator` | tools | E | M | Telegram Link Generator |
| 646 | P401 | `xlsx-sheet-lister` | pdf | M | M | XLSX Sheet Lister |
| 647 | P402 | `cricket-run-rate-calculator` | calculators | E | H | Cricket Run Rate Calculator |
| 648 | P402 | `net-run-rate-calculator` | calculators | E | H | Net Run Rate Calculator |
| 649 | P402 | `one-rep-max-calculator` | calculators | E | H | One-Rep Max Calculator |
| 650 | P403 | `chat-transcript-cleaner` | tools | E | M | Chat Transcript Cleaner |
| 651 | P403 | `reduced-motion-preview-toggle` | tools | E | L | Reduced Motion Preview Toggle |
| 652 | P404 | `duplicate-file-finder` | tools | H | M | Duplicate File Finder (hash local) |
| 653 | P405 | `org-chart-builder` | tools | H | M | Org Chart Builder |
| 654 | P406 | `wireframe-blocks` | tools | H | M | Wireframe Blocks (low-fi) |
| 655 | P407 | `chroma-key-simple` | image | H | M | Chroma Key Simple |
| 656 | P408 | `image-histogram` | image | M | M | Image Histogram |
| 657 | P409 | `nda-clause-checklist` | tools | E | M | NDA Clause Checklist (educational) |
| 658 | P409 | `terms-outline-generator` | tools | E | M | Terms Outline Generator |
| 659 | P410 | `bitcoin-uri-generator` | tools | E | M | Bitcoin URI Generator |
| 660 | P410 | `hashtag-counter` | tools | E | M | Hashtag Counter |
| 661 | P410 | `paypal-me-link-builder` | tools | E | M | PayPal.me Link Builder |
| 662 | P411 | `sms-link-generator` | tools | E | M | SMS Link Generator |
| 663 | P411 | `secret-santa-shuffler` | tools | E | M | Secret Santa Shuffler |
| 664 | P411 | `mailto-link-generator` | tools | E | M | mailto Link Generator |
| 665 | P412 | `bpm-tap-tempo` | tools | E | H | BPM Tap Tempo |
| 666 | P412 | `business-card-size-templates` | tools | E | M | Business Card Size Templates |
| 667 | P413 | `permissions-api-demo` | tools | E | L | Permissions API Demo |
| 668 | P413 | `bytecode-opcode-reference` | tools | E | L | Bytecode / Opcode Reference |
| 669 | P414 | `string-template-interpolator` | tools | E | L | String Template Interpolator |
| 670 | P414 | `quote-case-formatter` | tools | E | L | Quote Case Formatter |
| 671 | P415 | `screen-reader-announcement-simulator` | tools | H | M | Screen Reader Announcement Simulator |
| 672 | P416 | `huffman-coding-visualizer` | tools | H | M | Huffman Coding Visualizer |
| 673 | P417 | `wattage-to-amps` | calculators | E | H | Wattage to Amps |
| 674 | P417 | `oven-temperature-converter` | calculators | E | H | Oven Temperature Converter |
| 675 | P418 | `tip-split-with-tax` | calculators | E | H | Tip Split with Tax |
| 676 | P418 | `frequency-wavelength` | calculators | E | H | Frequency Wavelength |
| 677 | P419 | `power-calculator` | calculators | E | H | Power Calculator (V/I/R) |
| 678 | P419 | `db-converter` | calculators | E | H | dB Converter |
| 679 | P420 | `animated-webp-split` | image | H | M | Animated WebP Split |
| 680 | P421 | `tiff-to-png` | image | H | M | TIFF to PNG (limited) |
| 681 | P422 | `circle-of-fifths-interactive` | tools | M | H | Circle of Fifths Interactive |
| 682 | P423 | `pdf-crop-margins` | pdf | H | M | PDF Crop Margins |
| 683 | P424 | `pdf-grayscale-convert` | pdf | H | M | PDF Grayscale Convert |
| 684 | P425 | `pptx-text-extract` | pdf | H | M | PPTX Text Extract |
| 685 | P426 | `heart-rate-training-zones` | calculators | E | H | Heart Rate Training Zones |
| 686 | P426 | `pace-to-finish-time` | calculators | E | H | Pace to Finish Time |
| 687 | P427 | `tree-shaking-demo` | tools | M | L | Tree-shaking Demo |
| 688 | P427 | `word-to-minutes-estimator` | tools | E | M | Word to Minutes Estimator |
| 689 | P428 | `bracket-generator` | tools | M | M | Bracket Generator |
| 690 | P428 | `chord-finder` | tools | M | H | Chord Finder |
| 691 | P429 | `piano-chord-diagram` | tools | M | H | Piano Chord Diagram |
| 692 | P430 | `hvac-btu-estimator` | calculators | M | H | HVAC BTU Estimator |
| 693 | P430 | `stair-stringer-calculator` | calculators | M | H | Stair Stringer Calculator |
| 694 | P431 | `impermanent-loss-calculator` | calculators | M | H | Impermanent Loss Calculator |
| 695 | P431 | `liquidation-price-estimator` | calculators | M | H | Liquidation Price Estimator |
| 696 | P432 | `decision-matrix-maker` | tools | M | M | Decision Matrix Maker |
| 697 | P432 | `markdown-notes` | tools | M | M | Markdown Notes (local) |
| 698 | P433 | `countdown-to-event-page` | calculators | E | M | Countdown to Event Page |
| 699 | P434 | `geojson-to-csv-points` | tools | M | M | GeoJSON to CSV Points |
| 700 | P434 | `etag-simulator` | tools | M | L | ETag Simulator |
| 701 | P435 | `name-picker-wheel` | tools | E | H | Name Picker Wheel |
| 702 | P435 | `receipt-generator` | tools | M | M | Receipt Generator |
| 703 | P436 | `audio-format-info` | tools | M | M | Audio Format Info |
| 704 | P437 | `whiteboard-lite` | tools | H | M | Whiteboard Lite |
| 705 | P438 | `metronome` | tools | M | H | Metronome |
| 706 | P439 | `tuner` | tools | H | H | Tuner (mic WebAudio) |
| 707 | P440 | `bleed-and-margin-guide-generator` | tools | M | M | Bleed & Margin Guide Generator |
| 708 | P440 | `paraphrase-distance-meter` | tools | M | L | Paraphrase Distance Meter |
| 709 | P441 | `board-feet-calculator` | calculators | E | M | Board Feet Calculator |
| 710 | P441 | `fence-post-calculator` | calculators | E | M | Fence Post Calculator |
| 711 | P441 | `mulch-calculator` | calculators | E | M | Mulch Calculator |
| 712 | P442 | `baking-pan-size-converter` | calculators | E | M | Baking Pan Size Converter |
| 713 | P442 | `battery-life-estimator` | calculators | E | M | Battery Life Estimator |
| 714 | P443 | `rc-time-constant` | calculators | E | M | RC Time Constant |
| 715 | P443 | `transformer-turns-ratio` | calculators | E | M | Transformer Turns Ratio |
| 716 | P443 | `wire-gauge-calculator` | calculators | E | M | Wire Gauge Calculator |
| 717 | P444 | `business-card-designer` | tools | H | M | Business Card Designer (print CSS) |
| 718 | P445 | `audio-waveform-from-file` | tools | H | M | Audio Waveform from File |
| 719 | P446 | `gif-frame-viewer` | tools | H | M | GIF Frame Viewer |
| 720 | P447 | `simple-kanban` | tools | H | M | Simple Kanban (local) |
| 721 | P448 | `interval-calculator` | tools | E | M | Interval Calculator |
| 722 | P449 | `office-mime-detector` | pdf | E | L | Office MIME Detector |
| 723 | P450 | `pdf-booklet-imposition` | pdf | H | M | PDF Booklet Imposition |
| 724 | P451 | `march-madness-bracket-printer` | calculators | E | M | March Madness Bracket Printer |
| 725 | P451 | `race-predictor` | calculators | M | H | Race Predictor (Riegel) |
| 726 | P452 | `grocery-split-calculator` | calculators | E | M | Grocery Split Calculator |
| 727 | P453 | `text-compression-ratio-demo` | tools | M | L | Text Compression Ratio Demo |
| 728 | P454 | `glitch-art-generator` | image | M | L | Glitch Art Generator |
| 729 | P455 | `midi-note-number-converter` | tools | E | M | MIDI Note Number Converter |
| 730 | P456 | `epub-metadata-viewer` | pdf | H | M | EPUB Metadata Viewer |
| 731 | P457 | `lzw-demo-visualizer` | tools | H | L | LZW Demo Visualizer |
| 732 | P458 | `macro-from-recipe-estimator` | calculators | M | M | Macro from Recipe Estimator |
| 733 | P458 | `bech32-address-viewer` | calculators | M | M | Bech32 Address Viewer (educational) |
| 734 | P459 | `funding-rate-pnl-estimator` | calculators | M | M | Funding Rate PnL Estimator |
| 735 | P459 | `three-phase-power-calculator` | calculators | M | M | Three-Phase Power Calculator |
| 736 | P460 | `jailbreak-pattern-educators` | tools | E | L | Jailbreak Pattern Educators (safe) |
| 737 | P460 | `bounding-box-calculator` | tools | M | M | Bounding Box Calculator |
| 738 | P461 | `coin-flip-decision-wheel` | tools | E | M | Coin Flip / Decision Wheel |
| 739 | P462 | `sudoku-generator-solver` | tools | H | H | Sudoku Generator / Solver |
| 740 | P463 | `instagram-username-checker-style` | tools | E | L | Instagram Username Checker Style |
| 741 | P463 | `invoice-number-generator` | tools | E | L | Invoice Number Generator |
| 742 | P464 | `football-score-probability` | calculators | M | M | Football Score Probability (simple) |
| 743 | P465 | `nine-patch-preview` | image | H | L | Nine-patch Preview |
| 744 | P466 | `meme-text-overlay` | tools | M | M | Meme Text Overlay (image) |
| 745 | P466 | `map-tile-coordinate-converter` | tools | M | L | Map Tile Coordinate Converter |
| 746 | P467 | `2048` | tools | M | M | 2048 |
| 747 | P467 | `wordle-clone` | tools | M | M | Wordle Clone (daily static) |
| 748 | P468 | `color-from-video-frame` | tools | H | L | Color from Video Frame |
| 749 | P469 | `bmi-for-athletes-note` | calculators | E | L | BMI for Athletes Note |
| 750 | P470 | `hangman` | tools | E | L | Hangman |
| 751 | P470 | `tic-tac-toe` | tools | E | L | Tic Tac Toe |
| 752 | P470 | `rock-paper-scissors` | tools | E | L | Rock Paper Scissors |
| 753 | P471 | `yes-no-oracle` | tools | E | L | Yes/No Oracle |
| 754 | P471 | `minesweeper` | tools | M | L | Minesweeper |
| 755 | P472 | `snake` | tools | M | L | Snake |

---

## Daily workflow (copy this)

```bash
# 1. Pick today's phase from this file
# 2. Branch (optional for Easy; required for Hard)
git checkout -b feat/P0XX-short-name

# 3. Implement + registry update status=shipped
# 4. Local check
pnpm lint && pnpm typecheck && pnpm build

# 5. Merge & ship
git add -A && git commit -m "feat(tools): P0XX ship <slugs>"
git checkout main && git merge feat/P0XX-short-name && git push

# 6. Verify production URLs + mark checkbox in implementation.md
```

---

## Tracking

| Metric | Where |
|---|---|
| Phases done | Checkboxes in this file |
| Tools shipped | `status=shipped` count in registry |
| Production health | Vercel dashboard |
| SEO | Google Search Console |
| Quality | Weekly S-d CWV pass |

**Current pointer:** start at **F00**. Do not skip to tools before **F04** is live.

---

*This plan intentionally creates **hundreds** of small shippable phases so the site can be public immediately and improve every day. If a tool is later deemed out-of-scope, mark it `cancelled` here and `status: deprecated` in the registry — do not leave thin pages indexed.*
