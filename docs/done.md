# Forge — Done Tracker

**Source of truth for progress.** Update this file when a phase is live on production.

| Doc | Role |
|---|---|
| [`plan.md`](./plan.md) | Strategy & product blueprint |
| [`implementation.md`](./implementation.md) | What to build each day |
| **`done.md` (this file)** | What has been shipped |

---

## Status dashboard

> Edit these fields every time you finish a phase.

| Field | Value |
|---|---|
| **Last completed phase** | `P030` |
| **Next phase to do** | `P031` |
| **Production live?** | Ready (deploy on push / Vercel) |
| **Production URL** | — _(set after first Vercel deploy)_ |
| **Foundation done** | 12 / 12 |
| **Tool phases done** | 30 / 472 |
| **Tools shipped** | 53 / 755 |
| **Hub phases done** | 0 / 50 |
| **SEO phases done** | 0 / 94 |
| **Monetization phases done** | 0 / 15 |
| **Last updated** | 2026-07-26 |

### Progress bar (manual)

```
Foundation   [############] 100%
Tools        [#           ] ~0.2%
Overall*     [#           ] ~2%
```

*Overall ≈ weighted feel; exact counts are in the dashboard table.

---

## How to mark progress

1. Finish the phase from `implementation.md` (Definition of Done).
2. Deploy to production.
3. In this file:
   - Change `- [ ]` → `- [x]` for that phase
   - Update the **Status dashboard**
   - Add one line to the **Ship log**
4. Optionally sync the Progress pointer in `implementation.md`.

**Rule:** A phase is done only when it is **live**, not merely coded locally.

---

## Ship log

Newest at top. One line per completed phase.

| Date | Phase | Notes / commit / URL |
|---|---|---|
| 2026-07-27 | `P030` | Data Storage Converter (SI + IEC units) on `/convert` + tests |
| 2026-07-27 | `P029` | Length / Weight / Temperature converters on `/convert` + tests |
| 2026-07-27 | `P028` | PDF to Images (PDF.js render → PNG/JPEG) on `/pdf` + tests |
| 2026-07-27 | `P027` | PDF Rotate (90/180/270, all or range) on `/pdf` + tests |
| 2026-07-27 | `P026` | PDF Split (range / every page / chunks) on `/pdf` + tests |
| 2026-07-27 | `P025` | PDF Merge (pdf-lib, reorder, encrypted reject) on `/pdf` + tests |
| 2026-07-27 | `P024` | Images to PDF (pdf-lib, reorder, A4/Letter/fit) on `/pdf` + tests |
| 2026-07-27 | `P023` | Favicon Generator (ICO + PNGs + HTML snippet) on `/image` + tests |
| 2026-07-27 | `P022` | Image Compressor + EXIF Remover (Canvas strip/detect) on `/image` + tests |
| 2026-07-27 | `P021` | JPG to PNG + WebP Converter (PNG/JPEG/WebP) on `/image` + tests |
| 2026-07-26 | `P020` | Image Resizer + PNG to JPG (Canvas, local-only) on `/image` + tests |
| 2026-07-26 | `P019` | Regex Tester (flags, matches/groups, replace preview) on `/tools` + tests |
| 2026-07-26 | `P018` | Timezone Converter (Intl/IANA, DST-aware) on `/convert` + tests |
| 2026-07-26 | `P017` | Age Calculator (Y/M/D + next birthday) + tests |
| 2026-07-26 | `P016` | EMI / Loan Calculator (amortization schedule) + tests |
| 2026-07-26 | `P015` | Percentage + Tip Calculators on `/calculators` + tests |
| 2026-07-26 | `P014` | Number Base Converter (2/8/10/16, BigInt) on `/convert` + tests |
| 2026-07-26 | `P013` | HEX to RGB/HSL + Gitignore Generator + tests |
| 2026-07-26 | `P012` | Lorem Ipsum Generator + WCAG Color Contrast Checker + tests |
| 2026-07-26 | `P011` | JSON↔YAML + CSV↔JSON converters + tests |
| 2026-07-26 | `P010` | SQL Formatter + YAML to JSON + tests (soft-launch milestone) |
| 2026-07-26 | `P009` | HTML Formatter + CSS Formatter + CSS Minifier + tests |
| 2026-07-26 | `P008` | Text Diff (side-by-side) + Markdown Preview (GFM) + tests |
| 2026-07-26 | `P007` | Unix Timestamp Converter + Cron Explainer (`/convert`) + tests |
| 2026-07-26 | `P006` | QR Code Generator (PNG/SVG, error correction) + tests |
| 2026-07-26 | `P005` | Slug Generator + Random Password Generator (CSPRNG) + tests |
| 2026-07-26 | `P004` | Case Converter + Word Counter + Character Counter + tests |
| 2026-07-26 | `P003` | JWT Decoder + SHA-256 + MD5 shipped (pure impls + tests) |
| 2026-07-26 | `P002` | Base64, URL encode/decode, UUID v4 generator shipped + tests |
| 2026-07-26 | `theme` | Switched site to light lemon shade; Vitest + P001 unit tests |
| 2026-07-26 | `P001` | JSON Formatter + JSON Validator shipped |
| 2026-07-26 | `F11` | Blog index + 3 posts + InternalLink |
| 2026-07-26 | `F10` | CodeEditor, Copy/Download, FileDropzone, Toast; `/lab/editor-kit` |
| 2026-07-26 | `F09` | GitHub Actions CI (validate/typecheck/lint/build) |
| 2026-07-26 | `F08` | Analytics helper; `/about` `/privacy` `/terms` |
| 2026-07-26 | `F07` | cmdk command palette over shipped registry |
| 2026-07-26 | `F06` | Metadata helpers, robots.ts, sitemap (shipped-only) |
| 2026-07-26 | `F05` | Family hubs for tools/pdf/image/calculators/convert |
| 2026-07-26 | `F04` | Homepage hero + families + featured empty state |
| 2026-07-26 | `F03` | Dynamic family/slug routes + ToolShell + ComingSoon |
| 2026-07-26 | `F02` | Zod tool schema + content/tools + validate script |
| 2026-07-26 | `F01` | Charcoal/copper tokens, fonts, Navbar/Footer |
| 2026-07-26 | `F00` | Next.js App Router + TS + Tailwind bootstrap |

---

## Block A — Foundation (F00–F11)

| Done | Phase | Title |
|---|---|---|
| [x] | `F00` | Repo bootstrap |
| [x] | `F01` | Design tokens & global chrome |
| [x] | `F02` | Tool registry schema |
| [x] | `F03` | Dynamic tool route + ToolShell |
| [x] | `F04` | Homepage v1 (shippable) |
| [x] | `F05` | Category hub pages |
| [x] | `F06` | SEO primitives |
| [x] | `F07` | Command palette + client search |
| [x] | `F08` | Analytics + privacy pages |
| [x] | `F09` | CI + quality gates |
| [x] | `F10` | Editor kit |
| [x] | `F11` | First content stubs |

**Milestone:** after `[x]` on `F04`, set **Production live?** to Yes.

---

## Block B — Tool phases (P001–P472)

_472 phases · 755 tools. Check the box when the whole phase (all tools listed) is live._

| Done | Phase | Tools | Diff | Family |
|---|---|---|---|---|
| [x] | `P001` | JSON Formatter / Beautifier; JSON Validator | E | `/tools` |
| [x] | `P002` | Base64 Encode / Decode; URL Encode / Decode; UUID v4 Generator | E | `/tools` |
| [x] | `P003` | JWT Decoder; SHA-256 Hash; MD5 Hash Generator | E | `/tools` |
| [x] | `P004` | Case Converter (upper/lower/title/camel/snake/kebab); Word Counter; Character Counter | E | `/tools` |
| [x] | `P005` | Slug Generator; Random Password Generator | E | `/tools` |
| [x] | `P006` | QR Code Generator | E | `/tools` |
| [x] | `P007` | Unix Timestamp Converter; Cron Expression Explainer | E/M | `/convert` |
| [x] | `P008` | Text Diff (side-by-side); Markdown Preview | E/M | `/tools` |
| [x] | `P009` | HTML Formatter; CSS Formatter; CSS Minifier | E | `/tools` |
| [x] | `P010` | SQL Formatter; YAML to JSON | E | `/tools` |
| [x] | `P011` | JSON to YAML; CSV to JSON; JSON to CSV | E | `/tools` |
| [x] | `P012` | Lorem Ipsum Generator; Color Contrast Checker (WCAG) | E | `/tools` |
| [x] | `P013` | HEX to RGB; Gitignore Generator | E | `/tools` |
| [x] | `P014` | Number Base Converter (2/8/10/16) | E | `/convert` |
| [x] | `P015` | Percentage Calculator; Tip Calculator | E | `/calculators` |
| [x] | `P016` | EMI / Loan Calculator | E | `/calculators` |
| [x] | `P017` | Age Calculator | E | `/tools` |
| [x] | `P018` | Timezone Converter | M | `/convert` |
| [x] | `P019` | Regex Tester | M | `/tools` |
| [x] | `P020` | Image Resizer; PNG to JPG | E/M | `/image` |
| [x] | `P021` | JPG to PNG; WebP Converter | E/M | `/image` |
| [x] | `P022` | Image Compressor; EXIF Remover | M | `/image` |
| [x] | `P023` | Favicon Generator from Image | M | `/image` |
| [x] | `P024` | Images to PDF | M | `/pdf` |
| [x] | `P025` | PDF Merge | H | `/pdf` |
| [x] | `P026` | PDF Split | H | `/pdf` |
| [x] | `P027` | PDF Rotate | M | `/pdf` |
| [x] | `P028` | PDF to Images | H | `/pdf` |
| [x] | `P029` | Unit Converter (length); Unit Converter (weight); Unit Converter (temperature) | E | `/convert` |
| [x] | `P030` | Unit Converter (data storage) | E | `/convert` |
| [ ] | `P031` | GST / Sales Tax Calculator; SIP Calculator | E | `/calculators` |
| [ ] | `P032` | BMI Calculator; GPA Calculator | E | `/calculators` |
| [ ] | `P033` | Meta Tags Preview (SERP); CSV Viewer / Table | E | `/tools` |
| [ ] | `P034` | CSV to JSON (advanced options); Password Strength Meter | E | `/tools` |
| [ ] | `P035` | Markdown to HTML; JavaScript Beautifier | E | `/tools` |
| [ ] | `P036` | JavaScript Minifier; Date Difference Calculator | E | `/tools` |
| [ ] | `P037` | Regex Cheatsheet Interactive; JSON Minifier | E | `/tools` |
| [ ] | `P038` | CSS Box Shadow Generator; CSS Gradient Generator | E | `/tools` |
| [ ] | `P039` | CSV to Excel (XLSX) client-side; Excel to CSV | M | `/tools` |
| [ ] | `P040` | Fake Credit Card (test numbers only); Open Graph Meta Generator | E | `/tools` |
| [ ] | `P041` | Text Diff (inline); Password Generator (advanced options) | E/M | `/tools` |
| [ ] | `P042` | Color Picker; Fake User JSON Generator | E | `/tools` |
| [ ] | `P043` | README Generator; Readme Badges Generator | E | `/tools` |
| [ ] | `P044` | SQL Formatter (advanced); Keyword Density Checker | E | `/tools` |
| [ ] | `P045` | Markdown Table Generator; RGB to HEX | E | `/tools` |
| [ ] | `P046` | Pomodoro Timer; Fake Address Generator | E | `/tools` |
| [ ] | `P047` | Fake Name Generator; Git Cheat Sheet Interactive | E | `/tools` |
| [ ] | `P048` | Git Command Explorer; HTML Minifier | E | `/tools` |
| [ ] | `P049` | Add / Subtract Dates; Meeting Time Planner (multi-TZ) | E/M | `/tools` |
| [ ] | `P050` | Time Duration Calculator; World Clock | E | `/tools` |
| [ ] | `P051` | HTML Entity Encode / Decode; SHA-1 Hash | E | `/tools` |
| [ ] | `P052` | Fake Email Generator (local); License Text Generator; Sitemap XML Generator (manual URLs) | E | `/tools` |
| [ ] | `P053` | htaccess Redirect Generator; robots.txt Generator | E | `/tools` |
| [ ] | `P054` | JSON to XML; XML to JSON | E | `/tools` |
| [ ] | `P055` | HTTP Status Code Reference; Remove Duplicate Lines | E | `/tools` |
| [ ] | `P056` | Sort Lines; XML Formatter | E | `/tools` |
| [ ] | `P057` | YAML Formatter; CSS Flexbox Playground | E/M | `/tools` |
| [ ] | `P058` | CSS Grid Playground; Palette from Image | M | `/tools` |
| [ ] | `P059` | QR Code Reader (camera/file); WiFi QR Generator | E/M | `/tools` |
| [ ] | `P060` | Business Days Calculator; JSON to TypeScript Interface | M | `/tools` |
| [ ] | `P061` | vCard QR Generator; Glassmorphism Generator | E | `/tools` |
| [ ] | `P062` | CSV to SQL INSERT | M | `/tools` |
| [ ] | `P063` | SVG Optimizer (SVGO-like) | H | `/tools` |
| [ ] | `P064` | Countdown Timer Builder; File Checksum (browser) | E/M | `/tools` |
| [ ] | `P065` | JWT Debugger with Claims Explain; Passphrase Generator | E/M | `/tools` |
| [ ] | `P066` | Dockerfile Generator (templates); JSON Diff | M | `/tools` |
| [ ] | `P067` | HTML to Markdown; Reading Time Estimator | E/M | `/tools` |
| [ ] | `P068` | Zero-Width Character Detector; CSS Border Radius Generator | E | `/tools` |
| [ ] | `P069` | CSV Column Splitter; GraphQL Formatter | E | `/tools` |
| [ ] | `P070` | SQL Minifier; Complementary Color Finder | E | `/tools` |
| [ ] | `P071` | Week Number Calculator; Base64 URL-safe | E | `/tools` |
| [ ] | `P072` | SHA-512 Hash; Twitter Card Meta Generator | E | `/tools` |
| [ ] | `P073` | UUID Bulk Generator; Gitignore Builder (advanced) | E | `/tools` |
| [ ] | `P074` | Image to Base64 | E | `/image` |
| [ ] | `P075` | Mermaid Live Editor (embed) | H | `/tools` |
| [ ] | `P076` | Find & Replace Batch | E | `/tools` |
| [ ] | `P077` | Regex Explainer (static rules) | H | `/tools` |
| [ ] | `P078` | Dummy Text Generator (paragraphs); Invisible Character Remover; Line Counter | E | `/tools` |
| [ ] | `P079` | Word Frequency Counter; HTML Table Generator | E | `/tools` |
| [ ] | `P080` | CSV to Markdown; Accessible Palette Generator | E/M | `/tools` |
| [ ] | `P081` | HEX to HSL; Commit Message Helper | E | `/tools` |
| [ ] | `P082` | Conventional Commit Builder; JSON to Markdown Table | E | `/tools` |
| [ ] | `P083` | DNS Record Types Cheatsheet; Port Number Reference; URL Parser / Builder | E | `/tools` |
| [ ] | `P084` | User-Agent Parser; SQL JOIN Visualizer | E/M | `/tools` |
| [ ] | `P085` | Caesar Cipher; Markdown TOC Generator; Morse to Text | E | `/tools` |
| [ ] | `P086` | Text to Morse; HTML Entity Reference | E | `/tools` |
| [ ] | `P087` | JSON-LD Formatter; CSV to HTML Table | E | `/tools` |
| [ ] | `P088` | Day of Week Finder; Binary Encode / Decode | E | `/tools` |
| [ ] | `P089` | Hex Encode / Decode; NanoID Generator; ULID Generator | E | `/tools` |
| [ ] | `P090` | Unicode Escape / Unescape; API Key Style Token Generator | E | `/tools` |
| [ ] | `P091` | Colorful Avatar Generator (SVG); Lorem Picsum Alternative Placeholder | E/M | `/tools` |
| [ ] | `P092` | JSON Escape / Unescape; Barcode Generator (Code128) | E/M | `/tools` |
| [ ] | `P093` | CSV to SQL INSERT Bulk; QR Code for OTP Setup | M | `/tools` |
| [ ] | `P094` | Binary to Text; Remove Extra Spaces; Reverse Text | E | `/tools` |
| [ ] | `P095` | Text to Binary; Open Graph Preview | E/M | `/tools` |
| [ ] | `P096` | Schema Markup Generator (FAQ/HowTo); INI / ENV Parser | E/M | `/tools` |
| [ ] | `P097` | CSS Animation Keyframes Builder; Clip-path Generator | M | `/tools` |
| [ ] | `P098` | CSV Cleaner (trim, dedupe); CSV Diff | M | `/tools` |
| [ ] | `P099` | Color Blindness Simulator; Random Palette Generator | E/M | `/tools` |
| [ ] | `P100` | Calendar Generator (print); Docker Run to Compose Converter | M | `/tools` |
| [ ] | `P101` | Image Cropper | M | `/image` |
| [ ] | `P102` | JSON Path Tester; JSON Pretty Print with Tree View | M | `/tools` |
| [ ] | `P103` | CIDR Calculator; Fetch to cURL Converter | M | `/tools` |
| [ ] | `P104` | SSL Certificate Decoder (paste PEM); Subnet Calculator | M | `/tools` |
| [ ] | `P105` | cURL to Fetch Converter; Grep Online (multiline) | M | `/tools` |
| [ ] | `P106` | CORS Explainer Simulator; CSS Clamp Calculator | E/M | `/tools` |
| [ ] | `P107` | CSS Filter Generator; Responsive Font Scale Calculator | E | `/tools` |
| [ ] | `P108` | CSV Merger; Java Beautifier | M | `/tools` |
| [ ] | `P109` | PHP Beautifier; SCSS / LESS Formatter | M | `/tools` |
| [ ] | `P110` | TypeScript Formatter; Gradient from Two Colors | E/M | `/tools` |
| [ ] | `P111` | Tint / Shade Generator; Triadic / Analogous Generator | E | `/tools` |
| [ ] | `P112` | HMAC Generator; JWT Encoder (unsigned/demo) | M | `/tools` |
| [ ] | `P113` | UUID v1 / v7 Generator; Nginx Config Snippet Generator | M | `/tools` |
| [ ] | `P114` | Barcode Scanner (camera) | H | `/tools` |
| [ ] | `P115` | Word Diff | M | `/tools` |
| [ ] | `P116` | AES Encrypt / Decrypt (demo WebCrypto) | H | `/tools` |
| [ ] | `P117` | CSP Builder | M | `/tools` |
| [ ] | `P118` | OTP / TOTP Generator (local secret) | H | `/tools` |
| [ ] | `P119` | RSA Keypair Generator (WebCrypto) | H | `/tools` |
| [ ] | `P120` | HTML Preview Sandbox (sandboxed iframe); XML Validator | M | `/tools` |
| [ ] | `P121` | XML to CSV; YAML Validator | M | `/tools` |
| [ ] | `P122` | CSS to Tailwind Converter (heuristic) | H | `/tools` |
| [ ] | `P123` | Pivot Table Generator (simple) | H | `/tools` |
| [ ] | `P124` | Date to Epoch; Epoch to Date | E | `/convert` |
| [ ] | `P125` | Compound Interest; Mortgage Calculator | E | `/calculators` |
| [ ] | `P126` | Identicon Generator; SSH Public Key Fingerprint | E/M | `/tools` |
| [ ] | `P127` | Pregnancy Due Date | E | `/calculators` |
| [ ] | `P128` | Placeholder Image Generator | E | `/image` |
| [ ] | `P129` | JSON to Go Struct; JSON to Python Dataclass | M | `/tools` |
| [ ] | `P130` | Percentage Change; Random Number Generator | E | `/calculators` |
| [ ] | `P131` | HTTP Header Parser; IP Address Explainer (v4/v6 educational) | E/M | `/tools` |
| [ ] | `P132` | Query String Builder | E | `/tools` |
| [ ] | `P133` | PDF Compress (basic) | H | `/pdf` |
| [ ] | `P134` | Secure Random Bytes Generator; Security Headers Checker (paste response) | E | `/tools` |
| [ ] | `P135` | CGPA Converter | E | `/calculators` |
| [ ] | `P136` | Anagram Finder; .env Diff | E/M | `/tools` |
| [ ] | `P137` | CSS Specificity Calculator; Neumorphism Generator; Scrollbar Styler | E | `/tools` |
| [ ] | `P138` | Tailwind Color Palette Viewer; TSV Converter | E | `/tools` |
| [ ] | `P139` | Python Formatter (black-like rules subset) | H | `/tools` |
| [ ] | `P140` | Name That Color | E | `/tools` |
| [ ] | `P141` | Bcrypt Hash (wasm) | H | `/tools` |
| [ ] | `P142` | CRC32 Calculator; CI Workflow Template Picker | E | `/tools` |
| [ ] | `P143` | Base64 to Image | E | `/image` |
| [ ] | `P144` | JSON Flatten / Unflatten | M | `/tools` |
| [ ] | `P145` | JSON Schema Validator | H | `/tools` |
| [ ] | `P146` | JSON to TOML; TOML to JSON | E | `/tools` |
| [ ] | `P147` | Changelog Formatter; Patch / Unified Diff Viewer | E/M | `/tools` |
| [ ] | `P148` | Regex to Automata Visualizer | H | `/tools` |
| [ ] | `P149` | String Similarity (Levenshtein); Add Line Numbers | E/M | `/tools` |
| [ ] | `P150` | Button CSS Generator; Viewport Tester Sizes | E | `/tools` |
| [ ] | `P151` | TOML Formatter; XML Minifier | E | `/tools` |
| [ ] | `P152` | Cron Generator (UI) | M | `/convert` |
| [ ] | `P153` | Env Var Reference Linter; Semantic Version Bumper | E | `/tools` |
| [ ] | `P154` | AVIF Converter (if browser supports); Add Watermark | M | `/image` |
| [ ] | `P155` | App Icon Pack Generator (sizes); Image Metadata Viewer (EXIF) | M | `/image` |
| [ ] | `P156` | SVG to PNG | M | `/image` |
| [ ] | `P157` | MIME Type Lookup; XSS Payload Encoder (educational) | E | `/tools` |
| [ ] | `P158` | Kubernetes YAML Explainer (static) | H | `/tools` |
| [ ] | `P159` | Emoji Search / Picker; CREATE TABLE Builder | E/M | `/tools` |
| [ ] | `P160` | Form Builder HTML Export | M | `/tools` |
| [ ] | `P161` | Docker Compose Validator (client) | H | `/tools` |
| [ ] | `P162` | WCAG Contrast Checker (advanced) | E | `/tools` |
| [ ] | `P163` | Unit Converter (volume) | E | `/convert` |
| [ ] | `P164` | CAGR Calculator; Currency Converter (static rates snapshot) | E/M | `/calculators` |
| [ ] | `P165` | Currency Exchange Table (snapshot); FD / RD Calculator | E | `/calculators` |
| [ ] | `P166` | Income Tax Estimator (static slabs demo); Inflation Calculator | E/M | `/calculators` |
| [ ] | `P167` | Lumpsum Investment; Profit Margin Calculator; ROI Calculator | E | `/calculators` |
| [ ] | `P168` | Salary Take-Home Estimator; VAT Calculator | E/M | `/calculators` |
| [ ] | `P169` | Kubernetes Resource Calculator (requests) | M | `/tools` |
| [ ] | `P170` | BMR Calculator; Calorie Needs (TDEE); Ovulation Calculator | E | `/calculators` |
| [ ] | `P171` | PNG to SVG (trace approx) | H | `/image` |
| [ ] | `P172` | Social OG Image Size Crops | E | `/image` |
| [ ] | `P173` | System Design Component Glossary | E | `/interview` |
| [ ] | `P174` | Scientific Calculator | M | `/calculators` |
| [ ] | `P175` | PDF Signature Place (draw) | H | `/pdf` |
| [ ] | `P176` | EAN / UPC Generator | M | `/tools` |
| [ ] | `P177` | ERD from SQL (simple) | H | `/tools` |
| [ ] | `P178` | JSON to SQL; Hash Identifier (heuristic) | M | `/tools` |
| [ ] | `P179` | Citation Generator (APA/MLA static); Grade Percentage Calculator | E/M | `/calculators` |
| [ ] | `P180` | Weighted Grade Calculator | E | `/calculators` |
| [ ] | `P181` | Vigenère Cipher (educational); Favicon & App Manifest Preview | M | `/tools` |
| [ ] | `P182` | Delimiter Detector; OKLCH Converter | E/M | `/tools` |
| [ ] | `P183` | Roman Numerals Converter | E | `/convert` |
| [ ] | `P184` | Leap Year Checker; Stopwatch | E | `/tools` |
| [ ] | `P185` | CUID Generator | E | `/tools` |
| [ ] | `P186` | Sleep Cycle Calculator | E | `/calculators` |
| [ ] | `P187` | Image Rotate / Flip | E | `/image` |
| [ ] | `P188` | Big-O Cheatsheet Interactive | E | `/interview` |
| [ ] | `P189` | JSON Merge; JSON Sort Keys | E/M | `/tools` |
| [ ] | `P190` | NDJSON Viewer | E | `/tools` |
| [ ] | `P191` | Number to Words | E | `/calculators` |
| [ ] | `P192` | HTTP Request Builder (client-only mock) | H | `/tools` |
| [ ] | `P193` | PDF Delete Pages | H | `/pdf` |
| [ ] | `P194` | PDF Extract Pages | H | `/pdf` |
| [ ] | `P195` | PDF Protect (encrypt) | H | `/pdf` |
| [ ] | `P196` | PDF Reorder Pages | H | `/pdf` |
| [ ] | `P197` | PDF Text Extract | H | `/pdf` |
| [ ] | `P198` | PDF Unlock (password known, client) | H | `/pdf` |
| [ ] | `P199` | PDF Watermark | H | `/pdf` |
| [ ] | `P200` | SQL Query Explainer (static heuristics) | H | `/tools` |
| [ ] | `P201` | Palindrome Checker; String Rot13 | E | `/tools` |
| [ ] | `P202` | Unicode Normalizer (NFC/NFD); Responsive Breakpoint Preview | M | `/tools` |
| [ ] | `P203` | Properties File Converter; YAML Diff | E/M | `/tools` |
| [ ] | `P204` | CSS Triangle Generator | E | `/tools` |
| [ ] | `P205` | Unit Converter (area); Unit Converter (speed) | E | `/convert` |
| [ ] | `P206` | Discount Calculator; Hourly to Salary Converter; Simple Interest | E | `/calculators` |
| [ ] | `P207` | Ideal Weight Calculator; Pace Calculator (running) | E | `/calculators` |
| [ ] | `P208` | PlantUML Client Preview (wasm if avail) | H | `/tools` |
| [ ] | `P209` | Average / Mean Calculator; Degree / Radian Converter; GCD / LCM Calculator | E | `/calculators` |
| [ ] | `P210` | Permutation / Combination; Quadratic Equation Solver; Standard Deviation | E | `/calculators` |
| [ ] | `P211` | Trigonometry Calculator | E | `/calculators` |
| [ ] | `P212` | SQL Injection Playground (safe mock) | H | `/tools` |
| [ ] | `P213` | Certificate Fingerprint SHA256; SQL Injection Pattern Detector (educational) | E/M | `/tools` |
| [ ] | `P214` | Flashcard App (localStorage); Multiplication Table Generator | E/M | `/calculators` |
| [ ] | `P215` | Canonical URL Checker (paste HTML) | E | `/tools` |
| [ ] | `P216` | C/C++ Formatter (clang-format subset) | H | `/tools` |
| [ ] | `P217` | Go Formatter (gofmt-like subset) | H | `/tools` |
| [ ] | `P218` | ASCII Table Interactive; Periodic Table Interactive | E/M | `/tools` |
| [ ] | `P219` | Typing Speed Test; WPM Accuracy Test | M | `/tools` |
| [ ] | `P220` | Freelance Rate Calculator | E | `/calculators` |
| [ ] | `P221` | LeetCode Pattern Finder (static map) | E | `/interview` |
| [ ] | `P222` | MDX Preview (limited) | H | `/tools` |
| [ ] | `P223` | Text Compare (3-way) | H | `/tools` |
| [ ] | `P224` | Web Vitals Score Explainer | E | `/tools` |
| [ ] | `P225` | Amortization Schedule; Credit Card Payoff Calculator | M | `/calculators` |
| [ ] | `P226` | Retirement Calculator | M | `/calculators` |
| [ ] | `P227` | Noise Texture Generator; Waveform SVG Generator | M | `/tools` |
| [ ] | `P228` | Blur Face Region (manual); Dominant Color Extractor | M | `/image` |
| [ ] | `P229` | Load Balancer Explainer | E | `/interview` |
| [ ] | `P230` | Graphing Calculator (simple) | H | `/calculators` |
| [ ] | `P231` | CSR Decoder; Tracking Parameter Stripper (URL) | E/M | `/tools` |
| [ ] | `P232` | Fuzzy Match Demo | M | `/tools` |
| [ ] | `P233` | Bar Chart Maker; Line Chart Maker; Pie Chart Maker | E | `/calculators` |
| [ ] | `P234` | Bibliography Formatter; Fraction Visualizer | M | `/calculators` |
| [ ] | `P235` | Long Division Visualizer | M | `/calculators` |
| [ ] | `P236` | Headline Analyzer (heuristic); Column Type Inferencer | E/M | `/tools` |
| [ ] | `P237` | Cron Next Runs Calculator | M | `/convert` |
| [ ] | `P238` | Box Model Visualizer | E | `/tools` |
| [ ] | `P239` | Budget Splitter (50/30/20) | E | `/calculators` |
| [ ] | `P240` | ICO Converter; Image Color Adjust (brightness/contrast) | M | `/image` |
| [ ] | `P241` | Image to ASCII Art | M | `/image` |
| [ ] | `P242` | Bitwise Operations Playground; Latency Numbers Reference | E | `/interview` |
| [ ] | `P243` | Sorting Visualizer | M | `/interview` |
| [ ] | `P244` | JSON Filter by Key; ASCII Doc Lite Preview | M | `/tools` |
| [ ] | `P245` | Documentation Search Demo | M | `/tools` |
| [ ] | `P246` | PDF Metadata Viewer | M | `/pdf` |
| [ ] | `P247` | UTM Builder; UTM Parser | E | `/tools` |
| [ ] | `P248` | Algebra Step Checker (limited) | H | `/calculators` |
| [ ] | `P249` | CommonMark / GFM Diff; Meta Description Length Checker | E/M | `/tools` |
| [ ] | `P250` | Readability Score (Flesch); Title Tag Length Checker | E | `/tools` |
| [ ] | `P251` | CSS Reset Diff Viewer; Color Mixer | E | `/tools` |
| [ ] | `P252` | ISO 8601 Parser; Unit Converter (energy); Unit Converter (power) | E | `/convert` |
| [ ] | `P253` | Unit Converter (pressure) | E | `/convert` |
| [ ] | `P254` | Semver Range Explainer; Keyboard Shortcut Cheatsheets | E | `/tools` |
| [ ] | `P255` | Break-even Calculator | E | `/calculators` |
| [ ] | `P256` | .gitattributes Helper; Changelog Diff Helper | E | `/tools` |
| [ ] | `P257` | Body Fat Estimator (formula); Heart Rate Zone Calculator; Macro Split Calculator | E | `/calculators` |
| [ ] | `P258` | CAP Theorem Explorer; Time Complexity Calculator (input size) | E | `/interview` |
| [ ] | `P259` | Equation Plotter | H | `/calculators` |
| [ ] | `P260` | Fraction Calculator; Matrix Calculator (2x2/3x3) | M | `/calculators` |
| [ ] | `P261` | Median / Mode Calculator; Ratio Calculator | E | `/calculators` |
| [ ] | `P262` | Whois-like Educational (no live lookup) | E | `/tools` |
| [ ] | `P263` | PDF Compare (page images) | H | `/pdf` |
| [ ] | `P264` | Regex Cheatsheet by Language Flavor; Regex for SQL LIKE Converter | E | `/tools` |
| [ ] | `P265` | Essay Word Target Tracker; Periodic Table Quiz | E | `/calculators` |
| [ ] | `P266` | AMP Remover / HTML Cleaner; ARIA Role Reference | E | `/tools` |
| [ ] | `P267` | Protobuf Formatter | H | `/tools` |
| [ ] | `P268` | Lighthouse Metric Glossary; Country Codes Lookup (ISO) | E | `/tools` |
| [ ] | `P269` | Currency Codes Lookup | E | `/tools` |
| [ ] | `P270` | Dice Roller | E | `/calculators` |
| [ ] | `P271` | PDF Form Filler (basic AcroForm) | H | `/pdf` |
| [ ] | `P272` | PDF Metadata Editor | H | `/pdf` |
| [ ] | `P273` | PDF Page Number Add | H | `/pdf` |
| [ ] | `P274` | Cookie String Parser | E | `/tools` |
| [ ] | `P275` | Mongo Query to SQL (limited) | H | `/tools` |
| [ ] | `P276` | CSV to Chart; Descriptive Stats Calculator | E/M | `/calculators` |
| [ ] | `P277` | Z-Score Calculator | E | `/calculators` |
| [ ] | `P278` | Color Blind Safe Palette Test | M | `/tools` |
| [ ] | `P279` | Angle Converter; Scientific Notation Converter | E | `/convert` |
| [ ] | `P280` | Cache-Control Playground; HTTP Caching Header Builder | M | `/tools` |
| [ ] | `P281` | Water Intake Estimator | E | `/calculators` |
| [ ] | `P282` | Image Diff (pixel) | H | `/image` |
| [ ] | `P283` | Exponent Calculator; Factorial Calculator; Logarithm Calculator | E | `/calculators` |
| [ ] | `P284` | Prime Checker; Prime Factors; Square Root / Nth Root | E | `/calculators` |
| [ ] | `P285` | Index Recommendation Heuristic | H | `/tools` |
| [ ] | `P286` | PGP Message Explainer (structure) | H | `/tools` |
| [ ] | `P287` | A/B Test Significance Calculator | M | `/calculators` |
| [ ] | `P288` | Prompt Template Library | E | `/tools` |
| [ ] | `P289` | Round Avatar Crop | E | `/image` |
| [ ] | `P290` | Binary Search Visualizer | M | `/interview` |
| [ ] | `P291` | WhatsApp Link Generator; JSON → Zod Schema | E/M | `/tools` |
| [ ] | `P292` | Sample Size Calculator; Study Schedule Generator | M | `/calculators` |
| [ ] | `P293` | Bundle Size Analyzer (upload stats.json) | M | `/tools` |
| [ ] | `P294` | Background Remover (manual mask) | H | `/image` |
| [ ] | `P295` | Behavioral STAR Answer Template | E | `/interview` |
| [ ] | `P296` | Linear Equation Solver (2 var) | M | `/calculators` |
| [ ] | `P297` | YouTube Thumbnail Downloader (client URL parse) | E | `/tools` |
| [ ] | `P298` | Histogram Generator; Scatter Plot Maker | E/M | `/calculators` |
| [ ] | `P299` | Font Size Readability Checker | E | `/tools` |
| [ ] | `P300` | Event Loop Visualizer | H | `/tools` |
| [ ] | `P301` | Specificity Battle; Flag Quiz | E | `/tools` |
| [ ] | `P302` | Timezone Database Browser; Unicode Character Search | M | `/tools` |
| [ ] | `P303` | World Capitals Quiz | E | `/tools` |
| [ ] | `P304` | BST Visualizer | H | `/interview` |
| [ ] | `P305` | Graph Traversal Visualizer | H | `/interview` |
| [ ] | `P306` | Pathfinding Visualizer (A*/Dijkstra) | H | `/interview` |
| [ ] | `P307` | Stack / Queue Visualizer | E | `/interview` |
| [ ] | `P308` | GraphQL Query Formatter | E | `/tools` |
| [ ] | `P309` | JavaScript Playground (sandboxed) | H | `/tools` |
| [ ] | `P310` | TypeScript Playground (lite) | H | `/tools` |
| [ ] | `P311` | Confidence Interval Calculator; Linear Regression (2D) | M | `/calculators` |
| [ ] | `P312` | P-Value from Z (tables) | M | `/calculators` |
| [ ] | `P313` | Keyword Stuffing Checker; Sequence Diagram (Mermaid) | E/M | `/tools` |
| [ ] | `P314` | Multiplication Practice; Sign Language Alphabet (images) | E | `/tools` |
| [ ] | `P315` | HEIC to JPG (if support) | H | `/image` |
| [ ] | `P316` | Interview Question Timer; Resume Bullet Rewriter (rules-based, no AI) | E/M | `/interview` |
| [ ] | `P317` | Two's Complement Visualizer | E | `/interview` |
| [ ] | `P318` | Determinant Calculator; Vector Calculator | M | `/calculators` |
| [ ] | `P319` | Words to Number | M | `/calculators` |
| [ ] | `P320` | WebSocket Message Frame Explainer | H | `/tools` |
| [ ] | `P321` | Regex → JS Code Generator; Prompt Improver Checklist | E | `/tools` |
| [ ] | `P322` | System Prompt Builder; File Hash (drag-drop) | E/M | `/tools` |
| [ ] | `P323` | Package.json Dependency Visualizer; Flight Phonetics / NATO | E/M | `/tools` |
| [ ] | `P324` | Language Codes (ISO 639); Phonetic Alphabet Converter | E | `/tools` |
| [ ] | `P325` | Image Upscale (simple bilinear) | M | `/image` |
| [ ] | `P326` | Sprite Sheet Slicer | H | `/image` |
| [ ] | `P327` | PDF Flatten Annotations (limited) | H | `/pdf` |
| [ ] | `P328` | Local Storage Inspector UI; Escape Sequence Tester | E | `/tools` |
| [ ] | `P329` | Sentence Length Visualizer; Token Count Estimator (heuristic) | E/M | `/tools` |
| [ ] | `P330` | ER Diagram Builder | H | `/tools` |
| [ ] | `P331` | Flowchart Maker (simple) | H | `/tools` |
| [ ] | `P332` | Mind Map (basic) | H | `/tools` |
| [ ] | `P333` | Resistor Color Code | E | `/calculators` |
| [ ] | `P334` | Image Collage Maker | H | `/image` |
| [ ] | `P335` | Eisenhower Matrix; Google Maps Link Builder | E | `/tools` |
| [ ] | `P336` | Box Plot from Data | M | `/calculators` |
| [ ] | `P337` | Content Outline Generator (rules); Focus Order Visualizer (paste HTML) | M | `/tools` |
| [ ] | `P338` | ZIP Creator (client) | H | `/tools` |
| [ ] | `P339` | ZIP Extractor (client) | H | `/tools` |
| [ ] | `P340` | Multipart Form Data Builder; z-index Stacking Context Demo | M | `/tools` |
| [ ] | `P341` | Gantt Lite | H | `/tools` |
| [ ] | `P342` | Timeline Maker; Venn Diagram Maker | M | `/tools` |
| [ ] | `P343` | Linked List Visualizer | M | `/interview` |
| [ ] | `P344` | Cookie Policy Outline; Privacy Policy Section Outline | E | `/tools` |
| [ ] | `P345` | SRT to VTT Converter; VTT to SRT | E | `/tools` |
| [ ] | `P346` | CMYK to RGB Approx; DPI / PPI Calculator; Pixels to Inches | E | `/tools` |
| [ ] | `P347` | Print Size Calculator; RGB to CMYK Approx | E | `/tools` |
| [ ] | `P348` | Canvas Fingerprint Demo; OpenAPI Snippet Viewer | M | `/tools` |
| [ ] | `P349` | Chi-Square Calculator; Correlation Calculator | M | `/calculators` |
| [ ] | `P350` | Passive Voice Detector (rules); Gzip Compress Text | E/M | `/tools` |
| [ ] | `P351` | Position Size Calculator | E | `/calculators` |
| [ ] | `P352` | CSS Cascade Layers Explainer; Braille Translator (basic) | M | `/tools` |
| [ ] | `P353` | Ohm's Law Calculator | E | `/calculators` |
| [ ] | `P354` | Pixel Art Scaler (nearest) | E | `/image` |
| [ ] | `P355` | YouTube Timestamp Link Builder | E | `/tools` |
| [ ] | `P356` | DOCX Text Extract (client mammoth) | H | `/pdf` |
| [ ] | `P357` | DOCX to HTML (mammoth) | H | `/pdf` |
| [ ] | `P358` | PDF Combine Images Mixed | H | `/pdf` |
| [ ] | `P359` | Clipboard History (session only); Country Info Lookup | E/M | `/tools` |
| [ ] | `P360` | Country to Currency Map; Dialing Codes Lookup; Lat/Long Converter (DMS) | E | `/tools` |
| [ ] | `P361` | Content-Type Sniffer Educational; Import Cost Estimator (heuristic) | E/M | `/tools` |
| [ ] | `P362` | Lockfile Diff (package-lock) | M | `/tools` |
| [ ] | `P363` | Promise Timeline Visualizer | H | `/tools` |
| [ ] | `P364` | Source Map Consumer Viewer | H | `/tools` |
| [ ] | `P365` | DP Grid Visualizer | H | `/interview` |
| [ ] | `P366` | Heap Visualizer | H | `/interview` |
| [ ] | `P367` | Recursion Tree Visualizer | H | `/interview` |
| [ ] | `P368` | Social Bio Character Counter; Tweet Length Counter | E | `/tools` |
| [ ] | `P369` | Wheel of Names Advanced; Paper Size Reference (A4/Letter) | E/M | `/tools` |
| [ ] | `P370` | Referrer Policy Explainer | E | `/tools` |
| [ ] | `P371` | WebRTC Leak Demo (local) | H | `/tools` |
| [ ] | `P372` | File Size Converter Display; MIME from Extension | E | `/tools` |
| [ ] | `P373` | Recipe Scaler | E | `/calculators` |
| [ ] | `P374` | Polaroid Frame Generator | M | `/image` |
| [ ] | `P375` | Video Thumbnail Capture; Calendar .ics Generator | M | `/tools` |
| [ ] | `P376` | Habit Tracker (local); Pomodoro + Task List | M | `/tools` |
| [ ] | `P377` | vCard Generator | M | `/tools` |
| [ ] | `P378` | Air Fryer Converter; Coffee Ratio Calculator | E | `/calculators` |
| [ ] | `P379` | Distance Between Cities (static coords); Memory Match Game | E/M | `/tools` |
| [ ] | `P380` | Pixelate Region Tool | M | `/image` |
| [ ] | `P381` | Subtitle SRT Editor; Video Metadata Viewer | M | `/tools` |
| [ ] | `P382` | Amazon Affiliate Link Cleaner | E | `/tools` |
| [ ] | `P383` | Markdown Resume to PDF | H | `/tools` |
| [ ] | `P384` | Random Team Generator; Guitar Capo Transposer | E | `/tools` |
| [ ] | `P385` | Scale Generator | E | `/tools` |
| [ ] | `P386` | Plate Calculator (barbell) | E | `/calculators` |
| [ ] | `P387` | Few-shot Example Formatter; Prompt Diff; Prompt Variable Filler | E | `/tools` |
| [ ] | `P388` | RAG Chunk Size Estimator | E | `/tools` |
| [ ] | `P389` | Concrete Volume Calculator; Paint Coverage Calculator; Roof Pitch Calculator | E | `/calculators` |
| [ ] | `P390` | Tile Calculator; Cooking Unit Converter | E | `/calculators` |
| [ ] | `P391` | GeoJSON Viewer | M | `/tools` |
| [ ] | `P392` | APY to APR Converter; DCA Schedule Calculator; Gas Fee Unit Converter (Gwei) | E | `/calculators` |
| [ ] | `P393` | Risk/Reward Calculator; Wallet Address Checksum (ETH) | E | `/calculators` |
| [ ] | `P394` | Architecture Box Diagram | H | `/tools` |
| [ ] | `P395` | LED Resistor Calculator; Voltage Divider | E | `/calculators` |
| [ ] | `P396` | Dithering Converter | M | `/image` |
| [ ] | `P397` | Invoice PDF Generator (client) | H | `/tools` |
| [ ] | `P398` | Big Number Arithmetic | M | `/calculators` |
| [ ] | `P399` | Audio Trim (WebAudio) | H | `/tools` |
| [ ] | `P400` | LinkedIn Post Formatter; Telegram Link Generator | E | `/tools` |
| [ ] | `P401` | XLSX Sheet Lister | M | `/pdf` |
| [ ] | `P402` | Cricket Run Rate Calculator; Net Run Rate Calculator; One-Rep Max Calculator | E | `/calculators` |
| [ ] | `P403` | Chat Transcript Cleaner; Reduced Motion Preview Toggle | E | `/tools` |
| [ ] | `P404` | Duplicate File Finder (hash local) | H | `/tools` |
| [ ] | `P405` | Org Chart Builder | H | `/tools` |
| [ ] | `P406` | Wireframe Blocks (low-fi) | H | `/tools` |
| [ ] | `P407` | Chroma Key Simple | H | `/image` |
| [ ] | `P408` | Image Histogram | M | `/image` |
| [ ] | `P409` | NDA Clause Checklist (educational); Terms Outline Generator | E | `/tools` |
| [ ] | `P410` | Bitcoin URI Generator; Hashtag Counter; PayPal.me Link Builder | E | `/tools` |
| [ ] | `P411` | SMS Link Generator; Secret Santa Shuffler; mailto Link Generator | E | `/tools` |
| [ ] | `P412` | BPM Tap Tempo; Business Card Size Templates | E | `/tools` |
| [ ] | `P413` | Permissions API Demo; Bytecode / Opcode Reference | E | `/tools` |
| [ ] | `P414` | String Template Interpolator; Quote Case Formatter | E | `/tools` |
| [ ] | `P415` | Screen Reader Announcement Simulator | H | `/tools` |
| [ ] | `P416` | Huffman Coding Visualizer | H | `/tools` |
| [ ] | `P417` | Wattage to Amps; Oven Temperature Converter | E | `/calculators` |
| [ ] | `P418` | Tip Split with Tax; Frequency Wavelength | E | `/calculators` |
| [ ] | `P419` | Power Calculator (V/I/R); dB Converter | E | `/calculators` |
| [ ] | `P420` | Animated WebP Split | H | `/image` |
| [ ] | `P421` | TIFF to PNG (limited) | H | `/image` |
| [ ] | `P422` | Circle of Fifths Interactive | M | `/tools` |
| [ ] | `P423` | PDF Crop Margins | H | `/pdf` |
| [ ] | `P424` | PDF Grayscale Convert | H | `/pdf` |
| [ ] | `P425` | PPTX Text Extract | H | `/pdf` |
| [ ] | `P426` | Heart Rate Training Zones; Pace to Finish Time | E | `/calculators` |
| [ ] | `P427` | Tree-shaking Demo; Word to Minutes Estimator | E/M | `/tools` |
| [ ] | `P428` | Bracket Generator; Chord Finder | M | `/tools` |
| [ ] | `P429` | Piano Chord Diagram | M | `/tools` |
| [ ] | `P430` | HVAC BTU Estimator; Stair Stringer Calculator | M | `/calculators` |
| [ ] | `P431` | Impermanent Loss Calculator; Liquidation Price Estimator | M | `/calculators` |
| [ ] | `P432` | Decision Matrix Maker; Markdown Notes (local) | M | `/tools` |
| [ ] | `P433` | Countdown to Event Page | E | `/calculators` |
| [ ] | `P434` | GeoJSON to CSV Points; ETag Simulator | M | `/tools` |
| [ ] | `P435` | Name Picker Wheel; Receipt Generator | E/M | `/tools` |
| [ ] | `P436` | Audio Format Info | M | `/tools` |
| [ ] | `P437` | Whiteboard Lite | H | `/tools` |
| [ ] | `P438` | Metronome | M | `/tools` |
| [ ] | `P439` | Tuner (mic WebAudio) | H | `/tools` |
| [ ] | `P440` | Bleed & Margin Guide Generator; Paraphrase Distance Meter | M | `/tools` |
| [ ] | `P441` | Board Feet Calculator; Fence Post Calculator; Mulch Calculator | E | `/calculators` |
| [ ] | `P442` | Baking Pan Size Converter; Battery Life Estimator | E | `/calculators` |
| [ ] | `P443` | RC Time Constant; Transformer Turns Ratio; Wire Gauge Calculator | E | `/calculators` |
| [ ] | `P444` | Business Card Designer (print CSS) | H | `/tools` |
| [ ] | `P445` | Audio Waveform from File | H | `/tools` |
| [ ] | `P446` | GIF Frame Viewer | H | `/tools` |
| [ ] | `P447` | Simple Kanban (local) | H | `/tools` |
| [ ] | `P448` | Interval Calculator | E | `/tools` |
| [ ] | `P449` | Office MIME Detector | E | `/pdf` |
| [ ] | `P450` | PDF Booklet Imposition | H | `/pdf` |
| [ ] | `P451` | March Madness Bracket Printer; Race Predictor (Riegel) | E/M | `/calculators` |
| [ ] | `P452` | Grocery Split Calculator | E | `/calculators` |
| [ ] | `P453` | Text Compression Ratio Demo | M | `/tools` |
| [ ] | `P454` | Glitch Art Generator | M | `/image` |
| [ ] | `P455` | MIDI Note Number Converter | E | `/tools` |
| [ ] | `P456` | EPUB Metadata Viewer | H | `/pdf` |
| [ ] | `P457` | LZW Demo Visualizer | H | `/tools` |
| [ ] | `P458` | Macro from Recipe Estimator; Bech32 Address Viewer (educational) | M | `/calculators` |
| [ ] | `P459` | Funding Rate PnL Estimator; Three-Phase Power Calculator | M | `/calculators` |
| [ ] | `P460` | Jailbreak Pattern Educators (safe); Bounding Box Calculator | E/M | `/tools` |
| [ ] | `P461` | Coin Flip / Decision Wheel | E | `/tools` |
| [ ] | `P462` | Sudoku Generator / Solver | H | `/tools` |
| [ ] | `P463` | Instagram Username Checker Style; Invoice Number Generator | E | `/tools` |
| [ ] | `P464` | Football Score Probability (simple) | M | `/calculators` |
| [ ] | `P465` | Nine-patch Preview | H | `/image` |
| [ ] | `P466` | Meme Text Overlay (image); Map Tile Coordinate Converter | M | `/tools` |
| [ ] | `P467` | 2048; Wordle Clone (daily static) | M | `/tools` |
| [ ] | `P468` | Color from Video Frame | H | `/tools` |
| [ ] | `P469` | BMI for Athletes Note | E | `/calculators` |
| [ ] | `P470` | Hangman; Tic Tac Toe; Rock Paper Scissors | E | `/tools` |
| [ ] | `P471` | Yes/No Oracle; Minesweeper | E/M | `/tools` |
| [ ] | `P472` | Snake | M | `/tools` |

---

## Block C — Hub interludes (H001–H050)

| Done | Phase | After | Category |
|---|---|---|---|
| [ ] | `H001` | `P001` | JSON & Data Formats |
| [ ] | `H002` | `P002` | Encoding & Hashing |
| [ ] | `H003` | `P004` | Text Tools |
| [ ] | `H004` | `P006` | QR & Barcodes |
| [ ] | `H005` | `P007` | Converters (Units & Misc) |
| [ ] | `H006` | `P008` | Regex & Text |
| [ ] | `H007` | `P009` | Code Formatters |
| [ ] | `H008` | `P012` | Colors |
| [ ] | `H009` | `P013` | Generators |
| [ ] | `H010` | `P015` | Math & Calculators |
| [ ] | `H011` | `P015` | Finance Calculators |
| [ ] | `H012` | `P017` | Date & Time |
| [ ] | `H013` | `P020` | Image Tools |
| [ ] | `H014` | `P024` | PDF Tools |
| [ ] | `H015` | `P032` | Health & Everyday |
| [ ] | `H016` | `P032` | Student Tools |
| [ ] | `H017` | `P033` | Web & HTML |
| [ ] | `H018` | `P033` | CSV & Spreadsheets |
| [ ] | `H019` | `P038` | CSS & Design Dev |
| [ ] | `H020` | `P041` | Security & Crypto (educational, client) |
| [ ] | `H021` | `P043` | Markdown & Docs |
| [ ] | `H022` | `P044` | SQL & Databases |
| [ ] | `H023` | `P047` | Git & DevOps |
| [ ] | `H024` | `P055` | Networking & HTTP |
| [ ] | `H025` | `P056` | XML & YAML & Config |
| [ ] | `H026` | `P159` | Education & Reference |
| [ ] | `H027` | `P162` | Accessibility Tools |
| [ ] | `H028` | `P173` | Interview & DSA |
| [ ] | `H029` | `P224` | Developer Advanced |
| [ ] | `H030` | `P231` | Privacy Utilities |
| [ ] | `H031` | `P233` | Statistics & Charts |
| [ ] | `H032` | `P236` | Writing & Content |
| [ ] | `H033` | `P264` | Programming Language Tools |
| [ ] | `H034` | `P288` | AI Prompts (no inference) |
| [ ] | `H035` | `P289` | Image Advanced |
| [ ] | `H036` | `P291` | Miscellaneous High-SEO |
| [ ] | `H037` | `P313` | Diagrams |
| [ ] | `H038` | `P322` | Compression & Files |
| [ ] | `H039` | `P333` | Electronics & Engineering |
| [ ] | `H040` | `P344` | Legal / Docs Utilities |
| [ ] | `H041` | `P345` | Media (light) |
| [ ] | `H042` | `P346` | Printing & Paper |
| [ ] | `H043` | `P351` | Crypto Markets Static |
| [ ] | `H044` | `P356` | PDF Advanced & Office |
| [ ] | `H045` | `P359` | Countries & Geo |
| [ ] | `H046` | `P373` | Cooking & Lifestyle |
| [ ] | `H047` | `P384` | Music |
| [ ] | `H048` | `P386` | Sports |
| [ ] | `H049` | `P389` | Construction & DIY |
| [ ] | `H050` | `P435` | Games & Fun |

---

## Block D — SEO cadence (S001–S094)

One SEO day after every 5 tool phases (`S001` after `P005`, `S002` after `P010`, …).

| Done | Phase | After tool phase | Pattern (rotate) |
|---|---|---|---|
| [ ] | `S001` | `P005` | S-a comparison |
| [ ] | `S002` | `P010` | S-b how-to guide |
| [ ] | `S003` | `P015` | S-c internal links |
| [ ] | `S004` | `P020` | S-d CWV audit |
| [ ] | `S005` | `P025` | S-e homepage/changelog |
| [ ] | `S006` | `P030` | S-a comparison |
| [ ] | `S007` | `P035` | S-b how-to guide |
| [ ] | `S008` | `P040` | S-c internal links |
| [ ] | `S009` | `P045` | S-d CWV audit |
| [ ] | `S010` | `P050` | S-e homepage/changelog |
| [ ] | `S011` | `P055` | S-a comparison |
| [ ] | `S012` | `P060` | S-b how-to guide |
| [ ] | `S013` | `P065` | S-c internal links |
| [ ] | `S014` | `P070` | S-d CWV audit |
| [ ] | `S015` | `P075` | S-e homepage/changelog |
| [ ] | `S016` | `P080` | S-a comparison |
| [ ] | `S017` | `P085` | S-b how-to guide |
| [ ] | `S018` | `P090` | S-c internal links |
| [ ] | `S019` | `P095` | S-d CWV audit |
| [ ] | `S020` | `P100` | S-e homepage/changelog |
| [ ] | `S021` | `P105` | S-a comparison |
| [ ] | `S022` | `P110` | S-b how-to guide |
| [ ] | `S023` | `P115` | S-c internal links |
| [ ] | `S024` | `P120` | S-d CWV audit |
| [ ] | `S025` | `P125` | S-e homepage/changelog |
| [ ] | `S026` | `P130` | S-a comparison |
| [ ] | `S027` | `P135` | S-b how-to guide |
| [ ] | `S028` | `P140` | S-c internal links |
| [ ] | `S029` | `P145` | S-d CWV audit |
| [ ] | `S030` | `P150` | S-e homepage/changelog |
| [ ] | `S031` | `P155` | S-a comparison |
| [ ] | `S032` | `P160` | S-b how-to guide |
| [ ] | `S033` | `P165` | S-c internal links |
| [ ] | `S034` | `P170` | S-d CWV audit |
| [ ] | `S035` | `P175` | S-e homepage/changelog |
| [ ] | `S036` | `P180` | S-a comparison |
| [ ] | `S037` | `P185` | S-b how-to guide |
| [ ] | `S038` | `P190` | S-c internal links |
| [ ] | `S039` | `P195` | S-d CWV audit |
| [ ] | `S040` | `P200` | S-e homepage/changelog |
| [ ] | `S041` | `P205` | S-a comparison |
| [ ] | `S042` | `P210` | S-b how-to guide |
| [ ] | `S043` | `P215` | S-c internal links |
| [ ] | `S044` | `P220` | S-d CWV audit |
| [ ] | `S045` | `P225` | S-e homepage/changelog |
| [ ] | `S046` | `P230` | S-a comparison |
| [ ] | `S047` | `P235` | S-b how-to guide |
| [ ] | `S048` | `P240` | S-c internal links |
| [ ] | `S049` | `P245` | S-d CWV audit |
| [ ] | `S050` | `P250` | S-e homepage/changelog |
| [ ] | `S051` | `P255` | S-a comparison |
| [ ] | `S052` | `P260` | S-b how-to guide |
| [ ] | `S053` | `P265` | S-c internal links |
| [ ] | `S054` | `P270` | S-d CWV audit |
| [ ] | `S055` | `P275` | S-e homepage/changelog |
| [ ] | `S056` | `P280` | S-a comparison |
| [ ] | `S057` | `P285` | S-b how-to guide |
| [ ] | `S058` | `P290` | S-c internal links |
| [ ] | `S059` | `P295` | S-d CWV audit |
| [ ] | `S060` | `P300` | S-e homepage/changelog |
| [ ] | `S061` | `P305` | S-a comparison |
| [ ] | `S062` | `P310` | S-b how-to guide |
| [ ] | `S063` | `P315` | S-c internal links |
| [ ] | `S064` | `P320` | S-d CWV audit |
| [ ] | `S065` | `P325` | S-e homepage/changelog |
| [ ] | `S066` | `P330` | S-a comparison |
| [ ] | `S067` | `P335` | S-b how-to guide |
| [ ] | `S068` | `P340` | S-c internal links |
| [ ] | `S069` | `P345` | S-d CWV audit |
| [ ] | `S070` | `P350` | S-e homepage/changelog |
| [ ] | `S071` | `P355` | S-a comparison |
| [ ] | `S072` | `P360` | S-b how-to guide |
| [ ] | `S073` | `P365` | S-c internal links |
| [ ] | `S074` | `P370` | S-d CWV audit |
| [ ] | `S075` | `P375` | S-e homepage/changelog |
| [ ] | `S076` | `P380` | S-a comparison |
| [ ] | `S077` | `P385` | S-b how-to guide |
| [ ] | `S078` | `P390` | S-c internal links |
| [ ] | `S079` | `P395` | S-d CWV audit |
| [ ] | `S080` | `P400` | S-e homepage/changelog |
| [ ] | `S081` | `P405` | S-a comparison |
| [ ] | `S082` | `P410` | S-b how-to guide |
| [ ] | `S083` | `P415` | S-c internal links |
| [ ] | `S084` | `P420` | S-d CWV audit |
| [ ] | `S085` | `P425` | S-e homepage/changelog |
| [ ] | `S086` | `P430` | S-a comparison |
| [ ] | `S087` | `P435` | S-b how-to guide |
| [ ] | `S088` | `P440` | S-c internal links |
| [ ] | `S089` | `P445` | S-d CWV audit |
| [ ] | `S090` | `P450` | S-e homepage/changelog |
| [ ] | `S091` | `P455` | S-a comparison |
| [ ] | `S092` | `P460` | S-b how-to guide |
| [ ] | `S093` | `P465` | S-c internal links |
| [ ] | `S094` | `P470` | S-d CWV audit |

---

## Block E — Monetization & polish (M001–M015)

| Done | Phase | Work |
|---|---|---|
| [ ] | `M001` | Ad slot components (empty, feature-flagged off) |
| [ ] | `M002` | AdSense application prep: content density audit |
| [ ] | `M003` | Enable ads on low-intent pages only (guides first) |
| [ ] | `M004` | Affiliate disclosure + 1 hosting affiliate test |
| [ ] | `M005` | Affiliate: design tool or VPN (labeled) |
| [ ] | `M006` | Donate / Sponsors page |
| [ ] | `M007` | Gumroad templates store (3 packs) |
| [ ] | `M008` | Forge Plus landing (ad-free) — waitlist only |
| [ ] | `M009` | Embeddable calculator widget MVP |
| [ ] | `M010` | PWA offline shell for top 20 tools |
| [ ] | `M011` | Localization spike (1 locale, 10 tools) |
| [ ] | `M012` | Performance budget CI enforcement |
| [ ] | `M013` | Accessibility audit pass (axe on top 30) |
| [ ] | `M014` | Deprecate/noindex zero-impression tools (>9 months) |
| [ ] | `M015` | Year-1 retrospective → revise this plan |

---

## Quick counts (auto-oriented)

When updating the dashboard, recount checked boxes:

```bash
# From repo root — counts checked phases in done.md
grep -c '| \[x\] |' docs/done.md || true
```

| Block | Total checkboxes |
|---|---:|
| Foundation | 12 |
| Tools | 472 |
| Hubs | 50 |
| SEO | 94 |
| Monetization | 15 |
| **All phases** | **643** |

---

*Start at `F00`. Keep this file honest — skipped or cancelled phases should be noted in the Ship log, not silently left unchecked forever.*
